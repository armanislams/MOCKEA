# MOCKEA Comprehensive UI/UX Audit & Bug Report

---

## PART 1: UI/UX RECOMMENDATIONS

### Priority 1 — Critical Accessibility

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| 1 | **FlipCard is completely inaccessible on mobile/keyboard** — hover-only flip means pricing CTAs, task descriptions, and CTA cards are unreachable without a mouse. Back-face buttons are invisible to screen readers. | `FlipCard.jsx`, `Pricing.jsx`, `TaskCards.jsx`, `CTASection.jsx` | Add `onClick`/`onKeyDown` toggle for touch/keyboard. Add `aria-hidden="true"` to back face when hidden. Consider a non-flip fallback on mobile. |
| 2 | **No ARIA roles on any tab interface** — Review, ReviewDetail, and ManageSubmissions use tab-like navigation but have no `role="tablist"`, `role="tab"`, or `aria-selected`. | `Review.jsx`, `ReviewDetail.jsx`, `ManageSubmissions.jsx` | Add proper ARIA tab roles or use DaisyUI's `<Tabs>` component. |
| 3 | **SVG chart in Analytics is mouse-only** — interactive circles use `onMouseEnter/Leave` with no keyboard, focus, or ARIA equivalents. Screen readers get no chart data at all. | `Analytics.jsx:207-215` | Add `tabIndex`, `role="img"`, `aria-label` with data values. Add keyboard `onFocus`/`onBlur`. Provide a data table alternative. |
| 4 | **DaisyUI `data-tip` tooltips everywhere** — used in sidebar, admin tables, dashboard. Not accessible to screen readers or keyboard users. | All sidebar components, `ManageUsers.jsx`, `DashboardLayout.jsx` | Replace with DaisyUI popover, or add `aria-label` alongside `title`. |
| 5 | **Dashboard mobile sidebar has no toggle** — The mobile navbar is **commented out** (`DashboardLayout.jsx:64-86`). On screens < `lg`, there's no way to open the sidebar drawer. | `DashboardLayout.jsx:64-86` | Uncomment or rebuild the mobile hamburger toggle. |
| 6 | **No `aria-live` regions for dynamic content** — Loading spinners, toast notifications, password strength, chatbot typing indicator are not announced to screen readers. | `Loader.jsx`, `TableShell.jsx`, `PasswordStrengthIndicator.jsx`, `StudyBuddyChatbot.jsx` | Add `role="status"` + `aria-live="polite"` to loaders; `role="alert"` to errors; `aria-live` to strength meter. |
| 7 | **Testimonials carousel auto-plays at 200ms** — slides change every 0.2s, violating WCAG 2.2.2 (Pause, Stop, Hide). Users can't read content. Duplicated items (6 instead of 3) confuse screen readers. | `Testimonials.jsx:50,75` | Slow to 5000ms+, add pause button, remove duplicated items. |
| 8 | **Password toggle buttons lack `aria-label`** — Login and Register show/hide password buttons have no accessible name. | `Login.jsx:171-181`, `Register.jsx` | Add `aria-label="Show password"` / `"Hide password"`. |
| 9 | **HoverActions buttons have no accessible names** — admin action buttons (edit, delete, view) rely solely on `title` which screen readers don't reliably read. | `HoverActions.jsx:20,29,38` | Add `aria-label="Edit"`, `aria-label="Delete"`, etc. |
| 10 | **No skip-to-content link** — keyboard users must tab through the entire navbar on every page. | `HomeLayout.jsx`, `DashboardLayout.jsx` | Add `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>`. |

### Priority 2 — UX Anti-Patterns & Broken Flows

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| 11 | **Footer links are not clickable** — "About", "Features", "Pricing", etc. are plain `<li>` text, not `<a>` tags. Newsletter subscribe button does nothing. Social icons aren't linked. | `Footer.jsx:21-59` | Wrap in `<a>` tags with real routes. Wire up newsletter form. Link social icons. |
| 12 | **"Forgot Password?" links to `#`** — shows a toast instead of actually working. | `Login.jsx:147-151` | Implement Firebase `sendPasswordResetEmail` or remove the link. |
| 13 | **Terms of Service / Privacy Policy links are dead `href="#"`** | `Login.jsx:231-237`, `Register.jsx:324-330` | Create actual pages or link to external policy pages. |
| 14 | **ManageMockTests shows hardcoded fake data** — "124 Students attempted" and avatar badges "U1"/"U2"/"U3" are static. The edit button does nothing (`onEdit={() => {}}`). | `ManageMockTests.jsx:112,120-128` | Fetch real data or remove the placeholders. Remove or implement the edit button. |
| 15 | **CreateMockTest allows empty test submission** — only validates `title`, not that at least one question is selected per section. | `CreateMockTest.jsx:69-72` | Validate that each section has at least one question selected. |
| 16 | **"Targeted Practice is coming soon!" button** — a button that shows a toast is a UX trap. | `DashboardHome.jsx:426` | Either disable it visually or don't render it until the feature exists. |
| 17 | **Practice.jsx stopwatch never pauses/resets** — runs forever even after submission. | `Practice.jsx:94-99` | Pause when audio is paused; reset on submit. |
| 18 | **`dangerouslySetInnerHTML` without visible sanitization** — used for passages (Reading), writing prompts, instructor feedback (ReviewDetail), question previews (ManageQuestions). | `Reading.jsx:217`, `Writing.jsx:26-55`, `ReviewDetail.jsx:230-239`, `ManageQuestions.jsx:300` | Use DOMPurify or the project's `convertMarkdownContentToHtml` with explicit sanitization. Sanitize at the API level too. |

### Priority 3 — Visual Consistency & Responsiveness

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| 19 | **Hardcoded colors bypass the theme** — `bg-[#FAF9F6]`, `text-[#000f38]`, `bg-[#FDFDFB]`, `text-[#001529]`, `bg-red-800`, `IoAnalytics color="red"` used as inline styles. | `LandingStack.jsx`, `CoursesPage.jsx`, `Pricing.jsx`, `HowItWorks.jsx` | Map to DaisyUI theme tokens or Tailwind config custom colors. |
| 20 | **GSAP + Framer Motion double animation system** — `LandingStack` uses GSAP ScrollTrigger while `Pricing`, `CoursesPage` use Framer Motion. Increases bundle and creates inconsistency. | `LandingStack.jsx`, multiple home components | Pick one animation library. Refactor GSAP animations to Framer Motion's `useInView`/`whileInView`. |
| 21 | **GSAP ScrollTrigger memory leak** — no cleanup in `useEffect`. Instances are never killed on unmount. | `LandingStack.jsx:20-99` | Return a cleanup function that kills all ScrollTrigger instances. |
| 22 | **Fixed pixel heights break on different viewports** — Pricing flip cards `height: 480px`, TaskCards `height: 260px`. Content overflows on small screens. | `Pricing.jsx`, `TaskCards.jsx` | Use `min-height` instead of `height`, or use `aspect-ratio`. |
| 23 | **`<a>` instead of `<Link>` in SPA** — `Hero.jsx:42` uses `<a href="/#testFormats">` causing full reload. `CoursesPage.jsx:131` links to register with `<a>`. | `Hero.jsx`, `CoursesPage.jsx` | Use React Router `<Link>` or `<HashLink>`. |
| 24 | **Dark mode classes exist but may be dead** — `dark:` Tailwind classes used in `TableShell`, `Analytics`, `PageHeader` alongside DaisyUI class-based theming. | Multiple files | Verify dark mode is configured. If using DaisyUI's class strategy, replace `dark:` with `[data-theme="dark"]` or DaisyUI utility classes. |
| 25 | **`mt-15` is non-standard Tailwind** — `Footer.jsx:6` uses `mt-15` which isn't in default Tailwind config. | `Footer.jsx:6` | Use `mt-[60px]` or define `15` in the spacing config. |

### Priority 4 — User Feedback & Loading States

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| 26 | **No error state for failed data fetches** — `DashboardHome.jsx` (3 queries), `Review.jsx` (2 queries), `Analytics.jsx`, `TestEnvironment.jsx` all have no `isError` handling. Failed queries show blank/default data with no retry option. | Multiple files | Add `isError`/`error` checks to all `useQuery` calls. Show error UI with retry. |
| 27 | **DashboardLayout renders blank on error** — `if (isError) return null;` | `DashboardLayout.jsx:36-37` | Show an error message with a retry/logout button. |
| 28 | **TableShell shows spinner only** — no skeleton loading for data-heavy tables. Abrupt transition from spinner to full table. | `TableShell.jsx` | Add skeleton rows while loading. |
| 29 | **No audio error handling in Listening** — Howler.js `onloaderror`/`onplayerror` callbacks are not handled. If audio fails to load, the user sees a broken player. | `Listening.jsx` | Add error state with retry when audio fails. |
| 30 | **Login `loading` state gets stuck** — if `register`, `signIn`, `signInGoogle` throw, `setLoading(true)` is called but never resets to `false`. UI shows infinite spinner. | `AuthProvider.jsx:24-48` | Wrap auth calls in try/catch and call `setLoading(false)` in the catch block. |

---

## PART 2: BUG & CODE QUALITY REPORT

### Critical Bugs

| # | File:Line | Description | Impact |
|---|-----------|-------------|--------|
| 1 | `Speaking.jsx:907` | `isFullscreen` is passed to `TestShell` but is never defined in this component. Will cause a runtime error or always pass `undefined`. | Test integrity broken — fullscreen checks may not work. |
| 2 | `TestEnvironment.jsx:151` | Toast says `"Moving to undefined section"` when `currentModuleIdx` is 3 (Speaking, last section). The array `['Reading', 'Writing', 'Speaking']` doesn't account for the final section. | Misleading UX message on test completion. |
| 3 | `Listening.jsx:148` | `setIsPlaying(!isPlaying)` uses stale closure value. Rapid toggles invert the play state. | Audio play/pause becomes out of sync. |
| 4 | `MockTest.controller.js:196-197` | `tabSwitches` and `fullscreenExits` from `req.body` are stored without validation. Negative values decrement anti-cheat counters. | Students can bypass the integrity system entirely. |
| 5 | `Chatbot.controller.js:189-203` | Chatbot usage count increment is non-atomic (`read → increment → save`). Two concurrent requests both read the same count, both save the same incremented value. | Daily chatbot quota can be bypassed with parallel requests. |
| 6 | `User.controller.js:13-201` | **No try-catch blocks in ANY handler.** DB errors cause unhandled rejections that crash the server or hang requests. | Server instability under error conditions. |
| 7 | `User.controller.js:44-47` | User search parameter interpolated into `$regex` without escaping. Input like `(.*` causes catastrophic backtracking (ReDoS). | Potential server freeze / DoS. |
| 8 | `MockTest.controller.js:401,411` | `req.body` passed directly to model constructor / `findByIdAndUpdate`. Allows field injection (`_id`, `__v`, internal fields). | Data integrity compromise; privilege escalation. |
| 9 | `AuthProvider.jsx:24-48` | `loading` state never resets on auth errors — `setLoading(true)` called in `register`/`signIn`/`signInGoogle` but `setLoading(false)` only fires in `onAuthStateChanged`. On error, `onAuthStateChanged` never fires. | UI stuck on infinite loading spinner after failed login. |
| 10 | `Practice.jsx:41` | `audio.currentTime / audio.duration` produces `NaN` or `Infinity` when `duration` is `0` or `NaN` (before metadata loads). | Progress bar breaks visually. |

### High-Severity Bugs

| # | File:Line | Description | Impact |
|---|-----------|-------------|--------|
| 11 | `AutoLogout.jsx:31-44` | Side effects (`clearInterval`, `logOut()`) inside a React state updater function (`setTimeLeft`). React state updaters must be pure. | Unpredictable behavior in StrictMode; potential double-fire. |
| 12 | `AutoLogout.jsx:34-40` | Event listeners (`mousemove`, `keydown`, etc.) are never removed after the interval clears. Memory leak persists until full unmount. | Accumulated event listeners leak memory. |
| 13 | `Speaking.jsx:157-160` | `URL.createObjectURL` is never revoked. Each recording creates a blob URL that stays in memory forever. | Memory leak proportional to number of recordings. |
| 14 | `ManageUsers.jsx:275` | `banMutation.onSuccess` receives the pre-toggle `isBanned` value. Toast says "Banned!" when unbanning and vice versa. | Misleading admin feedback. |
| 15 | `Register.jsx:44-97` | After Firebase registration succeeds but backend registration fails, the user exists in Firebase but not the DB. No rollback. | Orphaned auth accounts; user can't log in. |
| 16 | `apiRateLimiter.js:1` | `ipRequestHistory` Map grows unboundedly — entries are never evicted. | Memory leak on the server over time. |
| 17 | `apiRateLimiter.js:10-11` | `x-forwarded-for` is client-spoofable. Each spoofed IP gets its own rate limit bucket. | Rate limiting completely bypassed. |
| 18 | `cache.js:7` | In-memory cache only evicts on read (lazy). Never-read expired keys remain forever. | Memory leak. |
| 19 | `Reading.jsx:217`, `Writing.jsx:26-55` | `dangerouslySetInnerHTML` with `DOMParser` (no sanitization). Content comes from admin-uploaded data but could contain scripts if admin account is compromised. | Stored XSS vulnerability. |
| 20 | `connectDB.js:14-16` | On connection failure, error is caught and logged but not re-thrown properly. Process becomes a zombie — consuming resources without serving requests. | Server appears running but is non-functional. |
| 21 | `aiService.js:122` | Gemini API key passed as URL query parameter. Appears in server/proxy logs. | API key exposure in logs. |
| 22 | `index.js:26-34` | If `CLIENT_URL`/`DEV_URL` are undefined, `allowedOrigins.includes(undefined)` is true for requests with no `Origin` header. CORS bypassed entirely. | Any server-to-server request bypasses CORS. |
| 23 | `Chatbot.controller.js:189-203` | No limit on `messages` array length. Client can send thousands of messages per request. | Unbounded Gemini API costs. |
| 24 | `ErrorBoundary.jsx:17-21` | `componentStack` not passed to error logger. Valuable debugging info dropped. | Harder to debug production errors. |

### Medium-Severity Bugs

| # | File:Line | Description | Impact |
|---|-----------|-------------|--------|
| 25 | `useAxiosSecure.jsx:8-10` | Module-level singleton with interceptor ejection. Multiple component mount/unmount cycles can leave the shared instance without interceptors. | Requests may fail silently without auth tokens. |
| 26 | `Reading.jsx:511` | `result?.evaluatedAnswers.find()` — `evaluatedAnswers` can be `undefined`. Missing `?.` chain. | Runtime crash on specific result states. |
| 27 | `TestEnvironment.jsx:27-57` | `JSON.parse(cached)` from localStorage without try/catch. Corrupted data crashes the component on mount. | Component crash on corrupted localStorage. |
| 28 | `Login.jsx:63` | Error message matched with `==` against a hardcoded Firebase string. Firebase error messages can change between SDK versions. | Error handling breaks after Firebase SDK update. |
| 29 | `Login.jsx:33` | `setTimeout(async () => {...}, 500)` — async callback errors are silently swallowed. | Silent failures in post-login logic. |
| 30 | `Practice.jsx:65-83` | `audioRef.current.pause()`/`.play()` called without null check. Throws if ref isn't set yet. | Runtime crash during initial render. |
| 31 | `Practice.jsx:301` | `spellCheck="false"` is a string (truthy). Should be `spellCheck={false}`. | Spellcheck is actually enabled despite the intent to disable it. |
| 32 | `mockTest.controller.js:229` | `originalQ.correctAnswer.toLowerCase().trim()` — throws TypeError if `correctAnswer` is undefined/null (essay questions). | Server crash on essay-type question evaluation. |
| 33 | `errorHandler.js:65` | Full error object (stack traces, internal paths) leaked to client when `NODE_ENV === "development"`. | If env var misconfigured in prod, sensitive data is exposed. |
| 34 | `submissions.controller.js:160-179` | Lock acquisition is check-then-act without atomicity. Two instructors can both pass the lock check. | Double-grading race condition. |
| 35 | `analytics.controller.js:69` | `totalQuestions += 40` hardcodes 40 questions per section regardless of actual count. | Accuracy percentages are miscalculated. |
| 36 | `sanitize.js:18` | Regex for `javascript:` URIs requires quotes. `<a href=javascript:alert(1)>` (unquoted) bypasses the filter. | XSS bypass. |
| 37 | `questions.controller.js:131` | `sort(() => 0.5 - Math.random())` is a biased shuffle. Not uniformly distributed. | Question randomization is unfair. |
| 38 | `Pricing.jsx:94` | `<style>` tag injected inside component. `stylesInjected` flag prevents re-injection, but the CSS selectors are global (`.fc-root`). | Potential CSS conflicts if class names collide. |
| 39 | `DashboardLayout.jsx:36-37` | `if (isError) return null;` — renders blank page on auth/user fetch error. | User sees a white screen with no explanation. |
| 40 | `ErrorBoundary.jsx:90` | `error.message` displayed to users. May contain sensitive internal paths or stack traces. | Information disclosure. |

### Code Quality Issues

| # | Issue | Where |
|---|-------|-------|
| 41 | **`parseFeedback` is duplicated** across `DashboardHome.jsx`, `Review.jsx`, `ReviewDetail.jsx`, and `GradeSubmissions.jsx`. Extract to `utils/`. |
| 42 | **~30+ `console.log`/`console.warn`/`console.error`** left in production code. `Speaking.jsx` alone has 20+. Use the project's `errorLogger.js` utility instead. |
| 43 | **4+ components with 700-1478 lines** — `Speaking.jsx` (1478), `GradeSubmissions` (1180), `ManageSubmissions` (~900), `TestEnvironment` (671). Should be decomposed. |
| 44 | **Hardcoded values** — `StudyBuddyChatbot.jsx:335` ("Powered by Gemini 2.5 Flash"), `ManageMockTests.jsx:89` (165), `Footer.jsx:64` (2026), `Practice.jsx:29` (external CDN URL). |
| 45 | **No pagination on admin list views** — ManageUsers, ManageQuestions, ManageSubmissions, ManageMockTests all load entire datasets. Will be slow at scale. |
| 46 | **React Query v5 API not used consistently** — `invalidateQueries(["key"])` should be `invalidateQueries({ queryKey: ["key"] })`. `ManageSubmissions.jsx:84,99`. |
| 47 | **Instructor reuses admin's `ManageResources` component** (`router.jsx:270-275`). If it contains admin-only API calls, this is a privilege escalation risk. Verify role checks inside the component. |
| 48 | **`useAxios` and `useAxiosSecure` both handle 429 rate-limit responses** with different code — DRY violation. Extract to a shared interceptor. |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Critical bugs | 10 |
| High-severity bugs | 14 |
| Medium-severity bugs | 16 |
| Accessibility issues | 10 |
| UX anti-patterns | 8 |
| Code quality issues | 8 |
| **Total actionable items** | **66** |

---

## Recommended Fix Order

1. **Critical bugs** (#1-10) — runtime crashes and security vulnerabilities
2. **AuthProvider loading bug** (#9) — affects every user on failed login
3. **Anti-cheat bypass** (#4) — exam integrity
4. **Backend missing try-catch** (#6) — server stability
5. **Accessibility criticals** (flip cards, tabs, chart) — largest UX impact
6. **Footer/broken links** — visible to all visitors
