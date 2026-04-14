# Research: AI Rehabilitation Platform MVP

**Date**: 2026-04-14  
**Purpose**: Resolve technology decisions and document best practices for implementation

## Technology Decisions

### 1. Email OTP Authentication with Supabase

**Decision**: Use Supabase Auth with email OTP (magic link alternative)

**Rationale**:

- Supabase Auth supports passwordless email authentication out of the box
- Free tier includes 50,000 monthly active users
- Built-in email templates (customizable for Russian language)
- Automatic session management with JWT tokens
- Row-level security integrates seamlessly with auth

**Implementation Approach**:

- Use `supabase.auth.signInWithOtp({ email })` for sending codes
- Use `supabase.auth.verifyOtp({ email, token, type: 'email' })` for verification
- Configure custom email templates in Supabase dashboard with Russian translations
- For MVP: Use Supabase's built-in email service (free tier: 3 emails/hour in development, upgrade for production)
- Alternative for production: Integrate Resend (free tier: 100 emails/day) via Supabase webhooks

**Best Practices**:

- Store OTP codes with 10-minute expiration
- Rate limit OTP requests (max 3 per email per hour)
- Show clear error messages in Russian for expired/invalid codes
- Implement session refresh logic for long-lived sessions

**References**:

- Supabase Auth OTP: https://supabase.com/docs/guides/auth/auth-email-passwordless
- Next.js + Supabase Auth: https://supabase.com/docs/guides/auth/server-side/nextjs

---

### 2. AI Model Selection for Goal Generation

**Decision**: Deferred to implementation with free-tier constraint

**Options Evaluated**:

| Model                  | Free Tier                  | Russian Support | Pros                                             | Cons                                      |
| ---------------------- | -------------------------- | --------------- | ------------------------------------------------ | ----------------------------------------- |
| Claude API (Anthropic) | $5 credit for new accounts | Excellent       | Best reasoning for medical goals, SMART criteria | Credit expires, then paid                 |
| OpenAI GPT-4o-mini     | $5 credit for new accounts | Excellent       | Fast, cost-effective                             | Credit expires, then paid                 |
| Gemini 1.5 Flash       | Free tier: 15 RPM          | Excellent       | Truly free tier, fast                            | Lower reasoning quality than Claude/GPT-4 |
| Llama 3.1 (via Groq)   | Free tier: 30 RPM          | Good            | Fast inference, free                             | Requires careful prompting                |
| Yandex GPT             | Free tier available        | Native Russian  | Best Russian language                            | Requires Russian phone for registration   |

**Recommendation for MVP**:

1. **Primary**: Gemini 1.5 Flash (truly free, 15 requests/min sufficient for MVP scale)
2. **Fallback**: Llama 3.1 via Groq (if Gemini quality insufficient)
3. **Production**: Claude API or GPT-4o-mini (better quality, worth the cost)

**Implementation Strategy**:

- Create abstraction layer for AI service (`src/shared/lib/ai/`)
- Define interface: `generateGoals(patientData) => Goal[]`
- Implement Gemini provider first
- Easy to swap providers later without changing application code

**Prompt Engineering for SMART Goals**:

```typescript
const systemPrompt = `Вы - эксперт по реабилитации. На основе данных пациента создайте 2-3 персонализированные цели реабилитации в формате SMART:
- Specific (Конкретная)
- Measurable (Измеримая) 
- Achievable (Достижимая)
- Relevant (Релевантная)
- Time-bound (Ограниченная по времени)

Формат ответа JSON:
{
  "goals": [
    {
      "title": "Краткое название цели",
      "description": "Подробное описание",
      "metric": "Измеримый показатель",
      "target": "Целевое значение",
      "timeframe": "Срок достижения"
    }
  ]
}`;
```

**References**:

- Gemini API: https://ai.google.dev/gemini-api/docs
- Groq (Llama): https://console.groq.com/docs/quickstart
- Vercel AI SDK (abstraction): https://sdk.vercel.ai/docs

---

### 3. Supabase Database Schema Design

**Decision**: PostgreSQL with row-level security (RLS) policies

**Schema Approach**:

- Use Supabase's `auth.users` table for authentication
- Create custom tables for domain entities
- Enable RLS on all tables
- Use foreign keys to `auth.users.id` for user relationships

**Best Practices**:

- Use UUID primary keys (Supabase default)
- Add `created_at` and `updated_at` timestamps (use `timestamptz`)
- Use JSONB for flexible questionnaire responses
- Create indexes on foreign keys and frequently queried columns
- Use Supabase migrations for version control

**RLS Policy Patterns**:

```sql
-- Patients can only see their own data
CREATE POLICY "Patients view own data" ON patients
  FOR SELECT USING (auth.uid() = user_id);

-- Clinicians can see their assigned patients
CREATE POLICY "Clinicians view assigned patients" ON patients
  FOR SELECT USING (
    clinician_id IN (
      SELECT id FROM clinicians WHERE user_id = auth.uid()
    )
  );
```

**References**:

- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL JSONB: https://www.postgresql.org/docs/current/datatype-json.html

---

### 4. Feature-Sliced Design (FSD) with Next.js

**Decision**: Implement FSD architecture as requested

**Layer Responsibilities**:

1. **shared/** - Reusable utilities, UI components, configs
   - No business logic
   - No imports from other layers
   - Examples: Button, Input, formatDate(), supabaseClient

2. **entities/** - Business entities (Patient, Clinician, Questionnaire, Goal)
   - Data models, types, schemas
   - API hooks (TanStack Query)
   - Entity-specific UI components
   - Can import from: shared

3. **features/** - User actions and use cases
   - Complete workflows (send-otp, complete-questionnaire, generate-goals)
   - Combines multiple entities
   - Can import from: shared, entities

4. **widgets/** - Composite UI blocks
   - Page sections (dashboard, questionnaire-form)
   - Combines features and entities
   - Can import from: shared, entities, features

5. **app/** - Next.js App Router pages
   - Route definitions
   - Layouts
   - Combines widgets
   - Can import from: all layers

**Best Practices**:

- Each slice has `model/`, `api/`, `ui/` folders
- Use barrel exports (`index.ts`) for public API
- Enforce import rules with ESLint (eslint-plugin-import)
- Co-locate tests with implementation

**Example Structure**:

```typescript
// entities/patient/model/types.ts
export interface Patient {
  id: string;
  email: string;
  clinician_id: string;
  created_at: string;
}

// entities/patient/api/usePatient.ts
export function usePatient(id: string) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => supabase.from("patients").select("*").eq("id", id).single(),
  });
}

// entities/patient/index.ts
export { type Patient } from "./model/types";
export { usePatient } from "./api/usePatient";
```

**References**:

- FSD Documentation: https://feature-sliced.design/
- Next.js App Router: https://nextjs.org/docs/app

---

### 5. TanStack Query Best Practices

**Decision**: Use TanStack Query v5 for all server state

**Key Patterns**:

**Query Keys Convention**:

```typescript
// Hierarchical query keys
["patients"][("patients", patientId)][ // All patients // Single patient
  ("patients", patientId, "questionnaires")
][("patients", patientId, "goals")]; // Patient's questionnaires // Patient's goals
```

**Optimistic Updates**:

```typescript
const mutation = useMutation({
  mutationFn: approveGoal,
  onMutate: async (goalId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["goals", goalId] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["goals", goalId]);

    // Optimistically update
    queryClient.setQueryData(["goals", goalId], (old) => ({
      ...old,
      status: "approved",
    }));

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(["goals", goalId], context.previous);
  },
});
```

**Prefetching for Performance**:

```typescript
// Prefetch patient data when hovering over patient list item
<PatientListItem
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['patients', patient.id],
      queryFn: () => fetchPatient(patient.id)
    });
  }}
/>
```

**References**:

- TanStack Query v5: https://tanstack.com/query/latest
- React Query + Supabase: https://supabase.com/docs/guides/getting-started/tutorials/with-react

---

### 6. shadcn/ui + Tailwind CSS Setup

**Decision**: Use shadcn/ui for component library

**Setup Steps**:

1. Initialize shadcn/ui: `npx shadcn-ui@latest init`
2. Configure for Russian language (RTL not needed, but translations yes)
3. Install needed components: `npx shadcn-ui@latest add button form input select textarea`

**Component Customization**:

- Modify `components.json` for custom theme
- Use CSS variables for colors (defined in `app/globals.css`)
- Create Russian translations for form validation messages

**Mobile-First Responsive Design**:

```typescript
// Tailwind breakpoints
sm: '640px'  // Small devices
md: '768px'  // Tablets
lg: '1024px' // Desktops
xl: '1280px' // Large desktops

// Mobile-first approach
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>
```

**Accessibility**:

- shadcn/ui built on Radix UI (ARIA compliant)
- Use semantic HTML
- Add Russian `aria-label` attributes
- Test with keyboard navigation

**References**:

- shadcn/ui: https://ui.shadcn.com/
- Tailwind CSS: https://tailwindcss.com/docs

---

### 7. Internationalization (i18n) for Russian

**Decision**: Use next-intl for type-safe translations

**Setup**:

```bash
npm install next-intl
```

**Structure**:

```typescript
// messages/ru.json
{
  "auth": {
    "login": "Войти",
    "enterEmail": "Введите email",
    "sendCode": "Отправить код"
  },
  "questionnaire": {
    "title": "Анкета пациента",
    "submit": "Отправить"
  }
}

// Usage
import { useTranslations } from 'next-intl';

function LoginForm() {
  const t = useTranslations('auth');
  return <button>{t('login')}</button>;
}
```

**Best Practices**:

- Organize translations by feature/domain
- Use nested keys for context
- Type-safe with TypeScript
- Server and client component support

**References**:

- next-intl: https://next-intl-docs.vercel.app/

---

### 8. Testing Strategy

**Decision**: Vitest + React Testing Library (E2E tests deferred)

**Test Approach**:

1. **Unit Tests** (Vitest + React Testing Library)
   - Utility functions
   - React components (isolated)
   - Validation schemas (Zod)

2. **Integration Tests** (Vitest + MSW)
   - API routes
   - TanStack Query hooks with mocked Supabase
   - Form submissions

**Setup**:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D msw # Mock Service Worker for API mocking
```

**Example Test**:

```typescript
// entities/patient/api/usePatient.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { usePatient } from "./usePatient";

test("fetches patient data", async () => {
  const { result } = renderHook(() => usePatient("123"));

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual({ id: "123", email: "test@example.com" });
});
```

**Note**: E2E tests with Playwright deferred to post-MVP phase.

**References**:

- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/react

---

### 9. Deployment on Vercel

**Decision**: Deploy to Vercel (free hobby plan)

**Configuration**:

- Automatic deployments from git push
- Environment variables in Vercel dashboard
- Preview deployments for PRs

**Environment Variables**:

```bash
# .env.local (not committed)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # Server-side only

# AI API (choose one)
GEMINI_API_KEY=xxx
# or
GROQ_API_KEY=xxx
```

**Best Practices**:

- Use `NEXT_PUBLIC_` prefix for client-side env vars
- Never expose service role key to client
- Use Vercel's built-in environment variable encryption
- Set up different environments (development, preview, production)

**References**:

- Vercel Deployment: https://vercel.com/docs/deployments/overview
- Next.js Environment Variables: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

## Summary

All technology decisions resolved:

- ✅ Authentication: Supabase Auth with email OTP
- ✅ AI Model: Gemini 1.5 Flash (free tier) with abstraction layer
- ✅ Database: Supabase PostgreSQL with RLS
- ✅ Architecture: Feature-Sliced Design with Next.js App Router
- ✅ State Management: TanStack Query v5
- ✅ UI: shadcn/ui + Tailwind CSS
- ✅ i18n: next-intl for Russian translations
- ✅ Testing: Vitest + React Testing Library (E2E deferred)
- ✅ Deployment: Vercel

**Ready for Phase 1**: Data model and API contracts design.
