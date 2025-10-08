-- Create machinery table
CREATE TABLE IF NOT EXISTS machinery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'operational',
  installation_date DATE,
  last_maintenance TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create maintenance orders table
CREATE TABLE IF NOT EXISTS maintenance_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id UUID REFERENCES machinery(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'preventivo' or 'correctivo'
  priority VARCHAR(50) DEFAULT 'media', -- 'baja', 'media', 'alta', 'critica'
  status VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'en_progreso', 'completada', 'cancelada'
  description TEXT,
  assigned_to VARCHAR(255),
  scheduled_date TIMESTAMP,
  completed_at TIMESTAMP,
  cost DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create sensors table
CREATE TABLE IF NOT EXISTS sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id UUID REFERENCES machinery(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sensor_type VARCHAR(100) NOT NULL, -- 'temperatura', 'vibracion', 'presion', 'velocidad', etc.
  unit VARCHAR(50) NOT NULL, -- 'C', 'Hz', 'PSI', 'RPM', etc.
  threshold_min DECIMAL(10, 2),
  threshold_max DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create sensor readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES sensors(id) ON DELETE CASCADE,
  value DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'normal', -- 'normal', 'warning', 'critical'
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES sensors(id) ON DELETE SET NULL,
  machinery_id UUID REFERENCES machinery(id) ON DELETE CASCADE,
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL, -- 'info', 'warning', 'critical'
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create maintenance history table
CREATE TABLE IF NOT EXISTS maintenance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machinery_id UUID REFERENCES machinery(id) ON DELETE CASCADE,
  order_id UUID REFERENCES maintenance_orders(id) ON DELETE SET NULL,
  performed_by VARCHAR(255),
  description TEXT NOT NULL,
  date TIMESTAMP DEFAULT NOW(),
  cost DECIMAL(10, 2),
  parts_replaced TEXT,
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_machinery_status ON machinery(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_machinery ON maintenance_orders(machinery_id);
CREATE INDEX IF NOT EXISTS idx_sensors_machinery ON sensors(machinery_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_machinery ON alerts(machinery_id);
