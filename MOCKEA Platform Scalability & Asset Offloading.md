# Implementation Plan: MOCKEA Platform Scalability & Asset Offloading

This plan addresses backend clustering, database caching, and secure direct-to-cloud file uploads to improve scalability, reliability, and security as user traffic increases.

## User Review Required

> [!IMPORTANT]
> - **Redis Dependency:** We will add the standard `redis` Node library. The caching system is designed with a **fail-safe local in-memory fallback**. If `REDIS_URL` is not provided in `.env` or the Redis server goes offline, the app automatically and transparently falls back to in-memory caching without crashing.
> - **Cloudinary signed uploads:** We will transition from public unsigned frontend uploads to secure backend-signed uploads. The frontend will fetch a one-time signature from the backend before uploading audio directly to Cloudinary.

## Open Questions

> [!NOTE]
> No immediate blockers. We will default to storing speaking responses in the `mockea_speaking_submissions` Cloudinary folder.

---

## Proposed Changes

We will introduce a clustering configuration, a new caching utility, and secure signature routes on the backend, while refactoring frontend audio upload scripts.

### 1. PM2 Clustering Configuration

#### [NEW] [ecosystem.config.cjs](file:///g:/project/MOCKEA/backend/ecosystem.config.cjs)
- Create a PM2 clustering configuration file to spin up multiple backend processes running in `cluster` mode across all available logical CPU cores.

---

### 2. Redis Caching Layer

#### [MODIFY] [package.json](file:///g:/project/MOCKEA/backend/package.json)
- Add standard `redis` dependency.

#### [NEW] [cache.js](file:///g:/project/MOCKEA/backend/src/utils/cache.js)
- Implement caching client with Redis support and automatic local in-memory `Map` caching fallback if Redis is unavailable.

#### [MODIFY] [questions.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/questions.controller.js)
- Cache individual question set queries (`getQuestionById`) under `question:${id}` (e.g. for IELTS reading/listening passages).
- Invalidate cache entries when question sets are updated or deleted.

#### [MODIFY] [mockTest.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/mockTest.controller.js)
- Cache full mock test layouts (`getMockTestById`) under `mocktest:${id}` to save massive `.populate()` database queries.
- Invalidate cache entries when mock test configurations are updated or deleted.

---

### 3. Direct-to-Cloud Upload Gating

#### [MODIFY] [submissions.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/submissions.controller.js)
- Add the `getUploadSignature` controller which signs a unique timestamp and folder target using the backend's `CLOUDINARY_API_SECRET`.

#### [MODIFY] [submissions.route.js](file:///g:/project/MOCKEA/backend/src/routes/submissions.route.js)
- Add the `GET /upload-signature` endpoint, protected by `verifyUserToken`.

#### [MODIFY] [Speaking.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Student%20Dashboard/Speaking/Speaking.jsx)
- Refactor `uploadToCloudinary` to request a secure signature from the backend first, then upload the audio blob directly to Cloudinary using signed parameters.

#### [MODIFY] [SpeakingSection.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Student%20Dashboard/FullMockTest/SpeakingSection.jsx)
- Apply the same signed direct upload refactoring to the mock exam speaking simulator.

---

## Verification Plan

### Automated Tests
- Run `node src/index.js` on the backend to verify that Mongoose schemas compile, packages import correctly, and the server starts.

### Manual Verification
- **Clustering:** Run `pm2 start ecosystem.config.cjs` locally and check process lists (`pm2 list`) to verify instances cluster cleanly.
- **Cache Hits & Misses:** Verify query resolution speeds on cached mock tests and question sets.
- **Signed Uploads:** Attempt to submit a speaking recording, inspect network requests to verify that the request uses signed credentials (`signature` and `timestamp`) instead of client-visible presets, and verify the file saves to Cloudinary.
