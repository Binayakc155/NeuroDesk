# Focus Intelligence Platform (B2B)

A sophisticated focus management and team analytics platform built with Next.js, Tailwind CSS, Prisma, and PostgreSQL.

## Features

### User-Level Features
- ✅ Start/stop deep work sessions
- ✅ Track session duration automatically
- ✅ Simple distraction detection (manual "I got disturbed" button)
- ✅ Weekly reports (total focus hours + session count)
- ✅ Focus score calculation with distraction penalty

### Team-Level Features
- ✅ Team dashboard with average focus metrics
- ✅ Basic team analytics (weekly team reports)
- ✅ Team member invitations
- ✅ Team invites management

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Headless components with Tailwind

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (email, OAuth providers)

### Additional Libraries
- **Validation**: Zod
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Date Utils**: date-fns
- **Password Hashing**: bcryptjs

## Project Structure

```
foinp/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/      # NextAuth configuration
│   │   │   ├── focus-sessions/          # Focus session endpoints
│   │   │   ├── focus-sessions/[id]/     # Individual session endpoints
│   │   │   ├── stats/                   # User statistics endpoint
│   │   │   └── teams/                   # Team management endpoints
│   │   ├── layout.tsx                   # Root layout
│   │   └── page.tsx                     # Home page
│   ├── components/                      # Reusable React components
│   ├── lib/
│   │   ├── auth.ts                      # NextAuth configuration
│   │   ├── prisma.ts                    # Prisma client singleton
│   │   └── utils.ts                     # Utility functions
│   └── types/
│       └── index.ts                     # TypeScript type definitions
├── prisma/
│   └── schema.prisma                    # Database schema
├── .env.local                           # Local environment variables
├── .env.example                         # Environment variable template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## Database Schema

### Core Models
- **User**: User accounts with email/password and OAuth
- **Account**: OAuth provider accounts
- **Session**: NextAuth session management
- **Team**: Team/group management
- **TeamMember**: User team membership
- **TeamInvite**: Team invitation system
- **FocusSession**: Individual focus/deep work sessions
- **Distraction**: Distraction events during sessions
- **WeeklyReport**: Weekly analytics and statistics
- **Notification**: User notifications
- **VerificationToken**: Email verification tokens

## Getting Started

### Prerequisites
- Node.js 18+ with npm or yarn
- PostgreSQL 14+ (or Supabase)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for dev)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- OAuth credentials (GitHub/Google - optional)

3. **Set up the database**:
```bash
npm run db:migrate
# or if starting fresh:
npm run db:push
```

4. **Generate Prisma client**:
```bash
npm run db:generate
```

5. **Start the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Focus Sessions
- `POST /api/focus-sessions` - Start a new focus session
- `GET /api/focus-sessions` - Get user's focus sessions
- `PATCH /api/focus-sessions/[id]` - End a focus session
- `DELETE /api/focus-sessions/[id]` - Delete a focus session

### User Statistics
- `GET /api/stats` - Get user statistics and metrics

### Teams
- `GET /api/teams` - Get user's teams
- `POST /api/teams` - Create a new team

### Authentication
- `POST /api/auth/signin` - Sign in with email/password
- `POST /api/auth/signup` - Register new account
- `GET /api/auth/session` - Get current session

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

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

## Support

For issues and feature requests, please open an issue in the repository.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
