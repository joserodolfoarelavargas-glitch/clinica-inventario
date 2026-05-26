import psycopg2
from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')
hashed = pwd_ctx.hash('admin123')

# 🔴 REEMPLAZA con tu EXTERNAL Connection String de Render
conn_string = "postgresql://clinica_user:IKHKx2ynydSaiiaZUty2y8cTmo0nFURA@dpg-d8aq72lckfvc73clu3q0-a.oregon-postgres.render.com:5432/clinica_inventario_5n9s"

try:
    conn = psycopg2.connect(conn_string)
    cursor = conn.cursor()
    
    # Crear tabla si no existe
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(120) NOT NULL,
        correo VARCHAR(120) UNIQUE NOT NULL,
        hashed_pass VARCHAR(256) NOT NULL,
        rol VARCHAR(30) DEFAULT 'responsable',
        area VARCHAR(80),
        activo BOOLEAN DEFAULT TRUE
    )
    ''')
    
    # Insertar admin
    cursor.execute('''
    INSERT INTO usuarios (nombre, correo, hashed_pass, rol, activo)
    SELECT 'Administrador', 'admin@clinica.com', %s, 'admin', TRUE
    WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'admin@clinica.com')
    ''', (hashed,))
    
    conn.commit()
    
    # Verificar
    cursor.execute("SELECT id, nombre, correo, rol FROM usuarios WHERE correo = 'admin@clinica.com'")
    admin = cursor.fetchone()
    if admin:
        print(f'✅ Administrador creado exitosamente')
        print(f'   Correo: admin@clinica.com')
        print(f'   Contraseña: admin123')
    else:
        print('❌ No se pudo crear el administrador')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')
