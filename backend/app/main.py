from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models
from .database import engine, get_db
from .routers import auth, productos, solicitudes, recepciones, usuarios, reportes

# Crear tablas en BD (para desarrollo)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title='ClínicaInventory API',
    description='Sistema de Gestión de Inventario',
    version='1.0.0'
)

# CORS para que React pueda llamar a la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
        "http://localhost:3000",
        "https://clinica-inventario.vercel.app",
        "https://clinica-inventario-git-main.vercel.app",
        "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Registrar todos los routers
app.include_router(auth.router, prefix='/auth', tags=['Autenticación'])
app.include_router(productos.router, prefix='/productos', tags=['Productos'])
app.include_router(solicitudes.router, prefix='/solicitudes', tags=['Solicitudes'])
app.include_router(recepciones.router, prefix='/recepciones', tags=['Recepciones'])
app.include_router(usuarios.router, prefix='/usuarios', tags=['Usuarios'])
app.include_router(reportes.router, prefix='/reportes', tags=['Reportes'])


@app.get('/')
def root():
    return {'mensaje': 'ClínicaInventory API funcionando'}


@app.get('/health')
def health_check():
    return {'status': 'ok'}
