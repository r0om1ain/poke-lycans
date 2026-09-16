"""Connexion PostgreSQL (postgres-dwh, port hôte exposé)."""

from __future__ import annotations

import psycopg2
import psycopg2.extensions

from config import DWH_DB, DWH_HOST, DWH_PASSWORD, DWH_PORT, DWH_USER


def get_connection() -> psycopg2.extensions.connection:
    return psycopg2.connect(
        host=DWH_HOST, port=DWH_PORT, dbname=DWH_DB, user=DWH_USER, password=DWH_PASSWORD,
    )
