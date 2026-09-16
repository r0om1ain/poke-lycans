"""Tests unitaires des règles de data quality (mock du curseur DB, pas de vraie DB requise)."""

from unittest.mock import MagicMock

from data_quality import run_checks


def _cursor_returning(*values):
    cursor = MagicMock()
    cursor.fetchone.side_effect = [(v,) for v in values]
    return cursor


def test_all_rules_pass():
    cursor = _cursor_returning(5, 0, 0)  # not_empty: 5 lignes, not_null: 0 NULL, no_future_date: 0
    failures = run_checks(
        cursor, table="staging.orders", where_clause="dt = '2026-04-07'",
        rules=[
            {"type": "not_empty"},
            {"type": "not_null", "column": "order_id"},
            {"type": "no_future_date", "column": "dt"},
        ],
    )
    assert failures == []


def test_not_empty_fails_on_zero_rows():
    cursor = _cursor_returning(0)
    failures = run_checks(cursor, table="staging.orders", where_clause="dt = '2026-04-07'", rules=[{"type": "not_empty"}])
    assert len(failures) == 1
    assert "not_empty" in failures[0]


def test_not_null_reports_count():
    cursor = _cursor_returning(3)
    failures = run_checks(
        cursor, table="staging.orders", where_clause="dt = '2026-04-07'",
        rules=[{"type": "not_null", "column": "order_id"}],
    )
    assert len(failures) == 1
    assert "3 ligne" in failures[0]


def test_unknown_rule_raises():
    cursor = MagicMock()
    try:
        run_checks(cursor, table="staging.orders", where_clause="", rules=[{"type": "bogus"}])
        assert False, "devrait lever ValueError"
    except ValueError:
        pass
