"""Test d'idempotence du pipeline (obligatoire, §9.3/§12.2 du cahier des charges) : rejouer
`transform_to_dwh` deux fois pour la même date doit donner le même COUNT(*) dans
dwh.fact_orders — pas 2x plus de lignes.

Nécessite postgres-dwh joignable (stack Docker démarrée) ; sinon le test est skip.
Utilise des ids "sentinelles" très improbables pour ne jamais entrer en collision avec de
vraies données TCGWorld, et nettoie tout ce qu'il crée.
"""

from __future__ import annotations

import pytest

import pipeline_orders_ingest
from db import get_connection

TEST_DATE = "2026-01-15"
SELLER_ID = 900_000_001
BUYER_ID = 900_000_002
PRODUCT_ID = 900_000_003
ORDER_ID = 900_000_004


@pytest.fixture
def db_available():
    try:
        conn = get_connection()
        conn.close()
    except Exception:
        pytest.skip("postgres-dwh non joignable — démarrer `docker compose up -d` dans data-platform/")


def _count_fact_orders(date: str) -> int:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM dwh.fact_orders WHERE dt = %s AND seller_id = %s", (date, SELLER_ID))
            return cur.fetchone()[0]
    finally:
        conn.close()


def _cleanup() -> None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM dwh.fact_orders WHERE dt = %s AND seller_id = %s", (TEST_DATE, SELLER_ID))
            cur.execute("DELETE FROM staging.orders WHERE dt = %s AND seller_id = %s", (TEST_DATE, SELLER_ID))
            cur.execute("DELETE FROM dwh.dim_seller WHERE id = %s", (SELLER_ID,))
            cur.execute("DELETE FROM dwh.dim_product WHERE id = %s", (PRODUCT_ID,))
        conn.commit()
    finally:
        conn.close()


def test_transform_to_dwh_is_idempotent(db_available):
    _cleanup()
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO staging.orders (
                    order_id, order_line_id, dt, seller_id, buyer_id, status_code,
                    product_id, product_type, product_name, category,
                    quantity, unit_price, line_total, order_total, shipping_fee, service_fee
                ) VALUES (%s, 1, %s, %s, %s, 'TEST', %s, 'carte', 'Carte Test Idempotence', 'Carte',
                          1, 10.00, 10.00, 10.00, 0, 1.20)
                """,
                (ORDER_ID, TEST_DATE, SELLER_ID, BUYER_ID, PRODUCT_ID),
            )
        conn.commit()
    finally:
        conn.close()

    try:
        pipeline_orders_ingest.transform_to_dwh(TEST_DATE)
        count_after_run_1 = _count_fact_orders(TEST_DATE)

        pipeline_orders_ingest.transform_to_dwh(TEST_DATE)
        count_after_run_2 = _count_fact_orders(TEST_DATE)

        assert count_after_run_1 == 1
        assert count_after_run_2 == count_after_run_1, "rejouer le transform a dupliqué des lignes"
    finally:
        _cleanup()
