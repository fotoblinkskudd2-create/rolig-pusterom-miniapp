/* Fiksa – UI-logikk. Alt kjører lokalt (localStorage), ingen backend i MVP. */

let selectedCategory = null;
let photos = []; // { id, dataUrl, tag, pins: [{x, y, note}] }
let currentGuide = null;
let activeAnnotatePhotoId = null;

const PHOTO_TAGS = ["Skade/feil", "Feilmelding/display", "Kabling/tilkobling", "Modellplate/merke", "Annet"];

// ---------- Kategori-chips ----------
function renderCategoryChips() {
  const wrap = document.getElementById("categoryChips");
  wrap.innerHTML = "";
  CATEGORIES.forEach((c) => {
    const chip = document.createElement("div");
    chip.className = "chip" + (selectedCategory === c.id ? " selected" : "");
    chip.textContent = `${c.icon} ${c.label}`;
    chip.onclick = () => {
      selectedCategory = selectedCategory === c.id ? null : c.id;
      renderCategoryChips();
    };
    wrap.appendChild(chip);
  });
}

// ---------- Bilder ----------
document.getElementById("photoInput").addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      photos.push({ id: "p" + Date.now() + Math.random().toString(36).slice(2, 7), dataUrl: reader.result, tag: PHOTO_TAGS[0], pins: [] });
      renderPhotoGrid();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
});

function renderPhotoGrid() {
  const grid = document.getElementById("photoGrid");
  grid.innerHTML = "";
  photos.forEach((p) => {
    const tile = document.createElement("div");
    tile.className = "photo-tile";
    tile.innerHTML = `
      <img src="${p.dataUrl}" alt="Bilde">
      <button class="rm" title="Fjern bilde">✕</button>
      <div class="photo-tag">${p.tag}</div>
    `;
    tile.querySelector(".rm").onclick = (ev) => {
      ev.stopPropagation();
      photos = photos.filter((x) => x.id !== p.id);
      renderPhotoGrid();
    };
    tile.querySelector(".photo-tag").onclick = (ev) => {
      ev.stopPropagation();
      const idx = PHOTO_TAGS.indexOf(p.tag);
      p.tag = PHOTO_TAGS[(idx + 1) % PHOTO_TAGS.length];
      renderPhotoGrid();
    };
    grid.appendChild(tile);
  });
  const addTile = document.createElement("label");
  addTile.className = "add-photo-tile";
  addTile.setAttribute("for", "photoInput");
  addTile.textContent = "+";
  grid.appendChild(addTile);
}

// ---------- Analyse ----------
function analyzeProblem() {
  const description = document.getElementById("description").value.trim();
  const symptomsRaw = document.getElementById("symptoms").value.trim();
  const symptomLines = symptomsRaw ? symptomsRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  const brand = document.getElementById("brand").value.trim();
  const model = document.getElementById("model").value.trim();
  const year = document.getElementById("year").value.trim();

  if (!description && symptomLines.length === 0) {
    alert("Skriv minst en kort beskrivelse av problemet.");
    return;
  }

  const { problem, matched } = matchProblem(selectedCategory, description, symptomLines);
  const cleanedDescription = stripFluff(description);

  currentGuide = {
    id: "g" + Date.now(),
    date: new Date().toISOString(),
    category: selectedCategory,
    brand, model, year,
    description: cleanedDescription,
    symptoms: symptomLines,
    photos: photos.map((p) => ({ ...p })),
    problem,
    matched,
  };

  renderGuide(currentGuide);
  saveToHistory(currentGuide);
  resetInputForm();
  switchPage("guide");
}

function resetInputForm() {
  document.getElementById("description").value = "";
  document.getElementById("symptoms").value = "";
  document.getElementById("brand").value = "";
  document.getElementById("model").value = "";
  document.getElementById("year").value = "";
  photos = [];
  selectedCategory = null;
  renderCategoryChips();
  renderPhotoGrid();
}

// ---------- Render guide ----------
function renderGuide(guide) {
  const p = guide.problem;
  const diff = difficultyLabel(p.difficulty);
  const catInfo = CATEGORIES.find((c) => c.id === guide.category);
  const productLine = [guide.brand, guide.model, guide.year].filter(Boolean).join(" · ");

  let html = `
    <h1>${p.title}</h1>
    ${productLine ? `<p class="sub">${catInfo ? catInfo.icon + " " : ""}${productLine}</p>` : ""}
    ${!guide.matched ? `<p class="sub">Ingen eksakt kjent feiltype ble gjenkjent – her er en generell feilsøkingsguide. Legg gjerne til flere detaljer for et mer presist treff.</p>` : ""}

    <div class="meta-row">
      <span class="badge ${diff.cls}">${diff.text}</span>
      <span class="badge badge-yellow" style="background:var(--blue-bg); color:#2b5a8c;">⏱ ca. ${p.timeMinutes} min</span>
    </div>

    ${guide.description ? `<div class="card"><h3>Kjerneproblem (renset for fyllord)</h3><p style="color:var(--text);">${escapeHtml(guide.description)}</p></div>` : ""}

    ${guide.symptoms.length ? `<div class="card"><h3>Symptomer</h3><ul class="plain">${guide.symptoms.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul></div>` : ""}

    <h2>Verktøy/deler du trenger</h2>
    <div class="card">
      ${p.tools.length ? `<ul class="plain">${p.tools.map((t) => `<li>${t}</li>`).join("")}</ul>` : `<p>Ingen spesialverktøy nødvendig.</p>`}
    </div>

    <h2>Steg for steg</h2>
    <div class="card">
      ${p.steps.map((s, i) => `<div class="step-item"><div class="step-num">${i + 1}</div><div class="step-text">${s}</div></div>`).join("")}
    </div>

    ${p.safety && p.safety.length ? `
    <div class="safety-box">
      <h3>⚠ Sikkerhet</h3>
      <ul class="plain">${p.safety.map((s) => `<li>${s}</li>`).join("")}</ul>
    </div>` : ""}

    <div class="pro-box" style="margin-top:12px;">
      <h3>🧑‍🔧 Når bør du kalle fagperson?</h3>
      <p style="color:var(--text);">${p.whenPro}</p>
    </div>
  `;

  if (guide.photos.length) {
    html += `<h2>Dine bilder</h2>`;
    guide.photos.forEach((photo) => {
      html += `
        <div class="card">
          <div class="annot-photo" id="annot-${photo.id}">
            <img src="${photo.dataUrl}" alt="Bilde" onclick="handlePhotoClick(event, '${photo.id}')">
            ${photo.pins.map((pin, i) => `<div class="pin" style="left:${pin.x}%; top:${pin.y}%;" onclick="showPinNote(event, '${photo.id}', ${i})">${i + 1}</div>`).join("")}
          </div>
          <p class="hint">${photo.tag} · Trykk på bildet for å sette en nummerert markør med notat.</p>
          <div id="pinnotes-${photo.id}"></div>
        </div>
      `;
    });
  }

  document.getElementById("guideContent").innerHTML = html;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Annotering av bilder ----------
function handlePhotoClick(evt, photoId) {
  const rect = evt.currentTarget.getBoundingClientRect();
  const x = ((evt.clientX - rect.left) / rect.width) * 100;
  const y = ((evt.clientY - rect.top) / rect.height) * 100;
  const note = prompt("Kort notat om dette punktet (f.eks. 'skruen som mangler'):");
  if (note === null) return;
  const photo = currentGuide.photos.find((p) => p.id === photoId);
  photo.pins.push({ x, y, note: note.trim() || "Uten notat" });
  updateHistoryEntry(currentGuide);
  renderGuide(currentGuide);
}

function showPinNote(evt, photoId, pinIndex) {
  evt.stopPropagation();
  const photo = currentGuide.photos.find((p) => p.id === photoId);
  const pin = photo.pins[pinIndex];
  alert(`Markør ${pinIndex + 1}: ${pin.note}`);
}

// ---------- Historikk (localStorage) ----------
function saveToHistory(guide) {
  const list = JSON.parse(localStorage.getItem("fiksa_history") || "[]");
  list.unshift(guide);
  localStorage.setItem("fiksa_history", JSON.stringify(list.slice(0, 100)));
}

function updateHistoryEntry(guide) {
  const list = JSON.parse(localStorage.getItem("fiksa_history") || "[]");
  const idx = list.findIndex((g) => g.id === guide.id);
  if (idx > -1) {
    list[idx] = guide;
    localStorage.setItem("fiksa_history", JSON.stringify(list));
  }
}

function renderHistory() {
  const list = JSON.parse(localStorage.getItem("fiksa_history") || "[]");
  const container = document.getElementById("historyList");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="big">🧰</div>
        <p>Ingen fikset problemer ennå. Guider du lager dukker opp her, også offline.</p>
      </div>`;
    return;
  }

  list.forEach((g) => {
    const d = new Date(g.date);
    const catInfo = CATEGORIES.find((c) => c.id === g.category);
    const card = document.createElement("div");
    card.className = "card history-card";
    card.innerHTML = `
      <div class="top">
        <h3>${catInfo ? catInfo.icon + " " : ""}${g.problem.title}</h3>
        <span class="date">${d.toLocaleDateString("no-NO", { day: "numeric", month: "short" })}</span>
      </div>
      <p>${[g.brand, g.model].filter(Boolean).join(" · ") || "Ingen produktinfo"}</p>
    `;
    card.onclick = () => {
      currentGuide = g;
      renderGuide(g);
      switchPage("guide");
    };
    container.appendChild(card);
  });
}

// ---------- Navigasjon ----------
function switchPage(name) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  document.querySelectorAll(".nav button").forEach((b) => b.classList.remove("active"));
  const navBtn = document.querySelector(`.nav button[data-nav="${name}"]`);
  if (navBtn) navBtn.classList.add("active");
  if (name === "historikk") renderHistory();
  if (name === "guide" && !currentGuide) {
    document.getElementById("guideContent").innerHTML = `
      <div class="empty-state">
        <div class="big">📋</div>
        <p>Ingen aktiv guide ennå. Beskriv et problem under "Nytt" for å lage en.</p>
      </div>`;
  }
}

// ---------- Offline-indikator ----------
function updateOfflineNote() {
  document.getElementById("offlineNote").classList.toggle("show", !navigator.onLine);
}
window.addEventListener("online", updateOfflineNote);
window.addEventListener("offline", updateOfflineNote);

// ---------- Service worker (offline) ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

// ---------- Init ----------
renderCategoryChips();
renderPhotoGrid();
updateOfflineNote();
