import os
from pymongo import MongoClient

MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    raise RuntimeError("MONGO_URL env var not set")

client = MongoClient(MONGO_URL)
db = client.get_default_database()