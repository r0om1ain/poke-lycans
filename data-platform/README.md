# MarketPlace Analytics — branché sur TCGWorld

Pipeline ELT (scripts Python + MinIO + PostgreSQL DWH + Metabase) construit pour répondre
au cahier des charges *"Projet A : MarketPlace Analytics"*, **branché sur les vraies
données de la marketplace TCGWorld** (cartes Pokémon), avec une orchestration par scripts
Python simples plutôt que par Airflow (écart assumé par rapport à la consigne, qui demande
Airflow — voir la section "Écarts par rapport au cahier des charges").

## Écarts par rapport au cahier des charges

- **Orchestration** : le cahier des charges demande Airflow 3.1.8. Ce projet utilise des
  **scripts Python simples** (`scripts/`), lancés à la main ou via une tâche planifiée
  (cron / Planificateur de tâches Windows). Conséquence sur la grille de notation (§14) :
  pas de Custom Hook Airflow, pas de DAG, pas de test pytest sur un DAGBag — remplacés par
  un client API "maison" (`marketplace_api_client.py`) et des tests pytest sur les scripts
  eux-mêmes (voir `tests/`).
- **Source de données** : l'API Flask simulée (`api-marketplace`) est remplacée par
  `server/TcgWorld.Api` (backend .NET existant), qui expose 3 routes d'export dédiées avec
  le même contrat d'auth Bearer : `GET /api/analytics-export/{orders,sellers,products}`
  (voir `server/TcgWorld.Api/Controllers/AnalyticsExportController.cs`). Cette API tourne
  sur l'hôte (`dotnet run`), pas dans Docker.
- **Grain de `fact_orders`** = la **ligne de commande**, pas la commande entière (une
  `Commande` TCGWorld peut contenir plusieurs annonces d'un même vendeur).
- **`commission`** = `CmdFraisService` (frais de service de la commande) pro-ratée par
  ligne, plutôt qu'un taux fixe fictif de 12 %.
- **Dimensions "stub" auto-cicatrisantes** : `transform_to_dwh` upsert une version minimale
  de `dim_seller`/`dim_product` à partir de `staging.orders` avant d'insérer les faits,
  garantissant l'intégrité référentielle même si `pipeline_dims_refresh.py` n'a pas encore
  tourné pour cette date.

## Architecture

```mermaid
flowchart LR
    subgraph src["Source"]
        api["TCGWorld API .NET<br/>/api/analytics-export<br/>(sur l'hôte, port 5009)"]
    end

    subgraph orch["Orchestration (scripts Python, sur l'hôte)"]
        client["MarketplaceAPIClient"]
        pipe["run_daily.py<br/>dims_refresh -> orders_ingest -> aggregate -> anomaly"]
        dq["data_quality.py<br/>(bonus)"]
    end

    subgraph store["Stockage (Docker)"]
        minio[("MinIO<br/>raw/orders/dt=.../data.json")]
        pg[("PostgreSQL 18<br/>staging / dwh / analytics")]
    end

    subgraph bi["BI"]
        meta["Metabase<br/>4 dashboards"]
    end

    subgraph obs["Observabilité (bonus)"]
        prom[("Prometheus")]
        graf["Grafana"]
    end

    api -->|Bearer token| client --> pipe
    pipe -->|upload raw JSON| minio
    pipe -->|load staging| pg
    pipe --> dq
    dq -->|OK| pg
    pg --> meta
    pg -. postgres-exporter .-> prom
    prom --> graf
```

```mermaid
sequenceDiagram
    participant CLI as run_daily.py (cron / manuel)
    participant C as MarketplaceAPIClient
    participant A as TCGWorld API (.NET)
    participant M as MinIO
    participant P as PostgreSQL (dwh)
    participant MB as Metabase

    CLI->>C: get_orders(date)
    C->>A: GET /api/analytics-export/orders?date=...
    A-->>C: JSON commandes réelles
    CLI->>M: PUT raw/orders/dt=.../data.json
    CLI->>P: DELETE+INSERT staging.orders (dt)
    CLI->>P: data_quality.run_checks (not_null, no_future_date)
    CLI->>P: DELETE+INSERT dwh.fact_orders (dt)
    CLI->>P: REFRESH analytics.daily_summary/seller_daily/category_daily
    MB->>P: SELECT pour les dashboards
```

## Modèle de données

Voir `init-db/schema.sql`. Schéma en étoile Kimball, 3 schémas séparés :

```
dim_seller   (id, name, country, joined_date)
dim_product  (id, name, category, seller_id)      -- category = 'Carte' ou TypeItem (ETB, Display, ...)
dim_date     (dt, year, month, day_of_week)
fact_orders  (fact_id, order_id, order_line_id, dt, seller_id, product_id,
              quantity, unit_price, total, commission)
analytics.daily_summary  (dt, total_orders, total_revenue, top_seller_id)
analytics.seller_daily   (dt, seller_id, revenue, orders_count)
analytics.category_daily (dt, category, revenue, orders_count)
analytics.anomaly_log    (dt, revenue, avg_revenue_7d, ratio_pct, is_anomaly)   -- bonus
```

## Scripts (`scripts/`)

| Script | Rôle |
|---|---|
| `config.py` | Configuration centralisée (env vars + `.env`) |
| `marketplace_api_client.py` | Client HTTP vers l'API TCGWorld (retry, token Bearer) |
| `db.py` / `minio_client.py` | Connexions PostgreSQL DWH / MinIO |
| `data_quality.py` | Règles configurables (`not_null`, `not_empty`, `no_future_date`) |
| `pipeline_dims_refresh.py` | Upsert `dwh.dim_seller` / `dwh.dim_product` |
| `pipeline_orders_ingest.py` | Pipeline principal : extract → MinIO → staging → dwh (idempotent) |
| `pipeline_analytics_aggregate.py` | Construit les tables `analytics.*` |
| `pipeline_anomaly_detect.py` | Bonus : détection d'anomalie CA (US-05) |
| `run_daily.py` | Point d'entrée unique, enchaîne les 4 étapes — à planifier |

## Lancement

### 1. API TCGWorld (source de données)

```bash
cd server/TcgWorld.Api
# server/TcgWorld.Api/appsettings.Development.json (gitignored) doit contenir :
#   { "ConnectionStrings": {"Default": "..."}, "Jwt": {"Secret": "..."},
#     "Analytics": { "ExportToken": "formation-token-2026" } }
dotnet tool restore
dotnet ef database update
dotnet run
# API dispo sur http://localhost:5009
```

Vérification :
```bash
curl http://localhost:5009/api/analytics-export/health
curl -H "Authorization: Bearer formation-token-2026" \
  "http://localhost:5009/api/analytics-export/orders?date=2026-04-07"
```

### 2. Stack Docker (MinIO, PostgreSQL DWH, Metabase)

```bash
cd data-platform
cp .env.example .env
docker compose --env-file .env up -d
docker compose ps   # attendre que tout soit healthy
```

### 3. Environnement Python pour les scripts

```bash
cd data-platform
python -m venv .venv
.venv\Scripts\activate        # Windows  (source .venv/bin/activate sous Linux/macOS)
pip install -r requirements.txt
```

### 4. Lancer le pipeline

```bash
cd data-platform/scripts
python run_daily.py --date 2026-04-07     # ou sans --date pour la date du jour
```

Chaque étape est aussi exécutable séparément (`python pipeline_orders_ingest.py --date ...`, etc.).

### 5. Planifier l'exécution quotidienne

- **Windows** : `schtasks /create /tn "MarketplaceAnalytics" /tr "python C:\...\data-platform\scripts\run_daily.py" /sc daily /st 06:00`
- **Linux/macOS (cron)** : `0 6 * * * /usr/bin/python3 /path/to/data-platform/scripts/run_daily.py`

### 6. Test manuel d'idempotence (§12.3)

```bash
python pipeline_orders_ingest.py --date 2026-04-07
docker compose exec postgres-dwh psql -U dwh_user -d dwh \
  -c "SELECT COUNT(*) FROM dwh.fact_orders WHERE dt='2026-04-07';"
# -> N lignes

python pipeline_orders_ingest.py --date 2026-04-07
docker compose exec postgres-dwh psql -U dwh_user -d dwh \
  -c "SELECT COUNT(*) FROM dwh.fact_orders WHERE dt='2026-04-07';"
# -> toujours N lignes (pas 2*N)
```

Test automatisé équivalent : `tests/test_idempotence.py` (voir section Tests).

### 7. Backfill 7 jours (bonus Could)

```bash
for i in 0 1 2 3 4 5 6; do
  d=$(date -d "2026-04-07 -$i day" +%F)   # macOS : date -j -v-${i}d -f "%Y-%m-%d" 2026-04-07 +%F
  python pipeline_orders_ingest.py --date "$d"
done
```

## Metabase

1. http://localhost:3000 → créer le compte admin (`admin@maelys.local` / `Admin2026!` suggéré).
2. Ajouter une source de données PostgreSQL :
   - Host : `postgres-dwh` (nom Docker, **pas** `localhost`)
   - Port : `5432` (port **interne**, pas `5433`)
   - Database : `dwh` — Username/password : ceux de `.env` (`DWH_USER`/`DWH_PASSWORD`)
3. Créer les questions ci-dessous en **SQL natif**, puis les assembler en dashboards.

### Dashboard 1 — Executive Summary (MVP)

**CA total aujourd'hui (Big Number)**
```sql
SELECT COALESCE(SUM(total_revenue), 0) AS ca_du_jour
FROM analytics.daily_summary
WHERE dt = CURRENT_DATE;
```

**CA des 30 derniers jours (Line chart)**
```sql
SELECT dt, total_revenue
FROM analytics.daily_summary
WHERE dt >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY dt;
```

**Top 5 vendeurs du jour (Bar chart)**
```sql
SELECT s.name AS vendeur, sd.revenue
FROM analytics.seller_daily sd
JOIN dwh.dim_seller s ON s.id = sd.seller_id
WHERE sd.dt = CURRENT_DATE
ORDER BY sd.revenue DESC
LIMIT 5;
```

### Dashboard 2 — Top Sellers (MVP)

**Top 10 vendeurs du mois (Bar chart)**
```sql
SELECT s.name AS vendeur, SUM(sd.revenue) AS ca_mois
FROM analytics.seller_daily sd
JOIN dwh.dim_seller s ON s.id = sd.seller_id
WHERE sd.dt >= date_trunc('month', CURRENT_DATE)
GROUP BY s.name
ORDER BY ca_mois DESC
LIMIT 10;
```

**Évolution du CA des top 3 vendeurs sur 30 jours (Line chart)**
```sql
WITH top3 AS (
    SELECT seller_id FROM analytics.seller_daily
    WHERE dt >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY seller_id ORDER BY SUM(revenue) DESC LIMIT 3
)
SELECT sd.dt, s.name AS vendeur, sd.revenue
FROM analytics.seller_daily sd
JOIN dwh.dim_seller s ON s.id = sd.seller_id
WHERE sd.seller_id IN (SELECT seller_id FROM top3)
  AND sd.dt >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY sd.dt;
```

**Vendeurs inactifs > 7 jours (Table)**
```sql
SELECT s.name AS vendeur, MAX(sd.dt) AS derniere_vente
FROM dwh.dim_seller s
LEFT JOIN analytics.seller_daily sd ON sd.seller_id = s.id
GROUP BY s.name
HAVING MAX(sd.dt) IS NULL OR MAX(sd.dt) < CURRENT_DATE - INTERVAL '7 days';
```

### Dashboards bonus (Should, +5 pts)

**Dashboard 3 — Commissions**
```sql
SELECT dt, SUM(commission) AS commissions
FROM dwh.fact_orders
WHERE dt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY dt ORDER BY dt;
```

**Dashboard 4 — Catégories**
```sql
SELECT category, SUM(revenue) AS ca
FROM analytics.category_daily
WHERE dt >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY category ORDER BY ca DESC;
```

## Observabilité (bonus Could, +10 pts)

`prometheus`, `grafana`, `postgres-exporter` sont dans `docker-compose.yml` (pas de
`statsd-exporter` : sans Airflow, il n'y a plus de métriques StatsD à convertir — seules les
métriques PostgreSQL du DWH sont exposées).

1. http://localhost:3001 (`admin`/`admin`) → **Dashboards → Import**.
2. Ajouter Prometheus comme source (`http://prometheus:9090`).
3. Importer l'ID **9628** — PostgreSQL Database (connexions, requêtes, locks).

## Tests

```bash
cd data-platform
pytest tests/ -v
```

- `test_marketplace_api_client.py` : client mocké (succès, 401 sans retry, retry sur 5xx,
  abandon après `MAX_RETRIES`).
- `test_data_quality.py` : règles de data quality (curseur mocké, pas de DB requise).
- `test_idempotence.py` : **vérification d'idempotence réelle** contre postgres-dwh (skip
  automatique si la stack Docker n'est pas démarrée) — rejoue `transform_to_dwh` deux fois
  et vérifie que `COUNT(*)` ne double pas.

## Choix techniques justifiés

- **Scripts Python plutôt qu'Airflow** : décision prise en cours de projet pour rester
  simple et déboguable sans dépendre d'une stack Airflow lourde (5 services rien que pour
  l'orchestration). Contrepartie assumée : pas de scheduler intégré, pas d'UI de suivi des
  runs, pas de retry automatique au niveau tâche (le retry existe seulement dans
  `MarketplaceAPIClient`, pas autour des étapes du pipeline) — acceptable pour ce volume de
  données et ce contexte.
- **DELETE + INSERT plutôt que MERGE/UPSERT** pour `fact_orders` et les tables
  `analytics.*` : plus simple, plus rapide pour des lots de cette taille, état
  prévisible après chaque run.
- **Pas de dbt/Spark** : volumétrie largement dans les capacités de scripts Python +
  `psycopg2`. Avec plus de temps, dbt remplacerait avantageusement le SQL embarqué dans les
  scripts pour la testabilité et la lignée des colonnes.

## Non implémenté / pistes avec plus de temps

- Orchestrateur dédié (Airflow, ou plus léger type Dagster/Prefect) pour avoir un
  scheduler, une UI de suivi, et des retries au niveau tâche plutôt qu'au niveau requête
  HTTP seulement.
- Provisioning automatique des dashboards Metabase via son API REST (fait manuellement ici
  via les requêtes SQL ci-dessus).
- Import automatisé du dashboard Grafana 9628 (étape manuelle documentée ci-dessus).
- SCD2 sur les dimensions, CI/CD GitHub Actions, migration cloud : hors périmètre.
