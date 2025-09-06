# ListingIQ 🏠

**AI-powered insights for real estate listings with comprehensive market analysis and investment recommendations.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/python-3.13+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-blue.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-black.svg)](https://nextjs.org/)

## ✨ Features

- **🤖 AI-Powered Analysis**: Comprehensive property analysis with 5 detailed sections
- **📊 Analysis Score**: Overall property rating (1-5 scale) with detailed breakdown
- **🔍 Key Strengths**: Identifies property advantages and positive attributes
- **⚠️ Research Areas**: Highlights areas requiring further investigation
- **🚨 Hidden Risks**: Uncovers potential issues and red flags
- **❓ Realtor Questions**: Critical questions to ask your real estate agent
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
- **Ollama** (automatically installed if no OpenAI API key) or OpenAI API key

### One-Command Setup

```bash
git clone https://github.com/yourusername/listing-iq.git
cd listing-iq

# Run the setup script - it does everything automatically!
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

That's it! The script will:

- ✅ Create environment files automatically
- ✅ Install all dependencies
- ✅ Set up Ollama (if no OpenAI key) or use your OpenAI key
- ✅ Start backend and frontend servers
- ✅ Provide you with running URLs

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Optional: Use OpenAI Instead of Ollama

If you have an OpenAI API key, edit `backend/.env`:

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
```

Then restart the backend to use OpenAI instead of Ollama.

## 📋 Analysis Output

Each property analysis includes these comprehensive sections:

### Property Analysis Structure

```
Property Analysis
Expert analysis based on the information you provided. Educational/informational only — not real estate, investment, or financial advice.

[Property Address]
Analysis Score: 4/5
Saved

Key Strengths
✓ [Identified advantages and positive attributes]
✓ [Property benefits and selling points]

Areas to Research
⚠ [Areas requiring further investigation]
⚠ [Missing information that needs research]

Hidden Risks & Issues
🚨 [Potential problems and red flags]
🚨 [Issues that could impact the decision]

Questions to Ask Your Realtor
❓ [Critical questions for due diligence]
❓ [Important information to gather]

Analysis Methodology & Limitations
[What's included/excluded and recommendations for further research]

Generated on: [Timestamp]
```

## 🔄 Development Workflow

### Daily Development

1. **Start Development**: Run `./scripts/dev-setup.sh` (starts everything automatically)
2. **Make Changes**: Edit code, the servers auto-reload
3. **Test Locally**: Visit http://localhost:3000
4. **Stop Services**: Use the PIDs shown by the script to kill processes

### Git Workflow

1. **Commit to Dev**: Push changes to the `dev` branch
2. **Staging Test**: Verify on Vercel preview deployment
3. **Merge to Main**: Deploy to production

```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin dev

# After testing on staging, merge to main
git checkout main
git merge dev
git push origin main
```

## 🔧 Development

### Available Commands

```bash
# Development
./scripts/dev-setup.sh            # Setup development environment

# Backend
cd backend
poetry install                     # Install dependencies
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000  # Start with auto-reload
poetry run pytest                 # Run tests
poetry run black .                # Format code
poetry run ruff check .           # Lint code

# Frontend
cd frontend
npm install                       # Install dependencies
npm run dev                       # Start development server
npm run build                     # Build for production
npm start                         # Start production server
npm run lint                      # Lint code
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

**Ollama Issues:**

```bash
# Check if Ollama is running
ps aux | grep ollama

# Restart Ollama if needed
ollama serve

# Pull a model if missing
ollama pull llama3.2:3b

# Check available models
ollama list
```

**Backend Not Using Correct LLM Provider:**

```bash
# Check current provider
curl -s http://localhost:8000/api/model-info/ | python3 -m json.tool

# If using wrong provider, check your backend/.env file:
cat backend/.env | grep LLM_PROVIDER
cat backend/.env | grep OPENAI_API_KEY

# Restart backend after making changes
kill <backend_pid>
./scripts/dev-setup.sh
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
# Environment Settings
ENVIRONMENT=development
DEBUG=true

# LLM Configuration
LLM_PROVIDER=ollama              # ollama or openai
OPENAI_API_KEY=your_openai_api_key_here     # Required if using OpenAI
OPENAI_MODEL=gpt-4
OLLAMA_MODEL=llama3.2:3b        # Local model

# Supabase Configuration (Optional for development)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...your_anon_key_here
SUPABASE_SERVICE_KEY=eyJ...your_service_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here

# Database
DATABASE_URL=sqlite:///./local_analyses.db

# CORS & Security
FRONTEND_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase Configuration (Optional for development)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key_here

# Environment Settings
NODE_ENV=development
```

## 🚀 Production Deployment

### Manual Deployment

For production deployment, you can deploy the frontend to Vercel and the backend to your preferred hosting service.

**Frontend Deployment (Vercel):**

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy from the main branch

**Backend Deployment:**

1. Set up your preferred hosting service (Railway, Render, etc.)
2. Configure environment variables for production
3. Deploy the backend application

**Environment Configuration:**

- Set `NODE_ENV=production` for production
- Configure all required environment variables
- Use production database and API keys

## 🏗️ API Reference

### Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Endpoints

- `POST /api/analyze` - Analyze a property (comprehensive 8-section analysis)
- `POST /api/analyze/stream` - Stream property analysis in real-time
- `POST /api/analysis/async` - Start async analysis job
- `GET /api/analysis/job/{job_id}` - Get async analysis status/results
- `DELETE /api/analysis/job/{job_id}` - Cancel async analysis
- `GET /api/analyses` - Get user analyses
- `GET /api/analyses/{id}` - Get specific analysis
- `DELETE /api/analyses/{id}` - Delete analysis
- `GET /api/model-info/` - Get current LLM provider and model info
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

**Built with ❤️ for homebuyers and real estate professionals**
