#!/usr/bin/env python
"""Point d'entrée unique du pipeline quotidien — à lancer à la main ou via une tâche
planifiée (cron / Planificateur de tâches Windows), en remplacement de l'orchestration
Airflow.

Enchaîne, dans l'ordre :
  1. pipeline_dims_refresh   (dwh.dim_seller / dwh.dim_product)
  2. pipeline_orders_ingest  (extract -> MinIO -> staging -> dwh.fact_orders, idempotent)
  3. pipeline_analytics_aggregate (analytics.daily_summary / seller_daily / category_daily)
  4. pipeline_anomaly_detect (bonus, US-05)

Usage :
    python run_daily.py --date 2026-04-07
    python run_daily.py                      # date = aujourd'hui

Exemple de tâche planifiée (Windows, tous les jours à 6h) :
    schtasks /create /tn "MarketplaceAnalytics" /tr "python C:\\...\\data-platform\\scripts\\run_daily.py" /sc daily /st 06:00

Exemple cron (Linux/macOS, tous les jours à 6h) :
    0 6 * * * /usr/bin/python3 /path/to/data-platform/scripts/run_daily.py
"""

from __future__ import annotations

import argparse
import sys
from datetime import date as date_cls

import pipeline_analytics_aggregate
import pipeline_anomaly_detect
import pipeline_dims_refresh
import pipeline_orders_ingest


def run(date: str) -> bool:
    print(f"=== Pipeline marketplace analytics — {date} ===")

    print("\n--- 1. Refresh dimensions ---")
    pipeline_dims_refresh.run()

    print("\n--- 2. Ingestion des commandes ---")
    dq_ok = pipeline_orders_ingest.run(date)
    if not dq_ok:
        print("\nPipeline interrompu : data quality KO, étapes suivantes non exécutées.")
        return False

    print("\n--- 3. Agrégation analytics ---")
    pipeline_analytics_aggregate.run(date)

    print("\n--- 4. Détection d'anomalie (bonus) ---")
    pipeline_anomaly_detect.detect_anomaly(date)

    print(f"\n=== Pipeline terminé avec succès pour {date} ===")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--date", default=date_cls.today().isoformat(), help="YYYY-MM-DD (défaut : aujourd'hui)")
    args = parser.parse_args()

    ok = run(args.date)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
