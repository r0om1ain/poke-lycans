#!/usr/bin/env python
"""Pipeline ELT principal : extract API Marketplace -> MinIO (raw) -> staging.orders ->
dwh.fact_orders (Must have).

Idempotence (obligatoire) : `transform_to_dwh` fait DELETE puis INSERT pour la partition
`dt` dans UNE transaction (commit unique à la fin). Rejouer le script pour la même date
donne toujours le même COUNT(*) dans dwh.fact_orders.

Usage :
    python pipeline_orders_ingest.py --date 2026-04-07
    python pipeline_orders_ingest.py                      # date = aujourd'hui
"""

from __future__ import annotations

import argparse
import sys
from datetime import date as date_cls
from typing import Any

from psycopg2.extras import execute_values

import db
import minio_client
from data_quality import run_checks
from marketplace_api_client import MarketplaceAPIClient


def extract(date: str) -> list[dict[str, Any]]:
    client = MarketplaceAPIClient()
    orders = client.get_orders(date)
    print(f"[extract] {len(orders)} commande(s) reçue(s) pour {date}")
    return orders


def upload_raw_to_minio(orders: list[dict[str, Any]], date: str) -> str:
    key = f"raw/orders/dt={date}/data.json"
    minio_client.upload_json(key, orders)
    print(f"[upload_raw_to_minio] {key}")
    return key


def load_staging(orders: list[dict[str, Any]], date: str) -> int:
    rows = [
        (
            order["orderId"], line["annonceId"], date,
            order["sellerId"], order["buyerId"], order["statusCode"],
            line["productId"], line["productType"], line["productName"], line["category"],
            line["quantite"], line["prixUnitaire"], line["montantTotal"],
            order["totalAmount"], order["shippingFee"], order["serviceFee"],
        )
        for order in orders
        for line in order["lines"]
    ]

    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            # Idempotent : on ne recharge que la partition dt du jour traité.
            cur.execute("DELETE FROM staging.orders WHERE dt = %s", (date,))
            if rows:
                execute_values(
                    cur,
                    """
                    INSERT INTO staging.orders (
                        order_id, order_line_id, dt, seller_id, buyer_id, status_code,
                        product_id, product_type, product_name, category,
                        quantity, unit_price, line_total, order_total, shipping_fee, service_fee
                    ) VALUES %s
                    """,
                    rows,
                )
        conn.commit()
    finally:
        conn.close()

    print(f"[load_staging] {len(rows)} ligne(s) chargée(s) dans staging.orders")
    return len(rows)


def check_data_quality(date: str) -> list[str]:
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            failures = run_checks(
                cur,
                table="staging.orders",
                where_clause=f"dt = '{date}'",
                rules=[
                    {"type": "not_null", "column": "order_id"},
                    {"type": "not_null", "column": "product_id"},
                    {"type": "no_future_date", "column": "dt"},
                ],
            )
    finally:
        conn.close()

    if failures:
        print(f"[check_data_quality] KO : {failures}")
    else:
        print("[check_data_quality] OK")
    return failures


def transform_to_dwh(date: str) -> None:
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            # Dimensions "stub" auto-cicatrisantes : garantit l'intégrité référentielle de
            # fact_orders même si pipeline_dims_refresh.py n'a pas encore tourné pour cette
            # date. ON CONFLICT DO NOTHING ne touche jamais une dimension déjà enrichie.
            cur.execute(
                """
                INSERT INTO dwh.dim_seller (id, name, country, joined_date)
                SELECT DISTINCT seller_id, 'seller_' || seller_id, NULL::text, NULL::date
                FROM staging.orders WHERE dt = %(date)s
                ON CONFLICT (id) DO NOTHING;

                INSERT INTO dwh.dim_product (id, name, category, seller_id)
                SELECT DISTINCT ON (product_id) product_id, product_name, category, seller_id
                FROM staging.orders WHERE dt = %(date)s
                ORDER BY product_id
                ON CONFLICT (id) DO NOTHING;
                """,
                {"date": date},
            )

            # Pattern d'idempotence obligatoire : DELETE + INSERT dans UNE transaction
            # (commit unique à la fin des deux statements).
            cur.execute(
                """
                DELETE FROM dwh.fact_orders WHERE dt = %(date)s;

                INSERT INTO dwh.fact_orders (
                    order_id, order_line_id, dt, seller_id, product_id, quantity, unit_price, total, commission
                )
                SELECT
                    order_id, order_line_id, dt, seller_id, product_id, quantity, unit_price, line_total,
                    CASE WHEN order_total > 0
                         THEN ROUND(service_fee * (line_total / order_total), 2)
                         ELSE 0
                    END AS commission
                FROM staging.orders
                WHERE dt = %(date)s;
                """,
                {"date": date},
            )
        conn.commit()
    finally:
        conn.close()

    print(f"[transform_to_dwh] dwh.fact_orders rechargé pour {date}")


def run(date: str) -> bool:
    """Retourne True si le run s'est terminé par un chargement DWH, False s'il a été
    bloqué par la data quality (dwh.fact_orders NON rechargé, comportement volontaire)."""
    orders = extract(date)
    upload_raw_to_minio(orders, date)
    load_staging(orders, date)

    failures = check_data_quality(date)
    if failures:
        print(f"[run] Data quality KO sur staging.orders, dwh.fact_orders NON rechargé : {failures}")
        return False

    transform_to_dwh(date)
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date_cls.today().isoformat(), help="YYYY-MM-DD (défaut : aujourd'hui)")
    args = parser.parse_args()

    ok = run(args.date)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
