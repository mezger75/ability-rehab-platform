# Quickstart Guide: AI Rehabilitation Platform MVP

**Last Updated**: 2026-04-14

## Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Git
- Supabase account (free tier)
- Code editor (VS Code recommended)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ability

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### 2. Supabase Setup

#### Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details:
   - Name: `ai-rehab-platform-mvp`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be provisioned (~2 minutes)

#### Get API Keys

1. In Supabase dashboard, go to Settings → API
2. Copy the following:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key (keep this secure!)

#### Configure Environment Variables

Create `.env.local` in project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only, never expose to client

# AI Service (choose one)
# Option 1: Gemini (recommended for MVP - free tier)
GEMINI_API_KEY=your_gemini_api_key_here

# Option 2: Groq (Llama 3.1 - free tier)
# GROQ_API_KEY=your_groq_api_key_here

# Option 3: OpenAI (paid, but high quality)
# OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get AI API Keys**:

- Gemini: https://ai.google.dev/ → Get API Key
- Groq: https://console.groq.com/ → Create API Key
- OpenAI: https://platform.openai.com/api-keys

### 3. Database Setup

#### Install Supabase CLI

```bash
npm install -g supabase
```

#### Link to Your Project

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

Find your project ref in Supabase dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`

#### Run Migrations

```bash
# Apply all migrations
supabase db push

# Or manually run migrations in Supabase SQL Editor
# Copy contents from supabase/migrations/*.sql
```

#### Seed Test Data (Optional)

```bash
# Run seed script
supabase db reset --db-url <your-database-url>

# Or manually in SQL Editor
# Copy contents from supabase/seed.sql
```

### 4. Configure Email Templates (Supabase Auth)

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Edit "Magic Link" template for Russian language:

**Subject**: `Ваш код для входа`

**Body**:

```html
<h2>Код для входа</h2>
<p>Ваш код для входа в платформу реабилитации:</p>
<h1>{{ .Token }}</h1>
<p>Код действителен в течение 10 минут.</p>
<p>Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
```

### 5. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 in your browser.

---

## Project Structure

```
ability/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, verify-otp)
│   ├── (patient)/           # Patient pages (questionnaire, goals)
│   ├── (clinician)/         # Clinician pages (dashboard, patients)
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
│
├── src/
│   ├── shared/              # FSD: Shared utilities
│   │   ├── ui/              # shadcn/ui components
│   │   ├── lib/             # Utilities (supabase, validation)
│   │   ├── config/          # App configuration
│   │   └── types/           # TypeScript types
│   │
│   ├── entities/            # FSD: Business entities
│   │   ├── patient/
│   │   ├── clinician/
│   │   ├── questionnaire/
│   │   └── goal/
│   │
│   ├── features/            # FSD: User actions
│   │   ├── auth/
│   │   ├── questionnaire/
│   │   ├── goals/
│   │   └── patient-management/
│   │
│   └── widgets/             # FSD: Composite UI blocks
│       ├── patient-questionnaire-form/
│       ├── clinician-dashboard/
│       └── goal-review-panel/
│
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed.sql             # Seed data
│
├── public/
│   └── locales/ru/          # Russian translations
│
└── specs/                   # Feature specifications
    └── 001-ai-rehab-platform-mvp/
```

---

## Development Workflow

### 1. Create a New Feature

Follow Feature-Sliced Design architecture:

```bash
# Example: Add new entity
mkdir -p src/entities/new-entity/{model,api,ui}
touch src/entities/new-entity/index.ts

# Example: Add new feature
mkdir -p src/features/new-feature
touch src/features/new-feature/index.ts
```

### 2. Add shadcn/ui Components

```bash
# Initialize shadcn/ui (first time only)
npx shadcn-ui@latest init

# Add specific components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

### 3. Generate TypeScript Types from Supabase

```bash
# Generate types
npx supabase gen types typescript --local > src/shared/types/database.types.ts

# Or from remote project
npx supabase gen types typescript --project-id <project-ref> > src/shared/types/database.types.ts
```

### 4. Run Tests

```bash
# Unit tests (Vitest)
npm run test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

### 5. Database Migrations

```bash
# Create new migration
supabase migration new <migration-name>

# Apply migrations locally
supabase db push

# Reset database (caution: deletes all data)
supabase db reset
```

---

## Common Tasks

### Add a New API Route

```typescript
// app/api/example/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Требуется авторизация" },
      { status: 401 }
    );
  }

  // Your logic here
  const { data, error } = await supabase.from("your_table").select("*");

  if (error) {
    return NextResponse.json(
      { error: "InternalError", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
```

### Add a TanStack Query Hook

```typescript
// src/entities/patient/api/usePatient.ts
import { useQuery } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function usePatient(id: string) {
  const supabase = createClientComponentClient();

  return useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*, clinician:clinicians(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}
```

### Add Russian Translation

```typescript
// messages/ru.json
{
  "auth": {
    "login": "Войти",
    "enterEmail": "Введите email",
    "sendCode": "Отправить код",
    "verifyCode": "Проверить код"
  },
  "questionnaire": {
    "title": "Анкета пациента",
    "submit": "Отправить",
    "painLevel": "Уровень боли"
  }
}

// Usage in component
import { useTranslations } from 'next-intl';

function LoginForm() {
  const t = useTranslations('auth');
  return <button>{t('login')}</button>;
}
```

---

## Troubleshooting

### Issue: "Supabase client not initialized"

**Solution**: Check that environment variables are set correctly in `.env.local` and restart dev server.

### Issue: "Row-level security policy violation"

**Solution**: Check that RLS policies are correctly set up in Supabase. Verify user role and permissions.

```sql
-- Check current user
SELECT auth.uid();

-- Check user role
SELECT role FROM profiles WHERE id = auth.uid();

-- Test RLS policy
SELECT * FROM patients WHERE user_id = auth.uid();
```

### Issue: "AI API rate limit exceeded"

**Solution**:

- Gemini free tier: 15 requests/minute
- Implement caching for repeated requests
- Add retry logic with exponential backoff

### Issue: "Email not sending (OTP)"

**Solution**:

- Development: Supabase sends 3 emails/hour max
- Check Supabase Dashboard → Authentication → Logs
- For production: Configure custom SMTP or use Resend integration

---

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Configure environment variables (same as `.env.local`)
5. Deploy

**Environment Variables in Vercel**:

- Add all variables from `.env.local`
- Use Vercel's environment variable encryption
- Set different values for Preview vs Production

### Database Migrations in Production

```bash
# Apply migrations to production
supabase db push --db-url <production-database-url>

# Or use Supabase CLI with linked project
supabase db push --project-ref <production-project-ref>
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run type-check       # TypeScript type checking

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier

# Database
supabase db push         # Apply migrations
supabase db reset        # Reset database
supabase gen types typescript --local  # Generate types
```

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **TanStack Query**: https://tanstack.com/query/latest
- **shadcn/ui**: https://ui.shadcn.com/
- **Feature-Sliced Design**: https://feature-sliced.design/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Getting Help

- Check [data-model.md](./data-model.md) for database schema
- Check [contracts/api-routes.md](./contracts/api-routes.md) for API documentation
- Check [research.md](./research.md) for technology decisions

---

**Ready to start coding!** 🚀
