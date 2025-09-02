-- Franchiseen Platform Database Initialization
-- This script sets up the initial database structure for development

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create a dedicated user for the application (optional, for production)
-- CREATE USER franchiseen_app WITH PASSWORD 'secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE franchiseen_platform TO franchiseen_app;

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just examples of what we might need

-- Performance settings for development
-- These would be different in production
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;

-- Reload configuration
SELECT pg_reload_conf();
