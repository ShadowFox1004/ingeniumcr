-- Insert sample machinery
INSERT INTO machinery (name, type, location, status, installation_date, description) VALUES
('Molino Principal #1', 'Molino', 'Área de Molienda A', 'operational', '2020-01-15', 'Molino principal para procesamiento de caña'),
('Molino Principal #2', 'Molino', 'Área de Molienda A', 'operational', '2020-01-15', 'Molino secundario para procesamiento de caña'),
('Caldera #1', 'Caldera', 'Área de Calderas', 'operational', '2018-06-20', 'Caldera de vapor principal'),
('Turbina Generadora', 'Generador', 'Sala de Máquinas', 'operational', '2019-03-10', 'Turbina generadora de electricidad'),
('Bomba de Agua #1', 'Bomba', 'Estación de Bombeo', 'maintenance', '2021-08-05', 'Bomba principal de agua de enfriamiento'),
('Compresor de Aire', 'Compresor', 'Sala de Compresores', 'operational', '2020-11-12', 'Compresor de aire para sistemas neumáticos'),
('Evaporador #1', 'Evaporador', 'Área de Evaporación', 'operational', '2019-09-25', 'Evaporador de jugo de caña'),
('Centrífuga #1', 'Centrífuga', 'Área de Cristalización', 'warning', '2021-02-18', 'Centrífuga para separación de azúcar');

-- Insert sensors for machinery
INSERT INTO sensors (machinery_id, name, sensor_type, unit, threshold_min, threshold_max) 
SELECT 
  m.id,
  m.name || ' - Temperatura',
  'temperatura',
  '°C',
  20,
  85
FROM machinery m WHERE m.type = 'Molino';

INSERT INTO sensors (machinery_id, name, sensor_type, unit, threshold_min, threshold_max) 
SELECT 
  m.id,
  m.name || ' - Vibración',
  'vibracion',
  'Hz',
  0,
  50
FROM machinery m WHERE m.type IN ('Molino', 'Turbina Generadora', 'Compresor');

INSERT INTO sensors (machinery_id, name, sensor_type, unit, threshold_min, threshold_max) 
SELECT 
  m.id,
  m.name || ' - Presión',
  'presion',
  'PSI',
  50,
  150
FROM machinery m WHERE m.type IN ('Caldera', 'Bomba', 'Compresor');

INSERT INTO sensors (machinery_id, name, sensor_type, unit, threshold_min, threshold_max) 
SELECT 
  m.id,
  m.name || ' - Velocidad',
  'velocidad',
  'RPM',
  100,
  1800
FROM machinery m WHERE m.type IN ('Molino', 'Turbina Generadora', 'Centrífuga');

-- Insert sample maintenance orders
INSERT INTO maintenance_orders (machinery_id, title, type, priority, status, description, assigned_to, scheduled_date)
SELECT 
  id,
  'Mantenimiento Preventivo Mensual',
  'preventivo',
  'media',
  'pendiente',
  'Revisión general, lubricación y ajustes',
  'Juan Pérez',
  NOW() + INTERVAL '3 days'
FROM machinery WHERE name = 'Molino Principal #1';

INSERT INTO maintenance_orders (machinery_id, title, type, priority, status, description, assigned_to, scheduled_date)
SELECT 
  id,
  'Reparación de Fuga',
  'correctivo',
  'alta',
  'en_progreso',
  'Reparar fuga en sistema de enfriamiento',
  'Carlos Rodríguez',
  NOW()
FROM machinery WHERE name = 'Bomba de Agua #1';

INSERT INTO maintenance_orders (machinery_id, title, type, priority, status, description, assigned_to, scheduled_date)
SELECT 
  id,
  'Inspección de Rodamientos',
  'preventivo',
  'alta',
  'pendiente',
  'Inspección y posible reemplazo de rodamientos',
  'Miguel Santos',
  NOW() + INTERVAL '1 day'
FROM machinery WHERE name = 'Centrífuga #1';

-- Insert sample sensor readings (last 24 hours)
INSERT INTO sensor_readings (sensor_id, value, status, timestamp)
SELECT 
  s.id,
  CASE 
    WHEN s.sensor_type = 'temperatura' THEN 65 + (RANDOM() * 15)
    WHEN s.sensor_type = 'vibracion' THEN 20 + (RANDOM() * 20)
    WHEN s.sensor_type = 'presion' THEN 80 + (RANDOM() * 40)
    WHEN s.sensor_type = 'velocidad' THEN 1200 + (RANDOM() * 400)
  END,
  'normal',
  NOW() - (INTERVAL '1 hour' * generate_series)
FROM sensors s
CROSS JOIN generate_series(0, 23);

-- Insert sample alerts
INSERT INTO alerts (sensor_id, machinery_id, alert_type, severity, message, status)
SELECT 
  s.id,
  s.machinery_id,
  'Temperatura Alta',
  'warning',
  'La temperatura ha superado el umbral recomendado',
  'active'
FROM sensors s
JOIN machinery m ON s.machinery_id = m.id
WHERE m.name = 'Centrífuga #1' AND s.sensor_type = 'temperatura';

INSERT INTO alerts (sensor_id, machinery_id, alert_type, severity, message, status)
SELECT 
  s.id,
  s.machinery_id,
  'Presión Baja',
  'critical',
  'La presión está por debajo del nivel mínimo operativo',
  'active'
FROM sensors s
JOIN machinery m ON s.machinery_id = m.id
WHERE m.name = 'Bomba de Agua #1' AND s.sensor_type = 'presion';
