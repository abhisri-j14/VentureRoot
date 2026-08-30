# VentureRoot — Frontend API Integration Map

> **Purpose**: Maps every frontend page/component to its expected API endpoint, request/response fields, and integration status.
> **Last Updated**: 2026-08-29
> **Related**: [MASTER-API-CONTRACT.md](./MASTER-API-CONTRACT.md)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | React Query hook / Axios call EXISTS in code |
| 🔶 | Mock data used, API call NOT implemented |
| ❌ | No code exists for this integration |

---

## Auth Pages

### Login — `src/app/(auth)/login/page.tsx`

| API | Method | Status | Request | Response Fields Consumed |
|-----|--------|:------:|---------|--------------------------|
| `/auth/login` | POST | 🔶 | `{ email, password }` | `token`, `user: { id, name, email, role }` |

- **Current behavior**: Sets `"mock-token-xyz-123"` in Zustand store, no API call
- **Auth store**: `useAuthStore.login(token, user)`
- **Redirect**: Reads `?redirect=` query param, defaults to `/role-selection`
- **Loading state**: `isSubmitting` boolean (1s timeout)
- **Error state**: `globalError` string (not connected to API errors)
- **React Query**: NOT USED (uses raw `setTimeout`)
- **Suggested hook**: `useMutation` wrapping `POST /auth/login`

---

### Register — `src/app/(auth)/register/page.tsx`

| API | Method | Status | Request | Response Fields Consumed |
|-----|--------|:------:|---------|--------------------------|
| `/auth/register` | POST | 🔶 | `{ fullName, email, password, confirmPassword }` | TBD |

- **Current behavior**: `console.log` of form data, no API call
- **Zod schema**: `registerSchema` in `features/auth/schemas/authSchema.ts`
- **Suggested hook**: `useMutation` wrapping `POST /auth/register`

---

### Role Selection — `src/app/(auth)/role-selection/page.tsx`

| API | Method | Status | Notes |
|-----|--------|:------:|-------|
| None | — | — | Pure frontend — switches `useAuthStore.switchRole()` |

- No API needed. Role selection is a frontend UX flow.

---

## Dashboard Pages

### Main Dashboard — `src/app/(dashboard)/dashboard/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| `/feasibility/{business_id}/score` | GET | 🔶 | `{ score }` → FeasibilityRing |
| `/finance/{business_id}` | GET | 🔶 | `totalCapex`, `loanAmount`, `ltvPercentage` |
| `/businesses` | GET | 🔶 | List of user businesses |

**Entrepreneur Dashboard** consumes:
- Feasibility score (78) → `FeasibilityRing`
- CAPEX total (₹8.5L) → `CountUp`
- Loan amount (₹7.65L) → `CountUp`
- Demand trend data → `MiniSparkline`
- CAPEX breakdown → `EditorialDonutChart`
- Evidence badges (population, demand, profitability)
- Map placeholder

**Mentor Dashboard** consumes:
- KPI counts: awaiting (7), reviewed (12), avg score (72), flagged (2)
- Recent submissions table (entrepreneur, business, location, status)
- All currently hardcoded mock data

**Admin Dashboard** consumes:
- Stats: total users (1247), active businesses (382), AI queries (89), flagged (3), pending reviews (14), schemes (18)
- All currently hardcoded mock data

**Suggested hooks**:
- `useQuery(['dashboard', role])` wrapping role-specific dashboard endpoint
- Or individual hooks: `useFeasibilityScore()`, `useFinanceSummary()`, `useBusinessList()`

---

### Profile — `src/app/(dashboard)/profile/page.tsx`

| API | Method | Status | Request/Response |
|-----|--------|:------:|------------------|
| `GET /users/me/profile` | GET | 🔶 | Returns profile data |
| `PUT /users/me/profile` | PUT | 🔶 | Sends updated profile |

- **Component**: `ProfileView` in `features/profile/components/ProfileView.tsx`
- **Fields consumed**: fullName, email, phone, location (state/district/block/village), financial (availableCapital, income), experience (businessExperience, skills, education)
- **Current behavior**: `MOCK_PROFILE` object, `console.log` on save
- **Suggested hooks**: `useQuery(['profile'])`, `useMutation` for update

---

### Onboarding — `src/app/onboarding/page.tsx`

| API | Method | Status | Request/Response |
|-----|--------|:------:|------------------|
| `PUT /users/me/profile` | PUT | 🔶 | Sends onboarding data |
| `GET /locations/search?q=` | GET | 🔶 | Location autocomplete |

- **Component**: `OnboardingFlow` in `features/profile/components/OnboardingFlow.tsx`
- **Fields sent**: Same as profile schema
- **Zod schema**: `profileSchema` in `features/profile/schemas/profileSchema.ts`

---

## Business Pages

### Create Business — `src/app/(dashboard)/business/create/page.tsx`

| API | Method | Status | Request |
|-----|--------|:------:|---------|
| `POST /businesses` | POST | 🔶 | `{ categoryId, state, district, block, village, availableMargin, existingResources, expectedRevenue }` |

- **Component**: `BusinessWizard` in `features/business/components/BusinessWizard.tsx`
- **Current behavior**: `console.log` then `router.push("/business/123")`
- **Zod schema**: `businessFormSchema` in `features/business/schemas/businessSchema.ts`
- **Suggested hook**: `useMutation` wrapping `POST /businesses`

---

### Business Detail — `src/app/(dashboard)/business/[id]/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| `GET /businesses/{id}` | GET | 🔶 | All `BusinessDetails` fields |

- **Component**: `BusinessDetailsView` in `features/business/components/BusinessDetailsView.tsx`
- **Fields consumed**: name, category, subcategory, description, status, location, capital, operations, resources
- **Charts**: Revenue trends (`EditorialAreaChart`), Cost breakdown (`EditorialDonutChart`)
- **Current behavior**: `MOCK_BUSINESS_DETAILS` object
- **Review controls**: `ReviewControls` visible for `MENTOR_ADVISOR` role

---

### Business Comparison — `src/app/(dashboard)/business/compare/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| `GET /businesses` | GET | 🔶 | Multiple businesses for comparison |
| `GET /feasibility/*/score` | GET | 🔶 | Scores per business |

- **Component**: `BusinessComparison` in `features/business/components/BusinessComparison.tsx`
- **Data**: Radar chart comparing 6 metrics across 3 businesses
- **Current behavior**: Entirely hardcoded mock data

---

### Feasibility — `src/app/(dashboard)/business/[id]/feasibility/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| `POST /feasibility/{id}/generate` | POST | ✅ hook | Triggers generation |
| `GET /feasibility/{id}` | GET | ✅ hook | Full feasibility data |
| `GET /feasibility/{id}/market` | GET | ✅ hook | `MarketAnalysis` |
| `GET /feasibility/{id}/opportunities` | GET | ✅ hook | `OpportunityAnalysis` |
| `GET /feasibility/{id}/swot` | GET | ✅ hook | `SWOTAnalysis` |
| `GET /feasibility/{id}/threats` | GET | ✅ hook | `RiskItem[]` |
| `GET /feasibility/{id}/competitors` | GET | ✅ hook | `CompetitionAnalysis` |
| `GET /feasibility/{id}/pricing` | GET | ✅ hook | `PricingAnalysis` |
| `GET /feasibility/{id}/score` | GET | ✅ hook | Score data |

- **React Query hooks**: ALL exist in `features/feasibility/api/feasibilityApi.ts`
- **Type definitions**: ALL exist in `features/feasibility/types/index.ts`
- **Sub-components**: `MarketCard`, `OpportunityCard`, `CompetitionCard`, `SWOTCard`, `RiskCard`, `PricingCard`
- **Location map**: `LocationIntelligenceMap` component
- **Current behavior**: Page uses `MOCK_*` data constants, does NOT call hooks

---

### Finance — `src/app/(dashboard)/business/[id]/finance/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| `POST /finance/simulate` | POST | 🔶 | Best/expected/worst case scenarios |
| `POST /finance/repayment` | POST | 🔶 | Quarterly breakdown |
| `GET /finance/{business_id}` | GET | 🔶 | Saved financial plan |

- **Components**: `WhatIfSimulator`, `RepaymentChart`
- **Simulator inputs**: loanAmount, interestRate, tenure, moratorium, revenue, expenses
- **Current behavior**: `console.log` + `alert()`, no API call

---

### Roadmap — `src/app/(dashboard)/business/[id]/roadmap/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| `GET /businesses/{id}/roadmap` (inferred) | GET | 🔶 | `Roadmap` with `ActionItem[]` |

- **Component**: `RoadmapTimeline`
- **Fields consumed**: actions (title, description, whatToDo, expectedOutcome, timeframe, priority, category, status, confidence, evidence)
- **Current behavior**: `MOCK_ACTION_ROADMAP` constant

---

## AI / Advisor

### AI Advisor — `src/app/(dashboard)/advisor/page.tsx`

| API | Method | Status | Request | Response Fields Consumed |
|-----|--------|:------:|---------|--------------------------|
| `POST /ai/advisor/chat` | POST | ✅ hook | `{ message, businessId?, context? }` | `{ role, content, evidence? }` |

- **Component**: `ChatWindow` in `features/advisor/components/ChatWindow.tsx`
- **React Query hook**: `useChatMutation()` in `features/advisor/api/advisorApi.ts`
- **Evidence rendering**: `EvidenceBadge` with `{ type, label, confidence }`
- **Voice input**: `VoiceRecorder` component (mock, no real speech API)
- **Current behavior**: Mock `setTimeout` response, does NOT call hook

---

## Reports

### Reports List — `src/app/(dashboard)/reports/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| `GET /reports` (inferred) | GET | 🔶 | `Report[]` |
| `POST /reports/generate` | POST | 🔶 | Triggers report generation |

- **Component**: `ReportGenerator` for generation stages
- **Fields consumed**: id, title, businessName, location, status, createdAt, type
- **Current behavior**: `MOCK_REPORTS` array

---

### Report Detail — `src/app/(dashboard)/reports/[id]/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| `GET /reports/{id}` | GET | 🔶 | Full report with feasibility data |
| `GET /reports/{id}/download` | GET | ❌ | Binary file download |

---

## Admin

### Admin Panel — `src/app/(dashboard)/admin/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| Admin CRUD endpoints | Various | ❌ | Categories, Geography, KB, Schemes, AI Oversight |

- **Components**: `CategoryManagement`, `GeographyManagement`, `KnowledgeBaseManagement`, `SchemeManagement`, `AIOversightDashboard`
- **Current behavior**: All show placeholder text

---

## Reviews

### Reviews — `src/app/(dashboard)/reviews/page.tsx`

| API | Method | Status | Response Fields Consumed |
|-----|--------|:------:|--------------------------|
| Review endpoints (TBD) | Various | ❌ | Submissions for mentor review |

- **Component**: `ReviewControls` (approve/reject/modify + comment)
- **Current behavior**: Buttons and textarea with no API calls

---

## Location (Shared)

### Location Intelligence — used across Feasibility and Business pages

| API | Method | Status | Hook |
|-----|--------|:------:|------|
| `GET /locations/{id}` | GET | ✅ | `useLocationDetails(id)` |
| `GET /locations/{id}/statistics` | GET | ✅ | `useLocationStatistics(id)` |
| `GET /locations/{id}/markets` | GET | ✅ | `useLocationMarkets(id)` |
| `GET /locations/{id}/competitors` | GET | ✅ | `useLocationCompetitors(id)` |

- **All hooks** in `features/location/api/locationApi.ts`
- **Component**: `LocationIntelligenceMap` (Leaflet map)
- **Current behavior**: Static mock map data

---

## Summary: Integration Readiness

| Category | Hooks Exist | Mock Data | Ready for Backend |
|----------|:-----------:|:---------:|:-----------------:|
| Feasibility (9 endpoints) | ✅ All 9 | ✅ | ✅ Needs schema confirmation only |
| Location (4 endpoints) | ✅ All 4 | 🔶 | ✅ Needs schema confirmation only |
| AI Chat (1 endpoint) | ✅ 1 | 🔶 | ✅ Needs schema confirmation only |
| Auth (5 endpoints) | ❌ None | 🔶 | 🔶 Needs hooks + schema |
| Business (6 endpoints) | ❌ None | ✅ | 🔶 Needs hooks + schema |
| Finance (6 endpoints) | ❌ None | 🔶 | 🔶 Needs hooks + schema |
| Reports (4 endpoints) | ❌ None | ✅ | 🔶 Needs hooks + schema |
| Schemes (4 endpoints) | ❌ None | ❌ | 🔶 Needs everything |
| Admin (TBD) | ❌ None | ❌ | ❌ Needs endpoint definition |
| Reviews (TBD) | ❌ None | ❌ | ❌ Needs endpoint definition |
