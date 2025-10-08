"""
Script para simular datos de sensores en tiempo real.
Este script genera lecturas aleatorias para todos los sensores activos.
"""

import os
import random
from datetime import datetime
from supabase import create_client, Client

# Configurar cliente de Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def generate_sensor_reading(sensor):
    """Genera una lectura aleatoria para un sensor basada en sus umbrales"""
    min_val = sensor['threshold_min'] or 0
    max_val = sensor['threshold_max'] or 100
    
    # 80% de probabilidad de valor normal
    # 15% de probabilidad de valor en advertencia
    # 5% de probabilidad de valor crítico
    rand = random.random()
    
    if rand < 0.80:
        # Valor normal (dentro de umbrales)
        value = random.uniform(min_val + (max_val - min_val) * 0.2, 
                              max_val - (max_val - min_val) * 0.2)
        status = 'normal'
    elif rand < 0.95:
        # Valor en advertencia (cerca de umbrales)
        if random.random() < 0.5:
            value = random.uniform(min_val, min_val + (max_val - min_val) * 0.15)
        else:
            value = random.uniform(max_val - (max_val - min_val) * 0.15, max_val)
        status = 'warning'
    else:
        # Valor crítico (fuera de umbrales)
        if random.random() < 0.5:
            value = random.uniform(min_val - (max_val - min_val) * 0.1, min_val)
        else:
            value = random.uniform(max_val, max_val + (max_val - min_val) * 0.1)
        status = 'critical'
    
    return {
        'sensor_id': sensor['id'],
        'value': round(value, 2),
        'status': status,
        'timestamp': datetime.now().isoformat()
    }

def create_alert_if_needed(sensor, reading):
    """Crea una alerta si la lectura es crítica"""
    if reading['status'] == 'critical':
        alert_data = {
            'sensor_id': sensor['id'],
            'machinery_id': sensor['machinery_id'],
            'alert_type': f"{sensor['sensor_type'].capitalize()} Fuera de Rango",
            'severity': 'critical',
            'message': f"El sensor {sensor['name']} registró un valor de {reading['value']} {sensor['unit']}, fuera del rango permitido ({sensor['threshold_min']}-{sensor['threshold_max']} {sensor['unit']})",
            'status': 'active'
        }
        
        # Verificar si ya existe una alerta activa para este sensor
        existing = supabase.table('alerts').select('*').eq('sensor_id', sensor['id']).eq('status', 'active').execute()
        
        if not existing.data:
            supabase.table('alerts').insert(alert_data).execute()
            print(f"[v0] Alerta creada para sensor {sensor['name']}")

def main():
    print("[v0] Iniciando simulación de datos de sensores...")
    
    # Obtener todos los sensores activos
    response = supabase.table('sensors').select('*').eq('status', 'active').execute()
    sensors = response.data
    
    print(f"[v0] Encontrados {len(sensors)} sensores activos")
    
    # Generar lecturas para cada sensor
    readings = []
    for sensor in sensors:
        reading = generate_sensor_reading(sensor)
        readings.append(reading)
        
        # Crear alerta si es necesario
        create_alert_if_needed(sensor, reading)
    
    # Insertar todas las lecturas
    if readings:
        supabase.table('sensor_readings').insert(readings).execute()
        print(f"[v0] {len(readings)} lecturas insertadas correctamente")
    
    print("[v0] Simulación completada")

if __name__ == "__main__":
    main()
