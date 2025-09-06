#!/bin/bash

# ListingIQ Local Development Setup
set -e

echo "🚀 Setting up ListingIQ for local development..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if certificates exist
if [ ! -f "frontend/localhost+2.pem" ] || [ ! -f "frontend/localhost+2-key.pem" ]; then
    echo "❌ Error: HTTPS certificates not found"
    echo "Please run: cd frontend && mkcert localhost 127.0.0.1 ::1"
    exit 1
fi

# Check if environment files exist
if [ ! -f "frontend/.env.local" ]; then
    echo "❌ Error: Frontend .env.local not found"
    echo "Please create frontend/.env.local with your Supabase credentials"
    exit 1
fi

if [ ! -f "backend/.env" ]; then
    echo "❌ Error: Backend .env not found"
    echo "Please create backend/.env with your Supabase credentials"
    exit 1
fi

echo "✅ All prerequisites found!"

# Install dependencies if needed
echo "📦 Installing dependencies..."
if [ -f "frontend/package.json" ]; then
    cd frontend && npm install && cd ..
fi

if [ -f "backend/pyproject.toml" ]; then
    cd backend && pip install -e . && cd ..
fi

echo ""
echo "🎉 Setup complete! You can now run:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Frontend with HTTPS (Terminal 2):"
echo "  cd frontend && npm run dev:https"
echo ""
echo "Then visit: https://localhost:3000"
echo ""
echo "🔐 HTTPS is enabled - Supabase authentication will work properly!"