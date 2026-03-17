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

## API Routes (Current)

Auth:

- `GET/POST /api/auth/[...nextauth]`
- `POST /api/auth/signup`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Focus + Analytics:

- `GET/POST /api/focus-sessions`
- `PATCH/DELETE /api/focus-sessions/[id]`
- `GET /api/focus-sessions/active`
- `POST /api/distractions`
- `GET /api/dashboard/stats`
- `GET /api/stats`

Settings + Personalization:

- `GET/POST /api/whitelist`
- `DELETE /api/whitelist/[id]`
- `GET/POST /api/sounds`
- `PATCH/DELETE /api/sounds/[id]`
- `GET/PATCH /api/user/preferences`

Other:

- `GET/POST /api/teams`
- `GET/POST /api/chatbot/conversations`
- `GET/POST /api/chatbot/messages`

## Notes

- The product direction is personal-focus-first  while retaining team-capable data models and APIs.
- Spotify custom items are persisted in browser localStorage and are not synced server-side.

## License

MIT
