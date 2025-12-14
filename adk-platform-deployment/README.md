# Google ADK Agent Platform - Deployment Guide

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
