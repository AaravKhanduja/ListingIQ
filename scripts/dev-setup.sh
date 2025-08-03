#!/bin/bash

echo "🚀 Setting up ListingIQ for development..."

# Check if .env files exist, create if not
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/env.example backend/.env
    echo "⚠️  Please update backend/.env with your OpenAI API key"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local file..."
    cp frontend/env.example frontend/.env.local
    echo "✅ Frontend environment created"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
poetry install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "✅ Development setup complete!"
echo ""
echo "To start development:"
echo "1. Update backend/.env with your OpenAI API key"
echo "2. Run: docker-compose up"
echo "   or separately:"
echo "   - Backend: cd backend && uvicorn app.main:app --reload"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "The app will work without Supabase in development mode."
echo "Data will be stored locally in backend/local_analyses.json" 