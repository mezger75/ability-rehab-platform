# Feature Specification: AI Rehabilitation Platform MVP

**Feature Branch**: `001-ai-rehab-platform-mvp`  
**Created**: 2026-04-14  
**Updated**: 2026-04-15  
**Status**: In Development  
**Input**: User description: "AI rehabilitation platform: the patient completes a questionnaire to collect data on their condition and progress, while the clinician works in a dashboard where, based on this data, AI helps formulate personalized, measurable rehabilitation goals and predict the patient's recovery trajectory."

## MVP Scope Changes (2026-04-15)

- **Authentication**: Removed from MVP - single-page application with role selection (Patient/Clinician)
- **Questionnaire**: Using WHO Disability Assessment Schedule (WHODAS 2.0) 12-item version
- **Charts**: Using Recharts library for data visualization in clinician dashboard
- **Language**: Russian only
- **Storage**: Mock data in-memory for MVP (no backend/database)
- **AI Integration**: Any free LLM API (Claude, OpenAI, Gemini, etc.) for SMART goal generation

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Patient Completes WHODAS 2.0 Assessment (Priority: P1)

A patient opens the platform and completes the WHO Disability Assessment Schedule (WHODAS 2.0) 12-item questionnaire. The questionnaire assesses functional limitations across 6 domains: Cognition, Mobility, Self-care, Getting along, Life activities, and Participation. Each question uses a 5-point scale (None, Mild, Moderate, Severe, Extreme/Cannot do). The interface is mobile-optimized and presented in Russian.

**Why this priority**: This is the foundation of the MVP - the WHODAS 2.0 provides standardized, validated assessment data that can be used for goal setting and progress tracking. It's a WHO-approved instrument widely used in rehabilitation.

**Independent Test**: Can be fully tested by completing the 12-question assessment on a mobile device and verifying that responses are captured and scored correctly across all 6 domains.

**Acceptance Scenarios**:

1. **Given** a patient selects "I am a patient" on the landing page, **When** they view the questionnaire intro, **Then** they see information about WHODAS 2.0 and the 6 domains being assessed
2. **Given** a patient is completing the questionnaire, **When** they answer each question, **Then** they select from a 5-point scale with clear Russian labels
3. **Given** a patient completes all 12 questions, **When** they submit, **Then** they see their results with domain scores and an overall disability index
4. **Given** a patient views their results, **When** the page displays scores, **Then** each domain shows a score from 1-5 with visual indicators (colors, progress bars)

---

### User Story 2 - Clinician Reviews Patient Data Dashboard (Priority: P1)

A clinician accesses a desktop dashboard showing mock patient data including WHODAS 2.0 scores over time, progress charts, and current rehabilitation goals. The dashboard uses Recharts for data visualization including radar charts (domain profiles), area charts (progress over time), and bar charts (patient comparisons).

**Why this priority**: Clinicians need visual tools to quickly understand patient progress and functional limitations. Charts make it easier to identify trends and areas needing focus.

**Independent Test**: Can be fully tested by accessing the clinician dashboard and verifying that all charts render correctly with mock data and are interactive.

**Acceptance Scenarios**:

1. **Given** a clinician selects "I am a clinician" on the landing page, **When** they access the dashboard, **Then** they see a list of mock patients with summary statistics
2. **Given** a clinician selects a patient, **When** they view the Overview tab, **Then** they see a radar chart showing current vs. baseline WHODAS 2.0 domain scores
3. **Given** a clinician views the Progress tab, **When** charts load, **Then** they see area charts showing score trends over weeks and bar charts comparing patients
4. **Given** a clinician reviews patient data, **When** they switch between tabs (Overview, Progress, Goals, AI Chat), **Then** navigation is smooth and data persists

---

### User Story 3 - AI-Generated SMART Rehabilitation Goals (Priority: P1)

Based on mock patient WHODAS 2.0 data, the clinician uses an AI chat interface to generate personalized SMART rehabilitation goals. The AI (any free LLM API) analyzes the patient's functional limitations and suggests specific, measurable, achievable, relevant, and time-bound goals. Goals are automatically added to the Goals tab where clinicians can track progress.

**Why this priority**: This is the core AI feature that differentiates the platform. It helps clinicians create evidence-based, personalized goals more efficiently.

**Independent Test**: Can be fully tested by using the AI chat to request goal generation and verifying that goals follow SMART format and are added to the patient's goal list.

**Acceptance Scenarios**:

1. **Given** a clinician is viewing a patient's data, **When** they open the AI Chat tab, **Then** they see a chat interface with suggested prompts for goal generation
2. **Given** a clinician requests a SMART goal for a specific domain, **When** the AI responds, **Then** the goal includes all SMART components (Specific, Measurable, Achievable, Relevant, Time-bound, Domain)
3. **Given** the AI generates a goal, **When** the response is parsed, **Then** the goal is automatically added to the Goals tab with a progress tracker
4. **Given** a clinician views the Goals tab, **When** they see active goals, **Then** they can adjust progress sliders and view SMART criteria for each goal

---

### Edge Cases

- What happens when a patient doesn't complete all questions? (Progress bar shows completion, can navigate back)
- What if the AI chat fails to connect? (Show error message: "Connection error with API")
- What if the AI response doesn't follow the expected format? (Goal is not added, clinician sees the raw response)
- What happens on desktop vs mobile? (Patient view is mobile-optimized but works on desktop; clinician view is desktop-optimized)
- What if a patient has very low scores (severe disability)? (System shows appropriate color coding and recommendations)

## Clarifications

### Session 2026-04-14

- Q: Patient authentication method? → A: ~~Email + OTP~~ **REMOVED FROM MVP** - No authentication, role selection only
- Q: AI model for goal generation? → A: **Any free LLM API** (Claude, OpenAI, Gemini, etc.) - configurable via environment variable
- Q: Database for patient data storage? → A: ~~Supabase~~ **REMOVED FROM MVP** - Mock data in-memory only
- Q: Clinician access control and patient assignment? → A: **REMOVED FROM MVP** - Mock patient list with hardcoded data
- Q: Questionnaire content source? → A: **WHODAS 2.0 (12-item version)** - WHO standardized disability assessment

### Session 2026-04-15

- Q: Chart library for clinician dashboard? → A: **Recharts** - React charting library
- Q: MVP data persistence? → A: **In-memory only** - No backend, all data resets on page refresh
- Q: Styling approach? → A: **Inline styles** for MVP speed, no Tailwind/shadcn in current implementation
- Q: Form validation? → A: **Client-side only** - Basic validation, no schema libraries in MVP
- Q: AI provider flexibility? → A: **Any free LLM** - Should work with Claude API, OpenAI, Gemini, or any compatible API

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide role selection with separate interfaces for patients and clinicians (no authentication)
- **FR-002**: System MUST support Russian language only in MVP
- **FR-003**: System MUST implement WHODAS 2.0 12-item questionnaire with 5-point scale responses
- **FR-004**: System MUST assess 6 functional domains: Cognition (2 questions), Mobility (2), Self-care (2), Getting along (2), Life activities (2), Participation (2)
- **FR-005**: System MUST calculate domain scores and overall disability index from questionnaire responses
- **FR-006**: System MUST provide a patient questionnaire flow optimized for mobile browsers
- **FR-007**: System MUST validate questionnaire responses and show progress (question X of 12)
- **FR-008**: System MUST display questionnaire results with domain scores, overall index, and visual indicators
- **FR-009**: System MUST provide a clinician dashboard optimized for desktop use
- **FR-010**: System MUST display mock patient list with summary statistics (name, diagnosis, age, weeks in rehab)
- **FR-011**: System MUST use Recharts library for all data visualizations
- **FR-012**: System MUST display radar chart showing current vs. baseline WHODAS 2.0 domain profiles
- **FR-013**: System MUST display area chart showing progress trends over weeks for multiple domains
- **FR-014**: System MUST display bar charts for patient comparisons and goal progress
- **FR-015**: System MUST integrate with any free LLM API (Claude, OpenAI, Gemini, etc.) for AI-powered SMART goal generation
- **FR-016**: System MUST parse AI responses to extract SMART goal components (Specific, Measurable, Achievable, Relevant, Time-bound, Domain)
- **FR-017**: System MUST allow clinicians to interact with AI via chat interface with suggested prompts
- **FR-018**: System MUST display approved rehabilitation goals with progress sliders (0-100%)
- **FR-019**: System MUST show SMART criteria breakdown for each goal
- **FR-020**: System MUST provide tab navigation in clinician dashboard (Overview, Progress, Goals, AI Chat)
- **FR-021**: System MUST handle AI API failures gracefully with error messages
- **FR-022**: System MUST allow switching between different LLM providers via configuration

### Key Entities

- **Patient**: Mock data including name, age, diagnosis, weeks in rehabilitation, WHODAS 2.0 scores
- **WHODAS 2.0 Question**: 12 questions across 6 domains with 5-point scale (1=None to 5=Extreme/Cannot do)
- **Domain Score**: Calculated average score for each of 6 functional domains
- **Disability Index**: Overall score calculated as average of all domain scores
- **Rehabilitation Goal**: SMART-formatted goal with domain, progress percentage, and detailed criteria
- **Chart Data**: Time-series data for progress tracking (weekly WHODAS scores)
- **AI Message**: Chat message with role (user/assistant) and content for goal generation dialogue

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Patients can complete the WHODAS 2.0 questionnaire (12 questions) in under 5 minutes on a mobile device
- **SC-002**: Questionnaire displays clear progress indicator and allows navigation between questions
- **SC-003**: Results page shows domain scores with color-coded severity indicators (green=mild, yellow=moderate, red=severe)
- **SC-004**: Clinician dashboard loads and displays all charts (radar, area, bar) within 2 seconds
- **SC-005**: Radar chart clearly shows current vs. baseline comparison across all 6 WHODAS domains
- **SC-006**: Progress charts show trends over 6 weeks with smooth area fills and clear legends
- **SC-007**: AI chat generates SMART goals that include all required components (S, M, A, R, T, Domain)
- **SC-008**: Goals are automatically added to Goals tab with editable progress sliders
- **SC-009**: All text in patient and clinician interfaces is in Russian
- **SC-010**: Interface is responsive and works on mobile (patient) and desktop (clinician) screen sizes

## Assumptions

- MVP is a demonstration/prototype without real user authentication or data persistence
- All patient data is mock/hardcoded and resets on page refresh
- WHODAS 2.0 questionnaire uses the standard 12-item version with 5-point scale
- AI goal generation requires LLM API key (provided via environment variable)
- Charts use Recharts library with default responsive behavior
- No backend server - all logic runs client-side in Next.js
- Russian translations are hardcoded strings, not using i18n library
- Goal progress tracking is manual via sliders, not automated based on new assessments
- Recovery trajectory prediction is out of scope for MVP
- The platform is a proof-of-concept for hackathon/demo purposes
- Any free LLM API can be used (Claude, OpenAI, Gemini, etc.) as long as it supports chat completion format
