# Docker Setup Guide

This project supports both development and production Docker configurations.

## Quick Start

### Development Mode (Separate Frontend & Backend)
```bash
# Build and start both containers
npm run docker:dev:build

# Or without rebuilding
npm run docker:dev

# Stop containers
npm run docker:down
```

### Production Mode (Single Container)
```bash
# Build and start production container
npm run docker:prod:build

# Or without rebuilding
npm run docker:prod

# Stop container
npm run docker:prod:down
```

## Architecture

### Development Setup (`docker-compose.yml`)
- **Backend Container**: Express server on port 3001
- **Frontend Container**: Vite dev server on port 5173
- Hot reload enabled for both
- Separate containers for easier debugging

### Production Setup (`docker-compose.prod.yml`)
- **Single Container**: Express server serves both API and static frontend
- Built React app served from Express
- Optimized for deployment
- Single port (3001) for everything

## Environment Variables

Create a `.env` file with:

```env
# Dataverse Configuration
DATAVERSE_BASE_URL=https://dataverse.fgcu.edu
DATAVERSE_API_TOKEN=your-api-token-here
SHOW_HIDDEN=true

# Server Configuration
SERVER_PORT=3001
CORS_ORIGIN=http://localhost:5173

# Frontend Configuration (dev only)
VITE_DATAVERSE_BASE_URL=https://dataverse.fgcu.edu
VITE_API_BASE_URL=http://localhost:3001/api
VITE_PORT=5173
VITE_ALLOWED_HOSTS=localhost,127.0.0.1
```

## Docker Files

### `Dockerfile` (Production)
Multi-stage build:
1. Builds frontend React app
2. Sets up Node backend
3. Serves built frontend from Express

### `Dockerfile.backend` (Development)
Runs only the Express backend server

### `Dockerfile.dev` (Development)
Runs only the Vite dev server with hot reload

## Port Mapping

### Development
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/health

### Production
- Application: http://localhost:3001
- API: http://localhost:3001/api
- Health Check: http://localhost:3001/health

## Accessing the Application

### Development
```bash
# Start containers
npm run docker:dev

# Frontend available at:
open http://localhost:5173

# Backend health check:
curl http://localhost:3001/health
```

### Production
```bash
# Start container
npm run docker:prod

# Application available at:
open http://localhost:3001

# API health check:
curl http://localhost:3001/health
```

## Common Commands

### Docker Compose Commands
```bash
# Start containers in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### Docker Commands
```bash
# List running containers
docker ps

# View all containers
docker ps -a

# Stop specific container
docker stop <container-id>

# Remove container
docker rm <container-id>

# View images
docker images

# Remove image
docker rmi <image-id>

# Clean up everything
docker system prune -a
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)

# Or change port in .env
SERVER_PORT=3002
```

### Container Won't Start
```bash
# View logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Changes Not Reflected
```bash
# Rebuild containers
npm run docker:dev:build

# Or for production
npm run docker:prod:build
```

### CORS Issues in Production
Update `.env`:
```env
CORS_ORIGIN=http://yourdomain.com
```

Or allow all origins (development only):
```env
CORS_ORIGIN=*
```

### API Token Not Working
1. Check `.env` file exists
2. Verify `DATAVERSE_API_TOKEN` is set
3. Rebuild containers: `npm run docker:prod:build`
4. Check health endpoint: `curl http://localhost:3001/health`

## Development Workflow

### With Docker
```bash
# Start both containers
npm run docker:dev

# Make changes to code (hot reload works)
# Frontend changes: instant reload
# Backend changes: restart backend container
docker-compose restart backend
```

### Without Docker
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev
```

## Production Deployment

### Build Production Image
```bash
docker build -t fgcu-gallery:latest .
```

### Run Production Container
```bash
docker run -d \
  -p 3001:3001 \
  -e DATAVERSE_BASE_URL=https://dataverse.fgcu.edu \
  -e DATAVERSE_API_TOKEN=your-token \
  -e SHOW_HIDDEN=true \
  -e NODE_ENV=production \
  --name fgcu-gallery \
  fgcu-gallery:latest
```

### Using Docker Compose
```bash
# Production mode
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

## CI/CD Integration

### Example GitHub Actions
```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t fgcu-gallery:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push fgcu-gallery:${{ github.sha }}
```

## Performance Optimization

### Production Build
The production Dockerfile:
- Uses multi-stage builds to reduce image size
- Only installs production dependencies
- Serves pre-built static files
- Optimized for minimal memory footprint

### Image Size
```bash
# Check image size
docker images fgcu-gallery

# Typical sizes:
# Development: ~500MB (includes dev dependencies)
# Production: ~200MB (optimized)
```

## Security Best Practices

✅ **DO:**
- Use environment variables for secrets
- Never commit `.env` files
- Use specific Node versions (not `latest`)
- Run containers as non-root user in production
- Use Docker secrets in production

❌ **DON'T:**
- Hardcode API tokens
- Expose unnecessary ports
- Run as root in production
- Use development mode in production

## Monitoring

### Health Checks
```bash
# Check if service is healthy
curl http://localhost:3001/health

# Response should include:
{
  "status": "ok",
  "environment": "production",
  "dataverseUrl": "https://dataverse.fgcu.edu",
  "hasApiToken": true,
  "showHidden": true
}
```

### Container Stats
```bash
# View resource usage
docker stats

# View specific container
docker stats <container-name>
```

## Need Help?

- Check logs: `docker-compose logs -f`
- Health check: `curl http://localhost:3001/health`
- Restart: `docker-compose restart`
- Full reset: `npm run docker:down && npm run docker:dev:build`
