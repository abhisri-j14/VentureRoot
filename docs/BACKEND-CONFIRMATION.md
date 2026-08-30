# Backend Confirmation Tracker

> **Purpose**: A centralized checklist for all missing schemas, field names, and behaviors that require explicit backend confirmation before frontend integration can be finalized.
> **Status**: PENDING

## 1. Authentication
- [ ] **Login Response**: Exact fields for access token, refresh token, expiry, and user data.
- [ ] **Refresh Token Flow**: Are refresh tokens sent in cookies or body? What is the request/response schema for `/auth/refresh`?
- [ ] **Registration Response**: Does it return tokens (auto-login) or just a success message?

## 2. API Global Standards
- [ ] **Error Schema**: Exact structure of the error response (e.g., FastAPI's 422 vs a custom format).
- [ ] **Wire Case Convention**: `snake_case` vs `camelCase`. (Frontend assumes `snake_case` based on manual examples, but needs confirmation).
- [ ] **ID Format**: UUIDs, integers, or custom strings?

## 3. Module-Specific Schemas
- [ ] **Businesses**: Exact schema for `POST /businesses` (create) and `GET /businesses/{id}` (read).
- [ ] **Profile**: Exact schema for `GET /users/me/profile`.
- [ ] **Finance**: Exact schema for `POST /finance/simulate`, `POST /finance/repayment`, and `GET /finance/{business_id}`.
- [ ] **Feasibility**: Exact schema for the aggregated feasibility response.
- [ ] **Advisor**: Streaming (SSE) vs standard REST for `POST /ai/advisor/chat`.
- [ ] **Reports**: Async tracking mechanism for `POST /reports/generate` and schema for `GET /reports/{id}/status`.
