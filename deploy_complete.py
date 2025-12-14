#!/usr/bin/env python3
"""
Complete deployment script for Google ADK Agent Platform
Deploys both SvelteKit frontend and FastAPI backend with full infrastructure
"""

import os
import sys
import json
import subprocess
import shutil
from pathlib import Path
import argparse

class ADKPlatformDeployer:
    def __init__(self, target_dir="adk-platform-deployment"):
        self.target_dir = target_dir
        self.workspace = Path("/workspace")
        
    def create_directory_structure(self):
        """Create the deployment directory structure"""
        directories = [
            f"{self.target_dir}/frontend",
            f"{self.target_dir}/backend",
            f"{self.target_dir}/database",
            f"{self.target_dir}/nginx",
            f"{self.target_dir}/docker",
            f"{self.target_dir}/kubernetes",
            f"{self.target_dir}/monitoring",
            f"{self.target_dir}/scripts",
            f"{self.target_dir}/docs"
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            
        print("✅ Directory structure created")
        
    def copy_sveltekit_frontend(self):
        """Copy and prepare SvelteKit frontend"""
        src = self.workspace / "sveltekit-frontend"
        dst = Path(self.target_dir) / "frontend"
        
        if src.exists():
            # Copy all files
            for item in src.rglob("*"):
                if item.is_file():
                    relative_path = item.relative_to(src)
                    target_path = dst / relative_path
                    target_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(item, target_path)
                    
            # Create production Dockerfile
            dockerfile_content = """# Multi-stage build for SvelteKit frontend
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
"""
            
            with open(dst / "Dockerfile", "w") as f:
                f.write(dockerfile_content)
                
            # Create nginx configuration
            nginx_config = """events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    server {
        listen 80;
        server_name localhost;
        
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # Handle SvelteKit routing
        location / {
            try_files $uri $uri/ @fallback;
        }
        
        location @fallback {
            rewrite ^.*$ /index.html last;
        }
        
        # Cache static assets
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # API proxy to backend
        location /api/ {
            proxy_pass http://backend:8000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # WebSocket proxy for chat
        location /ws/ {
            proxy_pass http://backend:8000/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
"""
            
            with open(dst / "nginx.conf", "w") as f:
                f.write(nginx_config)
                
            print("✅ SvelteKit frontend prepared")
        else:
            print("⚠️ SvelteKit frontend not found, skipping...")
            
    def copy_backend(self):
        """Copy and prepare FastAPI backend"""
        src = self.workspace / "backend"
        dst = Path(self.target_dir) / "backend"
        
        if src.exists():
            # Copy all backend files
            for item in src.rglob("*"):
                if item.is_file():
                    relative_path = item.relative_to(src)
                    target_path = dst / relative_path
                    target_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(item, target_path)
                    
            # Create production Dockerfile
            dockerfile_content = """# Python backend for Google ADK Agent Platform
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PYTHONPATH=/app

# Create app user
RUN useradd --create-home --shell /bin/bash app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Change ownership to app user
RUN chown -R app:app /app

# Switch to app user
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "main.py"]
"""
            
            with open(dst / "Dockerfile", "w") as f:
                f.write(dockerfile_content)
                
            print("✅ FastAPI backend prepared")
        else:
            print("⚠️ Backend not found, skipping...")
            
    def create_docker_compose(self):
        """Create Docker Compose configuration"""
        compose_content = """version: '3.8'

services:
  # PostgreSQL Database
  database:
    image: postgres:15-alpine
    container_name: adk-postgres
    environment:
      POSTGRES_DB: adk_platform
      POSTGRES_USER: adk_user
      POSTGRES_PASSWORD: adk_password_123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U adk_user -d adk_platform"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: adk-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: adk-backend
    environment:
      DATABASE_URL: postgresql://adk_user:adk_password_123@database:5432/adk_platform
      REDIS_URL: redis://redis:6379
      SECRET_KEY: your-secret-key-change-in-production
      DEBUG: "false"
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # SvelteKit Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: adk-frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      backend:
        condition: service_healthy
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro

  # Monitoring - Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: adk-prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  # Monitoring - Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: adk-grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin123
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    name: adk-network
"""
        
        with open(f"{self.target_dir}/docker-compose.yml", "w") as f:
            f.write(compose_content)
            
        print("✅ Docker Compose configuration created")
        
    def create_kubernetes_deployment(self):
        """Create Kubernetes deployment manifests"""
        # Backend deployment
        backend_deployment = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: adk-backend
  labels:
    app: adk-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: adk-backend
  template:
    metadata:
      labels:
        app: adk-backend
    spec:
      containers:
      - name: backend
        image: adk-platform-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: adk-secrets
              key: database-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: adk-secrets
              key: secret-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: adk-backend-service
spec:
  selector:
    app: adk-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
"""
        
        # Frontend deployment
        frontend_deployment = """apiVersion: apps/v1
kind: Deployment
metadata:
  name: adk-frontend
  labels:
    app: adk-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: adk-frontend
  template:
    metadata:
      labels:
        app: adk-frontend
    spec:
      containers:
      - name: frontend
        image: adk-platform-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: adk-frontend-service
spec:
  selector:
    app: adk-frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
"""
        
        with open(f"{self.target_dir}/kubernetes/backend-deployment.yml", "w") as f:
            f.write(backend_deployment)
            
        with open(f"{self.target_dir}/kubernetes/frontend-deployment.yml", "w") as f:
            f.write(frontend_deployment)
            
        print("✅ Kubernetes deployment manifests created")
        
    def create_monitoring_config(self):
        """Create monitoring configuration"""
        # Prometheus config
        prometheus_config = """global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'adk-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    
  - job_name: 'adk-frontend'
    static_configs:
      - targets: ['frontend:80']
"""
        
        with open(f"{self.target_dir}/monitoring/prometheus.yml", "w") as f:
            f.write(prometheus_config)
            
        print("✅ Monitoring configuration created")
        
    def create_deployment_scripts(self):
        """Create deployment automation scripts"""
        # Deploy script
        deploy_script = """#!/bin/bash
set -e

echo "🚀 Deploying Google ADK Agent Platform..."

# Build and start services
echo "Building Docker images..."
docker-compose build

echo "Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to be ready..."
sleep 30

# Check service health
echo "Checking service health..."
docker-compose ps

# Run database migrations if needed
echo "Running database migrations..."
# Add migration commands here

echo "✅ Deployment completed successfully!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "Monitoring: http://localhost:3000 (Grafana)"
"""
        
        # Stop script
        stop_script = """#!/bin/bash
echo "🛑 Stopping Google ADK Agent Platform..."

docker-compose down

echo "✅ Platform stopped"
"""
        
        with open(f"{self.target_dir}/scripts/deploy.sh", "w") as f:
            f.write(deploy_script)
            
        with open(f"{self.target_dir}/scripts/stop.sh", "w") as f:
            f.write(stop_script)
            
        # Make scripts executable
        os.chmod(f"{self.target_dir}/scripts/deploy.sh", 0o755)
        os.chmod(f"{self.target_dir}/scripts/stop.sh", 0o755)
        
        print("✅ Deployment scripts created")
        
    def create_documentation(self):
        """Create deployment documentation"""
        readme_content = """# Google ADK Agent Platform - Deployment Guide

This directory contains a complete deployment package for the Google ADK Agent Platform.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 80, 443, 3000, 5432, 6379, 8000, 9090 available

### Deployment Steps

1. **Deploy the platform:**
   ```bash
   cd scripts
   ./deploy.sh
   ```

2. **Access the platform:**
   - Frontend: http://localhost
   - API Documentation: http://localhost:8000/docs
   - Grafana Monitoring: http://localhost:3000 (admin/admin123)

### Services

- **Frontend** (Port 80): SvelteKit application
- **Backend** (Port 8000): FastAPI with workflow management
- **Database** (Port 5432): PostgreSQL
- **Cache** (Port 6379): Redis
- **Monitoring** (Port 3000): Grafana dashboard
- **Metrics** (Port 9090): Prometheus

### Configuration

Environment variables can be configured in `docker-compose.yml`:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: Application secret key
- `DEBUG`: Enable debug mode (true/false)

### Production Deployment

For production deployment:

1. Update `docker-compose.yml` with production values
2. Change default passwords
3. Configure SSL certificates
4. Set up monitoring and alerting
5. Configure backup strategies

### Kubernetes Deployment

For Kubernetes deployment:

```bash
kubectl apply -f kubernetes/
```

### Troubleshooting

- Check logs: `docker-compose logs -f [service-name]`
- Restart services: `docker-compose restart [service-name]`
- Check health: `curl http://localhost:8000/health`

### Support

For support and documentation, visit:
- API Documentation: http://localhost:8000/docs
- GitHub Repository: https://github.com/google/adk-platform
"""
        
        with open(f"{self.target_dir}/README.md", "w") as f:
            f.write(readme_content)
            
        print("✅ Deployment documentation created")
        
    def create_database_init(self):
        """Create database initialization script"""
        init_sql = """-- Google ADK Agent Platform Database Initialization

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS adk_platform;

-- Set search path
SET search_path TO adk_platform, public;

-- Models table
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'inactive',
    api_base VARCHAR(500),
    api_key VARCHAR(500),
    parameters JSONB DEFAULT '{}',
    capabilities TEXT[] DEFAULT '{}',
    performance JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    model_config JSONB NOT NULL,
    system_prompt TEXT NOT NULL,
    tools TEXT[] DEFAULT '{}',
    max_iterations INTEGER DEFAULT 5,
    temperature DECIMAL(3,2) DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'inactive',
    conversations INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    nodes JSONB DEFAULT '[]',
    connections JSONB DEFAULT '[]',
    execution_history JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflow executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    execution_time DECIMAL(10,3),
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    user_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_agent_id ON chat_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_metrics_type_entity ON metrics(metric_type, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON metrics(recorded_at);

-- Insert sample data
INSERT INTO models (name, type, provider, model_id, status, capabilities, parameters) VALUES
('MiniMax-M2 (API)', 'api', 'minimax', 'minimax-m2', 'active', 
 ARRAY['chat', 'completion', 'coding', 'agentic'], 
 '{"temperature": 1.0, "top_p": 0.95, "max_tokens": 2048}'),
('GPT-4 (API)', 'api', 'openai', 'gpt-4', 'inactive', 
 ARRAY['chat', 'completion'], 
 '{"temperature": 0.7, "top_p": 0.9, "max_tokens": 2048}')
ON CONFLICT DO NOTHING;

INSERT INTO agents (name, description, model_config, system_prompt, tools, status) VALUES
('Customer Support Bot', 'Handles customer inquiries and support tickets', 
 '{"name": "MiniMax-M2 (API)", "type": "api", "provider": "minimax"}',
 'You are a helpful customer support agent designed to provide accurate and useful information to users.',
 ARRAY['web_search', 'file_operations'], 'active')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA adk_platform TO adk_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA adk_platform TO adk_user;
"""
        
        with open(f"{self.target_dir}/database/init.sql", "w") as f:
            f.write(init_sql)
            
        print("✅ Database initialization script created")
        
    def run_deployment(self):
        """Execute the complete deployment process"""
        print("🚀 Starting Google ADK Agent Platform deployment...")
        print("=" * 60)
        
        # Create directory structure
        self.create_directory_structure()
        
        # Copy and prepare components
        self.copy_sveltekit_frontend()
        self.copy_backend()
        self.create_docker_compose()
        self.create_kubernetes_deployment()
        self.create_monitoring_config()
        self.create_deployment_scripts()
        self.create_documentation()
        self.create_database_init()
        
        print("=" * 60)
        print("✅ Deployment package created successfully!")
        print(f"📁 Location: {self.target_dir}")
        print()
        print("🚀 Next steps:")
        print(f"   1. cd {self.target_dir}")
        print("   2. ./scripts/deploy.sh")
        print("   3. Visit http://localhost to access the platform")
        print()
        print("📚 Documentation:")
        print(f"   - README.md: {self.target_dir}/README.md")
        print(f"   - API Docs: http://localhost:8000/docs")
        print(f"   - Monitoring: http://localhost:3000")
        
def main():
    parser = argparse.ArgumentParser(description='Deploy Google ADK Agent Platform')
    parser.add_argument('--target', default='adk-platform-deployment', 
                       help='Target directory for deployment package')
    parser.add_argument('--skip-frontend', action='store_true', 
                       help='Skip frontend deployment')
    parser.add_argument('--skip-backend', action='store_true', 
                       help='Skip backend deployment')
    
    args = parser.parse_args()
    
    deployer = ADKPlatformDeployer(args.target)
    
    try:
        deployer.run_deployment()
    except KeyboardInterrupt:
        print("\n❌ Deployment interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Deployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()