# Feature Specification: AI Rehabilitation Platform MVP

**Feature Branch**: `001-ai-rehab-platform-mvp`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "AI rehabilitation platform: the patient completes a questionnaire to collect data on their condition and progress, while the clinician works in a dashboard where, based on this data, AI helps formulate personalized, measurable rehabilitation goals and predict the patient's recovery trajectory."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Patient Completes Assessment Questionnaire (Priority: P1)

A patient opens the platform in a mobile browser and completes a structured questionnaire about their current condition, symptoms, functional limitations, and current recovery stage. The questionnaire is designed for smartphone use, shown in Russian only, and adapts based on the selected rehabilitation category and subtype so the system can collect standardized data for clinician review.

**Why this priority**: This is the foundation of the MVP - without structured patient data collection, the clinician dashboard and AI goal generation cannot function. It is the first step in the core product flow and converts unstructured patient complaints into usable clinical input.

**Independent Test**: Can be fully tested by having a patient complete onboarding, accept the disclaimer, fill in the questionnaire on a mobile device, and verify that all responses are validated and stored correctly.

**Acceptance Scenarios**:

1. **Given** a patient is using the platform for the first time, **When** they begin onboarding, **Then** they must first review and accept the privacy policy and medical disclaimer
2. **Given** a patient is completing the questionnaire on mobile, **When** they select a rehabilitation category, subtype, and recovery stage, **Then** they see only questions relevant to that case
3. **Given** a patient provides invalid or incomplete responses, **When** they try to continue, **Then** they receive clear validation messages and cannot proceed until required fields are completed
4. **Given** a patient completes the questionnaire, **When** they submit their responses, **Then** the data is saved and made available for clinician review

---

### User Story 2 - Clinician Reviews Patient Data Dashboard (Priority: P1)

A clinician logs into a desktop dashboard and reviews patient questionnaire submissions in a structured format. The dashboard displays a list of patients, recent submissions, and patient-specific assessment details including symptoms, functional limitations, and a concise AI-generated summary to help the clinician quickly understand the case.

**Why this priority**: Clinicians need an efficient way to review collected patient data. Without the dashboard, the questionnaire responses have limited value. Together, patient data collection and clinician review form the minimum viable workflow of the product.

**Independent Test**: Can be fully tested by loading the system with completed questionnaire responses and verifying that clinicians can access the dashboard, open a patient profile, and review the latest assessment data.

**Acceptance Scenarios**:

1. **Given** a clinician has assigned patients, **When** they access the dashboard, **Then** they see a list of patients with summary indicators such as latest submission date and review status
2. **Given** a clinician selects a specific patient, **When** they open the patient detail view, **Then** they see the latest questionnaire responses and a structured summary of the patient’s reported limitations
3. **Given** a patient has submitted a new questionnaire, **When** the clinician views the dashboard, **Then** that patient is marked as having new data requiring review
4. **Given** a clinician is reviewing patient data, **When** they add notes, **Then** those notes are saved to the patient record

---

### User Story 3 - AI-Generated Personalized Rehabilitation Goals (Priority: P1)

Based on the patient’s questionnaire data, the AI suggests personalized, measurable rehabilitation goals for the clinician. Goals are SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and tailored to the individual's capabilities and recovery phase. The clinician reviews these suggestions in the dashboard, can edit or reject them, and approves final goals that are then visible to the patient in a simple understandable format.

**Why this priority**: This is the main intelligence layer of the MVP and the core product differentiator. The platform’s value is not only in collecting data, but in helping clinicians turn structured patient input into actionable SMART goals more quickly and consistently.

**Independent Test**: Can be fully tested by feeding completed patient assessments into the AI goal generation flow and verifying that the system produces editable goal suggestions that clinicians can approve.

**Acceptance Scenarios**:

1. **Given** a patient has completed an assessment questionnaire, **When** the clinician requests AI goal suggestions, **Then** the system generates 2-3 personalized measurable rehabilitation goals
2. **Given** the AI has generated goal suggestions, **When** the clinician reviews them, **Then** they can accept, modify, or reject each goal before approval
3. **Given** goals have been approved by the clinician, **When** the patient logs in, **Then** they can view their current rehabilitation goals in Russian
4. **Given** the AI cannot generate a meaningful goal due to insufficient or inconsistent data, **When** the clinician requests suggestions, **Then** the system provides a fallback manual goal creation flow

---

### Edge Cases

- What happens when a patient starts a questionnaire but does not complete it? (Save draft or allow resume later)
- What if the patient enters symptoms that may indicate a red flag? (Show warning and advise consultation with a clinician or urgent care)
- What if the AI cannot generate suitable goals from the available data? (Fallback to manual clinician input)
- What if a clinician disagrees with the AI suggestion? (Clinician can edit or fully replace the goal)
- What happens if the patient accesses the platform from desktop instead of mobile? (Allow access, but optimize the experience primarily for mobile web)

## Clarifications

### Session 2026-04-14

- Q: Patient authentication method? → A: Email + OTP (one-time password) - passwordless authentication using email verification codes
- Q: AI model for goal generation? → A: To be decided during implementation; must have free tier for MVP
- Q: Database for patient data storage? → A: Supabase (PostgreSQL)
- Q: Clinician access control and patient assignment? → A: Admin creates clinician accounts, patients select their clinician during registration
- Q: Questionnaire content source? → A: Start with fixed generic questionnaire, expand categories later

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide role-based access with separate interfaces for patients and clinicians
- **FR-002**: System MUST support Russian language only in MVP
- **FR-003**: System MUST present a privacy notice and medical disclaimer before patient onboarding begins
- **FR-004**: System MUST allow patients to register and authenticate using email + OTP (one-time password sent via email)
- **FR-005**: System MUST allow patients to select their assigned clinician during registration from a list of available clinicians
- **FR-006**: System MUST provide a patient questionnaire flow optimized for mobile browsers
- **FR-006**: System MUST present questionnaire questions tailored to the selected rehabilitation category, subtype, and recovery stage
- **FR-007**: System MUST validate questionnaire responses in real time and prevent submission of incomplete required data
- **FR-008**: System MUST store questionnaire responses with timestamps and associate them with the correct patient record
- **FR-009**: System MUST provide a clinician dashboard optimized for desktop use
- **FR-010**: System MUST display all assigned patients with summary status indicators in the clinician dashboard
- **FR-011**: System MUST allow clinicians to open a detailed patient view with the latest questionnaire data
- **FR-012**: System MUST generate a concise AI summary of the patient’s reported condition and limitations
- **FR-013**: System MUST generate AI-powered rehabilitation goal suggestions based on patient questionnaire data
- **FR-014**: System MUST allow clinicians to review, edit, approve, or reject AI-generated goals
- **FR-015**: System MUST allow clinicians to manually create rehabilitation goals when needed
- **FR-016**: System MUST display approved rehabilitation goals to patients in a simple, understandable format
- **FR-017**: System MUST include basic safety handling for red-flag symptoms by warning the patient and advising medical consultation
- **FR-018**: System MUST maintain an audit trail of clinician actions such as goal approval, edits, and notes

### Key Entities

- **Patient**: Individual receiving rehabilitation support; has profile data, selected rehabilitation context, questionnaire responses, and approved rehabilitation goals
- **Clinician**: Healthcare professional reviewing patient assessments; has assigned patients, notes, and approved goal history
- **Questionnaire**: Structured assessment flow tailored to a rehabilitation category, subtype, and recovery stage; contains questions, validation rules, and submission metadata
- **Questionnaire Response**: Patient’s submitted answers to a questionnaire instance; includes response data, timestamp, and structured summary inputs
- **Rehabilitation Goal**: SMART-style goal assigned to a patient; includes description, measurable target, timeframe, status, and approval history
- **Clinician Note**: Comment or observation added by the clinician while reviewing patient data
- **Safety Alert**: Warning generated when patient input matches predefined red-flag symptoms or unsafe recovery indicators

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Patients can complete the initial questionnaire on a mobile device in under 10 minutes on average
- **SC-002**: Clinicians can review a patient’s submitted assessment and reach the goal-setting step in under 2 minutes
- **SC-003**: The system generates at least one usable draft rehabilitation goal for the majority of completed assessments
- **SC-004**: Clinicians can edit and approve goals without leaving the dashboard workflow
- **SC-005**: At least 80% of patients successfully complete onboarding and submit their assessment without support
- **SC-006**: All patient-facing and clinician-facing MVP interfaces are fully available in Russian
- **SC-007**: The platform clearly communicates that it is not a replacement for a doctor or emergency care

## Assumptions

- Initial MVP will focus on a narrow rehabilitation scope rather than supporting all rehabilitation categories from day one
- MVP will start with a fixed generic questionnaire; category-specific questions will be added in future iterations based on domain expert input
- The patient interface will be web-based and optimized for mobile browsers; native mobile apps are out of scope for v1
- The clinician interface will be web-based and optimized for desktop use
- AI-generated goals are assistive suggestions only and always require clinician review before becoming active
- Recovery trajectory prediction is out of scope for MVP and will be considered in a future phase
- The platform will support Russian language only in the initial release
- Questionnaire logic and AI suggestions will be based on structured rehabilitation logic and domain expert input
- AI model for goal generation will be selected during implementation phase; must support free tier for MVP
- Patient data will be stored in Supabase (PostgreSQL) with built-in authentication and row-level security
- The platform is intended to support preparation for rehabilitation planning, not diagnose conditions or manage emergency situations
