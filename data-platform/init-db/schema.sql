-- Schéma du Data Warehouse "MarketPlace Analytics" branché sur TCGWorld.
-- Exécuté automatiquement au premier démarrage de postgres-dwh (docker-entrypoint-initdb.d).
--
-- 3 schémas séparés (staging / dwh / analytics), modèle en étoile Kimball :
--   dim_seller, dim_product, dim_date  +  fact_orders
--   analytics.daily_summary / seller_daily / category_daily (agrégations pré-calculées)
--
-- Grain de fact_orders = LIGNE de commande (pas la commande entière) : une Commande
-- TCGWorld peut contenir plusieurs annonces de vendeurs différents produits, donc le
-- modèle simplifié "1 commande = 1 produit" du cahier des charges ne correspond pas aux
-- vraies données. C'est un choix de modélisation documenté, pas un écart accidentel.

CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS dwh;
CREATE SCHEMA IF NOT EXISTS analytics;

-- ============================================================================
-- STAGING — données brutes typées, une ligne par (commande, ligne de commande).
-- Rechargée en entier à chaque run pour la partition dt (TRUNCATE scopé + INSERT,
-- voir marketplace_orders_ingest_daily).
-- ============================================================================
CREATE TABLE IF NOT EXISTS staging.orders (
    order_id        INTEGER NOT NULL,
    order_line_id   INTEGER NOT NULL,
    dt              DATE NOT NULL,
    seller_id       INTEGER NOT NULL,
    buyer_id        INTEGER NOT NULL,
    status_code     TEXT,
    product_id      INTEGER NOT NULL,
    product_type    TEXT NOT NULL,
    product_name    TEXT NOT NULL,
    category        TEXT NOT NULL,
    quantity        INTEGER NOT NULL,
    unit_price      NUMERIC(12, 2) NOT NULL,
    line_total      NUMERIC(12, 2) NOT NULL,
    order_total     NUMERIC(12, 2) NOT NULL,
    shipping_fee    NUMERIC(12, 2) NOT NULL,
    service_fee     NUMERIC(12, 2) NOT NULL,
    loaded_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (order_id, order_line_id)
);
CREATE INDEX IF NOT EXISTS idx_staging_orders_dt ON staging.orders (dt);

-- ============================================================================
-- DWH — modèle dimensionnel
-- ============================================================================

CREATE TABLE IF NOT EXISTS dwh.dim_seller (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    country     TEXT,
    joined_date DATE
);

-- id = id catalogue (carte/item), pas id d'annonce : un même produit catalogue peut être
-- vendu par plusieurs vendeurs TCGWorld, donc seller_id est indicatif (dernier vendeur vu
-- côté API export) — l'attribution réelle par vente est sur fact_orders.seller_id.
CREATE TABLE IF NOT EXISTS dwh.dim_product (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    seller_id   INTEGER
);

-- Peuplée sur une large plage fixe : évite tout risque de FK manquante sur fact_orders.dt
-- quel que soit l'ordre de run des DAGs (pas besoin d'un DAG dédié pour dim_date).
CREATE TABLE IF NOT EXISTS dwh.dim_date (
    dt              DATE PRIMARY KEY,
    year            INTEGER NOT NULL,
    month           INTEGER NOT NULL,
    day_of_week     INTEGER NOT NULL  -- 0 = dimanche ... 6 = samedi (dow Postgres)
);
INSERT INTO dwh.dim_date (dt, year, month, day_of_week)
SELECT d::date, EXTRACT(YEAR FROM d)::int, EXTRACT(MONTH FROM d)::int, EXTRACT(DOW FROM d)::int
FROM generate_series('2020-01-01'::date, '2035-12-31'::date, interval '1 day') AS d
ON CONFLICT (dt) DO NOTHING;

CREATE TABLE IF NOT EXISTS dwh.fact_orders (
    fact_id         BIGSERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL,
    order_line_id   INTEGER NOT NULL,
    dt              DATE NOT NULL REFERENCES dwh.dim_date (dt),
    seller_id       INTEGER NOT NULL REFERENCES dwh.dim_seller (id),
    product_id      INTEGER NOT NULL REFERENCES dwh.dim_product (id),
    quantity        INTEGER NOT NULL,
    unit_price      NUMERIC(12, 2) NOT NULL,
    total           NUMERIC(12, 2) NOT NULL,
    commission      NUMERIC(12, 2) NOT NULL,
    UNIQUE (order_id, order_line_id)
);
CREATE INDEX IF NOT EXISTS idx_fact_orders_dt ON dwh.fact_orders (dt);
CREATE INDEX IF NOT EXISTS idx_fact_orders_seller ON dwh.fact_orders (seller_id);
CREATE INDEX IF NOT EXISTS idx_fact_orders_product ON dwh.fact_orders (product_id);

-- ============================================================================
-- ANALYTICS — agrégations pré-calculées, rafraîchies par
-- marketplace_analytics_aggregate_daily (DELETE+INSERT par dt, même pattern idempotent).
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics.daily_summary (
    dt              DATE PRIMARY KEY,
    total_orders    INTEGER NOT NULL,
    total_revenue   NUMERIC(14, 2) NOT NULL,
    top_seller_id   INTEGER
);

CREATE TABLE IF NOT EXISTS analytics.seller_daily (
    dt              DATE NOT NULL,
    seller_id       INTEGER NOT NULL,
    revenue         NUMERIC(14, 2) NOT NULL,
    orders_count    INTEGER NOT NULL,
    PRIMARY KEY (dt, seller_id)
);

CREATE TABLE IF NOT EXISTS analytics.category_daily (
    dt              DATE NOT NULL,
    category        TEXT NOT NULL,
    revenue         NUMERIC(14, 2) NOT NULL,
    orders_count    INTEGER NOT NULL,
    PRIMARY KEY (dt, category)
);

-- Bonus (Could) : résultats du DAG marketplace_anomaly_detect_daily.
CREATE TABLE IF NOT EXISTS analytics.anomaly_log (
    dt                  DATE PRIMARY KEY,
    revenue             NUMERIC(14, 2) NOT NULL,
    avg_revenue_7d       NUMERIC(14, 2) NOT NULL,
    ratio_pct            NUMERIC(6, 2) NOT NULL,
    is_anomaly           BOOLEAN NOT NULL,
    detected_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
