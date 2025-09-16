from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.database import db
from shared.models import News, APIResponse
import asyncio
import httpx
import json
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="News Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsAggregator:
    def __init__(self):
        self.sources = [
            "https://feeds.finance.yahoo.com/rss/2.0/headline",
            "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"
        ]
    
    async def fetch_news(self):
        """Fetch news from various sources"""
        try:
            # Mock news data for now - in production, integrate with real news APIs
            mock_news = [
                {
                    "title": "Market Rally Continues as Nifty Hits New High",
                    "content": "The Indian stock market continued its upward trajectory with Nifty 50 reaching a new all-time high...",
                    "source": "Economic Times",
                    "category": "Market",
                    "symbols": ["NIFTY50", "SENSEX"],
                    "sentiment": "POSITIVE",
                    "published_at": datetime.now() - timedelta(hours=1)
                },
                {
                    "title": "RBI Monetary Policy Decision Expected This Week",
                    "content": "The Reserve Bank of India is expected to announce its monetary policy decision this week...",
                    "source": "Business Standard",
                    "category": "Policy",
                    "symbols": ["BANKNIFTY"],
                    "sentiment": "NEUTRAL",
                    "published_at": datetime.now() - timedelta(hours=2)
                },
                {
                    "title": "Tech Stocks Under Pressure Amid Global Concerns",
                    "content": "Technology stocks faced selling pressure as global concerns about interest rates persist...",
                    "source": "Mint",
                    "category": "Technology",
                    "symbols": ["TCS", "INFY", "WIPRO"],
                    "sentiment": "NEGATIVE",
                    "published_at": datetime.now() - timedelta(hours=3)
                }
            ]
            
            for news_item in mock_news:
                await self.store_news(news_item)
                
        except Exception as e:
            logger.error(f"Error fetching news: {str(e)}")
    
    async def store_news(self, news_item: dict):
        """Store news item in database"""
        try:
            # Check if news already exists
            existing = db.execute_query(
                "SELECT id FROM news WHERE title = %s",
                (news_item["title"],)
            )
            
            if not existing:
                db.execute_query(
                    """INSERT INTO news (title, content, source, category, symbols, sentiment, published_at) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (news_item["title"], news_item["content"], news_item["source"],
                     news_item["category"], json.dumps(news_item["symbols"]),
                     news_item["sentiment"], news_item["published_at"])
                )
        except Exception as e:
            logger.error(f"Error storing news: {str(e)}")

news_aggregator = NewsAggregator()

async def news_fetching_task():
    """Background task for fetching news"""
    while True:
        try:
            await news_aggregator.fetch_news()
            await asyncio.sleep(300)  # Fetch every 5 minutes
        except Exception as e:
            logger.error(f"Error in news fetching task: {str(e)}")
            await asyncio.sleep(600)  # Wait 10 minutes on error

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(news_fetching_task())

@app.get("/api/news")
async def get_news(category: str = None, limit: int = 20, offset: int = 0):
    try:
        query = "SELECT * FROM news"
        params = []
        
        if category:
            query += " WHERE category = %s"
            params.append(category)
        
        query += " ORDER BY published_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        news_items = db.execute_query(query, tuple(params))
        
        # Parse JSON symbols
        for item in news_items:
            if item['symbols']:
                item['symbols'] = json.loads(item['symbols'])
        
        return APIResponse(success=True, data={"news": news_items})
        
    except Exception as e:
        logger.error(f"Error getting news: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get news")

@app.get("/api/news/{news_id}")
async def get_news_item(news_id: int):
    try:
        news_item = db.execute_query(
            "SELECT * FROM news WHERE id = %s",
            (news_id,)
        )
        
        if not news_item:
            raise HTTPException(status_code=404, detail="News item not found")
        
        item = news_item[0]
        if item['symbols']:
            item['symbols'] = json.loads(item['symbols'])
        
        return APIResponse(success=True, data={"news": item})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting news item: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get news item")

@app.get("/api/news/symbol/{symbol}")
async def get_news_by_symbol(symbol: str, limit: int = 10):
    try:
        # Search for news containing the symbol
        news_items = db.execute_query(
            """SELECT * FROM news 
               WHERE symbols LIKE %s 
               ORDER BY published_at DESC 
               LIMIT %s""",
            (f'%"{symbol}"%', limit)
        )
        
        # Parse JSON symbols
        for item in news_items:
            if item['symbols']:
                item['symbols'] = json.loads(item['symbols'])
        
        return APIResponse(success=True, data={"news": news_items})
        
    except Exception as e:
        logger.error(f"Error getting news by symbol: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get news by symbol")

@app.get("/api/news/sentiment/{sentiment}")
async def get_news_by_sentiment(sentiment: str, limit: int = 20):
    try:
        if sentiment.upper() not in ["POSITIVE", "NEGATIVE", "NEUTRAL"]:
            raise HTTPException(status_code=400, detail="Invalid sentiment")
        
        news_items = db.execute_query(
            """SELECT * FROM news 
               WHERE sentiment = %s 
               ORDER BY published_at DESC 
               LIMIT %s""",
            (sentiment.upper(), limit)
        )
        
        # Parse JSON symbols
        for item in news_items:
            if item['symbols']:
                item['symbols'] = json.loads(item['symbols'])
        
        return APIResponse(success=True, data={"news": news_items})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting news by sentiment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get news by sentiment")

@app.get("/api/news/categories")
async def get_news_categories():
    try:
        categories = db.execute_query(
            """SELECT category, COUNT(*) as count 
               FROM news 
               WHERE category IS NOT NULL 
               GROUP BY category 
               ORDER BY count DESC"""
        )
        
        return APIResponse(success=True, data={"categories": categories})
        
    except Exception as e:
        logger.error(f"Error getting news categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get news categories")

@app.get("/api/news/trending")
async def get_trending_news(hours: int = 24, limit: int = 10):
    try:
        # Get news from last N hours, ordered by relevance (mock implementation)
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        trending_news = db.execute_query(
            """SELECT * FROM news 
               WHERE published_at >= %s 
               ORDER BY published_at DESC 
               LIMIT %s""",
            (cutoff_time, limit)
        )
        
        # Parse JSON symbols
        for item in trending_news:
            if item['symbols']:
                item['symbols'] = json.loads(item['symbols'])
        
        return APIResponse(success=True, data={"news": trending_news})
        
    except Exception as e:
        logger.error(f"Error getting trending news: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get trending news")

@app.get("/api/news/stats")
async def get_news_stats():
    try:
        # Get news statistics
        stats = db.execute_query(
            """SELECT 
                COUNT(*) as total_news,
                COUNT(CASE WHEN sentiment = 'POSITIVE' THEN 1 END) as positive_news,
                COUNT(CASE WHEN sentiment = 'NEGATIVE' THEN 1 END) as negative_news,
                COUNT(CASE WHEN sentiment = 'NEUTRAL' THEN 1 END) as neutral_news,
                COUNT(CASE WHEN published_at >= %s THEN 1 END) as today_news
               FROM news""",
            (datetime.now().date(),)
        )
        
        # Get top sources
        top_sources = db.execute_query(
            """SELECT source, COUNT(*) as count 
               FROM news 
               WHERE source IS NOT NULL 
               GROUP BY source 
               ORDER BY count DESC 
               LIMIT 5"""
        )
        
        return APIResponse(success=True, data={
            "stats": stats[0] if stats else {},
            "topSources": top_sources
        })
        
    except Exception as e:
        logger.error(f"Error getting news stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get news statistics")

@app.post("/api/news/search")
async def search_news(search_data: dict):
    try:
        query = search_data.get("query", "")
        limit = search_data.get("limit", 20)
        
        if not query:
            raise HTTPException(status_code=400, detail="Search query is required")
        
        # Simple text search in title and content
        news_items = db.execute_query(
            """SELECT * FROM news 
               WHERE title LIKE %s OR content LIKE %s 
               ORDER BY published_at DESC 
               LIMIT %s""",
            (f"%{query}%", f"%{query}%", limit)
        )
        
        # Parse JSON symbols
        for item in news_items:
            if item['symbols']:
                item['symbols'] = json.loads(item['symbols'])
        
        return APIResponse(success=True, data={"news": news_items})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching news: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search news")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "news-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)