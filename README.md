# ListingIQ 🏠

**AI-powered insights for real estate listings with comprehensive market analysis and investment recommendations.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-blue.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)](https://nextjs.org/)

## ✨ Features

- **🤖 AI-Powered Analysis**: Comprehensive property analysis using advanced LLMs
- **🔐 Secure Authentication**: JWT-based auth with Supabase integration
- **📊 Market Insights**: Detailed market trends, comparables, and investment potential
- **💰 Investment Analysis**: ROI projections, cash flow analysis, and risk assessment
- **🏗️ Renovation Planning**: Cost estimates and priority improvement recommendations
- **📱 Modern UI**: Beautiful, responsive interface built with Next.js and shadcn/ui
- **🚀 Production Ready**: Enterprise-grade security, monitoring, and scalability

## 🏗️ Architecture

```
ListingIQ/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── middleware/     # Auth, rate limiting, validation
│   │   ├── models/         # Pydantic data models
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── config.py       # Configuration management
│   ├── Dockerfile          # Production container
│   └── pyproject.toml      # Python dependencies
├── frontend/               # Next.js frontend
│   ├── app/                # App router pages
│   ├── components/         # Reusable UI components
│   ├── lib/                # Utilities and services
│   └── next.config.ts      # Next.js configuration
└── scripts/                # Development and deployment scripts
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.13+** (3.12+ supported)
- **Node.js 18+**
- **Poetry** (recommended) or pip
- **Ollama** (for local LLM) or OpenAI API key

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/listing-iq.git
cd listing-iq

# Run the setup script
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

### 2. Configure Environment

```bash
# Backend (Development)
cp backend/env.example backend/.env
# Edit backend/.env with your API keys

# Backend (Production)
cp backend/env.production.example backend/.env
# Edit backend/.env with your production values

# Frontend (Development)
cp frontend/env.example frontend/.env.local
# Edit frontend/.env.local with your configuration

# Frontend (Production)
cp frontend/env.production.example frontend/.env.local
# Edit frontend/.env.local with your production values
```

### 3. Start Development Environment

```bash
# Terminal 1: Backend
cd backend && poetry run uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Ollama (if using local LLM)
ollama serve
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔧 Development

### Available Commands

```bash
# Development
./scripts/dev-setup.sh            # Setup development environment

# Backend
cd backend
poetry install                     # Install dependencies
poetry run uvicorn app.main:app --reload  # Start with auto-reload
poetry run pytest                 # Run tests
poetry run black .                # Format code
poetry run ruff check .           # Lint code

# Frontend
cd frontend
npm install                       # Install dependencies
npm run dev                       # Start development server
npm run build                     # Build for production
npm run type-check               # TypeScript check
```

### Development URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Troubleshooting

**Port already in use:**

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Poetry not found:**

```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
```

**Docker build fails:**

```bash
# Make sure you're in the backend directory
cd backend
ls Dockerfile                    # Should show the Dockerfile
docker build -t listingiq-backend .
```

### Environment Variables

#### Backend (.env)

```bash
# Environment
ENVIRONMENT=development
DEBUG=true

# LLM Configuration
LLM_PROVIDER=ollama              # ollama or openai
OPENAI_API_KEY=your_key_here     # Required if using OpenAI
OLLAMA_MODEL=llama3.2:3b        # Local model

# Supabase (Optional for development)
SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_key
SUPABASE_ANON_KEY=your_key
SUPABASE_JWT_SECRET=your_secret

# Database
DATABASE_URL=sqlite:///./local_analyses.db
```

#### Frontend (.env.local)

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Environment
NODE_ENV=development
```

## 🚀 Production Deployment

### 1. Install Docker (if not installed)

**macOS:**

```bash
brew install --cask docker
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install docker.io
sudo usermod -aG docker $USER
# Log out and back in
```

**Windows:**

```bash
# Download from https://www.docker.com/products/docker-desktop
```

**Test Docker:**

```bash
docker --version
docker run hello-world
```

**Start Docker Daemon (if not running):**

**macOS:**

```bash
# Start Docker Desktop app, or from terminal:
open -a Docker
# Wait for Docker to start (check system tray)
```

**Linux:**

```bash
# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Check status
sudo systemctl status docker
```

**Windows:**

```bash
# Start Docker Desktop from Start Menu
# Or run: "Docker Desktop" from Run dialog
```

### 2. Environment Configuration

**Create production environment file:**

```bash
# Copy the production template
cp backend/env.production.example backend/.env

# Edit with your production values
nano backend/.env
```

**Required production settings:**

```bash
# Environment
ENVIRONMENT=production
DEBUG=false

# Security (CHANGE THESE!)
SECRET_KEY=your-super-secret-key-change-this
REQUIRE_HTTPS=true
SECURE_COOKIES=true
CSRF_PROTECTION=true

# CORS & Domains
FRONTEND_ORIGIN=https://yourdomain.com
ALLOWED_HOSTS=["yourdomain.com", "api.yourdomain.com"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Database (Use PostgreSQL in production)
DATABASE_URL=postgresql://user:password@host:port/database

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

# LLM (Use OpenAI for production)
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4

# Logging & Monitoring
LOG_LEVEL=INFO
LOG_FORMAT=json
ENABLE_METRICS=true
ENABLE_HEALTH_CHECKS=true
```

### 2. Backend Deployment

```bash
# Option 1: Docker (Recommended for production)
cd backend                                    # ← IMPORTANT: Must be in backend directory
docker build -t listingiq-backend .
docker run -d -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e SUPABASE_URL=$SUPABASE_URL \
  listingiq-backend

# Option 2: Direct deployment (if Docker not available)
poetry install --only=main
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Note**: Docker is only needed for production deployment. For development, use the direct commands in the Development section.

### 3. Test Production Build

```bash
# Build and test locally
cd backend                                    # ← IMPORTANT: Must be in backend directory
docker build -t listingiq-backend .
docker run -d -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e DEBUG=false \
  listingiq-backend

# Test the API
curl http://localhost:8000/health

# Stop and cleanup
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi listingiq-backend
```

### 4. Frontend Deployment

```bash
# Option 1: Docker (Recommended for production)
cd frontend
docker build -t listingiq-frontend .
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  listingiq-frontend

# Option 2: Direct deployment
cd frontend
npm run build
npm start

# Option 3: Deploy to Vercel/Netlify
npm run build
# Deploy the .next folder
```

**Environment Variables for Frontend:**

```bash
# Copy production template
cp frontend/env.production.example frontend/.env.local

# Required variables:
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### 5. Production Features

#### 🔒 Security Features

- **Rate Limiting**: 60 requests/minute per IP (configurable)
- **Security Headers**: HSTS, CSP, XSS protection, frame options
- **Request Validation**: SQL injection protection, size limits
- **CORS Protection**: Configurable origins for production
- **Trusted Hosts**: Prevents host header attacks
- **Non-root Container**: Runs as `appuser` for security

#### 📊 Monitoring & Observability

- **Health Checks**: `/health` endpoint for load balancers
- **Metrics**: `/metrics` endpoint with system stats
- **Structured Logging**: JSON logs in production
- **Request Tracking**: All requests logged with timing
- **Error Monitoring**: Comprehensive error logging
- **Performance Metrics**: CPU, memory, disk usage

#### ⚡ Performance Features

- **Multi-worker**: 4 Uvicorn workers by default
- **Request Timing**: Process time headers
- **Optimized Builds**: Production-only dependencies
- **Connection Pooling**: Efficient database connections
- **Caching Ready**: Headers for CDN integration

#### 🔄 Scalability & Deployment

- **Docker Ready**: Production container with health checks
- **Load Balancer Compatible**: Health check endpoints
- **Auto-scaling Ready**: Stateless design
- **Environment Config**: Easy configuration management
- **Database Agnostic**: Supports PostgreSQL, MySQL, SQLite

#### 🛡️ Production Security Checklist

- ✅ API documentation disabled in production
- ✅ Debug mode disabled
- ✅ Secure headers enabled (HSTS, CSP, XSS protection)
- ✅ Rate limiting active (60 requests/minute)
- ✅ Request validation enabled
- ✅ CORS properly configured
- ✅ Non-root container user
- ✅ Structured logging enabled
- ✅ Health checks configured
- ✅ Metrics endpoint available
- ✅ Trusted hosts protection
- ✅ Frontend security headers (CSP, HSTS, XSS protection)
- ✅ Production environment templates provided
- ✅ Docker health checks configured
- ✅ Standalone Next.js output for optimal Docker builds

#### 🚀 Production Deployment Checklist

- ✅ Backend Docker container builds successfully
- ✅ Frontend Docker container builds successfully
- ✅ Both containers run with non-root users
- ✅ Health checks pass for both services
- ✅ Security headers present on both frontend and backend
- ✅ Environment variables properly configured
- ✅ Production-only dependencies installed
- ✅ Telemetry disabled in production
- ✅ Optimized builds with compression enabled
- ✅ Multi-stage Docker builds for minimal image size

## 🏗️ API Reference

### Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Endpoints

- `POST /api/analyze` - Analyze a property
- `GET /api/analyses` - Get user analyses
- `GET /api/analyses/{id}` - Get specific analysis
- `DELETE /api/analyses/{id}` - Delete analysis
- `GET /health` - Health check
- `GET /metrics` - System metrics

### Example Request

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "property_address": "123 Main St, City, State",
    "property_title": "Beautiful Family Home",
    "manual_data": {
      "listing_description": "Spacious 3BR home with great potential",
      "property_type": "Single Family",
      "bedrooms": 3,
      "bathrooms": 2,
      "square_feet": 1800,
      "year_built": 1995
    }
  }'
```

## 🔒 Security Features

- **JWT Authentication** with UTC-safe expiration
- **Rate Limiting** (60 requests/minute)
- **Request Validation** with SQL injection protection
- **CORS Protection** with configurable origins
- **Trusted Host** middleware for production
- **Non-root** Docker containers
- **Secure Headers** (X-Frame-Options, X-Content-Type-Options)

## 📊 Monitoring & Observability

- **Health Checks** for load balancers
- **Metrics Endpoint** for Prometheus
- **Structured Logging** (JSON in production)
- **Request Timing** headers
- **Error Tracking** and logging
- **Performance Monitoring** ready

## 🧪 Testing

```bash
# Backend tests
cd backend
poetry run pytest

# Frontend tests
cd frontend
npm test

# End-to-end tests
npm run test:e2e
```

## 🚨 Production Troubleshooting

### Common Issues

**Docker Build Fails:**

```bash
# Error: "failed to read dockerfile"
# Solution: Make sure you're in the backend directory
cd backend
docker build -t listingiq-backend .
```

**Container Won't Start:**

```bash
# Check logs
docker logs <container_id>

# Common fixes:
# 1. Missing environment variables
# 2. Port already in use
# 3. Invalid configuration
```

**Health Check Fails:**

```bash
# Test health endpoint
curl http://localhost:8000/health

# Check if container is running
docker ps

# Check container logs
docker logs <container_id>
```

**Rate Limiting Issues:**

```bash
# Test rate limiting
for i in {1..70}; do curl -s http://localhost:8000/health; done

# Should return 429 after 60 requests
```

**Security Headers Missing:**

```bash
# Check headers
curl -I http://localhost:8000/health

# Should include security headers like:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
```

**Environment Variables:**

```bash
# Verify environment is set correctly
docker exec <container_id> env | grep ENVIRONMENT

# Should show: ENVIRONMENT=production
```

### Performance Optimization

**Increase Workers:**

```bash
# Edit Dockerfile CMD line
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "8"]
```

**Database Connection Pooling:**

```bash
# Add to .env
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30
```

**Memory Limits:**

```bash
# Run with memory limits
docker run -d -p 8000:8000 --memory=2g --cpus=2 listingiq-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards

- **Python**: Black formatting, Ruff linting
- **TypeScript**: ESLint, Prettier
- **Git**: Conventional commits, pre-commit hooks
- **Testing**: Unit tests for all critical functions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/listing-iq/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/listing-iq/discussions)

## 🙏 Acknowledgments

- **FastAPI** for the excellent backend framework
- **Next.js** for the powerful frontend framework
- **shadcn/ui** for the beautiful component library
- **Supabase** for authentication and database services
- **Ollama** for local LLM capabilities

---

**Built with ❤️ for real estate professionals and investors**
