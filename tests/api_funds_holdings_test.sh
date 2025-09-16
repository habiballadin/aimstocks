#!/bin/bash

# Replace BASE_URL with your API base URL
BASE_URL="http://localhost:8002"

# Replace USER_ID with a valid user ID for testing
USER_ID="test-user-123"

echo "Testing funds API..."

curl -X POST "$BASE_URL/api/fyers/funds" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'"$USER_ID"'",
    "fund_limit": [
      {
        "id": 1,
        "title": "Total Balance",
        "equityAmount": 10000.50,
        "commodityAmount": 0
      },
      {
        "id": 2,
        "title": "Utilized Amount",
        "equityAmount": 2000.50,
        "commodityAmount": 0
      },
      {
        "id": 3,
        "title": "Clear Balance",
        "equityAmount": 8000.00,
        "commodityAmount": 0
      },
      {
        "id": 4,
        "title": "Realized Profit and Loss",
        "equityAmount": 500.00,
        "commodityAmount": 0
      },
      {
        "id": 10,
        "title": "Available Balance",
        "equityAmount": 7500.00,
        "commodityAmount": 0
      }
    ]
  }'

echo -e "\nTesting holdings API..."

curl -X POST "$BASE_URL/api/fyers/holdings" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "'"$USER_ID"'",
    "holdings": [
      {
        "symbol": "RELIANCE",
        "exchange": "NSE",
        "quantity": 10,
        "avg_price": 2500.00,
        "current_price": 2600.00,
        "market_value": 26000.00,
        "pnl": 1000.00,
        "pnl_percent": 4.0
      },
      {
        "symbol": "TCS",
        "exchange": "NSE",
        "quantity": 5,
        "avg_price": 3000.00,
        "current_price": 3100.00,
        "market_value": 15500.00,
        "pnl": 500.00,
        "pnl_percent": 3.33
      }
    ]
  }'

echo -e "\nFunds and holdings API test completed."
