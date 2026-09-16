#!/usr/bin/env python
"""Construit les tables d'agrégation analytics.* consommées par Metabase (Must have).

Même pattern idempotent que le pipeline principal : DELETE + INSERT par partition dt.
À lancer après pipeline_orders_ingest.py pour la même date.

Usage : python pipeline_analytics_aggregate.py --date 2026-04-07
"""

from __future__ import annotations

import argparse
from datetime import date as date_cls

import db


def build_daily_summary(date: str) -> None:
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM analytics.daily_summary WHERE dt = %(date)s;

                INSERT INTO analytics.daily_summary (dt, total_orders, total_revenue, top_seller_id)
                SELECT
                    %(date)s::date,
                    COUNT(DISTINCT order_id),
                    COALESCE(SUM(total), 0),
                    (
                        SELECT seller_id FROM dwh.fact_orders
                        WHERE dt = %(date)s
                        GROUP BY seller_id ORDER BY SUM(total) DESC LIMIT 1
                    )
                FROM dwh.fact_orders
                WHERE dt = %(date)s;
                """,
                {"date": date},
            )
        conn.commit()
    finally:
        conn.close()
    print(f"[build_daily_summary] {date}")


def build_seller_daily(date: str) -> None:
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM analytics.seller_daily WHERE dt = %(date)s;

                INSERT INTO analytics.seller_daily (dt, seller_id, revenue, orders_count)
                SELECT dt, seller_id, SUM(total), COUNT(DISTINCT order_id)
                FROM dwh.fact_orders
                WHERE dt = %(date)s
                GROUP BY dt, seller_id;
                """,
                {"date": date},
            )
        conn.commit()
    finally:
        conn.close()
    print(f"[build_seller_daily] {date}")


def build_category_daily(date: str) -> None:
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM analytics.category_daily WHERE dt = %(date)s;

                INSERT INTO analytics.category_daily (dt, category, revenue, orders_count)
                SELECT f.dt, p.category, SUM(f.total), COUNT(DISTINCT f.order_id)
                FROM dwh.fact_orders f
                JOIN dwh.dim_product p ON p.id = f.product_id
                WHERE f.dt = %(date)s
                GROUP BY f.dt, p.category;
                """,
                {"date": date},
            )
        conn.commit()
    finally:
        conn.close()
    print(f"[build_category_daily] {date}")


def run(date: str) -> None:
    build_daily_summary(date)
    build_seller_daily(date)
    build_category_daily(date)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date_cls.today().isoformat())
    args = parser.parse_args()
    run(args.date)


if __name__ == "__main__":
    main()
