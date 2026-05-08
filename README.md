# NeuroDesk

NeuroDesk is a  focus and deep-work tracker built with Next.js, Prisma, NextAuth, and PostgreSQL.

It helps users run focused sessions, track distractions, view progress, and maintain a clean focus routine through a modern galaxy-style UI.

## Highlights

- Personal focus timer with start/end session flow
- Live duration tracking and distraction counting
- Dashboard analytics (sessions, hours, focus score, recent sessions)
- Session journal grouped by day
- Spotify embed player with custom links
- Custom Spotify items persist in localStorage per browser
- Whitelisted domains management in Settings
- Authentication with credentials + optional GitHub/Google OAuth
- Chatbot conversation and message endpoints

## Tech Stack

- Next.js 16 (App Router) + React 19
- TypeScript + Tailwind CSS v4
- NextAuth v5 (JWT session strategy)
- Prisma ORM + PostgreSQL
- Zod, React Hook Form, Axios, bcryptjs

## Project Structure

```text
src/
	app/
		api/
			auth/[...nextauth]/
			auth/signup/
			auth/forgot-password/
			auth/reset-password/
			chatbot/conversations/
			chatbot/messages/
			dashboard/stats/
			distractions/
			focus-sessions/
			focus-sessions/[id]/
			focus-sessions/active/
			sounds/
			sounds/[id]/
			stats/
			teams/
			user/preferences/
			whitelist/
			whitelist/[id]/
		auth/signin/
		auth/signup/
		dashboard/
		settings/
		layout.tsx
		page.tsx
	components/
	lib/
	types/
prisma/
	schema.prisma
```

## Environment Variables

Create a `.env.local` file at the project root.

Required (core app):

- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - direct DB URL for Prisma migrations
- `NEXTAUTH_SECRET` - random secret for NextAuth
- `NEXTAUTH_URL` - app URL (for local: `http://localhost:3000`)

Optional (OAuth):

- `GITHUB_ID`, `GITHUB_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

Optional (Chatbot AI):

- `GROQ_API_KEY` - required to enable chatbot responses via Groq API (without it, `/api/chatbot/messages` returns a 503 error)
- `GROQ_MODEL` - optional Groq model name (default: `mixtral-8x7b-32768`, e.g. `llama-3-70b-8192`)

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Set up `.env.local` (see variables above)

3. Apply database schema

```bash
npm run db:migrate
# or
npm run db:push
```

4. Start development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint
- `npm run db:migrate` - create/apply migration
- `npm run db:push` - push Prisma schema
- `npm run db:generate` - generate Prisma client
- `npm run db:studio` - open Prisma Studio

## Authentication

The platform supports multiple authentication methods:

1. **Email/Password**: Built-in email authentication with bcrypt hashing
2. **GitHub OAuth**: Optional GitHub sign-in
3. **Google OAuth**: Optional Google sign-in

Configure OAuth providers by setting the appropriate environment variables.

## Focus Score Calculation

The focus score is calculated based on:
- **Base Score**: Duration (normalized to 100 for 1 hour)
- **Distraction Penalty**: -10 points per distraction
- **Range**: 0-100

Formula: `(durationMinutes / 60) * 100 - (distractionCount * 10)`

## Weekly Reports

Automatically generated every week containing:
- Total focus hours
- Session count
- Weekly focus score
- Average session duration
- Total distraction count

## Development Guidelines

### Adding a New API Endpoint

1. Create route file in `src/app/api/[resource]/route.ts`
2. Import `auth` for authentication
3. Import `prisma` for database operations
4. Handle errors and return appropriate status codes
5. Follow RESTful conventions

### Adding a New Database Model

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name your_migration_name`
3. Update TypeScript types in `src/types/index.ts`
4. Update API routes as needed

## Deployment

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms

1. Build: `npm run build`
2. Set environment variables
3. Start: `npm run start`

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint`
4. Commit and push
5. Open a pull request

## License

MIT
