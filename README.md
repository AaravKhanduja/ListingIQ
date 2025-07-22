# 🧠 ListingIQ

**AI-powered real estate listing analysis.**  
Upload a property listing or paste its text — get intelligent insights, flags, and follow-up questions in seconds.

> Built with Next.js 15 (App Router), FastAPI, GPT-4, Tailwind, and Supabase.

---

## 🧩 Features

| Feature                    | Description                                               | SWE Value                                 |
| -------------------------- | --------------------------------------------------------- | ----------------------------------------- |
| 📝 Paste or Upload Listing | Large textarea input or PDF upload                        | File parsing, input handling              |
| 🤖 Insight Generator       | Multi-step GPT prompt chain: extract → analyze → generate | Prompt chaining, async backend, safety    |
| 💡 Insights UI             | Renders 3 sections: Strengths, Flags, Follow-up Questions | Dynamic UI, user-centric flow             |
| 🔐 Auth (Supabase)         | Email/password login, secure listing access               | Supabase RLS, protected routes            |
| 💾 Save to Dashboard       | Store analyzed listings and revisit later                 | DB modeling, Supabase integration         |
| 📤 Export Report           | Export insights as Markdown or PDF                        | 3rd-party libraries, formatting pipelines |
| 🧪 Tests                   | Unit & integration tests for GPT logic and auth           | Engineering discipline, test coverage     |
| 📚 Docs & Diagrams         | Architecture diagram + README explanation                 | Communication clarity, system thinking    |

---

## 🏗 Tech Stack

### Frontend

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/docs/app)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, [shadcn/ui](https://ui.shadcn.com)
- **Auth:** Supabase (RLS, email/password)

### Backend

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **AI:** OpenAI GPT-4 — multi-stage prompt chain
- **Security:** Environment variable–based secrets
- **Export:** PDF/Markdown generation (WIP)

---

## 🧹 Code Quality

**Backend**

- Linting & Formatting: [Ruff](https://docs.astral.sh/ruff) (includes Black)
- Pre-commit hooks: Enforced via pre-commit (`pre-commit run --all-files`)

**Frontend**

- Formatting: [Prettier](https://prettier.io)
- Pre-commit hooks: Managed by [Husky](https://typicode.github.io/husky)

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/listingiq.git

# Frontend setup
cd listingiq/frontend
cp .env.example .env.local
npm install
npm run dev

# Backend setup
cd ../backend
cp .env.example .env
poetry install
uvicorn app.main:app --reload
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

## 📄 License

MIT License. See [LICENSE](LICENSE) for more information.
