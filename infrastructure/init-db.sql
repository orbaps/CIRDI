-- Enable extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (PostgreSQL)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'viewer')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  notification_email BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'UTC'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Devices table (PostgreSQL)
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET NOT NULL,
  mac_address MACADDR UNIQUE,
  hostname VARCHAR(255),
  device_type VARCHAR(50) NOT NULL DEFAULT 'unknown',
  vendor VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'online',
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location VARCHAR(255),
  snmp_community VARCHAR(255),
  snmp_version INTEGER,
  monitor_bandwidth BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_ip ON devices(ip_address);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);

-- Alerts table (PostgreSQL)
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  device_id UUID REFERENCES devices(id),
  source_ip INET,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON alerts(triggered_at DESC);

-- Bandwidth Metrics (TimescaleDB Hypertable)
CREATE TABLE IF NOT EXISTS bandwidth_metrics (
  time TIMESTAMPTZ NOT NULL,
  device_id UUID REFERENCES devices(id), -- Optional foreign key, might be better to use TEXT ID for high ingestion
  interface_name TEXT,
  download_bps BIGINT NOT NULL,
  upload_bps BIGINT NOT NULL,
  download_bytes BIGINT NOT NULL,
  upload_bytes BIGINT NOT NULL,
  errors_in INTEGER DEFAULT 0,
  errors_out INTEGER DEFAULT 0
);

-- Convert to hypertable
SELECT create_hypertable('bandwidth_metrics', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_bandwidth_device_time ON bandwidth_metrics(device_id, time DESC);

-- Security Events (TimescaleDB Hypertable)
CREATE TABLE IF NOT EXISTS security_events (
  time TIMESTAMPTZ NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  alert_severity INTEGER,
  alert_signature TEXT,
  src_ip INET NOT NULL,
  dest_ip INET NOT NULL,
  src_port INTEGER,
  dest_port INTEGER,
  proto TEXT,
  action VARCHAR(50),
  raw_event JSONB
);

-- Convert to hypertable
SELECT create_hypertable('security_events', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_security_src_ip ON security_events(src_ip, time DESC);
CREATE INDEX IF NOT EXISTS idx_security_severity ON security_events(alert_severity, time DESC);

-- Seed default admin user (password: changeme)
INSERT INTO users (email, name, password_hash, role, status)
VALUES (
  'admin@institute.gov.in',
  'Super Admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7d3YgSPAn6',
  'super_admin',
  'active'
) ON CONFLICT (email) DO NOTHING;
