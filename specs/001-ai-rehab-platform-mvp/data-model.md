# Data Model: AI Rehabilitation Platform MVP

**Date**: 2026-04-14  
**Database**: Supabase (PostgreSQL)

## Overview

This document defines the database schema for the AI Rehabilitation Platform MVP. All tables use row-level security (RLS) policies to ensure patients can only access their own data and clinicians can only access their assigned patients.

## Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase built-in)
│  (id, email)    │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    patients     │  │   clinicians    │  │     admins      │
│                 │  │                 │  │                 │
│ - user_id (FK)  │  │ - user_id (FK)  │  │ - user_id (FK)  │
│ - clinician_id  │  │ - name          │  │ - name          │
│   (FK)          │  │ - specialization│  │                 │
└────────┬────────┘  └─────────────────┘  └─────────────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ questionnaire_  │  │      goals      │  │ clinician_notes │
│   responses     │  │                 │  │                 │
│                 │  │ - patient_id    │  │ - patient_id    │
│ - patient_id    │  │ - created_by    │  │ - clinician_id  │
│ - responses     │  │ - status        │  │ - content       │
│   (JSONB)       │  │ - ai_generated  │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Tables

### 1. `profiles` (extends auth.users)

Stores additional user profile information and role.

```sql
CREATE TYPE user_role AS ENUM ('patient', 'clinician', 'admin');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Fields**:

- `id` (UUID, PK, FK to auth.users): User identifier
- `role` (ENUM): User role (patient, clinician, admin)
- `full_name` (TEXT, nullable): User's full name
- `created_at` (TIMESTAMPTZ): Account creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Validation Rules**:

- `role` must be one of: patient, clinician, admin
- `full_name` max length: 255 characters

---

### 2. `clinicians`

Stores clinician-specific information.

```sql
CREATE TABLE clinicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  specialization TEXT,
  is_accepting_patients BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE clinicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view own record"
  ON clinicians FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view accepting clinicians"
  ON clinicians FOR SELECT
  USING (is_accepting_patients = true);

CREATE POLICY "Admins can manage clinicians"
  ON clinicians FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
```

**Fields**:

- `id` (UUID, PK): Clinician identifier
- `user_id` (UUID, FK to auth.users, UNIQUE): Associated user account
- `specialization` (TEXT, nullable): Clinician's specialization (e.g., "Физиотерапевт", "Эрготерапевт")
- `is_accepting_patients` (BOOLEAN): Whether clinician is accepting new patients
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Validation Rules**:

- `specialization` max length: 255 characters
- Only one clinician record per user_id

---

### 3. `patients`

Stores patient-specific information and clinician assignment.

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  clinician_id UUID REFERENCES clinicians(id) ON DELETE SET NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  disclaimer_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own record"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own record"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Clinicians can view assigned patients"
  ON patients FOR SELECT
  USING (
    clinician_id IN (
      SELECT id FROM clinicians WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can update assigned patients"
  ON patients FOR UPDATE
  USING (
    clinician_id IN (
      SELECT id FROM clinicians WHERE user_id = auth.uid()
    )
  );
```

**Fields**:

- `id` (UUID, PK): Patient identifier
- `user_id` (UUID, FK to auth.users, UNIQUE): Associated user account
- `clinician_id` (UUID, FK to clinicians, nullable): Assigned clinician
- `onboarding_completed` (BOOLEAN): Whether patient completed onboarding flow
- `disclaimer_accepted_at` (TIMESTAMPTZ, nullable): When patient accepted medical disclaimer
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Validation Rules**:

- Only one patient record per user_id
- `disclaimer_accepted_at` must be set before completing questionnaire
- `clinician_id` must reference an existing clinician

---

### 4. `questionnaire_responses`

Stores patient questionnaire submissions.

```sql
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  rehabilitation_category TEXT NOT NULL,
  rehabilitation_subtype TEXT,
  recovery_stage TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_questionnaire_responses_patient_id
  ON questionnaire_responses(patient_id);
CREATE INDEX idx_questionnaire_responses_completed_at
  ON questionnaire_responses(completed_at DESC);

-- RLS Policies
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own responses"
  ON questionnaire_responses FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can insert own responses"
  ON questionnaire_responses FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can view assigned patient responses"
  ON questionnaire_responses FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN clinicians c ON p.clinician_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );
```

**Fields**:

- `id` (UUID, PK): Response identifier
- `patient_id` (UUID, FK to patients): Patient who submitted the response
- `responses` (JSONB): Questionnaire answers in JSON format
- `rehabilitation_category` (TEXT): Category selected (e.g., "physical_therapy", "occupational_therapy")
- `rehabilitation_subtype` (TEXT, nullable): Subtype if applicable
- `recovery_stage` (TEXT, nullable): Current recovery stage
- `completed_at` (TIMESTAMPTZ): When questionnaire was completed
- `created_at` (TIMESTAMPTZ): Record creation timestamp

**JSONB Structure** (`responses` field):

```json
{
  "questions": [
    {
      "id": "q1",
      "question": "Опишите вашу текущую боль по шкале от 1 до 10",
      "answer": "7",
      "type": "scale"
    },
    {
      "id": "q2",
      "question": "Какие движения вызывают дискомфорт?",
      "answer": "Подъем руки выше плеча",
      "type": "text"
    }
  ],
  "summary": {
    "pain_level": 7,
    "mobility_issues": ["shoulder_elevation"],
    "daily_activities_affected": ["dressing", "reaching"]
  }
}
```

**Validation Rules**:

- `responses` must be valid JSON
- `rehabilitation_category` required, max length: 100 characters
- Cannot modify responses after creation (immutable)

---

### 5. `goals`

Stores rehabilitation goals (AI-generated or manually created).

```sql
CREATE TYPE goal_status AS ENUM ('draft', 'active', 'completed', 'archived');

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by_clinician_id UUID NOT NULL REFERENCES clinicians(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metric TEXT NOT NULL,
  target_value TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  status goal_status NOT NULL DEFAULT 'draft',
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  ai_prompt TEXT,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_goals_patient_id ON goals(patient_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_created_by ON goals(created_by_clinician_id);

-- RLS Policies
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own goals"
  ON goals FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can view assigned patient goals"
  ON goals FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN clinicians c ON p.clinician_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can manage assigned patient goals"
  ON goals FOR ALL
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN clinicians c ON p.clinician_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );
```

**Fields**:

- `id` (UUID, PK): Goal identifier
- `patient_id` (UUID, FK to patients): Patient this goal belongs to
- `created_by_clinician_id` (UUID, FK to clinicians): Clinician who created/approved the goal
- `title` (TEXT): Short goal title (e.g., "Увеличить диапазон движения плеча")
- `description` (TEXT): Detailed goal description
- `metric` (TEXT): Measurable metric (e.g., "Угол подъема руки")
- `target_value` (TEXT): Target value (e.g., "180 градусов")
- `timeframe` (TEXT): Time to achieve goal (e.g., "4 недели")
- `status` (ENUM): Current status (draft, active, completed, archived)
- `ai_generated` (BOOLEAN): Whether goal was generated by AI
- `ai_prompt` (TEXT, nullable): Original AI prompt if AI-generated
- `approved_at` (TIMESTAMPTZ, nullable): When clinician approved the goal
- `completed_at` (TIMESTAMPTZ, nullable): When goal was marked complete
- `created_at` (TIMESTAMPTZ): Record creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Validation Rules**:

- `title` max length: 255 characters
- `description` max length: 2000 characters
- `status` transitions: draft → active → completed/archived
- `approved_at` must be set when status changes to 'active'
- Only clinician assigned to patient can create/modify goals

---

### 6. `clinician_notes`

Stores clinician notes about patients.

```sql
CREATE TABLE clinician_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinician_id UUID NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clinician_notes_patient_id ON clinician_notes(patient_id);
CREATE INDEX idx_clinician_notes_created_at ON clinician_notes(created_at DESC);

-- RLS Policies
ALTER TABLE clinician_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinicians can view notes for assigned patients"
  ON clinician_notes FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN clinicians c ON p.clinician_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can create notes for assigned patients"
  ON clinician_notes FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN clinicians c ON p.clinician_id = c.id
      WHERE c.user_id = auth.uid()
    )
    AND clinician_id IN (
      SELECT id FROM clinicians WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clinicians can update own notes"
  ON clinician_notes FOR UPDATE
  USING (
    clinician_id IN (
      SELECT id FROM clinicians WHERE user_id = auth.uid()
    )
  );
```

**Fields**:

- `id` (UUID, PK): Note identifier
- `patient_id` (UUID, FK to patients): Patient the note is about
- `clinician_id` (UUID, FK to clinicians): Clinician who wrote the note
- `content` (TEXT): Note content
- `created_at` (TIMESTAMPTZ): Note creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

**Validation Rules**:

- `content` max length: 5000 characters
- Only clinician assigned to patient can create notes
- Clinicians can only edit their own notes

---

## Database Functions

### 1. Update `updated_at` Trigger

Automatically update `updated_at` timestamp on row updates.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinicians_updated_at
  BEFORE UPDATE ON clinicians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinician_notes_updated_at
  BEFORE UPDATE ON clinician_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Get Patient Summary

Function to generate patient summary for clinician dashboard.

```sql
CREATE OR REPLACE FUNCTION get_patient_summary(p_patient_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'patient_id', p.id,
    'patient_name', pr.full_name,
    'latest_questionnaire', (
      SELECT json_build_object(
        'id', qr.id,
        'completed_at', qr.completed_at,
        'category', qr.rehabilitation_category
      )
      FROM questionnaire_responses qr
      WHERE qr.patient_id = p.id
      ORDER BY qr.completed_at DESC
      LIMIT 1
    ),
    'active_goals_count', (
      SELECT COUNT(*)
      FROM goals g
      WHERE g.patient_id = p.id AND g.status = 'active'
    ),
    'completed_goals_count', (
      SELECT COUNT(*)
      FROM goals g
      WHERE g.patient_id = p.id AND g.status = 'completed'
    )
  ) INTO result
  FROM patients p
  JOIN profiles pr ON p.user_id = pr.id
  WHERE p.id = p_patient_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Seed Data

Initial data for testing (admins and sample clinicians).

```sql
-- Insert admin user (requires manual auth.users entry first)
-- This would be done via Supabase dashboard or auth API

-- Sample clinicians (after creating auth.users entries)
INSERT INTO clinicians (user_id, specialization, is_accepting_patients)
VALUES
  ('uuid-of-clinician-1', 'Физиотерапевт', true),
  ('uuid-of-clinician-2', 'Эрготерапевт', true),
  ('uuid-of-clinician-3', 'Логопед', false);
```

---

## Migration Strategy

1. Create tables in order of dependencies (profiles → clinicians → patients → responses/goals/notes)
2. Enable RLS on each table immediately after creation
3. Create indexes after initial data load
4. Test RLS policies with different user roles
5. Create database functions last

**Migration Files** (in `supabase/migrations/`):

- `20260414000001_create_profiles.sql`
- `20260414000002_create_clinicians.sql`
- `20260414000003_create_patients.sql`
- `20260414000004_create_questionnaire_responses.sql`
- `20260414000005_create_goals.sql`
- `20260414000006_create_clinician_notes.sql`
- `20260414000007_create_functions.sql`
- `20260414000008_seed_data.sql`

---

## TypeScript Types

Generated types for use in application code:

```typescript
// Generated by Supabase CLI: supabase gen types typescript

export type UserRole = "patient" | "clinician" | "admin";
export type GoalStatus = "draft" | "active" | "completed" | "archived";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Clinician {
  id: string;
  user_id: string;
  specialization: string | null;
  is_accepting_patients: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  clinician_id: string | null;
  onboarding_completed: boolean;
  disclaimer_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireResponse {
  id: string;
  patient_id: string;
  responses: {
    questions: Array<{
      id: string;
      question: string;
      answer: string;
      type: string;
    }>;
    summary?: Record<string, any>;
  };
  rehabilitation_category: string;
  rehabilitation_subtype: string | null;
  recovery_stage: string | null;
  completed_at: string;
  created_at: string;
}

export interface Goal {
  id: string;
  patient_id: string;
  created_by_clinician_id: string;
  title: string;
  description: string;
  metric: string;
  target_value: string;
  timeframe: string;
  status: GoalStatus;
  ai_generated: boolean;
  ai_prompt: string | null;
  approved_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicianNote {
  id: string;
  patient_id: string;
  clinician_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
```

---

## Summary

Database schema complete with:

- ✅ 6 main tables (profiles, clinicians, patients, questionnaire_responses, goals, clinician_notes)
- ✅ Row-level security policies for all tables
- ✅ Indexes on foreign keys and frequently queried columns
- ✅ Automatic `updated_at` triggers
- ✅ Helper functions for common queries
- ✅ TypeScript type definitions

**Ready for**: API contracts definition and implementation.
