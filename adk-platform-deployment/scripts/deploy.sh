#!/bin/bash
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
