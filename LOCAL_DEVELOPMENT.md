# Local Development Setup

## 🚀 Quick Start

### Prerequisites

- ✅ HTTPS certificates generated with `mkcert`
- ✅ Supabase project created with environment variables configured
- ✅ Frontend `.env.local` and Backend `.env` files set up

### Running the Application

**Terminal 1 - Backend:**

```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend (HTTPS):**

```bash
cd frontend
npm run dev:https
```

**Visit:** https://localhost:3000

## 🔐 Why HTTPS?

- **Supabase Authentication**: Requires HTTPS for OAuth redirects
- **Secure Cookies**: Authentication tokens need secure context
- **Production Parity**: Matches production environment behavior

## 🛠 Environment Configuration

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NODE_ENV=development
```

### Backend (.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ENVIRONMENT=development
```

## 🧪 Testing Workflow

1. **Local Development**: Test features locally with HTTPS
2. **Commit to Dev**: Push changes to dev branch
3. **Test on Staging**: Verify on Vercel preview deployment
4. **Merge to Main**: Deploy to production

## 🔧 Troubleshooting

### Certificate Issues

```bash
# Regenerate certificates
cd frontend
mkcert localhost 127.0.0.1 ::1
```

### Port Conflicts

- Frontend: Change port in `scripts/dev-https.js`
- Backend: Use `--port 8001` flag

### Supabase Connection

- Verify environment variables are correct
- Check Supabase project is active
- Ensure localhost is in allowed origins

## 📝 Development Tips

- Use browser dev tools to monitor network requests
- Check console for authentication flow
- Test both login and analysis features
- Verify API calls to backend are working
