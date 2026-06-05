from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Configuración especial para PostgreSQL en producción
connect_args = {}
if settings.DATABASE_URL.startswith('sqlite'):
    connect_args = {"check_same_thread": False}

# Modificado: Agregamos parámetros pool para evitar el error SSL en Render
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args,
    pool_pre_ping=True,   # Verifica que la conexión no esté rota antes de enviar una consulta
    pool_recycle=300      # Recicla y renueva la conexión automáticamente cada 5 minutos
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()