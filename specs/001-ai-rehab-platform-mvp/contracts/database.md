# Database Schema Contract

**Date**: 2026-04-14  
**Database**: Supabase (PostgreSQL 15)

## Schema Version

**Current Version**: 1.0.0  
**Migration Path**: `supabase/migrations/`

## Tables

### Core Tables

| Table                     | Purpose                 | Primary Key | Foreign Keys                                                              |
| ------------------------- | ----------------------- | ----------- | ------------------------------------------------------------------------- |
| `profiles`                | User profile and role   | `id` (UUID) | `id` → `auth.users.id`                                                    |
| `clinicians`              | Clinician-specific data | `id` (UUID) | `user_id` → `auth.users.id`                                               |
| `patients`                | Patient-specific data   | `id` (UUID) | `user_id` → `auth.users.id`, `clinician_id` → `clinicians.id`             |
| `questionnaire_responses` | Patient assessments     | `id` (UUID) | `patient_id` → `patients.id`                                              |
| `goals`                   | Rehabilitation goals    | `id` (UUID) | `patient_id` → `patients.id`, `created_by_clinician_id` → `clinicians.id` |
| `clinician_notes`         | Clinician observations  | `id` (UUID) | `patient_id` → `patients.id`, `clinician_id` → `clinicians.id`            |

### Enums

```sql
CREATE TYPE user_role AS ENUM ('patient', 'clinician', 'admin');
CREATE TYPE goal_status AS ENUM ('draft', 'active', 'completed', 'archived');
```

## Row-Level Security (RLS)

All tables have RLS enabled. Key policies:

- **Patients**: Can only view/update their own data
- **Clinicians**: Can view/update data for assigned patients only
- **Admins**: Full access to all data

## Indexes

Performance-critical indexes:

```sql
-- Foreign key indexes
CREATE INDEX idx_patients_clinician_id ON patients(clinician_id);
CREATE INDEX idx_questionnaire_responses_patient_id ON questionnaire_responses(patient_id);
CREATE INDEX idx_goals_patient_id ON goals(patient_id);
CREATE INDEX idx_goals_created_by ON goals(created_by_clinician_id);
CREATE INDEX idx_clinician_notes_patient_id ON clinician_notes(patient_id);

-- Query optimization indexes
CREATE INDEX idx_questionnaire_responses_completed_at ON questionnaire_responses(completed_at DESC);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_clinician_notes_created_at ON clinician_notes(created_at DESC);
```

## Data Types

### JSONB Structure for `questionnaire_responses.responses`

```typescript
{
  questions: Array<{
    id: string;
    question: string;
    answer: string;
    type: 'text' | 'scale' | 'multiple_choice' | 'boolean';
  }>;
  summary?: {
    pain_level?: number;
    mobility_issues?: string[];
    daily_activities_affected?: string[];
    [key: string]: any;
  };
}
```

## Constraints

- All tables have `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- Most tables have `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- UUIDs use `gen_random_uuid()` for generation
- Foreign keys use `ON DELETE CASCADE` or `ON DELETE SET NULL` appropriately

## Triggers

- `update_updated_at_column()`: Automatically updates `updated_at` on row modification

## Functions

- `get_patient_summary(patient_id UUID)`: Returns JSON summary of patient data

## Backward Compatibility

**Breaking Changes**: None (initial version)

**Migration Strategy**:

- New columns: Add with DEFAULT or NULL
- Removed columns: Deprecate first, remove in next major version
- Renamed columns: Create new column, migrate data, deprecate old

## Type Generation

Generate TypeScript types:

```bash
npx supabase gen types typescript --local > src/shared/types/database.types.ts
```

## Testing

Seed data available in `supabase/seed.sql` for:

- 3 test clinicians
- 5 test patients
- Sample questionnaire responses
- Sample goals

---

**See**: [data-model.md](../data-model.md) for detailed schema documentation
