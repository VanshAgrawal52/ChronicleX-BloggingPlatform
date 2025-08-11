

# ChronicleX Blogging Platform



<p align="center">
  <strong style="font-size:2em;">ChronicleX Blogging Platform</strong>
</p>

<p align="center">
  <a href="https://vercel.com/new/git/external?repository-url=https://github.com/VanshAgrawal52/ChronicleX-BloggingPlatform&project-name=chroniclex-bloggingplatform&repository-name=ChronicleX-BloggingPlatform">
    <img src="https://vercel.com/button" alt="Deploy with Vercel"/>
  </a>
</p>
## Made by

Project by [VanshAgrawal52](https://github.com/VanshAgrawal52) (Vansh Agrawal)

<p align="center">
  <b>A modern, production-ready blogging platform built with Fastify, Prisma, Next.js 14, and PostgreSQL.<br>
  Features role-based authentication, real-time comments, reactions, admin dashboard, and beautiful theming.<br>
  By Vansh Agrawal.</b><br>
  <a href="https://nodejs.org/">Node.js</a> • <a href="https://nextjs.org/">Next.js 14</a> • <a href="https://www.prisma.io/">Prisma</a> • <a href="https://www.fastify.io/">Fastify</a> • <a href="https://tailwindcss.com/">Tailwind</a>
## Deploy to Vercel

Click the button below to deploy the frontend instantly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/VanshAgrawal52/ChronicleX-BloggingPlatform&project-name=chroniclex-bloggingplatform&repository-name=ChronicleX-BloggingPlatform)

**Setup:**
- Set the root directory to `packages/frontend` in Vercel settings.
- Set the environment variable `NEXT_PUBLIC_API_URL` to your backend API URL.
- Deploy!

> The backend (Fastify/Prisma) should be deployed separately (Railway, Render, Fly.io, VPS, etc). Set up your database and environment variables as described below.
</p>

<p align="center">
  <a href="#features">Features</a> • <a href="#quick-start">Quick Start</a> • <a href="#admin-access">Admin Access</a> • <a href="#production">Production</a> • <a href="#security">Security</a>
</p>

---

## Features

- 🔒 JWT Auth (access/refresh), roles: READER, AUTHOR, ADMIN
- ✍️ Posts: draft, publish, tags, search, unique slugs
- 💬 Comments: REST + WebSocket live stream
- 🎉 Reactions: optimistic UI, GraphQL mutation
- ⚡ Caching: Redis (optional), prefix invalidation
- 📊 Observability: /healthz, Prometheus /metrics, Pino logs
- 🛡️ Security: Helmet, rate limit, XSS/markdown sanitization
- 🖥️ Admin dashboard: role-gated, delete posts
- 🌗 Theming: SSR-safe light/dark, system toggle

## Stack

- **Backend:** Fastify (TypeScript), Prisma (PostgreSQL), Mercurius GraphQL, WebSocket
- **Frontend:** Next.js 14, React 18, TailwindCSS, React Query
- **Cache/Queue:** Redis (optional), BullMQ scaffold

## Monorepo Structure

```
packages/
  backend/      # Fastify API + GraphQL + Prisma + WS
  frontend/     # Next.js app (pages/)
.github/
infrastructure/
docker-compose.yml
docker-compose.prod.yml
```

## Requirements

- Node.js 18+
- pnpm 9+
- PostgreSQL 14+
- (Optional) Redis 6+ (disable with `DISABLE_REDIS=true`)

## Quick Start (Development)

```bash
# 1. Install dependencies
pnpm install

# 2. Setup database
pnpm --filter @chroniclex/backend prisma:generate
pnpm --filter @chroniclex/backend prisma:migrate dev

# 3. Seed database (creates admin, sample posts)
pnpm --filter @chroniclex/backend seed

# 4. Start backend & frontend (in separate terminals)
pnpm --filter @chroniclex/backend dev    # http://localhost:4000
pnpm --filter @chroniclex/frontend dev   # http://localhost:3000
```

## Admin Access

Default admin credentials (from seed):

```
Email:    admin@chroniclex.dev
Username: admin
Password: AdminPass123!
```

Login at: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)

Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

> ⚠️ **Change the admin password after first login for security!**

## Environment Variables

**Backend (`packages/backend/.env`):**

```ini
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/chroniclex
JWT_SECRET=your-long-random-secret
DISABLE_REDIS=true
# ...see .env.example for all options
```

**Frontend (`packages/frontend/.env`):**

```ini
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Production

```bash
# Build all
pnpm build

# (Recommended) Use Docker Compose for prod
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Run DB migrations and seed (first time only)
docker compose -f docker-compose.prod.yml exec backend pnpm prisma:migrate deploy
docker compose -f docker-compose.prod.yml exec backend pnpm seed
```

Services:
- Frontend: http://localhost:3000
- Backend:  http://localhost:4000

## Security & Best Practices

- Never commit `.env` files (already gitignored)
- Use strong, unique secrets for JWT and admin
- Change default admin password after setup
- Enable HTTPS and set secure CORS in production
- Review and restrict environment variables for deployment

## Troubleshooting

- **Theme/hydration mismatch:** Hard refresh browser (SSR-safe toggle is built-in)
- **Toasts not showing:** Clear cache/hard refresh; toasts render top-right
- **Cannot publish post:** Only authors/admins can publish; drafts allowed for all
- **401 after idle:** Token auto-refreshes; re-login if needed
- **Seed posts missing:** Ensure backend is running and posts are published

## Contributing

PRs and issues welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) if present.

## License

MIT
