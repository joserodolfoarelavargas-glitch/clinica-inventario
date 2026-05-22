# backend/app/routers/usuarios.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Usuario
from ..schemas import UsuarioCreate, UsuarioOut
from ..auth import get_password_hash, get_current_user, require_admin

router = APIRouter()


@router.post('/', response_model=UsuarioOut)
def crear_usuario(user: UsuarioCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    # Verificar si el correo ya está registrado
    existe = db.query(Usuario).filter(Usuario.correo == user.correo).first()
    if existe:
        raise HTTPException(400, 'Ya existe un usuario con ese correo')
    
    hashed = get_password_hash(user.password)
    
    db_user = Usuario(
        nombre=user.nombre,
        correo=user.correo,
        hashed_pass=hashed,
        rol=user.rol,
        area=user.area
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.get('/', response_model=List[UsuarioOut])
def listar_usuarios(db: Session = Depends(get_db), admin=Depends(require_admin)):
    usuarios = db.query(Usuario).filter(Usuario.activo == True).all()
    return usuarios


@router.get('/{user_id}', response_model=UsuarioOut)
def obtener_usuario(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(404, 'Usuario no encontrado')
    return user


@router.put('/{user_id}', response_model=UsuarioOut)
def editar_usuario(user_id: int, user_data: UsuarioCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(404, 'Usuario no encontrado')
    
    user.nombre = user_data.nombre
    user.correo = user_data.correo
    user.rol = user_data.rol
    user.area = user_data.area
    
    if user_data.password:
        user.hashed_pass = get_password_hash(user_data.password)
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete('/{user_id}')
def eliminar_usuario(user_id: int, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not user:
        raise HTTPException(404, 'Usuario no encontrado')
    
    user.activo = False  # Soft delete
    db.commit()
    
    return {'ok': True, 'mensaje': 'Usuario eliminado'}