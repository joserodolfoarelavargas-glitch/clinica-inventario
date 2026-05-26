from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Usuario
from app.auth import get_password_hash

# Tu DATABASE_URL de Railway
DATABASE_URL = "postgresql://postgres:bcAaeTsbwzzskuAdAULnaSUgierBNgRD@postgres.railway.internal:5432/railway"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("Conectando a la base de datos...")

if not db.query(Usuario).filter(Usuario.correo == 'admin@clinica.com').first():
    admin = Usuario(
        nombre='Administrador',
        correo='admin@clinica.com',
        hashed_pass=get_password_hash('admin123'),
        rol='admin',
        activo=True
    )
    db.add(admin)
    db.commit()
    print('✅ Administrador creado exitosamente')
    print('   Correo: admin@clinica.com')
    print('   Contraseña: admin123')
else:
    print('⚠️ El administrador ya existe')

db.close()
