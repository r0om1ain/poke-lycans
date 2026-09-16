"""Client pour l'API Marketplace (remplace l'API Flask simulée du cahier des charges).

Appelle server/TcgWorld.Api/Controllers/AnalyticsExportController.cs — token Bearer,
retry sur timeout/5xx, échec immédiat sur 401 (mêmes règles que la Connection Airflow
`marketplace_api` de la version précédente, sans dépendance à Airflow).
"""

from __future__ import annotations

import time
from typing import Any

import requests

from config import MARKETPLACE_API_TOKEN, MARKETPLACE_API_URL


class MarketplaceAPIError(Exception):
    """Erreur définitive (non retryable) renvoyée par l'API Marketplace."""


class MarketplaceAPIClient:
    MAX_RETRIES = 3
    BACKOFF_SECONDS = 1.5
    TIMEOUT_SECONDS = 10

    def __init__(self, base_url: str = MARKETPLACE_API_URL, token: str = MARKETPLACE_API_TOKEN) -> None:
        self.base_url = base_url.rstrip("/")
        self.token = token

    def _session(self) -> requests.Session:
        session = requests.Session()
        if self.token:
            session.headers["Authorization"] = f"Bearer {self.token}"
        return session

    def _request(self, path: str, params: dict[str, Any] | None = None) -> Any:
        url = f"{self.base_url}/{path.lstrip('/')}"
        session = self._session()

        last_error: Exception | None = None
        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                response = session.get(url, params=params, timeout=self.TIMEOUT_SECONDS)
            except (requests.ConnectionError, requests.Timeout) as exc:
                last_error = exc
                print(f"[MarketplaceAPIClient] tentative {attempt}/{self.MAX_RETRIES} échouée ({exc}) pour {url}")
            else:
                if response.status_code == 401:
                    raise MarketplaceAPIError(
                        f"401 Unauthorized sur {url} — vérifier MARKETPLACE_API_TOKEN "
                        f"(doit correspondre à Analytics:ExportToken côté API .NET)."
                    )
                if response.status_code >= 500:
                    last_error = MarketplaceAPIError(f"{response.status_code} sur {url}")
                    print(f"[MarketplaceAPIClient] tentative {attempt}/{self.MAX_RETRIES} — {last_error}")
                else:
                    response.raise_for_status()
                    return response.json()

            if attempt < self.MAX_RETRIES:
                time.sleep(self.BACKOFF_SECONDS * attempt)

        raise MarketplaceAPIError(f"Échec après {self.MAX_RETRIES} tentatives sur {url}: {last_error}")

    def get_orders(self, date: str) -> list[dict[str, Any]]:
        """Commandes créées le `date` (YYYY-MM-DD)."""
        return self._request("orders", params={"date": date})

    def get_sellers(self, limit: int | None = None) -> list[dict[str, Any]]:
        return self._request("sellers", params={"limit": limit} if limit else None)

    def get_products(self, limit: int | None = None) -> list[dict[str, Any]]:
        return self._request("products", params={"limit": limit} if limit else None)
