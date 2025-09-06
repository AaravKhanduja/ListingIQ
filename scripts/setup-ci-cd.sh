#!/bin/bash

# CI/CD Setup Script for ListingIQ
set -e

echo "🚀 Setting up CI/CD pipeline for ListingIQ..."

# 1. Create GitHub Actions workflow
mkdir -p .github/workflows
cat > .github/workflows/ci-cd.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build

  deploy-staging:
    if: github.ref == 'refs/heads/dev'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod=false'

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod=true'
EOF

# 2. Create Vercel configuration
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_APP_ENV": "@app-env"
  }
}
EOF

# 3. Create environment configuration
cat > frontend/lib/config.ts << 'EOF'
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  isProduction: process.env.NEXT_PUBLIC_APP_ENV === 'production',
  isStaging: process.env.NEXT_PUBLIC_APP_ENV === 'preview'
}

export default config
EOF

echo "✅ CI/CD setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add these secrets to your GitHub repository:"
echo "   - VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID" 
echo "   - VERCEL_PROJECT_ID"
echo ""
echo "2. Configure Vercel environments:"
echo "   - staging: NEXT_PUBLIC_APP_ENV=preview"
echo "   - production: NEXT_PUBLIC_APP_ENV=production"
echo ""
echo "3. Test the pipeline:"
echo "   git push origin dev  # → Staging deployment"
echo "   git push origin main # → Production deployment"
