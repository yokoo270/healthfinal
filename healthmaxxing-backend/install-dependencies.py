#!/usr/bin/env python3
import subprocess
import sys
import os

def run_command(command):
    """Ejecuta un comando y maneja errores"""
    try:
        print(f"Ejecutando: {command}")
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Éxito: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e.stderr}")
        return False

def main():
    print("🚀 Instalando dependencias para HealthMaxxingAI Backend...")
    print("=" * 60)
    
    # Verificar si estamos en el directorio correcto
    if not os.path.exists("package.json"):
        print("❌ Error: No se encontró package.json")
        print("   Asegúrate de estar en el directorio healthmaxxing-backend")
        sys.exit(1)
    
    # Lista de dependencias principales
    dependencies = [
        "express@^4.18.2",
        "cors@^2.8.5", 
        "sqlite3@^5.1.6",
        "bcryptjs@^2.4.3",
        "uuid@^9.0.1",
        "express-session@^1.17.3",
        "connect-sqlite3@^0.9.13"
    ]
    
    # Lista de dependencias de desarrollo
    dev_dependencies = [
        "nodemon@^3.0.1"
    ]
    
    print("📦 Instalando dependencias principales...")
    for dep in dependencies:
        if not run_command(f"npm install {dep}"):
            print(f"❌ Error instalando {dep}")
            sys.exit(1)
    
    print("\n🔧 Instalando dependencias de desarrollo...")
    for dep in dev_dependencies:
        if not run_command(f"npm install --save-dev {dep}"):
            print(f"❌ Error instalando {dep}")
            sys.exit(1)
    
    print("\n✅ ¡Todas las dependencias instaladas correctamente!")
    print("=" * 60)
    print("🎯 Dependencias instaladas:")
    print("   • express - Framework web")
    print("   • cors - Manejo de CORS")
    print("   • sqlite3 - Base de datos")
    print("   • bcryptjs - Encriptación de contraseñas")
    print("   • uuid - Generación de IDs únicos")
    print("   • express-session - Manejo de sessions")
    print("   • connect-sqlite3 - Store de sessions en SQLite")
    print("   • nodemon - Desarrollo (opcional)")
    print("\n🚀 Para iniciar el servidor:")
    print("   node server.js")
    print("\n🔧 Para desarrollo con auto-reload:")
    print("   npm run dev")

if __name__ == "__main__":
    main()
