#!/usr/bin/env python
"""Refresh des dimensions dwh.dim_seller / dwh.dim_product (Must have).

Contrairement à fact_orders (partitionné par dt), les dimensions sont cumulatives : upsert
(INSERT ... ON CONFLICT DO UPDATE) sur l'ensemble des vendeurs/produits renvoyés par l'API
à chaque run — rejouable sans effet de bord.

Usage : python pipeline_dims_refresh.py
"""

from __future__ import annotations

from psycopg2.extras import execute_values

import db
from marketplace_api_client import MarketplaceAPIClient


def refresh_dim_seller() -> int:
    client = MarketplaceAPIClient()
    sellers = client.get_sellers()
    if not sellers:
        return 0

    rows = [(s["sellerId"], s["name"], s.get("country"), s["joinedDate"]) for s in sellers]
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            execute_values(
                cur,
                """
                INSERT INTO dwh.dim_seller (id, name, country, joined_date) VALUES %s
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name, country = EXCLUDED.country, joined_date = EXCLUDED.joined_date
                """,
                rows,
            )
        conn.commit()
    finally:
        conn.close()

    print(f"[refresh_dim_seller] {len(rows)} vendeur(s) upserté(s)")
    return len(rows)


def refresh_dim_product() -> int:
    client = MarketplaceAPIClient()
    products = client.get_products()
    if not products:
        return 0

    rows = [(p["productId"], p["name"], p["category"], p["sellerId"]) for p in products]
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            execute_values(
                cur,
                """
                INSERT INTO dwh.dim_product (id, name, category, seller_id) VALUES %s
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name, category = EXCLUDED.category, seller_id = EXCLUDED.seller_id
                """,
                rows,
            )
        conn.commit()
    finally:
        conn.close()

    print(f"[refresh_dim_product] {len(rows)} produit(s) upserté(s)")
    return len(rows)


def run() -> None:
    refresh_dim_seller()
    refresh_dim_product()


if __name__ == "__main__":
    run()
