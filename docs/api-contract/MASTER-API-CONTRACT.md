# VentureRoot — Master API Contract

> **Version**: 0.1.0 (Pre-Integration Draft)
> **Last Updated**: 2026-08-29
> **Status**: DRAFT — BACKEND AND ML IMPLEMENTATIONS DO NOT EXIST IN THIS REPOSITORY YET

---

## 1. Purpose

This document is the **single source of truth** for how VentureRoot's Frontend, Backend (FastAPI), and ML/AI services communicate via APIs.

It is based on:
- **[FROM MANUAL]** — The VentureRoot team manual / product architecture reference provided by the user.
- **[FRONTEND]** — Actual frontend code found in the repository (`frontend/src/`).
- **[INFERRED]** — Logically derived from the product domain and frontend expectations.

> [!CAUTION]
> **No backend, ML service, database models, or OpenAPI specification exist in this repository.**
> The repository contains ONLY the Next.js frontend application.
> Every API contract in this document is therefore either **FROM MANUAL** or **FRONTEND** (what the frontend expects to call) or **INFERRED**.
> Nothing is **[CONFIRMED]** by actual running backend code.

---

## 2. System Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│  Next.js         │────▶│  FastAPI          │────▶│  ML/AI Service   │
│  Frontend        │◀────│  Backend          │◀────│  (Gemini/RAG)    │
│                  │     │                  │     │                  │
│  Port: 3000      │     │  Port: 8000       │     │  Internal Only   │
│  (Public)        │     │  /api/v1          │     │  (Not Public)    │
│                  │     │                  │     │                  │
└──────────────────┘     └───────┬──────────┘     └──────────────────┘
                                 │
                                 ▼
                         ┌──────────────────┐
                         │  Database         │
                         │  (PostgreSQL?)    │
                         │  [NEEDS BACKEND   │
                         │   CONFIRMATION]   │
                         └──────────────────┘
```

**Key Boundaries:**
- Frontend → Backend: REST over HTTPS, JSON, `Authorization: Bearer <token>`
- Backend → ML: Internal service calls (NOT exposed to frontend)
- Backend → DB: ORM layer (SQLAlchemy assumed from FastAPI convention — **[INFERRED]**)
- Frontend NEVER calls ML directly

---

## 3. Service Boundaries

| Concern | Owner | Notes |
|---------|-------|-------|
| UI rendering, forms, state | Frontend | Next.js App Router, Zustand, React Query |
| REST API, validation, auth | Backend | FastAPI, Pydantic |
| Business logic, financial calcs | Backend | NOT in frontend |
| Scheme matching, eligibility | Backend | NOT in frontend |
| ML predictions, demand/risk/price | ML/AI | Called by backend only |
| LLM chat, RAG, recommendations | ML/AI | Behind backend abstraction |
| Data persistence | Backend + DB | Frontend is stateless |

---

## 4. API Versioning

**[FROM MANUAL]**

All endpoints are prefixed with:
```
/api/v1
```

The frontend API client is configured at:
```typescript
// frontend/src/lib/api/client.ts
baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
```

Future versions should use `/api/v2`, `/api/v3`, etc. The frontend client should be updated to point to the new version.

---

## 5. Authentication

### 5.1 Frontend Implementation Status

**[FRONTEND]** The frontend currently uses:
- **Zustand store** (`useAuthStore`) holding `token`, `role`, and `user`
- **Mock token** (`"mock-token-xyz-123"`) set on login — no real backend call
- **Authorization header**: `Bearer <token>` attached via Axios interceptor
- **401 handling**: Auto-logout on 401 response
- **No refresh token logic** implemented yet

### 5.2 Expected Auth Flow [FROM MANUAL]

```
POST /api/v1/auth/register   → Create account
POST /api/v1/auth/login      → Get access + refresh token
POST /api/v1/auth/refresh    → Refresh access token
POST /api/v1/auth/logout     → Invalidate session
GET  /api/v1/auth/me         → Get current user
```

### 5.3 Token Mechanism

**[NEEDS BACKEND CONFIRMATION]**

| Decision | Status |
|----------|--------|
| Token type (JWT?) | NEEDS BACKEND CONFIRMATION |
| Token transport (header vs cookie) | Frontend assumes `Authorization: Bearer` header |
| Access token expiry | NEEDS BACKEND CONFIRMATION |
| Refresh token expiry | NEEDS BACKEND CONFIRMATION |
| Refresh token storage (httpOnly cookie vs body) | NEEDS BACKEND CONFIRMATION |
| Token payload (claims) | NEEDS BACKEND CONFIRMATION |

### 5.4 Login Request [FROM MANUAL + FRONTEND]

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 1 char)"
}
```
*Frontend also captures `rememberMe: boolean` — [NEEDS BACKEND CONFIRMATION] whether backend uses this.*

**Response:** [NEEDS BACKEND CONFIRMATION]
```json
{
  "access_token": "string",
  "refresh_token": "string [NEEDS CONFIRMATION]",
  "token_type": "bearer [NEEDS CONFIRMATION]",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "ENTREPRENEUR | MENTOR_ADVISOR | ADMIN"
  }
}
```

### 5.5 Register Request [FROM MANUAL + FRONTEND]

```
POST /api/v1/auth/register
```

**Request Body (from frontend Zod schema):**
```json
{
  "fullName": "string (required, min 2 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "confirmPassword": "string (must match password)"
}
```

> [!IMPORTANT]
> **[NEEDS BACKEND CONFIRMATION]**: Does the backend expect `full_name` (snake_case) or `fullName` (camelCase)?
> The frontend schema uses camelCase. FastAPI/Pydantic convention is snake_case.

**Response:** [NEEDS BACKEND CONFIRMATION]

### 5.6 Roles (RBAC)

**[FRONTEND]** Three roles are defined:

| Role | Label | Description |
|------|-------|-------------|
| `ENTREPRENEUR` | Kisan | Explore and plan business opportunities |
| `MENTOR_ADVISOR` | Advisor / Mentor | Support and review entrepreneur plans |
| `ADMIN` | Administrator | Manage VentureRoot platform data |

**[NEEDS BACKEND CONFIRMATION]**: Exact role values, role assignment mechanism, role hierarchy.

---

## 6. Authorization / RBAC

**[FROM MANUAL + FRONTEND]**

| Endpoint Group | ENTREPRENEUR | MENTOR_ADVISOR | ADMIN |
|----------------|:---:|:---:|:---:|
| Auth | ✓ | ✓ | ✓ |
| Users/Profile | ✓ (own) | ✓ (own) | ✓ (all) |
| Businesses | ✓ (own) | ✓ (assigned) | ✓ (all) |
| Feasibility | ✓ (own) | ✓ (assigned) | ✓ (all) |
| Finance | ✓ (own) | ✓ (assigned) | ✓ (all) |
| Schemes | ✓ | ✓ | ✓ |
| AI Advisor | ✓ | ✓ | ✓ |
| Reports | ✓ (own) | ✓ (assigned) | ✓ (all) |
| Reviews | ✗ | ✓ | ✓ |
| Admin Panel | ✗ | ✗ | ✓ |

**[NEEDS BACKEND CONFIRMATION]**: Exact authorization rules and middleware implementation.

---

## 7. Global Headers

**[FRONTEND]** — from `frontend/src/lib/api/client.ts`:

```
Content-Type: application/json
Authorization: Bearer <token>  (when authenticated)
```

**[NEEDS BACKEND CONFIRMATION]:**
- `Accept-Language` header for multilingual responses?
- CORS configuration?
- Rate limiting headers?

---

## 8. Global Error Contract

**[NEEDS BACKEND CONFIRMATION]** — No error schema exists in the codebase.

### PROPOSED Structure (REQUIRES BACKEND APPROVAL)

```json
{
  "detail": "string — human-readable error message",
  "error_code": "string — machine-readable error code (e.g. AUTH_INVALID_CREDENTIALS)",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Expected HTTP Status Codes

| Code | When | Notes |
|------|------|-------|
| `400` | Bad request / malformed input | |
| `401` | Missing/invalid/expired token | Frontend auto-logouts |
| `403` | Authenticated but insufficient role | |
| `404` | Resource not found | |
| `409` | Conflict (duplicate email, etc.) | |
| `422` | Validation error (Pydantic) | FastAPI default for validation |
| `429` | Rate limited | [NEEDS BACKEND CONFIRMATION] |
| `500` | Internal server error | |
| `503` | ML service unavailable | [NEEDS BACKEND CONFIRMATION] |

---

## 9. Global Data Conventions

**[NEEDS BACKEND CONFIRMATION]** — None of these are confirmed by actual backend code.

| Convention | Expected | Status |
|------------|----------|--------|
| Case convention (API) | `snake_case` (FastAPI/Pydantic default) | NEEDS BACKEND CONFIRMATION |
| Case convention (frontend) | `camelCase` (TypeScript convention) | FRONTEND |
| Case transformation layer | Frontend Axios transform? Or backend alias? | NEEDS BACKEND CONFIRMATION |
| ID format | String (UUID?) | Frontend uses `"user-ent-001"`, `"biz-01"`, `"rep-101"` style |
| Dates | ISO 8601 (`2026-08-28T10:00:00Z`) | FRONTEND |
| Currency | Numbers in INR (₹), integer paisa or float rupees? | NEEDS BACKEND CONFIRMATION |
| Percentages | 0–100 integer? 0.0–1.0 float? | NEEDS BACKEND CONFIRMATION |
| Nullable fields | `null` or absent? | NEEDS BACKEND CONFIRMATION |
| Pagination | Offset/limit? Cursor? | NEEDS BACKEND CONFIRMATION |
| Languages supported | `en`, `bn`, `hi` | FRONTEND (from `useUIStore`) |

---

## 10. Auth APIs

### POST /api/v1/auth/register [FROM MANUAL]

| Field | Detail |
|-------|--------|
| **Purpose** | Create a new user account |
| **Owner** | Backend |
| **Consumer** | Frontend (Register page) |
| **Auth required** | No |
| **Request body** | `{ fullName, email, password, confirmPassword }` |
| **Response** | [NEEDS BACKEND CONFIRMATION] |
| **Frontend consumer** | `(auth)/register/page.tsx` |

### POST /api/v1/auth/login [FROM MANUAL]

| Field | Detail |
|-------|--------|
| **Purpose** | Authenticate user, return tokens |
| **Owner** | Backend |
| **Consumer** | Frontend (Login page) |
| **Auth required** | No |
| **Request body** | `{ email, password }` |
| **Response** | `{ access_token, user: { id, name, email, role } }` [NEEDS BACKEND CONFIRMATION] |
| **Frontend consumer** | `(auth)/login/page.tsx` → `useAuthStore.login()` |

### POST /api/v1/auth/refresh [FROM MANUAL]

| Field | Detail |
|-------|--------|
| **Purpose** | Refresh access token |
| **Owner** | Backend |
| **Consumer** | Frontend (Axios interceptor — NOT YET IMPLEMENTED) |
| **Auth required** | Refresh token |
| **Request body** | [NEEDS BACKEND CONFIRMATION] |
| **Response** | [NEEDS BACKEND CONFIRMATION] |

### POST /api/v1/auth/logout [FROM MANUAL]

| Field | Detail |
|-------|--------|
| **Purpose** | Invalidate session/token |
| **Owner** | Backend |
| **Consumer** | Frontend |
| **Auth required** | Yes |
| **Request body** | None or `{ refresh_token }` [NEEDS BACKEND CONFIRMATION] |

### GET /api/v1/auth/me [FROM MANUAL]

| Field | Detail |
|-------|--------|
| **Purpose** | Get current authenticated user |
| **Owner** | Backend |
| **Consumer** | Frontend (session validation) |
| **Auth required** | Yes |
| **Response** | `{ id, name, email, role, ... }` [NEEDS BACKEND CONFIRMATION] |

---

## 11. User APIs

### GET /api/v1/users/me [FROM MANUAL]
### PUT /api/v1/users/me [FROM MANUAL]
### GET /api/v1/users/me/profile [FROM MANUAL]
### PUT /api/v1/users/me/profile [FROM MANUAL]

**[FRONTEND]** Profile data structure (from `profileSchema.ts`):

```typescript
{
  fullName: string;           // min 2 chars
  email?: string;             // valid email
  phone?: string;             // min 10 chars
  location: {
    state: string;            // required
    district: string;         // required
    block?: string;
    village?: string;
  };
  financial: {
    availableCapital: number; // min 0
    income: number;           // min 0
  };
  experience: {
    businessExperience: "None" | "0-2 years" | "3-5 years" | "5+ years";
    skills?: string;
    education?: string;
  };
}
```

**[NEEDS BACKEND CONFIRMATION]**: Exact endpoint split between `/users/me` and `/users/me/profile`.

---

## 12. Location APIs

### [FRONTEND] — Implemented React Query Hooks

The frontend has implemented these hooks in `features/location/api/locationApi.ts`:

| Hook | Endpoint | Status |
|------|----------|--------|
| `useLocationDetails(locationId)` | `GET /locations/{locationId}` | FRONTEND (hook exists, no backend) |
| `useLocationStatistics(locationId)` | `GET /locations/{locationId}/statistics` | FRONTEND |
| `useLocationMarkets(locationId)` | `GET /locations/{locationId}/markets` | FRONTEND |
| `useLocationCompetitors(locationId)` | `GET /locations/{locationId}/competitors` | FRONTEND |

### [FROM MANUAL] — Full Location API Surface

```
GET  /api/v1/locations/states
GET  /api/v1/locations/districts?state_id=
GET  /api/v1/locations/blocks?district_id=
GET  /api/v1/locations/villages?block_id=
GET  /api/v1/locations/search?q=
GET  /api/v1/locations/{location_id}
GET  /api/v1/locations/{location_id}/statistics
GET  /api/v1/locations/{location_id}/markets
GET  /api/v1/locations/{location_id}/competitors
```

**Location Hierarchy:**
```
State → District → Block → Village
```

**[NEEDS BACKEND CONFIRMATION]**: Response schemas for all location endpoints.

---

## 13. Business APIs

### [FROM MANUAL] — Full Business API Surface

```
POST   /api/v1/businesses                    — Create
GET    /api/v1/businesses                    — List (user's businesses)
GET    /api/v1/businesses/{id}               — Get detail
PUT    /api/v1/businesses/{id}               — Update
DELETE /api/v1/businesses/{id}               — Delete
POST   /api/v1/businesses/{id}/duplicate     — Duplicate
```

### [FRONTEND] — Business Form Schema (`businessSchema.ts`)

```typescript
{
  categoryId: string;       // required, min 1 char
  state: string;            // required
  district: string;         // required
  block: string;            // required
  village: string;          // required
  availableMargin: number;  // min 5000
  existingResources?: string;
  expectedRevenue: number;  // min 0
}
```

### [FRONTEND] — Business Detail Interface (`BusinessDetailsView.tsx`)

```typescript
interface BusinessDetails {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  status: "Draft" | "Analyzing" | "Ready";
  location: {
    state: string;
    district: string;
    block?: string;
    village?: string;
  };
  capital: {
    availableMargin: number;
    workingCapital?: number;
    expectedInvestment?: number;
  };
  operations: {
    expectedRevenue: number;
    expectedPrice?: number;
    productionQuantity?: number;
  };
  resources: {
    land?: string;
    equipment?: string;
    existingResources?: string;
  };
}
```

**[NEEDS BACKEND CONFIRMATION]**: Exact Pydantic model, field names (snake_case), and which fields are computed vs user-input.

---

## 14. Finance APIs

### [FROM MANUAL] — Finance API Surface

```
POST /api/v1/finance/calculate       — Run financial calculation
POST /api/v1/finance/structure       — Get financial structuring
POST /api/v1/finance/scheme-match    — Match applicable schemes
POST /api/v1/finance/repayment      — Get repayment schedule
POST /api/v1/finance/simulate       — What-if simulation
GET  /api/v1/finance/{business_id}   — Get saved financial plan
```

### [FROM MANUAL] — Example: POST /api/v1/finance/structure

**Request:**
```json
{
  "available_margin": 100000,
  "business_category": "dairy",
  "location_id": "loc_123"
}
```

**Response:**
```json
{
  "project_cost": 1000000,
  "maximum_loan": 900000,
  "scheme": {
    "id": "term_loan",
    "interest_rate": 8.0,
    "tenure_months": 84,
    "moratorium_months": 6
  }
}
```

### [FROM MANUAL] — FinancialPlan TypeScript Concept

```typescript
interface FinancialPlan {
  projectCost: number;
  availableMargin: number;
  maximumLoan: number;
  interestRate: number;
  tenureMonths: number;
  moratoriumMonths: number;
  schemeId: string;
  estimatedEmi?: number;
}
```

> [!WARNING]
> The manual shows `snake_case` in JSON responses and `camelCase` in the TypeScript interface.
> The backend must confirm which convention it uses. The frontend must implement a transform layer if they differ.

### [FRONTEND] — Simulation Parameters (from `WhatIfSimulator.tsx`)

```json
{
  "loanAmount": "number (50000 – 2000000)",
  "interestRate": "number (1 – 24%)",
  "tenure": "number (12 | 24 | 36 | 48 | 60 | 84 months)",
  "moratorium": "number (0 | 3 | 6 | 12 months)",
  "revenue": "number (5000 – 500000)",
  "expenses": "number (5000 – 500000)"
}
```

**Simulation Response:** [NEEDS BACKEND CONFIRMATION]
- Best case scenario
- Expected case scenario
- Worst case scenario
- Loan risk assessment

### [FRONTEND] — Repayment Data (from `RepaymentChart.tsx`)

Expected response structure:
```json
[
  { "period": "Q1", "principal": 0, "interest": 15000, "isMoratorium": true },
  { "period": "Q2", "principal": 0, "interest": 15000, "isMoratorium": true },
  { "period": "Q3", "principal": 25000, "interest": 14000, "isMoratorium": false }
]
```

**[NEEDS BACKEND CONFIRMATION]**: Exact schema, quarterly vs monthly granularity.

---

## 15. Scheme APIs

### [FROM MANUAL]

```
GET  /api/v1/schemes                        — List all schemes
GET  /api/v1/schemes/{id}                   — Get scheme detail
POST /api/v1/schemes/match                  — Match schemes to business
POST /api/v1/schemes/{id}/eligibility       — Check eligibility
```

**[NEEDS BACKEND CONFIRMATION]**: Scheme response schema including:
- Scheme name, description
- Eligibility criteria
- Benefits, subsidy amounts
- Required documents
- Interest rate, tenure constraints
- Geographic applicability

---

## 16. Feasibility APIs

### [FRONTEND] — Implemented React Query Hooks (`feasibilityApi.ts`)

| Hook | Endpoint | Method |
|------|----------|--------|
| `useGenerateFeasibility()` | `POST /feasibility/{business_id}/generate` | Mutation |
| `useFeasibilityData(id)` | `GET /feasibility/{business_id}` | Query |
| `useFeasibilityMarket(id)` | `GET /feasibility/{business_id}/market` | Query |
| `useFeasibilityOpportunities(id)` | `GET /feasibility/{business_id}/opportunities` | Query |
| `useFeasibilitySwot(id)` | `GET /feasibility/{business_id}/swot` | Query |
| `useFeasibilityThreats(id)` | `GET /feasibility/{business_id}/threats` | Query |
| `useFeasibilityCompetitors(id)` | `GET /feasibility/{business_id}/competitors` | Query |
| `useFeasibilityPricing(id)` | `GET /feasibility/{business_id}/pricing` | Query |
| `useFeasibilityScore(id)` | `GET /feasibility/{business_id}/score` | Query |

### [FRONTEND] — Expected Response Types (from `feasibility/types/index.ts`)

#### MarketAnalysis
```typescript
{
  evidence: Evidence[];
  confidence?: Confidence;
  why?: WhyExplanation;
  reach: { radius5km: number; radius10km: number };
  demandIndicators: string[];
  localObservations: string[];
  customerSegments: string[];
  marketSizeValue?: number;
  marketTrends: string[];
  evidenceSources: string[];
}
```

#### OpportunityAnalysis
```typescript
{
  evidence: Evidence[];
  confidence?: Confidence;
  why?: WhyExplanation;
  summary: string;
  demandOpportunity: string;
  unmetNeed: string;
  localBusinessOpportunity: string;
  keyDrivers: string[];
  observations: string[];
}
```

#### CompetitionAnalysis
```typescript
{
  evidence: Evidence[];
  confidence?: Confidence;
  why?: WhyExplanation;
  overview: string;
  competitors: Competitor[];
  observations: string[];
}
```

#### Competitor
```typescript
{
  id: string;
  name: string;
  type: "Direct" | "Indirect";
  location: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  positioning: string;
}
```

#### SWOTAnalysis
```typescript
{
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}
```

#### RiskItem
```typescript
{
  id: string;
  title: string;
  category: "Market" | "Financial" | "Operational" | "Environmental" | "Competition";
  severity: "Low" | "Medium" | "High" | "Critical";
  explanation: string;
  potentialImpact: string;
  mitigationAdvisory?: string;
  evidence?: Evidence[];
}
```

#### PricingAnalysis
```typescript
{
  expectedLocalPrice: number;
  observedMarketPrice: number;
  priceRange: { min: number; max: number };
  marketValue: string;
  observations: string[];
  pricingFactors: string[];
}
```

#### Shared Intelligence Types
```typescript
type EvidenceType = "FACT" | "ESTIMATE" | "PREDICTION" | "UNKNOWN";

interface Evidence {
  type: EvidenceType;
  label: string;
  source: string;
  confidenceScore?: number;
}

interface Confidence {
  score: number;        // 0-100
  level: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
}

interface WhyExplanation {
  summary: string;
  factors: string[];
}
```

### Async Behavior

**[NEEDS BACKEND CONFIRMATION]**: Is `POST /feasibility/{business_id}/generate` synchronous or asynchronous?

If async:
```json
{
  "job_id": "string",
  "status": "PENDING | PROCESSING | COMPLETED | FAILED"
}
```

Frontend would need to poll `GET /feasibility/{business_id}` or a `/jobs/{job_id}` endpoint.

---

## 17. ML APIs (Internal — Backend ↔ ML)

**[FROM MANUAL]** — These are INTERNAL APIs. Frontend does NOT call these directly.

```
POST /ml/demand/predict
POST /ml/price/predict
POST /ml/revenue/predict
POST /ml/risk/predict
POST /ml/feasibility/score
POST /ml/market/analyze
```

**[NEEDS ML CONFIRMATION]**:
- ML service URL and port
- Request/response schemas
- Model versions
- Confidence scoring mechanism
- Feature input requirements
- Error/fallback behavior
- Latency expectations

---

## 18. AI APIs (Frontend-Facing)

### POST /api/v1/ai/advisor/chat [FROM MANUAL + FRONTEND]

**[FRONTEND]** — Hook exists in `advisorApi.ts`:

```typescript
// Request
{
  message: string;
  businessId?: string;
  context?: any;
}

// Response  [NEEDS BACKEND CONFIRMATION]
{
  role: "assistant";
  content: string;
  evidence?: {
    sources: string[];
    type: "FACT" | "ESTIMATE" | "PREDICTION" | "UNKNOWN";
    confidence?: number;
  };
}
```

**[NEEDS BACKEND CONFIRMATION]**:
- Streaming (SSE) vs standard REST?
- `conversation_id` for history tracking?
- `language` parameter for multilingual?
- Max message length?
- Rate limiting?

### [FROM MANUAL] — Other AI Endpoints

```
POST /api/v1/ai/business/analyze
POST /api/v1/ai/business/recommend
POST /api/v1/ai/report/generate
POST /api/v1/ai/market/analyze
POST /api/v1/ai/pricing/predict
POST /api/v1/ai/risk/analyze
```

**All [NEEDS BACKEND CONFIRMATION]** — No frontend hooks exist for these beyond the advisor chat.

---

## 19. RAG / Knowledge APIs

### [FROM MANUAL]

```
POST /api/v1/knowledge/search
POST /api/v1/knowledge/query
GET  /api/v1/knowledge/sources
```

**[NEEDS BACKEND CONFIRMATION]**: All request/response schemas.
**[NEEDS ML CONFIRMATION]**: RAG pipeline, vector store, embedding model, retrieval strategy.

---

## 20. Report APIs

### [FROM MANUAL]

```
POST /api/v1/reports/generate
GET  /api/v1/reports/{id}
GET  /api/v1/reports/{id}/status
GET  /api/v1/reports/{id}/download
```

### [FRONTEND] — Report Type Definitions

```typescript
type ReportStatus = "IDLE" | "GENERATING" | "READY" | "FAILED" | "DRAFT";

interface Report {
  id: string;
  title: string;
  businessId: string;
  businessName: string;
  location?: string;
  status: ReportStatus;
  createdAt: string;      // ISO 8601
  type: string;
  feasibilityData?: FeasibilityData;
}

interface ReportStage {
  id: string;
  label: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ERROR";
}
```

**[NEEDS BACKEND CONFIRMATION]**:
- Is report generation async? (Frontend has generation stages UI suggesting yes)
- Download content type (PDF? DOCX?)
- Report includes embedded feasibility data?

---

## 21. File APIs

**[NEEDS BACKEND CONFIRMATION]** — No file upload/download APIs are referenced in the frontend except report download.

---

## 22. Async Job Contract

**[NEEDS BACKEND CONFIRMATION]** — The following operations may be async:

1. Feasibility generation (`POST /feasibility/{business_id}/generate`)
2. Report generation (`POST /reports/generate`)
3. AI analysis endpoints

If async, a standard job contract is recommended:

### PROPOSED (REQUIRES BACKEND APPROVAL)

```json
{
  "job_id": "string (UUID)",
  "status": "PENDING | PROCESSING | COMPLETED | FAILED",
  "progress": 0.0,
  "result_url": "/api/v1/feasibility/{business_id}",
  "error": null
}
```

---

## 23. Pagination

**[NEEDS BACKEND CONFIRMATION]** — No pagination is implemented in the frontend.

### PROPOSED (REQUIRES BACKEND APPROVAL)

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "pages": 5
}
```

Query parameters: `?page=1&page_size=20&sort_by=created_at&order=desc`

---

## 24. Rate Limiting

**[NEEDS BACKEND CONFIRMATION]**

Recommended endpoints to rate limit:
- `POST /auth/login` — prevent brute force
- `POST /ai/advisor/chat` — LLM cost control
- `POST /feasibility/*/generate` — compute-heavy
- `POST /reports/generate` — compute-heavy

---

## 25. Security

### Required

| Requirement | Status |
|-------------|--------|
| HTTPS in production | [NEEDS BACKEND CONFIRMATION] |
| JWT signature verification | [NEEDS BACKEND CONFIRMATION] |
| CORS configuration | [NEEDS BACKEND CONFIRMATION] |
| RBAC middleware | [NEEDS BACKEND CONFIRMATION] |
| Input sanitization | [NEEDS BACKEND CONFIRMATION] |
| SQL injection protection | [NEEDS BACKEND CONFIRMATION] |

### NEVER Expose to Frontend

- `GEMINI_API_KEY`
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- ML service credentials
- Storage/cloud secrets

Frontend should ONLY have:
- `NEXT_PUBLIC_API_URL` — the backend base URL

---

## 26. Frontend Integration Map

See separate document: [`FRONTEND-API-MAP.md`](./FRONTEND-API-MAP.md)

---

## 27. Team Ownership Matrix

| API Group | Owner | Consumer | Backend | ML/AI | Frontend | DB |
|-----------|-------|----------|:-------:|:-----:|:--------:|:--:|
| Auth | Backend | Frontend | YES | NO | YES | YES |
| Users/Profile | Backend | Frontend | YES | NO | YES | YES |
| Locations | Backend | Frontend | YES | PARTIAL | YES | YES |
| Businesses | Backend | Frontend | YES | NO | YES | YES |
| Feasibility | Backend | Frontend | YES | YES | YES | YES |
| Finance | Backend | Frontend | YES | PARTIAL | YES | YES |
| Schemes | Backend | Frontend | YES | NO | YES | YES |
| AI Advisor | Backend | Frontend | YES | YES | YES | PARTIAL |
| AI Analysis | Backend | Frontend | YES | YES | YES | PARTIAL |
| Knowledge/RAG | Backend | Frontend | YES | YES | YES | YES |
| Reports | Backend | Frontend | YES | YES | YES | YES |
| Admin (Schemes/Categories/Geo/KB) | Backend | Frontend | YES | NO | YES | YES |
| Reviews | Backend | Frontend | YES | NO | YES | YES |

---

## 28. API Status Matrix

| Endpoint | Backend Implemented? | Schema Known? | Frontend Hook? | ML Dependency? | Status |
|----------|:---:|:---:|:---:|:---:|--------|
| `POST /auth/register` | NO | PARTIAL (frontend schema) | NO (mock) | NO | NEEDS BACKEND |
| `POST /auth/login` | NO | PARTIAL (frontend schema) | NO (mock) | NO | NEEDS BACKEND |
| `POST /auth/refresh` | NO | NO | NO | NO | NEEDS BACKEND |
| `POST /auth/logout` | NO | NO | NO | NO | NEEDS BACKEND |
| `GET /auth/me` | NO | NO | NO | NO | NEEDS BACKEND |
| `GET /users/me` | NO | NO | NO | NO | NEEDS BACKEND |
| `PUT /users/me` | NO | PARTIAL (frontend schema) | NO | NO | NEEDS BACKEND |
| `GET /locations/*` | NO | NO | YES (hooks) | PARTIAL | NEEDS BACKEND |
| `POST /businesses` | NO | PARTIAL (frontend schema) | NO (mock) | NO | NEEDS BACKEND |
| `GET /businesses` | NO | NO | NO | NO | NEEDS BACKEND |
| `GET /businesses/{id}` | NO | PARTIAL (frontend type) | NO (mock) | NO | NEEDS BACKEND |
| `POST /feasibility/*/generate` | NO | NO | YES (hook) | YES | NEEDS BACKEND + ML |
| `GET /feasibility/*` | NO | YES (frontend types) | YES (hooks) | YES | NEEDS BACKEND + ML |
| `POST /finance/calculate` | NO | NO | NO | PARTIAL | NEEDS BACKEND |
| `POST /finance/structure` | NO | PARTIAL (manual example) | NO | PARTIAL | NEEDS BACKEND |
| `POST /finance/simulate` | NO | PARTIAL (frontend UI) | NO (mock) | PARTIAL | NEEDS BACKEND |
| `POST /finance/repayment` | NO | PARTIAL (frontend mock) | NO (mock) | NO | NEEDS BACKEND |
| `GET /schemes` | NO | NO | NO | NO | NEEDS BACKEND |
| `POST /schemes/match` | NO | NO | NO | NO | NEEDS BACKEND |
| `POST /ai/advisor/chat` | NO | PARTIAL (frontend hook) | YES (hook) | YES | NEEDS BACKEND + ML |
| `POST /ai/business/analyze` | NO | NO | NO | YES | NEEDS BACKEND + ML |
| `POST /knowledge/*` | NO | NO | NO | YES | NEEDS BACKEND + ML |
| `POST /reports/generate` | NO | PARTIAL (frontend type) | NO (mock) | YES | NEEDS BACKEND + ML |
| `GET /reports/{id}` | NO | PARTIAL (frontend type) | NO (mock) | NO | NEEDS BACKEND |

---

## 29. Manual vs Implementation Gaps

### Gap 1: No Backend Exists

**Manual says:** Full FastAPI backend with Pydantic schemas, database, authentication.
**Actual code says:** Repository contains ONLY the `frontend/` directory. No `backend/`, no `ml/`, no `docker-compose.yml`, no `requirements.txt`.
**Impact:** CRITICAL — No API contract can be confirmed.
**Recommended resolution:** Backend team must create the FastAPI application and publish OpenAPI spec.

### Gap 2: Case Convention Mismatch

**Manual says:** API responses use `snake_case` (e.g., `available_margin`, `project_cost`).
**Frontend code says:** TypeScript interfaces use `camelCase` (e.g., `availableMargin`, `projectCost`).
**Impact:** Frontend will need a transform layer (Axios interceptor or manual mapping).
**Recommended resolution:** Backend team confirms `snake_case`. Frontend implements camelCase↔snake_case transform in Axios interceptors or uses a library like `camelcase-keys`.

### Gap 3: ID Format Inconsistency

**Frontend mock data uses:** Prefixed string IDs (`"user-ent-001"`, `"biz-01"`, `"rep-101"`, `"comp-1"`, `"risk-1"`).
**Manual does not specify:** Exact ID format.
**Impact:** Frontend types define `id: string` which is flexible, but backend must confirm UUID vs auto-increment vs custom format.
**Recommended resolution:** Backend team decides on UUID v4 for all entity IDs.

### Gap 4: OpenAPI Not Available

**Manual says:** Pydantic → OpenAPI → Generated TypeScript client.
**Actual code says:** No OpenAPI spec exists. Frontend manually maintains TypeScript types.
**Impact:** Types may drift from actual API. No automated client generation possible.
**Recommended resolution:** Backend publishes OpenAPI JSON at `/api/v1/openapi.json`. Frontend can then use `openapi-typescript-codegen` to generate a type-safe client.

---

## 30. Open Questions

See separate document: [`API-CONTRACT-GAPS.md`](./API-CONTRACT-GAPS.md)

---

## 31. Versioning / Future Compatibility

- Current version: `/api/v1`
- Breaking changes should result in `/api/v2`
- Non-breaking additions (new optional fields, new endpoints) can be added to v1
- Deprecated endpoints should return `Deprecation` header before removal
- Frontend API client base URL is configurable via `NEXT_PUBLIC_API_URL`

---

## Appendix A: Generated Types / SDK Strategy

### Current State
Frontend manually maintains TypeScript types in:
- `features/feasibility/types/index.ts`
- `features/reports/types/index.ts`
- `features/roadmap/types/index.ts`
- `features/auth/schemas/authSchema.ts`
- `features/business/schemas/businessSchema.ts`
- `features/profile/schemas/profileSchema.ts`

### Recommended Transition Path

1. **Phase 1 (Current):** Manual TypeScript types + Axios client
2. **Phase 2 (After backend exists):** Backend publishes OpenAPI at `/api/v1/openapi.json`
3. **Phase 3:** Generate TypeScript client using `openapi-typescript-codegen` or `@hey-api/openapi-ts`
4. **Phase 4:** Replace manual types with generated client

### Dependencies Already Installed
- `axios` — HTTP client ✓
- `@tanstack/react-query` — Data fetching ✓
- `zod` — Schema validation ✓
- `react-hook-form` + `@hookform/resolvers` — Form handling ✓
