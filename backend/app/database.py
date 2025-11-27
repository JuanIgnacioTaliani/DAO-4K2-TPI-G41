from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from threading import Lock

DB_USER = os.getenv("DB_USER", "dao_user")
DB_PASS = os.getenv("DB_PASS", "dao_pass")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "dao_alquiler")

SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

class _DatabaseSingleton:
    _instance = None
    _lock: Lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            pool_pre_ping=True,
        )
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)

Database = _DatabaseSingleton()

Base = declarative_base()

def get_db():
    db = Database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
