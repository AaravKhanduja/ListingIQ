# 🧠 ListingIQ

**AI-powered real estate listing analysis.**  
Upload a property listing or paste its text — get intelligent insights, flags, and follow-up questions in seconds.

> Built with Next.js 15 (App Router), FastAPI, GPT-4, Tailwind, and Supabase.

**🔑 Required API Keys:**

- **OpenAI API Key** (Required) - For AI analysis generation
- **RapidAPI Key** (Optional) - For real Zillow property data (without this, realistic mock data is used)

---

## 🧩 Features

| Feature                    | Description                                                         | Status     |
| -------------------------- | ------------------------------------------------------------------- | ---------- |
| 📝 Paste or Upload Listing | Large textarea input or address search                              | ✅ Done    |
| 🤖 Insight Generator       | Multi-step GPT prompt chain: extract → analyze → generate           | ✅ Done    |
| 💡 Insights UI             | Renders 4 sections: Strengths, Weaknesses, Hidden Issues, Questions | ✅ Done    |
| 🔐 Auth (Supabase)         | Email/password login, secure listing access                         | 🔄 Planned |
| 💾 Save to Dashboard       | Store analyzed listings and revisit later                           | ✅ Done    |
| 📤 Export Report           | Export insights as PDF                                              | ✅ Done    |
| 🧪 Tests                   | Unit & integration tests for GPT logic and auth                     | 🔄 Planned |
| 🐳 Docker Support          | Production-ready containerization                                   | ✅ Done    |
| 🗄 Database Integration     | Supabase PostgreSQL with local fallback                             | ✅ Done    |

---

## 🏗 Tech Stack

### Frontend

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/docs/app)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, [shadcn/ui](https://ui.shadcn.com)
- **PDF Export:** jsPDF for report generation
- **State Management:** React hooks with localStorage

### Backend

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **AI:** OpenAI GPT-4 with v1.0 API
- **Database:** Supabase PostgreSQL with local JSON fallback
- **Security:** Environment variable–based secrets
- **Containerization:** Docker with multi-stage builds

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

````bash
# Clone the repo
git clone https://github.com/yourusername/listingiq.git
cd listingiq

# Set up environment variables
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local

# Add your OpenAI API key to backend/.env
echo "OPENAI_API_KEY=your_openai_api_key_here" >> backend/.env

# Optional: Add RapidAPI key for real Zillow data (mock data used if not provided)
echo "RAPIDAPI_KEY=your_rapidapi_key_here" >> backend/.env

# Start the entire stack
docker-compose up

Visit http://localhost:3000 to see the app!

### Option 2: Manual Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/listingiq.git
cd listingiq

# Frontend setup
cd frontend
cp .env.example .env.local
npm install
npm run dev

# Backend setup (in another terminal)
cd ../backend
cp .env.example .env
# Add your OpenAI API key to .env
# Optional: Add RapidAPI key for real Zillow data (mock data used if not provided)
poetry install
poetry run uvicorn app.main:app --reload

---

## 🔧 Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- Poetry (for Python dependency management)
- OpenAI API key

### Environment Variables

**Backend (.env):**

```bash
OPENAI_API_KEY=your_openai_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here  # Optional - for real Zillow data (mock data used if not provided)
SUPABASE_URL=your_supabase_project_url  # Optional
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional
FRONTEND_ORIGIN=http://localhost:3000
````

**Frontend (.env.local):**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url  # Optional
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  # Optional
```

### Development Scripts

```bash
# Run development setup script
./scripts/dev-setup.sh

# Start backend with hot reload
cd backend && poetry run uvicorn app.main:app --reload

# Start frontend with hot reload
cd frontend && npm run dev

# Run tests (when implemented)
cd backend && poetry run pytest
cd frontend && npm run test
```

---

## 🐳 Production Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or build individual containers
docker build -t listingiq-backend ./backend
docker build -t listingiq-frontend ./frontend
```

### Manual Deployment

**Backend (Railway/Render/AWS):**

```bash
cd backend
poetry install --no-dev
poetry run uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Frontend (Vercel/Netlify):**

```bash
cd frontend
npm run build
npm start
```

---

## 🗄 Database Setup

### Supabase (Production)

1. Create a Supabase project
2. Run the schema: `supabase-schema.sql`
3. Add environment variables to your deployment

### Local Development

The app works without Supabase using local JSON storage. Data is saved to `backend/local_analyses.json`.

---

## 🧹 Code Quality

**Backend**

- Linting & Formatting: [Ruff](https://docs.astral.sh/ruff) (includes Black)
- Pre-commit hooks: Enforced via pre-commit (`pre-commit run --all-files`)
- Type Safety: Pydantic models with comprehensive validation

**Frontend**

- Formatting: [Prettier](https://prettier.io)
- Pre-commit hooks: Managed by [Husky](https://typicode.github.io/husky)
- Type Safety: TypeScript with strict configuration

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
poetry run pytest

# Run with coverage
poetry run pytest --cov=app

# Run specific test
poetry run pytest tests/test_analyze.py::test_analyze_property
```

### Frontend Tests

```bash
cd frontend
npm run test

# Run with coverage
npm run test:coverage
```

---

## 🔧 Development Guide

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.11+** - [Download](https://python.org/)
- **Poetry** - [Install](https://python-poetry.org/docs/#installation)
- **Docker** (optional) - [Download](https://docker.com/)

### One-Command Setup

```bash
# Clone and setup everything
git clone https://github.com/yourusername/listingiq.git
cd listingiq
./scripts/dev-setup.sh
```

### Manual Setup

```bash
# 1. Environment setup
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local

# 2. Add your OpenAI API key
echo "OPENAI_API_KEY=your_key_here" >> backend/.env

# 3. Install dependencies
cd backend && poetry install
cd ../frontend && npm install

# 4. Start development servers
# Terminal 1: Backend
cd backend && poetry run uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Development Workflow

#### Backend Development

```bash
cd backend

# Start development server
poetry run uvicorn app.main:app --reload

# Run tests
poetry run pytest

# Format code
poetry run black .
poetry run ruff check --fix .

# Install new dependencies
poetry add package-name
```

#### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Run tests
npm run test

# Format code
npm run lint
npm run format

# Install new dependencies
npm install package-name
```

### Database Development

**Local Development (No Supabase needed):**

- Data is stored in `backend/local_analyses.json`
- No setup required
- Works out of the box

**Zillow Integration:**

- **Without RapidAPI Key**: Uses realistic mock data for development
- **With RapidAPI Key**: Fetches real property data from Zillow
- Add `RAPIDAPI_KEY=your_key` to backend `.env` for real data
- Get RapidAPI key from [Zillow API](https://rapidapi.com/3b-data-3b-data-default/api/zillow-com1/)
- **Note**: The app will return mock data if no RapidAPI key is provided, ensuring it works out of the box

**Production (Supabase):**

1. Create Supabase project
2. Run `supabase-schema.sql`
3. Add environment variables

### Docker Development

```bash
# Start entire stack
docker-compose up

# Rebuild containers
docker-compose up --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Debugging

#### Backend Debugging

```bash
# Enable debug logging
export DEBUG=true

# Check API endpoints
curl http://localhost:8000/docs

# Test specific endpoint
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"property_address": "123 Test St"}'
```

#### Frontend Debugging

```bash
# Check browser console for API calls
# Look for "🔍 Making API call with:" logs

# Clear localStorage
localStorage.clear()

# Check network tab for API requests
```

### Code Style

#### Backend (Python)

- **Formatter:** Black
- **Linter:** Ruff
- **Type Checking:** Pydantic models
- **Pre-commit:** Automatic formatting

#### Frontend (TypeScript)

- **Formatter:** Prettier
- **Linter:** ESLint
- **Type Checking:** TypeScript strict mode
- **Pre-commit:** Husky hooks

### Common Issues

#### Backend Issues

**OpenAI API Error:**

```bash
# Check API key
echo $OPENAI_API_KEY

# Test API call
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Port Already in Use:**

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

#### Frontend Issues

**API Connection Error:**

```bash
# Check backend is running
curl http://localhost:8000/docs

# Check CORS settings
curl -H "Origin: http://localhost:3000" \
  http://localhost:8000/api/analyses
```

**Build Errors:**

```bash
# Clear Next.js cache
rm -rf frontend/.next
npm run dev
```

---

## 🧪 Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/amazing-thing`
3. Commit your changes with conventional commits.
4. Push to the branch: `git push origin feature/amazing-thing`
5. Open a pull request 🚀

See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for more information.
