import os
import subprocess

def test_register_endpoint():
    command = [
        "curl",
        "-v",
        "-X", "POST",
        "http://localhost:3000/api/register",
        "-H", "Content-Type: application/json",
        "-d", '{"name":"Test User","email":"test@test.com","password":"test123"}',
        "-w", "\nHTTP Status: %{http_code}\n"
    ]
    
    try:
        result = subprocess.run(command, 
                              capture_output=True, 
                              text=True,
                              check=True)
        print("Respuesta completa:")
        print(result.stdout)
        print("\nSalida de error (si hay):")
        print(result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar curl: {e}")
        print(f"Salida: {e.stdout}")
        print(f"Error: {e.stderr}")

test_register_endpoint()
