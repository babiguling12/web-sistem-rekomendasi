from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get the directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))

# Create database URL
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(current_dir, 'rekomendasi_wisata.db')}"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()
