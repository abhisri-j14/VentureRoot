# VentureRoot Frontend API Contract

> **Version**: 1.0 (Draft)
> **Last Updated**: 2026-08-29

## 1. Scope
This document defines the **frontend API contract** for VentureRoot. It outlines the specific capabilities the frontend application (Next.js) needs to communicate with the backend (FastAPI).

**Crucially, this is a capability-based abstraction, not a 1:1 mapping of backend routes.** The frontend will expose clean, consolidated modules that map closely to user-facing features rather than exposing dozens of redundant endpoints.

**Boundaries:**
- **Frontend Owns**: UI, forms, state management, API calls via Axios, React Query hooks, JWT handling, loading/error states, and response rendering.
- **Frontend DOES NOT Own**: Business logic, finance calculations, ML predictions, AI RAG generation, scheme rules, or database validation.

## 2. Architecture
The frontend data layer follows a three-tier architecture:
1. **Components / Pages**: Trigger actions and read state (React).
2. **React Query Hooks**: Manage caching, loading states, and refetching logic (`useMutation`, `useQuery`).
3. **API Modules**: Thin wrappers around Axios that define the typed contract for specific domains (e.g., `auth.ts`, `businesses.ts`).

## 3. Base URL
All API calls are routed through the centralized Axios client, pointing to the backend defined in environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```
URLs must never be hardcoded in frontend components.

## 4. Authentication/JWT
The backend implements JWT authentication (HS256).

- **Access Token Expiry**: 30 minutes
- **Refresh Token Expiry**: 30 days

The frontend uses `zustand` (`useAuthStore`) to maintain the session state (`user`, `role`, `token`). 
Upon login, the access token is saved and automatically attached to the `Authorization: Bearer <token>` header via Axios interceptors. 

> **[NEEDS BACKEND CONFIRMATION]**:
> - Are refresh tokens stored in `httpOnly` cookies or returned in the response body?
> - What are the exact property names for tokens in the login response (e.g., `access_token` vs `accessToken`)?

## 5. Axios Client Contract
A single, centralized Axios client will be maintained at `src/lib/api/client.ts`. 

Responsibilities:
- Defining the `baseURL`.
- Request interceptor: Injecting the JWT `Authorization` header.
- Response interceptor: Normalizing error responses.
- 401 Interceptor: Triggering the token refresh flow (or auto-logout if the refresh token is expired).

## 6. API Modules
The frontend consolidates backend endpoints into **8 core modules** based on user-facing features.

### 6.1 Auth API (`auth`)
```typescript
auth.register(data: RegisterFormValues)
auth.login(credentials: LoginFormValues)
auth.refresh()
auth.logout()
auth.me()
```
*Maps to*: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`

### 6.2 Profile API (`profile`)
Consolidated user profile management.
```typescript
profile.get()
profile.update(data: ProfileData)
```
*Maps to*: `GET /users/me/profile`, `PUT /users/me/profile`

### 6.3 Locations API (`locations`)
Hierarchical location fetching for onboarding and wizards.
```typescript
locations.getStates()
locations.getDistricts(stateId: string)
locations.getBlocks(districtId: string)
locations.getVillages(blockId: string)
locations.search(query: string)
```
*Maps to*: `GET /locations/states`, `GET /locations/districts`, `GET /locations/blocks`, `GET /locations/villages`, `GET /locations/search`

### 6.4 Businesses API (`businesses`)
Core CRUD operations for an entrepreneur's business ideas.
```typescript
businesses.list()
businesses.get(id: string)
businesses.create(data: BusinessFormValues)
businesses.update(id: string, data: Partial<BusinessFormValues>)
businesses.delete(id: string)
```
*Maps to*: `GET /businesses`, `GET /businesses/{id}`, `POST /businesses`, `PUT /businesses/{id}`, `DELETE /businesses/{id}`

### 6.5 Analysis API (`analysis`)
**Consolidated Module.** The frontend will NOT expose 8 separate functions for feasibility sections. A single function fetches the aggregate feasibility dashboard.
```typescript
analysis.generateFeasibility(businessId: string)
analysis.getFeasibility(businessId: string)
```
*Maps to*: `POST /feasibility/{business_id}/generate`, `GET /feasibility/{business_id}`. 
*(If the backend requires separate calls for market, opportunities, etc., `getFeasibility` will use `Promise.all` under the hood to abstract this from the UI).*

### 6.6 Finance API (`finance`)
Clean abstractions for the finance views (What-if Simulator, Financial Plan).
```typescript
finance.getPlan(businessId: string)
finance.simulate(input: SimulationInput)
finance.getSchemeOptions(input: SchemeMatchInput)
finance.getRepaymentSchedule(businessId: string)
```
*Maps to*: `GET /finance/{business_id}`, `POST /finance/simulate`, `POST /finance/structure`, `POST /finance/repayment`

### 6.7 Advisor API (`advisor`)
Features powered by AI and ML, exposed as simple frontend utilities.
```typescript
advisor.chat(message: string, businessId?: string, context?: any)
advisor.analyzeBusiness(businessId: string)
advisor.getRecommendations(businessId: string)
```
*Maps to*: `POST /ai/advisor/chat`, `POST /ai/business/analyze`, `POST /ai/business/recommend`

### 6.8 Reports API (`reports`)
Capabilities for generating and viewing downloadable reports.
```typescript
reports.list()
reports.generate(businessId: string)
reports.get(id: string)
reports.download(id: string)
```
*Maps to*: `GET /reports` (inferred), `POST /reports/generate`, `GET /reports/{id}`, `GET /reports/{id}/download`

## 7. Request/Response Mapping
- The frontend currently uses `camelCase` for TypeScript interfaces.
- The manual examples use `snake_case` for the backend JSON (e.g., `available_margin`).

> **[BACKEND CONTRACT DECISION REQUIRED]**: Either the backend accepts and returns `camelCase` (e.g. via Pydantic alias generators), or the frontend Axios client must implement a global `snake_case ↔ camelCase` transform interceptor.

## 8. React Query Integration
React Query will sit directly on top of the API modules. We will avoid creating a hook for every endpoint, and instead create hooks for features:

- `useAuth()`: Wraps `auth.login`, `auth.logout`
- `useProfile()`: Wraps `profile.get`, `profile.update`
- `useFeasibility(businessId)`: Wraps `analysis.getFeasibility`
- `useWhatIfSimulation()`: Wraps `finance.simulate`
- `useAdvisorChat()`: Wraps `advisor.chat`

## 9. Error Handling
All API errors must be normalized by the Axios interceptor into a standard predictable shape for the UI:

```typescript
interface ApiError {
  message: string;        // Human-readable message
  code: string;           // Machine-readable code (e.g., "VALIDATION_ERROR")
  details?: any;          // Field-level errors (e.g., { email: "Invalid format" })
}
```

> **[NEEDS BACKEND CONFIRMATION]**: What is the exact schema the backend uses for errors (e.g. FastAPI's default 422 format)?

## 10. Loading/Error/Empty States
- **Loading**: Handled intrinsically by React Query `isLoading` and `isPending` flags.
- **Error**: Handled by React Query `isError` and `error` objects, displaying toast notifications or inline error boundaries.
- **Empty**: Frontend components must safely handle `null` arrays or empty objects (e.g., a business with no feasibility generated yet).

## 11. Frontend API → UI Mapping

| Feature | UI Component | API Module |
|---------|-------------|------------|
| Registration Flow | `app/(auth)/register` | `auth.register()` |
| Login / Auth | `app/(auth)/login` | `auth.login()` |
| Onboarding / Profile | `features/profile/components/*` | `profile.get()`, `profile.update()` |
| Location Selection | `ProfileView`, `BusinessWizard` | `locations.getStates()`, etc. |
| Business Creation | `features/business/components/BusinessWizard` | `businesses.create()` |
| Feasibility Dashboard | `features/feasibility/components/*` | `analysis.getFeasibility()` |
| What-If Simulator | `features/finance/components/WhatIfSimulator` | `finance.simulate()` |
| AI Chat | `features/advisor/components/ChatWindow` | `advisor.chat()` |
| Reports Generation | `features/reports/components/ReportGenerator` | `reports.generate()`, `reports.get()` |

## 12. Known Contract Fields
The manual defines several models that we can consider known domain concepts (pending final wire-format casing):

- **Business**: `id`, `user_id`, `location_id`, `category_id`, `name`, `description`, `status`, `created_at`, `updated_at`.
- **Business Inputs**: `available_capital`, `expected_investment`, `working_capital`, `expected_monthly_revenue`, `raw_material_cost`, `labour_cost`, `rent`, `transport_cost`, `utility_cost`, `other_cost`, `expected_price`, `expected_quantity`.
- **Financial Plan**: `project_cost`, `available_margin`, `maximum_loan`, `interest_rate`, `tenure_months`, `moratorium_months`, `scheme_id`, `estimated_emi`.

## 13. Backend Confirmation Requirements
To finalize the implementation, the frontend requires the following confirmations:
1. Exact token field names and refresh mechanism.
2. Async behavior for Report and Feasibility generation (do they return a `job_id` or stream?).
3. Case conversion strategy (`camelCase` vs `snake_case`).
4. Exact standard error response schema.

## 14. Final Implementation Order
1. Implement `src/lib/api/client.ts` (Axios setup).
2. Wire up `auth` and `profile` APIs to replace local Zustand mocks.
3. Wire up `businesses` API to remove hardcoded business cards.
4. Wire up `analysis` API to hydrate the feasibility dashboard.
5. Wire up `finance` and `advisor` APIs.

---

## FINAL API SUMMARY

| Frontend Module | Frontend Capability | Backend Endpoint(s) | UI Consumer |
|---|---|---|---|
| **auth** | `register(data)` | `POST /api/v1/auth/register` | Register Page |
| | `login(credentials)` | `POST /api/v1/auth/login` | Login Page |
| | `refresh()` | `POST /api/v1/auth/refresh` | Axios Interceptor |
| | `logout()` | `POST /api/v1/auth/logout` | Global Nav |
| | `me()` | `GET /api/v1/auth/me` | Auth Provider / Guard |
| **profile** | `get()` | `GET /api/v1/users/me/profile` | Profile View, Onboarding |
| | `update(data)` | `PUT /api/v1/users/me/profile` | Profile View, Onboarding |
| **locations** | `getStates()` | `GET /api/v1/locations/states` | Wizards, Profile |
| | `getDistricts(stateId)` | `GET /api/v1/locations/districts` | Wizards, Profile |
| | `getBlocks(districtId)` | `GET /api/v1/locations/blocks` | Wizards, Profile |
| | `getVillages(blockId)` | `GET /api/v1/locations/villages` | Wizards, Profile |
| | `search(query)` | `GET /api/v1/locations/search` | Search Inputs |
| **businesses** | `list()` | `GET /api/v1/businesses` | Dashboard |
| | `get(id)` | `GET /api/v1/businesses/{id}` | Business Detail |
| | `create(data)` | `POST /api/v1/businesses` | Business Wizard |
| | `update(id, data)` | `PUT /api/v1/businesses/{id}` | Business Settings |
| | `delete(id)` | `DELETE /api/v1/businesses/{id}` | Business Settings |
| **analysis** | `generateFeasibility(id)` | `POST /api/v1/feasibility/{id}/generate` | Feasibility Dashboard |
| | `getFeasibility(id)` | `GET /api/v1/feasibility/{id}` (aggregated) | Feasibility Dashboard |
| **finance** | `getPlan(id)` | `GET /api/v1/finance/{id}` | Finance Tab |
| | `simulate(input)` | `POST /api/v1/finance/simulate` | What-If Simulator |
| | `getSchemeOptions(input)`| `POST /api/v1/finance/structure` | Scheme Calculator |
| | `getRepaymentSchedule(id)`| `POST /api/v1/finance/repayment` | Repayment Chart |
| **advisor** | `chat(message, id, ctx)` | `POST /api/v1/ai/advisor/chat` | Chat Window |
| | `analyzeBusiness(id)` | `POST /api/v1/ai/business/analyze` | AI Oversight (Admin) |
| | `getRecommendations(id)`| `POST /api/v1/ai/business/recommend` | Advisor Tab |
| **reports** | `list()` | `GET /api/v1/reports` | Reports List |
| | `generate(id)` | `POST /api/v1/reports/generate` | Report Generator |
| | `get(id)` | `GET /api/v1/reports/{id}` | Report Detail |
| | `download(id)` | `GET /api/v1/reports/{id}/download` | Report Export |
