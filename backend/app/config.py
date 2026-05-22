from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'sqlite:///./inventario.db')
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    DIAS_STOCK_MINIMO: int = 3
    DIAS_ALERTA: int = 7
    DIAS_STOCK_MAXIMO: int = 30

    class Config:
        env_file = '.env'

settings = Settings()