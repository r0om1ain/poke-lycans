"""Tests unitaires du MarketplaceAPIClient, mock de `requests` (§9.2 du cahier des charges,
adapté : plus de Connection Airflow, config lue directement par le client)."""

from unittest.mock import MagicMock, patch

import pytest

from marketplace_api_client import MarketplaceAPIClient, MarketplaceAPIError


@patch("marketplace_api_client.requests.Session.get")
def test_get_orders_success(mock_get):
    response = MagicMock(status_code=200)
    response.json.return_value = [{"orderId": 1, "lines": []}]
    response.raise_for_status.return_value = None
    mock_get.return_value = response

    client = MarketplaceAPIClient(base_url="http://api.test/api/analytics-export", token="test-token")
    result = client.get_orders("2026-04-07")

    assert result == [{"orderId": 1, "lines": []}]
    assert mock_get.call_args.args[0] == "http://api.test/api/analytics-export/orders"
    assert mock_get.call_args.kwargs["params"] == {"date": "2026-04-07"}


@patch("marketplace_api_client.requests.Session.get")
def test_401_fails_immediately_no_retry(mock_get):
    mock_get.return_value = MagicMock(status_code=401)

    client = MarketplaceAPIClient(base_url="http://api.test/api/analytics-export", token="bad-token")
    with pytest.raises(MarketplaceAPIError):
        client.get_orders("2026-04-07")

    assert mock_get.call_count == 1  # pas de retry sur une erreur d'auth


@patch("marketplace_api_client.time.sleep", return_value=None)
@patch("marketplace_api_client.requests.Session.get")
def test_retries_on_5xx_then_succeeds(mock_get, _mock_sleep):
    ok_response = MagicMock(status_code=200)
    ok_response.json.return_value = []
    ok_response.raise_for_status.return_value = None
    mock_get.side_effect = [MagicMock(status_code=500), MagicMock(status_code=502), ok_response]

    client = MarketplaceAPIClient(base_url="http://api.test/api/analytics-export", token="test-token")
    result = client.get_sellers()

    assert result == []
    assert mock_get.call_count == 3


@patch("marketplace_api_client.time.sleep", return_value=None)
@patch("marketplace_api_client.requests.Session.get")
def test_gives_up_after_max_retries(mock_get, _mock_sleep):
    mock_get.return_value = MagicMock(status_code=500)

    client = MarketplaceAPIClient(base_url="http://api.test/api/analytics-export", token="test-token")
    with pytest.raises(MarketplaceAPIError):
        client.get_products()

    assert mock_get.call_count == MarketplaceAPIClient.MAX_RETRIES
