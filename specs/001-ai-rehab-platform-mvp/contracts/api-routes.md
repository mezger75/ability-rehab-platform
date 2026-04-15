# API Contracts: AI Rehabilitation Platform MVP

**Date**: 2026-04-14  
**Framework**: Next.js 15 App Router API Routes

## Overview

This document defines the API contracts for the AI Rehabilitation Platform MVP. All API routes follow REST conventions and return JSON responses. Authentication is handled via Supabase session cookies.

## Authentication

All API routes (except auth routes) require authentication via Supabase session.

**Authentication Flow**:

1. Client calls `/api/auth/send-otp` with email
2. User receives OTP code via email
3. Client calls `/api/auth/verify-otp` with email + code
4. Server sets session cookie
5. Subsequent requests include session cookie automatically

**Error Response** (401 Unauthorized):

```json
{
  "error": "Unauthorized",
  "message": "Требуется авторизация"
}
```

---

## API Routes

### Authentication

#### POST `/api/auth/send-otp`

Send OTP code to user's email.

**Request Body**:

```json
{
  "email": "patient@example.com"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Код отправлен на email"
}
```

**Error Responses**:

- 400 Bad Request: Invalid email format
- 429 Too Many Requests: Rate limit exceeded (max 3 per hour)
- 500 Internal Server Error: Email service failure

**Rate Limiting**: 3 requests per email per hour

---

#### POST `/api/auth/verify-otp`

Verify OTP code and create session.

**Request Body**:

```json
{
  "email": "patient@example.com",
  "token": "123456"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "patient@example.com",
    "role": "patient"
  }
}
```

**Error Responses**:

- 400 Bad Request: Missing email or token
- 401 Unauthorized: Invalid or expired token
- 500 Internal Server Error: Session creation failure

**Side Effects**: Sets session cookie (`sb-access-token`, `sb-refresh-token`)

---

#### POST `/api/auth/signout`

Sign out current user.

**Request Body**: None (uses session cookie)

**Success Response** (200 OK):

```json
{
  "success": true
}
```

**Side Effects**: Clears session cookies

---

### Patients

#### GET `/api/patients/me`

Get current patient's profile.

**Authentication**: Required (patient role)

**Success Response** (200 OK):

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "clinician_id": "uuid",
  "clinician": {
    "id": "uuid",
    "name": "Иван Иванов",
    "specialization": "Физиотерапевт"
  },
  "onboarding_completed": true,
  "disclaimer_accepted_at": "2026-04-14T10:30:00Z",
  "created_at": "2026-04-14T10:00:00Z"
}
```

**Error Responses**:

- 401 Unauthorized: Not authenticated
- 404 Not Found: Patient profile not found

---

#### PATCH `/api/patients/me`

Update current patient's profile.

**Authentication**: Required (patient role)

**Request Body**:

```json
{
  "clinician_id": "uuid",
  "onboarding_completed": true,
  "disclaimer_accepted_at": "2026-04-14T10:30:00Z"
}
```

**Success Response** (200 OK):

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "clinician_id": "uuid",
  "onboarding_completed": true,
  "disclaimer_accepted_at": "2026-04-14T10:30:00Z",
  "updated_at": "2026-04-14T10:35:00Z"
}
```

**Error Responses**:

- 400 Bad Request: Invalid data
- 401 Unauthorized: Not authenticated
- 404 Not Found: Patient profile not found

---

#### GET `/api/patients/me/goals`

Get current patient's goals.

**Authentication**: Required (patient role)

**Query Parameters**:

- `status` (optional): Filter by status (active, completed, archived)

**Success Response** (200 OK):

```json
{
  "goals": [
    {
      "id": "uuid",
      "title": "Увеличить диапазон движения плеча",
      "description": "Постепенно увеличивать угол подъема руки через упражнения на растяжку",
      "metric": "Угол подъема руки",
      "target_value": "180 градусов",
      "timeframe": "4 недели",
      "status": "active",
      "approved_at": "2026-04-14T11:00:00Z",
      "created_at": "2026-04-14T10:45:00Z"
    }
  ]
}
```

---

### Clinicians

#### GET `/api/clinicians`

Get list of clinicians accepting patients.

**Authentication**: Not required (public endpoint for patient registration)

**Success Response** (200 OK):

```json
{
  "clinicians": [
    {
      "id": "uuid",
      "name": "Иван Иванов",
      "specialization": "Физиотерапевт",
      "is_accepting_patients": true
    },
    {
      "id": "uuid",
      "name": "Мария Петрова",
      "specialization": "Эрготерапевт",
      "is_accepting_patients": true
    }
  ]
}
```

---

#### GET `/api/clinicians/me/patients`

Get list of patients assigned to current clinician.

**Authentication**: Required (clinician role)

**Query Parameters**:

- `has_new_data` (optional): Filter patients with new questionnaire responses

**Success Response** (200 OK):

```json
{
  "patients": [
    {
      "id": "uuid",
      "name": "Анна Смирнова",
      "email": "anna@example.com",
      "latest_questionnaire": {
        "id": "uuid",
        "completed_at": "2026-04-14T09:00:00Z",
        "category": "physical_therapy"
      },
      "active_goals_count": 2,
      "completed_goals_count": 1,
      "has_new_data": true,
      "created_at": "2026-04-10T10:00:00Z"
    }
  ]
}
```

---

#### GET `/api/clinicians/me/patients/[patientId]`

Get detailed information about a specific patient.

**Authentication**: Required (clinician role, must be assigned to patient)

**Success Response** (200 OK):

```json
{
  "patient": {
    "id": "uuid",
    "name": "Анна Смирнова",
    "email": "anna@example.com",
    "created_at": "2026-04-10T10:00:00Z"
  },
  "latest_questionnaire": {
    "id": "uuid",
    "completed_at": "2026-04-14T09:00:00Z",
    "rehabilitation_category": "physical_therapy",
    "responses": {
      "questions": [
        {
          "id": "q1",
          "question": "Опишите вашу текущую боль по шкале от 1 до 10",
          "answer": "7",
          "type": "scale"
        }
      ],
      "summary": {
        "pain_level": 7,
        "mobility_issues": ["shoulder_elevation"]
      }
    }
  },
  "goals": [
    {
      "id": "uuid",
      "title": "Увеличить диапазон движения плеча",
      "status": "active",
      "created_at": "2026-04-14T10:45:00Z"
    }
  ],
  "notes": [
    {
      "id": "uuid",
      "content": "Пациент показывает хороший прогресс",
      "created_at": "2026-04-14T11:00:00Z"
    }
  ]
}
```

**Error Responses**:

- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not assigned to this patient
- 404 Not Found: Patient not found

---

### Questionnaires

#### POST `/api/questionnaires/responses`

Submit a questionnaire response.

**Authentication**: Required (patient role)

**Request Body**:

```json
{
  "rehabilitation_category": "physical_therapy",
  "rehabilitation_subtype": "shoulder_injury",
  "recovery_stage": "early",
  "responses": {
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
}
```

**Success Response** (201 Created):

```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "rehabilitation_category": "physical_therapy",
  "completed_at": "2026-04-14T09:00:00Z",
  "created_at": "2026-04-14T09:00:00Z"
}
```

**Error Responses**:

- 400 Bad Request: Invalid data or missing required fields
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Disclaimer not accepted

**Validation Rules**:

- Patient must have accepted disclaimer before submitting
- `rehabilitation_category` is required
- `responses.questions` must be a non-empty array
- Each question must have `id`, `question`, `answer`, `type`

---

#### GET `/api/questionnaires/responses`

Get questionnaire responses for current user.

**Authentication**: Required (patient or clinician role)

**Query Parameters**:

- `patient_id` (optional, clinician only): Get responses for specific patient

**Success Response** (200 OK):

```json
{
  "responses": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "rehabilitation_category": "physical_therapy",
      "completed_at": "2026-04-14T09:00:00Z",
      "responses": {
        "questions": [...],
        "summary": {...}
      }
    }
  ]
}
```

---

### Goals

#### POST `/api/goals/generate`

Generate AI-powered goal suggestions for a patient.

**Authentication**: Required (clinician role)

**Request Body**:

```json
{
  "patient_id": "uuid",
  "questionnaire_response_id": "uuid"
}
```

**Success Response** (200 OK):

```json
{
  "goals": [
    {
      "title": "Увеличить диапазон движения плеча",
      "description": "Постепенно увеличивать угол подъема руки через упражнения на растяжку и укрепление мышц ротаторной манжеты",
      "metric": "Угол подъема руки",
      "target_value": "180 градусов",
      "timeframe": "4 недели"
    },
    {
      "title": "Снизить уровень боли",
      "description": "Уменьшить болевые ощущения при повседневных движениях через физиотерапию и правильную технику движений",
      "metric": "Уровень боли по шкале",
      "target_value": "3 из 10",
      "timeframe": "3 недели"
    }
  ],
  "ai_metadata": {
    "model": "gemini-1.5-flash",
    "generated_at": "2026-04-14T10:30:00Z",
    "prompt_tokens": 450,
    "completion_tokens": 320
  }
}
```

**Error Responses**:

- 400 Bad Request: Invalid patient_id or questionnaire_response_id
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not assigned to this patient
- 500 Internal Server Error: AI service failure
- 503 Service Unavailable: AI service rate limit exceeded

**Processing Time**: Typically 3-10 seconds

---

#### POST `/api/goals`

Create or approve a goal for a patient.

**Authentication**: Required (clinician role)

**Request Body**:

```json
{
  "patient_id": "uuid",
  "title": "Увеличить диапазон движения плеча",
  "description": "Постепенно увеличивать угол подъема руки",
  "metric": "Угол подъема руки",
  "target_value": "180 градусов",
  "timeframe": "4 недели",
  "status": "active",
  "ai_generated": true,
  "ai_prompt": "Generate goals based on questionnaire..."
}
```

**Success Response** (201 Created):

```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "created_by_clinician_id": "uuid",
  "title": "Увеличить диапазон движения плеча",
  "description": "Постепенно увеличивать угол подъема руки",
  "metric": "Угол подъема руки",
  "target_value": "180 градусов",
  "timeframe": "4 недели",
  "status": "active",
  "ai_generated": true,
  "approved_at": "2026-04-14T10:45:00Z",
  "created_at": "2026-04-14T10:45:00Z"
}
```

**Error Responses**:

- 400 Bad Request: Invalid data or missing required fields
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not assigned to this patient

---

#### PATCH `/api/goals/[goalId]`

Update a goal (edit, approve, complete, archive).

**Authentication**: Required (clinician role)

**Request Body**:

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "completed",
  "completed_at": "2026-04-14T12:00:00Z"
}
```

**Success Response** (200 OK):

```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "title": "Updated title",
  "status": "completed",
  "completed_at": "2026-04-14T12:00:00Z",
  "updated_at": "2026-04-14T12:00:00Z"
}
```

**Error Responses**:

- 400 Bad Request: Invalid status transition
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not assigned to this patient
- 404 Not Found: Goal not found

**Valid Status Transitions**:

- draft → active
- active → completed
- active → archived
- completed → archived

---

### Clinician Notes

#### POST `/api/notes`

Add a note about a patient.

**Authentication**: Required (clinician role)

**Request Body**:

```json
{
  "patient_id": "uuid",
  "content": "Пациент показывает хороший прогресс в упражнениях на растяжку"
}
```

**Success Response** (201 Created):

```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "clinician_id": "uuid",
  "content": "Пациент показывает хороший прогресс в упражнениях на растяжку",
  "created_at": "2026-04-14T11:00:00Z"
}
```

**Error Responses**:

- 400 Bad Request: Missing content or patient_id
- 401 Unauthorized: Not authenticated
- 403 Forbidden: Not assigned to this patient

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "ErrorType",
  "message": "Человекочитаемое сообщение на русском",
  "details": {
    "field": "Дополнительная информация об ошибке"
  }
}
```

**Common Error Types**:

- `ValidationError`: Invalid input data
- `AuthenticationError`: Not authenticated
- `AuthorizationError`: Insufficient permissions
- `NotFoundError`: Resource not found
- `RateLimitError`: Too many requests
- `InternalError`: Server error

---

## Rate Limiting

| Endpoint              | Limit                     | Window     |
| --------------------- | ------------------------- | ---------- |
| `/api/auth/send-otp`  | 3 requests per email      | 1 hour     |
| `/api/goals/generate` | 10 requests per clinician | 1 hour     |
| All other endpoints   | 100 requests per user     | 15 minutes |

**Rate Limit Response** (429 Too Many Requests):

```json
{
  "error": "RateLimitError",
  "message": "Слишком много запросов. Попробуйте позже.",
  "retry_after": 3600
}
```

---

## Webhooks (Future)

Not implemented in MVP. Future consideration for:

- Email notifications when goals are approved
- Reminders for questionnaire completion
- Alerts for concerning patient data

---

## Summary

API contracts complete with:

- ✅ Authentication endpoints (send OTP, verify OTP, signout)
- ✅ Patient endpoints (profile, goals)
- ✅ Clinician endpoints (patient list, patient details)
- ✅ Questionnaire endpoints (submit, view responses)
- ✅ Goal endpoints (generate AI goals, create, update)
- ✅ Clinician notes endpoints
- ✅ Error response format
- ✅ Rate limiting specifications

**Ready for**: Implementation and testing.
