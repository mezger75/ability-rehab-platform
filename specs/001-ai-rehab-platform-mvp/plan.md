# Implementation Plan: AI Rehabilitation Platform MVP

**Branch**: `001-ai-rehab-platform-mvp` | **Date**: 2026-04-14 | **Updated**: 2026-04-15 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-ai-rehab-platform-mvp/spec.md`

## Summary

Build an AI-powered rehabilitation platform MVP where patients complete the WHODAS 2.0 (12-item) questionnaire on mobile, while clinicians review progress data in a desktop dashboard with Recharts visualizations and use AI assistance to formulate personalized SMART rehabilitation goals. The MVP is a single-page Next.js application with no authentication, no backend, and mock data only.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15 (App Router)  
**Primary Dependencies**:

- Next.js 15 (React framework with App Router)
- Recharts (charting library for data visualization)
- React (UI library)

**Storage**: In-memory mock data only (no database, no persistence)  
**Authentication**: None (role selection only: Patient or Clinician)  
**AI Integration**: Any free LLM API (Claude, OpenAI, Gemini, etc.) for SMART goal generation  
**Testing**: Manual testing only for MVP  
**Target Platform**: Web (mobile-first for patients, desktop-optimized for clinicians)  
**Project Type**: Single-page application (client-side only)

**Performance Goals**:

- Patient questionnaire loads instantly (no API calls)
- Clinician dashboard renders all charts in <1s
- AI goal generation completes in <10s (depends on API)

**Constraints**:

- No backend server or database
- No user authentication or sessions
- All data is mock/hardcoded
- Russian language only
- Must work without internet (except AI features)

**Scale/Scope**:

- MVP: Demo/prototype only
- 3 mock patients with hardcoded data
- 12-question WHODAS 2.0 questionnaire
- 3 initial SMART goals per patient

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: Simplified MVP - no constitution needed for prototype:

- ✅ Single-page React application (Next.js App Router)
- ✅ Type safety (TypeScript)
- ✅ Component-based architecture
- ✅ Inline styles for rapid prototyping
- ✅ No backend complexity
- ✅ No authentication complexity

## Project Structure

### Current Implementation

```text
app/
├── page.tsx                  # Main application file (all code in one file)
├── globals.css               # Global styles
└── layout.tsx                # Root layout

public/                       # Static assets

specs/
└── 001-ai-rehab-platform-mvp/
    ├── spec.md               # Feature specification (updated)
    └── plan.md               # This file (updated)
```

**Structure Decision**: For MVP speed, all application logic is in a single `app/page.tsx` file (~800 lines). This includes:

- Landing page with role selection
- Patient questionnaire (WHODAS 2.0)
- Clinician dashboard with tabs
- All mock data and constants
- Inline styles for all components

**Future Refactoring**: When moving beyond MVP, consider:

- Splitting into separate components
- Adding proper state management
- Implementing backend API
- Adding authentication
- Using CSS modules or Tailwind

## Complexity Tracking

> Simplified MVP - no complex architecture decisions needed

| Decision          | Rationale                                                              | Alternatives Considered                                                 |
| ----------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Single-file app   | Fastest way to build MVP; all code in one place for easy understanding | Feature-Sliced Design (too complex for prototype)                       |
| Inline styles     | No build configuration needed; fastest styling approach                | Tailwind CSS (requires setup), CSS modules (more files)                 |
| Recharts          | Requested by user; excellent React charting library with good defaults | Chart.js (not React-native), D3 (too low-level)                         |
| Mock data         | No backend complexity; instant load times; perfect for demo            | Supabase (overkill for MVP), localStorage (unnecessary)                 |
| No authentication | Removes entire auth flow; faster to build and demo                     | Email+OTP (too complex for MVP), Magic links (requires backend)         |
| WHODAS 2.0        | Standardized WHO assessment; clinically validated; well-documented     | Custom questionnaire (not validated), other scales (less comprehensive) |
| Any free LLM API  | Flexibility to use Claude, OpenAI, Gemini, or other free APIs          | Locked to single provider (less flexible)                               |

## Implementation Status (2026-04-15)

### ✅ Completed

- Landing page with role selection (Patient/Clinician)
- WHODAS 2.0 questionnaire (12 questions, 6 domains, 5-point scale)
- Patient results page with domain scores and visual indicators
- Clinician dashboard with patient list and tabs
- Recharts integration (radar, area, bar charts)
- Mock patient data (3 patients with progress over 6 weeks)
- SMART goals display with progress sliders
- AI chat interface for goal generation
- TypeScript types for all components
- Mobile-responsive patient interface
- Desktop-optimized clinician dashboard

### 🚧 In Progress

- LLM API integration (needs API key configuration)
- AI response parsing for SMART goal extraction
- Support for multiple LLM providers (Claude, OpenAI, Gemini)

### 📋 Future Enhancements (Post-MVP)

- Backend API for data persistence
- User authentication
- Real patient data storage
- Multiple questionnaire types
- Automated progress tracking
- Recovery trajectory prediction
- Multi-language support
- Component refactoring and code splitting

## WHODAS 2.0 Implementation Details

### Questionnaire Structure

The WHO Disability Assessment Schedule (WHODAS 2.0) 12-item version assesses functional limitations across 6 domains:

1. **Cognition** (Understanding and communicating)
   - D1.1: Concentrating on doing something for ten minutes
   - D1.2: Remembering to do important things

2. **Mobility** (Getting around)
   - D2.1: Standing for long periods such as 30 minutes
   - D2.2: Standing up from sitting down / Walking a long distance

3. **Self-care** (Hygiene, dressing, eating and staying alone)
   - D3.1: Washing your whole body
   - D3.2: Getting dressed

4. **Getting along** (Interacting with other people)
   - D4.1: Dealing with people you do not know
   - D4.2: Maintaining a friendship

5. **Life activities** (Domestic responsibilities, leisure, work and school)
   - D5.1: Taking care of your household responsibilities
   - D5.2: Doing your most important work/school tasks

6. **Participation** (Joining in community activities)
   - D6.1: How much of a problem did you have joining in community activities
   - D6.2: How much have you been emotionally affected by your health problems

### Scoring

- Each question uses a 5-point scale: 1 (None), 2 (Mild), 3 (Moderate), 4 (Severe), 5 (Extreme/Cannot do)
- Domain scores: Average of 2 questions per domain
- Overall disability index: Average of all 6 domain scores
- Lower scores indicate better functioning

### Russian Translation

All questions and scale labels are presented in Russian in the implementation.

## AI Integration Architecture

### Supported LLM Providers

The system supports any LLM API that follows a chat completion format:

- **Claude API** (Anthropic)
- **OpenAI API** (GPT-3.5/GPT-4)
- **Gemini API** (Google)
- Any compatible API with similar request/response format

### Configuration

API provider is configured via environment variable:

```
NEXT_PUBLIC_ANTHROPIC_API_KEY=your-api-key-here
```

### SMART Goal Format

The AI is prompted to generate goals in this structured format:

```
SMART_GOAL: [Goal statement]
SPECIFIC: [Specific details]
MEASURABLE: [Measurable criteria]
ACHIEVABLE: [Achievability assessment]
RELEVANT: [Relevance to patient]
TIME_BOUND: [Time frame]
DOMAIN: [One of: Мобильность / Когниция / Самообслуживание / Взаимодействие / Жизнедеятельность / Участие]
```

### Goal Parsing

The system parses AI responses to extract SMART components and automatically creates goal objects that are added to the Goals tab.

## Recharts Implementation

### Chart Types Used

1. **Radar Chart** (Overview tab)
   - Shows current vs. baseline WHODAS 2.0 domain scores
   - 6 axes (one per domain)
   - Two data series: start and current

2. **Area Chart** (Progress tab)
   - Shows score trends over 6 weeks
   - Multiple domains overlaid
   - Color-coded by domain

3. **Bar Chart** (Progress tab & Goals tab)
   - Patient comparison (horizontal bars)
   - Goal progress tracking (horizontal bars with percentages)

### Chart Configuration

- Responsive containers adapt to screen size
- Tooltips show detailed values on hover
- Legends identify data series
- Color scheme matches domain categories

## Next Steps

1. **Complete AI Integration**
   - Test with multiple LLM providers
   - Improve goal parsing robustness
   - Add fallback for API failures

2. **Polish UI/UX**
   - Improve mobile responsiveness
   - Add loading states
   - Enhance error messages

3. **Testing**
   - Manual testing on different devices
   - Test with different LLM providers
   - Verify WHODAS 2.0 scoring accuracy

4. **Documentation**
   - Add setup instructions (README)
   - Document API key configuration
   - Create user guide for demo
