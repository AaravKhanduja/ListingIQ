#!/bin/bash

# ListingIQ Local Development Setup
set -e

echo "🚀 Setting up ListingIQ for local development..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend/.env.local..."
    cp frontend/env.example frontend/.env.local
fi

if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env..."
    cp backend/env.example backend/.env
fi

echo "✅ All prerequisites found!"

# Install dependencies if needed
echo "📦 Installing dependencies..."
if [ -f "frontend/package.json" ]; then
    cd frontend && npm install && cd ..
fi

if [ -f "backend/pyproject.toml" ]; then
    cd backend
    if command -v poetry &> /dev/null; then
        poetry install
    elif command -v pip &> /dev/null; then
        pip install -e .
    else
        echo "⚠️  Neither Poetry nor pip found. Please install Python dependencies manually."
    fi
    cd ..
fi

# Check for OpenAI key and set up Ollama if not found
if ! grep -q "OPENAI_API_KEY=sk-" backend/.env 2>/dev/null; then
    echo ""
    echo "⚠️  No OpenAI API key found - setting up Ollama for local LLM..."
    
    # Check if Ollama is installed
    if ! command -v ollama &> /dev/null; then
        echo "📦 Installing Ollama..."
        
        # Detect OS and install Ollama
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install ollama
            else
                echo "❌ Homebrew not found. Please install Ollama manually:"
                echo "   Visit: https://ollama.ai/download"
                exit 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -fsSL https://ollama.ai/install.sh | sh
        else
            echo "❌ Unsupported OS. Please install Ollama manually:"
            echo "   Visit: https://ollama.ai/download"
            exit 1
        fi
    fi
    
    echo "🚀 Starting Ollama service..."
    # Start Ollama in background
    ollama serve &
    OLLAMA_PID=$!
    
    # Wait a moment for Ollama to start
    sleep 3
    
    echo "📥 Pulling Llama model..."
    ollama pull llama3.2:3b
    
    echo "✅ Ollama setup complete!"
    echo "   - Ollama is running in background (PID: $OLLAMA_PID)"
    echo "   - Model 'llama3.2:3b' is ready to use"
    echo ""
fi

echo ""
echo "🎉 Setup complete! Starting development servers..."
echo ""

# Start backend in background
echo "🚀 Starting backend server..."
cd backend
if command -v poetry &> /dev/null; then
    poetry run python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
else
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
fi
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🚀 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development servers started!"
echo "   - Backend: http://localhost:8000 (PID: $BACKEND_PID)"
echo "   - Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
if [ ! -z "$OLLAMA_PID" ]; then
    echo "   - Ollama: http://localhost:11434 (PID: $OLLAMA_PID)"
fi
echo ""
echo "🔧 Development environment ready!"
echo "   Visit: http://localhost:3000"
echo ""
echo "💡 To stop all services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
if [ ! -z "$OLLAMA_PID" ]; then
    echo "   kill $OLLAMA_PID"
fi