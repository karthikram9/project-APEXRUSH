from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import redis
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:mustang1989@localhost:5432/vitalscan_db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)