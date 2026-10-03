"""Autentisering og tilgangskontroll.

Dev/test: faste bearer-tokens (`dev-<rolle>-<bruker>`), kun aktiv når VIBE_ENV != "prod".
Produksjon: OIDC (Keycloak / Entra ID / ID-porten for innbyggere). JWT valideres mot JWKS,
og rolle hentes fra claim `roles`. Se docs/09-personvern-etikk.md.
"""
from __future__ import annotations

import os
from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .models import Role

bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class Principal:
    user_id: str
    role: Role


def _parse_dev_token(token: str) -> Principal | None:
    parts = token.split("-", 2)
    if len(parts) != 3 or parts[0] != "dev":
        return None
    try:
        return Principal(user_id=parts[2], role=Role(parts[1]))
    except ValueError:
        return None


def current_principal(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> Principal:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Mangler bearer-token")
    if os.getenv("VIBE_ENV", "dev") == "prod":
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, "OIDC-validering må kobles på i prod")
    principal = _parse_dev_token(creds.credentials)
    if principal is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Ugyldig token")
    return principal


def require(*roles: Role):
    def dep(p: Principal = Depends(current_principal)) -> Principal:
        if p.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"Rollen {p.role.value} har ikke tilgang")
        return p

    return dep
