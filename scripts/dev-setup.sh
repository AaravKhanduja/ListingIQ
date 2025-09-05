#!/bin/bash

# ListingIQ Development Setup Script
# Simple, focused setup for development

set -e

echo "🚀 Setting up ListingIQ development environment..."

# Check if we're in the right directory
if [ ! -f "pyproject.toml" ] && [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the ListingIQ project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."

# Backend setup
if [ -d "backend" ]; then
    echo "🔧 Setting up backend..."
    cd backend
    
    # Check if Poetry is installed
    if command -v poetry &> /dev/null; then
        echo "Installing Python dependencies with Poetry..."
        poetry install
    else
        echo "⚠️  Poetry not found. Please install Poetry first:"
        echo "   curl -sSL https://install.python-poetry.org | python3 -"
        exit 1
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "Creating .env file..."
        cp env.example .env
        echo "✅ Created .env file - please configure your environment variables"
    fi
    
    cd ..
else
    echo "❌ Backend directory not found"
    exit 1
fi

# Frontend setup
if [ -d "frontend" ]; then
    echo "🎨 Setting up frontend..."
    cd frontend
    
    echo "Installing Node.js dependencies..."
    npm install
    
    # Create .env.local file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        echo "Creating .env.local file..."
        cp env.example .env.local
        echo "✅ Created .env.local file - please configure your environment variables"
    fi
    
    cd ..
else
    echo "❌ Frontend directory not found"
    exit 1
fi

# Ollama setup (optional)
echo "🦙 Setting up Ollama (optional - for local LLM)..."
if command -v ollama &> /dev/null; then
    echo "Ollama found. Starting service..."
    ollama serve &
    sleep 3
    
    # Check if model is available
    if ollama list | grep -q "llama3.2:3b"; then
        echo "✅ Model llama3.2:3b is available"
    else
        echo "Downloading model llama3.2:3b..."
        ollama pull llama3.2:3b
        echo "✅ Model downloaded"
    fi
else
    echo "⚠️  Ollama not found. Install from https://ollama.ai for local LLM support"
    echo "   Or use OpenAI API key in backend/.env"
fi

echo ""
echo "🎉 Development setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment variables in .env and .env.local files"
echo "2. Start development servers:"
echo ""
echo "   # Terminal 1: Backend"
echo "   cd backend && poetry run uvicorn app.main:app --reload"
echo ""
echo "   # Terminal 2: Frontend"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 See README.md for detailed instructions" 