"""MVP Factory agent: scaffolds a deployable full-stack product from a validated idea.

Writes real, runnable files to products/<slug>/ (FastAPI + static frontend +
Stripe checkout stub + Dockerfile + README with deploy steps). Stripe billing
uses test-mode keys read from env -- no live charge can happen without the
operator supplying real keys and switching mode themselves.
"""
from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

from app.agents.base import BaseAgent
from app.config import BASE_DIR, PRODUCTS_DIR
from app.db import now, tx

_MAIN_PY = '''"""{title} - REGNViking OS MVP scaffold."""
import os
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="{title}")
app.mount("/static", StaticFiles(directory="static"), name="static")

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
PRICE_NOK = {price_nok}


@app.get("/")
def index():
    return FileResponse("static/index.html")


@app.get("/api/health")
def health():
    return {{"status": "ok", "product": "{slug}"}}


@app.post("/api/checkout")
def checkout():
    """Creates a Stripe Checkout Session in TEST mode if STRIPE_SECRET_KEY is set.
    Returns a stub response otherwise so the scaffold runs with zero config."""
    if not STRIPE_SECRET_KEY:
        return {{"mode": "stub", "message": "Set STRIPE_SECRET_KEY (test mode) to enable real checkout."}}
    import stripe

    stripe.api_key = STRIPE_SECRET_KEY
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{{
            "price_data": {{
                "currency": "nok",
                "product_data": {{"name": "{title}"}},
                "unit_amount": PRICE_NOK * 100,
            }},
            "quantity": 1,
        }}],
        success_url="https://example.com/success",
        cancel_url="https://example.com/cancel",
    )
    return {{"mode": "live-test", "checkout_url": session.url}}
'''

_INDEX_HTML = """<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>body{{font-family:system-ui;max-width:480px;margin:60px auto;padding:0 20px}}
button{{padding:12px 20px;font-size:1rem;cursor:pointer}}</style>
</head>
<body>
<h1>{title}</h1>
<p>{idea}</p>
<p>Pris: {price_nok} NOK</p>
<button onclick="checkout()">Kjop na</button>
<pre id="out"></pre>
<script>
async function checkout() {{
  const r = await fetch('/api/checkout', {{method: 'POST'}});
  const data = await r.json();
  document.getElementById('out').textContent = JSON.stringify(data, null, 2);
  if (data.checkout_url) window.location.href = data.checkout_url;
}}
</script>
</body>
</html>
"""

_DOCKERFILE = """FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""

_REQUIREMENTS = "fastapi>=0.115\nuvicorn>=0.30\nstripe>=10.0\n"

_README = """# {title}

REGNViking OS MVP scaffold. Generated {created_at}. 48h deadline: {deadline}.

## Idea
{idea}

## Run locally
```
pip install -r requirements.txt
uvicorn main:app --reload
```

## Deploy (one of)
- **Fly.io**: `fly launch` then `fly deploy` (Dockerfile included)
- **Render**: connect repo, set start command `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Docker anywhere**: `docker build -t {slug} . && docker run -p 8000:8000 {slug}`

## Billing
Set `STRIPE_SECRET_KEY` (test mode: `sk_test_...`) to enable real Stripe Checkout.
Without it, `/api/checkout` returns a stub response so the app still runs end to end.

## ROI
Tracked in REGNViking OS ROI dashboard under source `mvp:{slug}`.
"""


def _slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "mvp"


def _scaffold_path_str(target: Path) -> str:
    try:
        return str(target.relative_to(BASE_DIR))
    except ValueError:
        return str(target)


class MVPFactoryAgent(BaseAgent):
    name = "mvp_factory"
    description = "Turns a validated idea into a deployable, billable product scaffold"

    def handle(self, kind: str, payload: dict) -> dict:
        if kind == "scaffold":
            return self._scaffold(payload)
        raise ValueError(f"unknown task kind for mvp_factory: {kind}")

    def _scaffold(self, payload: dict) -> dict:
        idea = payload["idea"]
        title = payload.get("title", idea[:60])
        price_nok = int(payload.get("price_nok", 199))
        base_slug = _slugify(title)
        slug = base_slug
        suffix = 1
        target = PRODUCTS_DIR / slug
        while target.exists():
            suffix += 1
            slug = f"{base_slug}-{suffix}"
            target = PRODUCTS_DIR / slug

        (target / "static").mkdir(parents=True, exist_ok=True)
        created_at = datetime.now(timezone.utc)
        deadline = created_at + timedelta(hours=48)

        (target / "main.py").write_text(
            _MAIN_PY.format(title=title, slug=slug, price_nok=price_nok), encoding="utf-8"
        )
        (target / "static" / "index.html").write_text(
            _INDEX_HTML.format(title=title, idea=idea, price_nok=price_nok), encoding="utf-8"
        )
        (target / "Dockerfile").write_text(_DOCKERFILE, encoding="utf-8")
        (target / "requirements.txt").write_text(_REQUIREMENTS, encoding="utf-8")
        (target / "README.md").write_text(
            _README.format(
                title=title, idea=idea, slug=slug,
                created_at=created_at.isoformat(), deadline=deadline.isoformat(),
            ),
            encoding="utf-8",
        )

        with tx() as conn:
            conn.execute(
                """INSERT INTO mvps (idea, slug, scaffold_path, stripe_ready, status, created_at, deadline_at)
                   VALUES (?, ?, ?, 0, 'scaffolded', ?, ?)""",
                (idea, slug, _scaffold_path_str(target), created_at.isoformat(), deadline.isoformat()),
            )

        self.remember("last_mvp_slug", slug)
        return {
            "slug": slug,
            "path": _scaffold_path_str(target),
            "deadline_at": deadline.isoformat(),
            "price_nok": price_nok,
            "files": ["main.py", "static/index.html", "Dockerfile", "requirements.txt", "README.md"],
        }
