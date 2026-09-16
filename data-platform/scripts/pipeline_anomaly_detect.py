#!/usr/bin/env python
"""Détection d'anomalie sur le CA journalier (bonus, US-05).

Compare analytics.daily_summary.total_revenue du jour à la moyenne mobile des 7 jours
précédents. Alerte (log + table analytics.anomaly_log) si le CA du jour < 70% de cette
moyenne. À lancer après pipeline_analytics_aggregate.py.

Usage : python pipeline_anomaly_detect.py --date 2026-04-07
"""

from __future__ import annotations

import argparse
from datetime import date as date_cls

import db

ANOMALY_THRESHOLD_PCT = 70.0


def detect_anomaly(date: str) -> bool:
    conn = db.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    COALESCE((SELECT total_revenue FROM analytics.daily_summary WHERE dt = %(date)s), 0),
                    COALESCE((
                        SELECT AVG(total_revenue) FROM analytics.daily_summary
                        WHERE dt >= %(date)s::date - INTERVAL '7 days' AND dt < %(date)s::date
                    ), 0)
                """,
                {"date": date},
            )
            revenue, avg_7d = cur.fetchone()

            ratio_pct = round(float(revenue) / float(avg_7d) * 100, 2) if avg_7d else 0.0
            is_anomaly = bool(avg_7d) and ratio_pct < ANOMALY_THRESHOLD_PCT

            cur.execute(
                """
                INSERT INTO analytics.anomaly_log (dt, revenue, avg_revenue_7d, ratio_pct, is_anomaly)
                VALUES (%(date)s, %(revenue)s, %(avg_7d)s, %(ratio)s, %(is_anomaly)s)
                ON CONFLICT (dt) DO UPDATE SET
                    revenue = EXCLUDED.revenue, avg_revenue_7d = EXCLUDED.avg_revenue_7d,
                    ratio_pct = EXCLUDED.ratio_pct, is_anomaly = EXCLUDED.is_anomaly, detected_at = now()
                """,
                {"date": date, "revenue": revenue, "avg_7d": avg_7d, "ratio": ratio_pct, "is_anomaly": is_anomaly},
            )
        conn.commit()
    finally:
        conn.close()

    if is_anomaly:
        print(f"[detect_anomaly] ANOMALIE CA le {date} : {revenue}€ vs moyenne 7j {avg_7d}€ ({ratio_pct}%)")
    else:
        print(f"[detect_anomaly] CA du {date} dans la normale ({ratio_pct}% de la moyenne 7j)")
    return is_anomaly


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date_cls.today().isoformat())
    args = parser.parse_args()
    detect_anomaly(args.date)


if __name__ == "__main__":
    main()
