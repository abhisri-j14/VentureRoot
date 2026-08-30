# VentureRoot — Frontend-Backend Handoff

## 1 — PROJECT SUMMARY
- **Project Name:** VentureRoot
- **Purpose:** A local business planning platform tailored for non-metro Indian markets.
- **Target Users:** First-time entrepreneurs, small business owners, local investors.
- **Major Capabilities:** AI business advisor, feasibility scoring, financial simulation, location intelligence.
- **Frontend Architecture:** Next.js 16 (App Router), React, Tailwind CSS, Framer Motion, Zustand.
- **API Architecture:** Centralized Axios client (`src/lib/api/client.ts`) communicating over REST (`/api/v1`).

## 2 — FRONTEND ROUTE MAP
**AUTH**
- `/login` (Login flow)
- `/register` (Registration flow)
- `/role-selection` (User role onboarding)
- `/onboarding` (Profile completion)

**DASHBOARD**
- `/dashboard` (Main user dashboard)
- `/profile` (User profile management)
- `/advisor` (AI Advisor Chat UI)
- `/reports` (List of saved reports)
- `/reports/[id]` (Detailed view of a specific report)
- `/admin` (Admin dashboard layout)
- `/reviews` (User reviews/ratings view)

**BUSINESS**
- `/business/create` (Business creation wizard)
- `/business/compare` (Compare multiple business ideas)
- `/business/[id]` (Specific business dashboard)
- `/business/[id]/feasibility` (Feasibility analysis and metrics)
- `/business/[id]/finance` (Financial simulator and repayment charts)
- `/business/[id]/roadmap` (Step-by-step business roadmap)

**MARKETING**
- `/` (Landing page)

## 3 — FEATURE MAP
**AUTH**
- Login/Register forms with Zod validation.
- Zustand `useAuthStore` ready to consume JWTs.

**BUSINESS**
- Multi-step business creation wizard.
- Business summary dashboards.

**FEASIBILITY**
- Feasibility scoring view with SWOT and Market insights.

**FINANCE**
- "What-If" interactive simulator (Loan, Interest, Revenue).
- Repayment schedule charting.

**ADVISOR**
- AI Chat interface for business guidance.

**REPORTS**
- View generated feasibility/finance reports.
- PDF Download trigger flow.

## 4 — AXIOS / API INFRASTRUCTURE
- **Axios Instance:** Centralized in `src/lib/api/client.ts`.
- **Base URL:** Driven by `process.env.NEXT_PUBLIC_API_URL`, defaults to `http://localhost:8000/api/v1`.
- **Timeout:** 10,000ms.
- **JWT Injection:** Implemented via request interceptor (reads from Zustand store).
- **JWT Origin Protection:** IMPLEMENTED (Checks for relative or base URLs before attaching `Authorization` header).
- **Error Normalization:** IMPLEMENTED (Transforms Axios errors into `ApiError` format `message`, `code`, `details`).
- **401 Handling:** IMPLEMENTED (Auto-logout on 401).
- **Refresh Token Mechanism:** WAITING FOR BACKEND CONFIRMATION.
- **withCredentials:** NOT IMPLEMENTED (Currently using Bearer tokens, awaiting backend preference).

## 5 — ALL API MODULES

| Module | Function | HTTP | Endpoint | Request Payload | Response Schema | Status |
|---|---|---|---|---|---|---|
| authApi | register | POST | /auth/register | RegisterFormValues | Unknown | REQUEST CONNECTED |
| authApi | login | POST | /auth/login | LoginFormValues | Unknown | REQUEST CONNECTED |
| authApi | refresh | POST | /auth/refresh | None | Unknown | DEFINED |
| authApi | logout | POST | /auth/logout | None | None | REQUEST CONNECTED |
| authApi | me | GET | /auth/me | None | Unknown | DEFINED |
| profileApi | getProfile | GET | /users/me/profile | None | Unknown | DEFINED |
| profileApi | updateProfile | PUT | /users/me/profile | ProfileData | Unknown | REQUEST CONNECTED |
| locationApi | getStates | GET | /locations/states | None | Unknown | DEFINED |
| locationApi | getDistricts | GET | /locations/districts | None (Query `state_id`) | Unknown | DEFINED |
| locationApi | getBlocks | GET | /locations/blocks | None (Query `district_id`) | Unknown | DEFINED |
| locationApi | getVillages | GET | /locations/villages | None (Query `block_id`) | Unknown | DEFINED |
| locationApi | search | GET | /locations/search | None (Query `q`) | Unknown | DEFINED |
| locationApi | getDetails | GET | /locations/{id} | None | Unknown | DEFINED |
| locationApi | getStatistics | GET | /locations/{id}/statistics | None | Unknown | DEFINED |
| locationApi | getMarkets | GET | /locations/{id}/markets | None | Unknown | DEFINED |
| locationApi | getCompetitors | GET | /locations/{id}/competitors | None | Unknown | DEFINED |
| businessApi | list | GET | /businesses | None | Unknown | DEFINED |
| businessApi | get | GET | /businesses/{id} | None | Unknown | DEFINED |
| businessApi | create | POST | /businesses | BusinessFormValues | Unknown | REQUEST CONNECTED |
| businessApi | update | PUT | /businesses/{id} | Partial<BusinessFormValues> | Unknown | DEFINED |
| businessApi | delete | DELETE | /businesses/{id} | None | None | DEFINED |
| feasibilityApi| getFeasibility| GET | /feasibility/{businessId} | None | Unknown | REQUEST CONNECTED |
| feasibilityApi| getMarket | GET | /feasibility/{id}/market | None | Unknown | DEFINED |
| feasibilityApi| getOpportunities| GET | /feasibility/{id}/opportunities | None | Unknown | DEFINED |
| feasibilityApi| getSwot | GET | /feasibility/{id}/swot | None | Unknown | DEFINED |
| feasibilityApi| getThreats | GET | /feasibility/{id}/threats | None | Unknown | DEFINED |
| feasibilityApi| getCompetitors| GET | /feasibility/{id}/competitors | None | Unknown | DEFINED |
| feasibilityApi| getPricing | GET | /feasibility/{id}/pricing | None | Unknown | DEFINED |
| feasibilityApi| getScore | GET | /feasibility/{id}/score | None | Unknown | DEFINED |
| feasibilityApi| generateFeasibility | POST | /feasibility/{id}/generate | None | Unknown | DEFINED |
| financeApi | simulate | POST | /finance/simulate | SimulationInput | Unknown | REQUEST CONNECTED |
| financeApi | getPlan | GET | /finance/{businessId} | None | Unknown | DEFINED |
| financeApi | getSchemeOptions| POST | /finance/structure | SchemeMatchInput | Unknown | DEFINED |
| financeApi | getRepaymentSchedule| POST | /finance/repayment | { businessId } | Unknown | DEFINED |
| advisorApi | chat | POST | /ai/advisor/chat | { message, businessId?, context? } | Unknown | REQUEST CONNECTED |
| advisorApi | analyzeBusiness | POST | /ai/business/analyze | { businessId } | Unknown | DEFINED |
| advisorApi | getRecommendations| POST | /ai/business/recommend | { businessId } | Unknown | DEFINED |
| reportApi | list | GET | /reports | None | Unknown | REQUEST CONNECTED |
| reportApi | get | GET | /reports/{id} | None | Unknown | REQUEST CONNECTED |
| reportApi | generate | POST | /reports/generate | { businessId } | Unknown | DEFINED |
| reportApi | getStatus | GET | /reports/{id}/status | None | Unknown | DEFINED |
| reportApi | download | GET | /reports/{id}/download | None | Blob | REQUEST CONNECTED |

## 6 — API STATUS CLASSIFICATION
- 🟢 **REQUEST CONNECTED:** API is hooked up to a UI button or page mount and physically sends an Axios request.
- 🟡 **DEFINED BUT RESPONSE CONTRACT PENDING:** API is written in Axios but currently unattached to UI because the required response is unknown.
- 🟠 **INFERRED / BACKEND CONFIRMATION REQUIRED:** Route parameters/payloads are guessed based on standard conventions but need validation.
- ⚪ **NOT USED BY ACTIVE UI:** API function is written but not yet leveraged in active frontend components.
- 🔴 **BLOCKED:** Cannot proceed without backend intervention (e.g. strict Response schema).

## 7 — CONFIRMED ENDPOINTS
None. All endpoints currently implemented in the frontend are inferred or awaiting strict schema sign-off from backend engineers. 

## 8 — ENDPOINTS CURRENTLY USED BY UI
**AUTH**
- `POST /auth/login` (Login form)
- `POST /auth/register` (Register form)

**PROFILE**
- `PUT /users/me/profile` (Onboarding flow)

**BUSINESS**
- `POST /businesses` (Create Business Wizard)

**ADVISOR**
- `POST /ai/advisor/chat` (Chat Window)

**FINANCE**
- `POST /finance/simulate` (What-If Simulator)

**REPORTS**
- `GET /reports` (Reports page list)
- `GET /reports/{id}` (Report Detail page)
- `GET /reports/{id}/download` (Report Detail download button)

**FEASIBILITY**
- `GET /feasibility/{businessId}` (Feasibility Dashboard)

*Status for all:* "Request connected; response consumption pending."

## 9 — MOCK DATA / MOCK BEHAVIOR
**A. UI DISPLAY MOCKS (Visual/Data Placeholders)**
- `src/features/reports/components/ReportDetailView.tsx`: `MOCK_REPORTS` (Provides the list & detail object properties since `ReportDetailResponse` is unknown).
- `src/features/feasibility/components/FeasibilityView.tsx`: `MOCK_FEASIBILITY_DATA` (Feeds the charts, SWOT, and market analysis visuals).
- `src/features/advisor/components/ChatWindow.tsx`: `mockResponse` bubble (Displays a placeholder AI response in the UI).
- `src/features/finance/components/WhatIfSimulator.tsx`: `mockRepaymentData` (Provides points for the Recharts graph).

**B. TEMPORARY API/NETWORK BEHAVIOR (Fallback Logic)**
- Form submissions (`Login`, `Register`, `BusinessWizard`, `Onboarding`, `Chat`, `Finance`) catch Network Errors when the backend is offline, print a `console.warn`, and execute `.push(mockRoute)` to keep the application navigating properly in the development environment.

**C. BACKEND-DEPENDENT PLACEHOLDERS**
- Login sets a dummy `mock_jwt_token_123` because the actual token field inside `LoginResponse` is unknown. 
- Business creation routes to `/business/123` because the backend-generated UUID is unknown.

## 10 — REAL FRONTEND API CONNECTIONS
- **Login UI (`login/page.tsx`)** → `authApi.login()` → `POST /auth/login` (Request connected)
- **Register UI (`register/page.tsx`)** → `authApi.register()` → `POST /auth/register` (Request connected)
- **Onboarding UI (`OnboardingFlow.tsx`)** → `profileApi.updateProfile()` → `PUT /users/me/profile` (Request connected)
- **Business UI (`BusinessWizard.tsx`)** → `businessApi.create()` → `POST /businesses` (Request connected)
- **Advisor UI (`ChatWindow.tsx`)** → `advisorApi.chat()` → `POST /ai/advisor/chat` (Request connected)
- **Finance UI (`WhatIfSimulator.tsx`)** → `financeApi.simulate()` → `POST /finance/simulate` (Request connected)
- **Reports List UI (`reports/page.tsx`)** → `reportApi.list()` → `GET /reports` (Request connected)
- **Report Detail UI (`ReportDetailView.tsx`)** → `reportApi.get()` → `GET /reports/{id}` (Request connected)
- **Report Download UI (`ReportDetailView.tsx`)** → `reportApi.download()` → `GET /reports/{id}/download` (Request connected)
- **Feasibility UI (`feasibility/page.tsx`)** → `feasibilityApi.getFeasibility()` → `GET /feasibility/{businessId}` (Request connected)

## 11 — RESPONSE CONTRACT BLOCKERS
**AUTH**
- Login response: Frontend needs to know the exact field name containing the JWT (e.g. `.token`, `.access_token`).

**BUSINESS**
- Business creation response: Frontend needs the generated ID to route the user.
- Business list/detail response: Frontend needs the exact shape of the business object.

**FEASIBILITY**
- Aggregated feasibility response: Frontend needs an object matching the metrics/SWOT/market arrays currently represented in `MOCK_FEASIBILITY_DATA`.

**FINANCE**
- Simulation response: Frontend needs the projected repayment schedule array and total liability metrics.

**ADVISOR**
- Chat response: Frontend needs the structure of the AI message (and evidence format if supported).

**REPORTS**
- Report list response: Frontend needs the array of report objects (id, title, date, status).
- Report detail response: Frontend needs the structure of the report metadata.

## 12 — BACKEND CONFIRMATION CHECKLIST
**CRITICAL**
- [ ] Provide final `LoginResponse` and `RegisterResponse` schemas.
- [ ] Confirm the unified `ApiError` schema shape (does backend return `{ detail: string, error_code: string }`?)
- [ ] Provide standard response shapes for Business (GET, POST).
- [ ] Provide aggregated `Feasibility` response schema.

**HIGH**
- [ ] Confirm standard casing convention for JSON (snake_case vs camelCase).
- [ ] Confirm if Refresh tokens are managed via `HttpOnly` Cookies or Response Body payload.
- [ ] Provide `Finance Simulator` output schema.

**MEDIUM**
- [ ] Clarify if Reports are generated synchronously or require async polling / jobs.
- [ ] Clarify if Advisor Chat uses Server-Sent Events (Streaming) or standard REST.

## 13 — BACKEND WORK REQUIRED
### Authentication
- Finalize and document the login/registration JSON response contracts.
- Expose the `/auth/me` endpoint.

### Business
- Finalize Business models and document GET/POST output shapes.

### Feasibility
- Build the endpoint that returns aggregated feasibility metrics.

### Finance
- Finalize calculation engine and output shape for the simulator.

### Advisor
- Determine and document the chat interface (REST vs Stream).

## 14 — FRONTEND/BACKEND CONTRACT GAPS
| Feature | Frontend Ready | Backend Information Needed | Impact |
|---|---|---|---|
| Auth | Yes | LoginResponse schema | Cannot extract real JWT |
| Business | Request ready | Create response schema | Cannot navigate to real Business ID |
| Feasibility | Request ready | Aggregated response schema | Cannot populate real metrics/charts |
| Advisor | Request ready | Response schema (Stream vs REST) | Cannot display real AI text |
| Finance | Request ready | Output schema | Cannot populate real charts |
| Reports | Request ready | Report metadata schema | Cannot display real report list |

## 15 — WHAT FRONTEND DOES NOT NEED FROM BACKEND
The frontend team does **NOT** require details on:
- Underlying Database schemas or ORM mappings.
- Internal ML model architecture, LLM configurations, or vector stores.
- Microservice internal communication patterns.
The frontend strictly relies on **Request payloads, HTTP Status codes, Response structures, and Error schemas**.

## 16 — CURRENT INTEGRATION STATUS
- **Auth (Login/Reg):** 🟡 WAITING FOR BACKEND CONTRACT (Connected, ignoring unknown response)
- **Business Create:** 🟡 WAITING FOR BACKEND CONTRACT (Connected, using mock route ID fallback)
- **Feasibility:** 🟠 TEMPORARY MOCK (Connected on mount, UI reads from mock data)
- **Reports:** 🟠 TEMPORARY MOCK (Connected on mount, UI reads from mock data)
- **Finance Simulator:** 🟡 WAITING FOR BACKEND CONTRACT (Connected, ignoring unknown response)
- **Advisor Chat:** 🟡 WAITING FOR BACKEND CONTRACT (Connected, injecting mock fallback response)

## 17 — FRONTEND HANDOFF NOTES
- The frontend uses a centralized Axios client that automatically catches 401s.
- Frontend API modules strictly separate logic by feature domain (e.g. `businessApi`, `advisorApi`).
- The frontend codebase uses `camelCase` internally. If the backend returns `snake_case`, please specify if we should map it or if the backend will handle serialization.
- Existing UI mocks are solely temporary visual placeholders. Once the backend schemas are confirmed, we will delete the mocks and directly wire the state to the API client hooks.

## 18 — FINAL API INVENTORY
### AUTH
| Method | Endpoint | Frontend Function | Status |
|---|---|---|---|
| POST | `/auth/login` | `authApi.login` | CONNECTED |
| POST | `/auth/register` | `authApi.register` | CONNECTED |
| POST | `/auth/logout` | `authApi.logout` | CONNECTED |
| POST | `/auth/refresh` | `authApi.refresh` | DEFINED |
| GET | `/auth/me` | `authApi.me` | DEFINED |

### PROFILE
| Method | Endpoint | Frontend Function | Status |
|---|---|---|---|
| PUT | `/users/me/profile` | `profileApi.updateProfile` | CONNECTED |
| GET | `/users/me/profile` | `profileApi.getProfile` | DEFINED |

### LOCATIONS
| Method | Endpoint | Frontend Function | Status |
|---|---|---|---|
| GET | `/locations/states` | `locationApi.getStates` | DEFINED |
| GET | `/locations/districts` | `locationApi.getDistricts` | DEFINED |
| GET | `/locations/blocks` | `locationApi.getBlocks` | DEFINED |
| GET | `/locations/villages` | `locationApi.getVillages` | DEFINED |
| GET | `/locations/search` | `locationApi.search` | DEFINED |
| GET | `/locations/{id}` | `locationApi.getDetails` | DEFINED |
| GET | `/locations/{id}/statistics` | `locationApi.getStatistics` | DEFINED |
| GET | `/locations/{id}/markets` | `locationApi.getMarkets` | DEFINED |
| GET | `/locations/{id}/competitors` | `locationApi.getCompetitors` | DEFINED |

### BUSINESS
| Method | Endpoint | Frontend Function | Status |
|---|---|---|---|
| POST | `/businesses` | `businessApi.create` | CONNECTED |
| GET | `/businesses` | `businessApi.list` | DEFINED |
| GET | `/businesses/{id}` | `businessApi.get` | DEFINED |
| PUT | `/businesses/{id}` | `businessApi.update` | DEFINED |
| DELETE | `/businesses/{id}` | `businessApi.delete` | DEFINED |

### FEASIBILITY
| Method | Endpoint | Frontend Function | Status |
|---|---|---|---|
| GET | `/feasibility/{id}` | `feasibilityApi.getFeasibility` | CONNECTED |
| POST | `/feasibility/{id}/generate` | `feasibilityApi.generateFeasibility` | DEFINED |
| GET | `/feasibility/{id}/market` | `feasibilityApi.getMarket` | DEFINED |
| GET | `/feasibility/{id}/opportunities` | `feasibilityApi.getOpportunities` | DEFINED |
| GET | `/feasibility/{id}/swot` | `feasibilityApi.getSwot` | DEFINED |
| GET | `/feasibility/{id}/threats` | `feasibilityApi.getThreats` | DEFINED |
| GET | `/feasibility/{id}/competitors` | `feasibilityApi.getCompetitors` | DEFINED |
| GET | `/feasibility/{id}/pricing` | `feasibilityApi.getPricing` | DEFINED |
| GET | `/feasibility/{id}/score` | `feasibilityApi.getScore` | DEFINED |

### FINANCE
| Method | Endpoint | Frontend Function | Status |
|---|---|---|---|
| POST | `/finance/simulate` | `financeApi.simulate` | CONNECTED |
| GET | `/finance/{id}` | `financeApi.getPlan` | DEFINED |
| POST | `/finance/structure` | `financeApi.getSchemeOptions` | DEFINED |
| POST | `/finance/repayment` | `financeApi.getRepaymentSchedule` | DEFINED |

### ADVISOR
| Method | Endpoint | Frontend Function | Status |
|---|---|---|---|
| POST | `/ai/advisor/chat` | `advisorApi.chat` | CONNECTED |
| POST | `/ai/business/analyze` | `advisorApi.analyzeBusiness` | DEFINED |
| POST | `/ai/business/recommend` | `advisorApi.getRecommendations` | DEFINED |

### REPORTS
| Method | Endpoint | Frontend Function | Status |
|---|---|---|---|
| GET | `/reports` | `reportApi.list` | CONNECTED |
| GET | `/reports/{id}` | `reportApi.get` | CONNECTED |
| GET | `/reports/{id}/download` | `reportApi.download` | CONNECTED |
| POST | `/reports/generate` | `reportApi.generate` | DEFINED |
| GET | `/reports/{id}/status` | `reportApi.getStatus` | DEFINED |
