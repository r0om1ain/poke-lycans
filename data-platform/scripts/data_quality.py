"""Vérifications de qualité de données — règles configurables (bonus Should have, +5 pts).

Remplace le DataQualityOperator Airflow de la version précédente par de simples fonctions
appelées directement dans le script pipeline.
"""

from __future__ import annotations

from typing import Any


def _scoped(where_clause: str, extra_condition: str | None = None) -> str:
    conditions = [c for c in [where_clause, extra_condition] if c]
    return f" WHERE {' AND '.join(conditions)}" if conditions else ""


def run_checks(cursor, table: str, where_clause: str, rules: list[dict[str, Any]]) -> list[str]:
    """Exécute `rules` sur `table` (scopée par `where_clause`, ex. "dt = '2026-04-07'").

    rules: [{"type": "not_empty"}, {"type": "not_null", "column": "order_id"},
            {"type": "no_future_date", "column": "dt"}]

    Retourne la liste des échecs (vide = tout est OK).
    """
    failures: list[str] = []

    for rule in rules:
        rule_type = rule["type"]

        if rule_type == "not_empty":
            sql = f"SELECT COUNT(*) FROM {table}{_scoped(where_clause)}"
            cursor.execute(sql)
            if cursor.fetchone()[0] == 0:
                failures.append(f"not_empty: {table} n'a aucune ligne ({sql})")

        elif rule_type == "not_null":
            column = rule["column"]
            sql = f"SELECT COUNT(*) FROM {table}{_scoped(where_clause, f'{column} IS NULL')}"
            cursor.execute(sql)
            count = cursor.fetchone()[0]
            if count > 0:
                failures.append(f"not_null: {count} ligne(s) avec {column} NULL dans {table}")

        elif rule_type == "no_future_date":
            column = rule["column"]
            sql = f"SELECT COUNT(*) FROM {table}{_scoped(where_clause, f'{column} > CURRENT_DATE')}"
            cursor.execute(sql)
            count = cursor.fetchone()[0]
            if count > 0:
                failures.append(f"no_future_date: {count} ligne(s) avec {column} dans le futur dans {table}")

        else:
            raise ValueError(f"Règle de data quality inconnue: {rule_type!r}")

    return failures
