"""Configuration centralisée, lue depuis l'environnement (et data-platform/.env s'il existe).

Les scripts tournent sur l'hôte (pas dans Docker) : ils parlent donc aux ports exposés par
docker-compose.yml (postgres-dwh:5433, minio:9000), pas aux noms de service internes.
"""

from __future__ import annotations

import os
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:  # pragma: no cover - python-dotenv est une commodité, pas une obligation
    pass


def _env(name: str, default: str) -> str:
    return os.environ.get(name, default)


MARKETPLACE_API_URL = _env("MARKETPLACE_API_URL", "http://localhost:5009/api/analytics-export")
MARKETPLACE_API_TOKEN = _env("MARKETPLACE_API_TOKEN", "formation-token-2026")

DWH_HOST = _env("DWH_HOST", "localhost")
DWH_PORT = int(_env("DWH_PORT", "5433"))
DWH_DB = _env("DWH_DB", "dwh")
DWH_USER = _env("DWH_USER", "dwh_user")
DWH_PASSWORD = _env("DWH_PASSWORD", "dwh_password")

MINIO_ENDPOINT = _env("MINIO_ENDPOINT", "http://localhost:9000")
MINIO_ACCESS_KEY = _env("MINIO_ACCESS_KEY", "minio_admin")
MINIO_SECRET_KEY = _env("MINIO_SECRET_KEY", "minio_password_2026")
MINIO_BUCKET = _env("MINIO_BUCKET", "data-lake")
