# VentureRoot — API Contract Gaps

> **Purpose**: This document contains ONLY unresolved questions that require answers from the respective teams before API integration can begin.
> **Last Updated**: 2026-08-29
> **Related**: [MASTER-API-CONTRACT.md](./MASTER-API-CONTRACT.md)

---

## CRITICAL FINDING

> [!CAUTION]
> **No backend, ML service, database, or OpenAPI specification exists in the repository.**
> The repository contains ONLY the `frontend/` directory.
> ALL questions below are blockers for real API integration.

---

## BACKEND QUESTIONS

### Authentication

1. **What is the exact login response schema?**
   - Field name for access token: `access_token`? `token`? `accessToken`?
   - Is a refresh token included in login response?
   - Is the refresh token sent as httpOnly cookie or in response body?
   - Token type: JWT? Opaque? What signing algorithm?
   - Access token expiry duration?
   - Refresh token expiry duration?

2. **Does the backend accept `rememberMe` in the login request?**
   - Frontend sends it. Does backend use it to extend token expiry?

3. **What is the exact register response?**
   - Does register auto-login (return tokens)?
   - Or does it return a success message requiring separate login?
   - Is email verification required?

4. **How does token refresh work?**
   - `POST /auth/refresh` — request body or cookie-based?
   - What happens when refresh token expires?

5. **What is the exact `GET /auth/me` response?**
   - Which user fields are returned?
   - Is `role` a single value or array?

### Case Convention

6. **Does the backend use `snake_case` for all JSON field names?**
   - The team manual shows `snake_case` in API examples
   - Frontend uses `camelCase` in TypeScript
   - Who is responsible for the transform?

### Error Handling

7. **Is there a standardized error response schema?**
   - Proposed: `{ detail, error_code, errors[] }` — approved?
   - FastAPI default 422 validation error format — kept or customized?

8. **Does the backend distinguish between 401 (unauthenticated) and 403 (unauthorized)?**

### IDs

9. **What ID format is used?**
   - UUID v4? Auto-increment integer? Custom prefix strings?
   - Is `location_id` the same as `village_id`, or a separate concept?

### Business Logic

10. **What is the exact `POST /businesses` request schema?**
    - Frontend form fields: `categoryId`, `state`, `district`, `block`, `village`, `availableMargin`, `existingResources`, `expectedRevenue`
    - Does backend accept these directly, or require a `location_id` reference instead?

11. **What are the possible `business.status` values?**
    - Frontend assumes: `"Draft" | "Analyzing" | "Ready"`
    - Backend may have additional states?

12. **How does `POST /businesses/{id}/duplicate` work?**
    - Returns new business ID? Full business object?

### Finance

13. **What is the exact request/response schema for `POST /finance/calculate`?**
14. **What is the exact request/response schema for `POST /finance/structure`?**
    - Manual example provided, but is it the final schema?
15. **What is the exact request/response schema for `POST /finance/simulate`?**
    - Frontend expects: best/expected/worst case scenarios + risk assessment
16. **What is the exact response schema for `POST /finance/repayment`?**
    - Frontend expects quarterly breakdown: `{ period, principal, interest, isMoratorium }`
    - Is it quarterly or monthly?
17. **What is `POST /finance/scheme-match` vs `POST /schemes/match`?**
    - Are these the same endpoint or different?

### Schemes

18. **What is the scheme data model?**
    - Name, description, eligibility criteria, benefits, documents, constraints?
19. **What is the `POST /schemes/{id}/eligibility` request/response?**

### Feasibility

20. **Is `POST /feasibility/{business_id}/generate` synchronous or asynchronous?**
    - If async: What is the job tracking mechanism?
    - Does it return a `job_id`?
    - How does frontend poll for completion?
21. **Does `GET /feasibility/{business_id}` return ALL feasibility sections in one response?**
    - Or must the frontend call each sub-endpoint separately?
22. **What is the `GET /feasibility/{business_id}/score` response?**
    - Single number? Object with breakdown?

### Reports

23. **Is report generation asynchronous?**
    - Frontend has a multi-stage generation UI suggesting yes
24. **What is the download format?** PDF? DOCX?
25. **What is the content type for `GET /reports/{id}/download`?**

### Locations

26. **What is the response schema for `GET /locations/states`?**
    - `[{ id, name, code? }]`?
27. **Does `GET /locations/search?q=` return all hierarchy levels?**
28. **What data does `GET /locations/{id}/statistics` return?**
    - Population? Income? Industry data? Demographics?

### Pagination

29. **What pagination format does the backend use?**
    - Offset/limit? Page/page_size? Cursor?
30. **Which list endpoints support pagination?**
    - `GET /businesses`?
    - `GET /schemes`?
    - `GET /reports`?

### Reviews

31. **Are there review-specific API endpoints?**
    - The frontend has review UI (approve/reject/modify) but no API hooks
    - Expected: `POST /reviews/{business_id}/submit`, `GET /reviews`, etc.?

### Admin

32. **Are there admin CRUD endpoints?**
    - The frontend has admin sections for: Categories, Geography, Knowledge Base, Schemes, AI Oversight
    - Each section currently shows placeholder content
    - Expected: Full CRUD endpoints for each admin section?

---

## ML QUESTIONS

### Infrastructure

33. **What is the ML service URL/port?**
34. **Is the ML service a separate process/container?**
35. **What framework is used?** (Flask? FastAPI? gRPC?)

### Models

36. **What ML models are used?**
    - Demand prediction model
    - Price prediction model
    - Revenue prediction model
    - Risk prediction model
    - Feasibility scoring model
    - Market opportunity model

37. **What are the input features for each model?**
38. **What is the output schema for each model?**
39. **How is confidence/evidence generated?**
    - Is confidence a model output or a heuristic?
    - What determines FACT vs ESTIMATE vs PREDICTION vs UNKNOWN?

40. **What is the expected latency for ML predictions?**
41. **What happens when the ML service is unavailable?**
    - Does the backend return a degraded response?
    - Or does it return a 503?

---

## AI/RAG QUESTIONS

### LLM

42. **Which LLM is used?** Gemini? Which version?
43. **Is the Gemini API key managed by backend or ML service?**
44. **Is the advisor chat streaming (SSE) or standard REST?**

### RAG

45. **What vector store is used?** (Pinecone? Chroma? Weaviate? FAISS?)
46. **What documents are indexed?**
    - Government scheme documents?
    - Market research reports?
    - Industry benchmarks?
47. **What embedding model is used?**
48. **What is the chunking strategy?**

### Chat

49. **Does the advisor track conversation history?**
    - Is there a `conversation_id`?
    - How many messages are kept in context?
50. **Does the advisor accept a `language` parameter?**
    - Frontend supports `en`, `bn`, `hi`
51. **What is the maximum input message length?**
52. **Is the advisor context-aware of the user's business data?**
    - Does `businessId` in the request pull business context automatically?

### Knowledge

53. **What is the `POST /knowledge/search` request schema?**
54. **What is the `POST /knowledge/query` request schema?**
55. **What citation/source information is returned?**

---

## FRONTEND QUESTIONS

56. **Should the frontend implement `camelCase ↔ snake_case` transforms in the Axios interceptor?**
    - Or should the backend use Pydantic `alias_generator` to accept camelCase?

57. **Should the frontend use `openapi-typescript-codegen` once the backend publishes OpenAPI?**
    - Or continue with manual TypeScript types?

58. **How should the frontend handle offline/degraded mode?**
    - Cache recent data?
    - Show stale data with indicator?

---

## ARCHITECTURE QUESTIONS

59. **Database choice?**
    - PostgreSQL? MySQL? SQLite (dev)? MongoDB?

60. **Deployment architecture?**
    - Docker Compose? Kubernetes? Vercel (frontend) + Railway/Render (backend)?

61. **Environment configuration?**
    - `.env` structure for backend?
    - Required environment variables?

62. **File storage?**
    - Report PDFs stored where? S3? Local filesystem? GCS?

63. **Monitoring and logging?**
    - Backend error tracking? (Sentry?)
    - API request logging?

64. **CI/CD pipeline?**
    - Automated testing?
    - OpenAPI validation?

65. **WebSocket / SSE support?**
    - Required for streaming chat?
    - Any other real-time features?
