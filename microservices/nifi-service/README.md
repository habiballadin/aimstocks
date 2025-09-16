# NiFi Data Ingestion Pipeline

## Setup Instructions

1. **Start NiFi:**
   ```bash
   ./scripts/start-nifi.sh
   ```

2. **Access NiFi UI:**
   - URL: https://localhost:8443/nifi
   - Username: admin
   - Password: ctsBtRBKHRAx69EqUghvvgEvjnaLjFEB

## Create Data Flows

### 1. Symbol Master Ingestion (Daily)
- **GenerateFlowFile** → Set to run every 24 hours
- **ExecuteScript** → Use `/opt/nifi/scripts/symbol_ingestion.py`
- **LogMessage** → Log completion status

### 2. Historical Data Ingestion (Hourly)  
- **GenerateFlowFile** → Set to run every 1 hour
- **ExecuteScript** → Use `/opt/nifi/scripts/historical_data_ingestion.py`
- **LogMessage** → Log completion status

## Processor Configuration

### GenerateFlowFile Settings:
- **Scheduling Strategy:** Timer driven
- **Run Schedule:** 
  - Symbol Master: `0 0 2 * * ?` (Daily at 2 AM)
  - Historical Data: `0 0 * * * ?` (Every hour)

### ExecuteScript Settings:
- **Script Engine:** python
- **Script File:** `/opt/nifi/scripts/[script_name].py`
- **Module Directory:** `/opt/nifi/scripts`

## Data Tables Created:
- `symbol_master` - All exchange symbols with metadata
- `historical_data` - OHLCV candle data

## Monitoring:
- Check NiFi UI for processor status
- Monitor MySQL tables for data updates
- Review NiFi logs for any errors