# Implementation Plan: AI Rehabilitation Platform MVP

**Branch**: `001-ai-rehab-platform-mvp` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-ai-rehab-platform-mvp/spec.md`

## Summary

Build an AI-powered rehabilitation platform MVP where patients complete mobile-optimized questionnaires about their condition and progress, while clinicians review this data in a desktop dashboard and use AI assistance to formulate personalized SMART rehabilitation goals. The platform uses email+OTP authentication, stores data in Supabase, and is built with Next.js, TypeScript, TanStack Query, shadcn/ui, and Tailwind CSS following Feature-Sliced Design architecture.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15 (App Router)  
**Primary Dependencies**:

- Next.js 15 (React framework with App Router)
- TanStack Query v5 (server state management)
- shadcn/ui (component library built on Radix UI)
- Tailwind CSS (styling)
- Supabase JS Client (database + auth)
- Zod (schema validation)

**Storage**: Supabase (PostgreSQL) with row-level security  
**Testing**: Vitest + React Testing Library (E2E deferred to post-MVP)  
**Target Platform**: Web (mobile-first for patients, desktop-optimized for clinicians)  
**Project Type**: Full-stack web application (Next.js monolith)  
**Performance Goals**:

- Patient questionnaire loads in <2s on 3G
- Clinician dashboard renders patient list in <1s
- AI goal generation completes in <10s

**Constraints**:

- Must use free tiers only (Supabase free tier, Vercel hobby plan)
- Russian language only for MVP
- Mobile-first responsive design for patient interface
- Desktop-optimized for clinician dashboard

**Scale/Scope**:

- MVP: 10-50 patients, 3-5 clinicians
- Single generic questionnaire (10-15 questions)
- 2-3 AI-generated goals per patient

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: No constitution file defined - proceeding with standard web application best practices:

- ✅ Component-driven architecture (React + shadcn/ui)
- ✅ Type safety (TypeScript + Zod validation)
- ✅ Feature-Sliced Design for scalability
- ✅ Server-side rendering for performance
- ✅ Row-level security for data protection

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-rehab-platform-mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (database schema)
├── quickstart.md        # Phase 1 output (setup instructions)
├── contracts/           # Phase 1 output (API contracts)
│   ├── api-routes.md    # Next.js API route contracts
│   └── database.md      # Supabase schema contracts
└── tasks.md             # Phase 2 output (NOT created yet)
```

### Source Code (repository root)

Following Feature-Sliced Design (FSD) architecture:

```text
app/                          # Next.js 15 App Router
├── (auth)/                   # Auth layout group
│   ├── login/
│   └── verify-otp/
├── (patient)/                # Patient layout group (mobile-first)
│   ├── onboarding/
│   ├── questionnaire/
│   └── goals/
├── (clinician)/              # Clinician layout group (desktop)
│   ├── dashboard/
│   └── patients/
│       └── [id]/
├── api/                      # API routes
│   ├── auth/
│   ├── questionnaires/
│   └── goals/
└── layout.tsx

src/
├── shared/                   # FSD: Shared layer
│   ├── ui/                   # shadcn/ui components
│   ├── lib/                  # Utilities, helpers
│   │   ├── supabase/         # Supabase client setup
│   │   ├── validation/       # Zod schemas
│   │   └── i18n/             # Russian translations
│   ├── config/               # App configuration
│   └── types/                # Shared TypeScript types
│
├── entities/                 # FSD: Entities layer
│   ├── patient/
│   │   ├── model/            # Types, schemas
│   │   ├── api/              # TanStack Query hooks
│   │   └── ui/               # Patient-specific components
│   ├── clinician/
│   │   ├── model/
│   │   ├── api/
│   │   └── ui/
│   ├── questionnaire/
│   │   ├── model/
│   │   ├── api/
│   │   └── ui/
│   └── goal/
│       ├── model/
│       ├── api/
│       └── ui/
│
├── features/                 # FSD: Features layer
│   ├── auth/
│   │   ├── send-otp/
│   │   └── verify-otp/
│   ├── questionnaire/
│   │   ├── complete-questionnaire/
│   │   └── view-responses/
│   ├── goals/
│   │   ├── generate-ai-goals/
│   │   ├── approve-goals/
│   │   └── view-patient-goals/
│   └── patient-management/
│       ├── select-clinician/
│       └── view-patient-list/
│
└── widgets/                  # FSD: Widgets layer
    ├── patient-questionnaire-form/
    ├── clinician-dashboard/
    ├── patient-list/
    └── goal-review-panel/

public/
└── locales/
    └── ru/                   # Russian translations

supabase/
├── migrations/               # Database migrations
└── seed.sql                  # Seed data (test clinicians)
```

**Structure Decision**: Using Feature-Sliced Design (FSD) architecture with Next.js App Router. This provides:

- Clear separation of concerns (shared → entities → features → widgets → app)
- Scalability for future feature additions
- Co-location of related code (model, api, ui together)
- Type-safe data flow from database to UI

## Complexity Tracking

> No constitution violations - standard Next.js web application architecture

| Decision              | Rationale                                                                                 | Alternatives Considered                                                 |
| --------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Feature-Sliced Design | Requested by user; provides scalability and maintainability for growing feature set       | Standard Next.js folder structure (simpler but less organized at scale) |
| TanStack Query        | Requested by user; excellent for server state management, caching, and optimistic updates | SWR (simpler but less powerful), native fetch (no caching)              |
| Supabase              | Clarified in spec; provides database + auth + row-level security in one package           | Separate PostgreSQL + Auth service (more complex setup)                 |
