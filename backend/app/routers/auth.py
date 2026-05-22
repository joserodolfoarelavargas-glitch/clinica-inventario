# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from ..database import get_db
from ..models import Usuario
from ..schemas import Token, UsuarioOut
from ..auth import verify_password, create_access_token, get_current_user
from ..config import settings

router = APIRouter()


@router.post('/login', response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscar usuario por correo
    user = db.query(Usuario).filter(Usuario.correo == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_pass):
        raise HTTPException(status_code=401, detail='Credenciales incorrectas')
    
    if not user.activo:
        raise HTTPException(status_code=401, detail='Usuario inactivo')
    
    # Crear token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={'sub': user.correo}, expires_delta=access_token_expires
    )
    
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'rol': user.rol
    }


@router.get('/me', response_model=UsuarioOut)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user