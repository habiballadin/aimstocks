# MySQL Docker Setup for AimStocks

## Quick Start

```bash
# Start MySQL container
./scripts/start-mysql.sh

# Or manually with docker-compose
docker-compose up -d mysql
```

## Database Details

- **Host**: localhost
- **Port**: 3306
- **Database**: aimstocks
- **User**: aimstocks_user
- **Password**: aimstocks_password
- **Root Password**: rootpassword

## Connect to Database

```bash
# Using MySQL client
mysql -h localhost -P 3306 -u aimstocks_user -p aimstocks

# Using Docker exec
docker exec -it aimstocks_mysql mysql -u aimstocks_user -p aimstocks
```

## Database Schema

- `users` - User accounts
- `portfolios` - User portfolios
- `holdings` - Stock holdings
- `orders` - Trading orders
- `watchlist` - User watchlists
- `market_data` - Market data cache

## Commands

```bash
# Start container
docker-compose up -d mysql

# Stop container
docker-compose down

# View logs
docker-compose logs mysql

# Remove all data
docker-compose down -v
```