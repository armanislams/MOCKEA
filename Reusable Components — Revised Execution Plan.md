# Reusable Components — Revised Execution Plan

## Decisions Applied

| Question | Decision |
|---|---|
| Q1 — Merge Add + Edit form? | ✅ **Yes — merge into `QuestionSetForm`** (if build passes, keep merged) |
| Q2 — All at once or one by one? | ✅ **One tier at a time** — each phase is approved before the next begins |
| Q3 — `useAdminQuery` options? | ✅ **Scalable** — accept a full `options` pass-through for `staleTime`, `gcTime`, `retry`, etc. |

> [!IMPORTANT]
> After each phase, `npm run build` must pass with **zero errors**. The admin form pages must be manually verified to work before proceeding.

---

## Phase 1 — Tier 1: Merge AddQuestionForm + EditQuestionForm

**Goal:** Replace two ~57KB files (700+ duplicated lines) with a single `QuestionSetForm` component backed by 8 shared sub-components.

**Strategy:** Extract shared pieces first, then merge. This way if the merge fails, the sub-components are still useful.

---

### Step 1.1 — Extract shared constants & factories

#### [NEW] `src/components/Dashboard/Admin Dashboard/QuestionForm/questionFormConstants.js`

Exports everything that is currently copy-pasted verbatim in both files:
- `TEST_SECTIONS` array
- `QUESTION_TYPE_GROUPS` grouped select options
- `ALL_QUESTION_TYPES` flat list
- `NEEDS_OPTIONS`, `NEEDS_PAIRS`, `NEEDS_IMAGE` sets
- `LISTENING_PARTS` array
- `makeQuestion()` factory function
- `initialForm()` factory function

---

### Step 1.2 — Extract shared sub-components

#### [NEW] `QuestionForm/QuestionTypeFields.jsx`
- `QuestionTypeSelect` — grouped `<select>` for question type
- `QuestionTypeExtras` — renders MCQ options, matching pairs, or image URL based on type

Currently defined identically at the top of both `AddQuestionForm.jsx` and `EditQuestionForm.jsx`.

---

#### [NEW] `QuestionForm/TestSectionPicker.jsx`
```jsx
// Props: value, onChange, locked (bool — EditQuestionForm locks the section)
<TestSectionPicker value={testType} onChange={setTestType} locked={false} />
```

---

#### [NEW] `QuestionForm/ListeningPartSelector.jsx`
```jsx
// Props: value, onChange — only shown when isIeltsListening
<ListeningPartSelector value={listeningPart} onChange={...} />
```

---

#### [NEW] `QuestionForm/ListeningInlineGuide.jsx`
Renders the ~78-line static guide info box (step cards + markdown template) that appears for Listening Part 3/4. Pure display, no props needed.

---

#### [NEW] `QuestionForm/GeneralInfoCard.jsx`
```jsx
// Props: formData, patch (partial update fn)
<GeneralInfoCard formData={formData} patch={patch} />
```
Renders: Test Title input, Exam Program select (IELTS/PTE/BOTH), Plan Type select, `isPublic` + `isMockOnly` toggles, Global Instructions textarea.

---

#### [NEW] `QuestionForm/ContentEditorCard.jsx`
```jsx
// Props: testType, listeningPart, formData, patch
<ContentEditorCard testType={testType} listeningPart={listeningPart} formData={formData} patch={patch} />
```
Renders the conditional content block: reading passage, listening audio + notes, writing task 1/2, speaking part 1/2/3 questions.

---

#### [NEW] `QuestionForm/QuestionsBuilderCard.jsx`
```jsx
// Props: testType, questions, onAdd, onRemove, onUpdate
<QuestionsBuilderCard testType={testType} questions={formData.questions}
  onAdd={handleAddQuestion} onRemove={handleRemoveQuestion} onUpdate={patchQuestion} />
```
Renders the sub-questions list with add/remove buttons and per-question type fields.

---

### Step 1.3 — Create `QuestionSetForm` (merged component)

#### [NEW] `QuestionForm/QuestionSetForm.jsx`

```jsx
// Props:
//   mode = "add" | "edit"
//   questionId (only needed in edit mode — used to fetch existing data)
//   onSuccess (callback after successful submit)

const QuestionSetForm = ({ mode = "add", questionId }) => { ... }
```

**Logic branching:**
- `mode === "edit"` → runs `useQuery` to fetch existing question set by `questionId`, pre-fills form
- `mode === "add"` → starts with `initialForm()`
- Both → same form UI, different mutation endpoint (`POST /questions/add` vs `PUT /questions/:id`)

Uses `useQuestionFormState` (see step 1.4) for all form state logic.

---

### Step 1.4 — Extract form state hook

#### [NEW] `src/hooks/useQuestionFormState.jsx`

Consolidates the duplicated form state + all helper functions:
```js
useQuestionFormState(initialData)
// returns:
// { formData, setFormData, testType, setTestType, listeningPart, setListeningPart,
//   patch, patchQuestion, handleAddQuestion, handleRemoveQuestion,
//   handleAddOption, updateOption, handleAddPair, updatePair }
```

---

### Step 1.5 — Update routed pages

#### [MODIFY] `src/components/Dashboard/Admin Dashboard/AddQuestionForm.jsx`
Replace entire file body with:
```jsx
import QuestionSetForm from "./QuestionForm/QuestionSetForm";
const AddQuestionForm = () => <QuestionSetForm mode="add" />;
export default AddQuestionForm;
```

#### [MODIFY] `src/components/Dashboard/Admin Dashboard/EditQuestionForm.jsx`
Replace entire file body with:
```jsx
import QuestionSetForm from "./QuestionForm/QuestionSetForm";
const EditQuestionForm = () => {
  const { id } = useParams();
  return <QuestionSetForm mode="edit" questionId={id} />;
};
export default EditQuestionForm;
```

---

### Step 1.6 — Verify Phase 1

- ✅ `npm run build` passes
- ✅ Navigate to `/dashboard/admin/add-questions` — create a new Reading, Listening, Writing, Speaking question set
- ✅ Navigate to `/dashboard/admin/edit-questions/:id` — edit an existing set (all fields pre-filled)
- ✅ Submit both forms successfully
- ✅ Delete a question set from ManageQuestions

> [!CAUTION]
> If the merged form causes any regression during step 1.6, fall back to keeping `AddQuestionForm` and `EditQuestionForm` as separate files that **import** the shared sub-components. The sub-components created in steps 1.1–1.4 are still a big win either way.

---

## Phase 2 — Tier 2: Hooks

**Goal:** Extract 4 reusable custom hooks. No UI changes.

---

### Step 2.1 — `useCountdown`

#### [NEW] `src/hooks/useCountdown.jsx`

```js
// Replaces identical useEffect + fmtTime in: Listening, Reading, Writing, TestEnvironment
useCountdown(initialSeconds, active, submitted)
// returns: { timeLeft, setTimeLeft, fmtTime, resetCountdown }
```

**Scalable design:** `active` is a generic boolean trigger — any condition can be passed in.

Update:
- `[MODIFY] Listening.jsx` — remove `timeLeft` state + `useEffect` + `fmtCountdown` → use hook
- `[MODIFY] Reading.jsx` — remove `timeLeft` state + `useEffect` + `fmtTime` → use hook
- `[MODIFY] Writing.jsx` — remove `timeLeft` state + `useEffect` + `fmtTime` → use hook (pass `timerActive` as `active`)
- `[MODIFY] TestEnvironment.jsx` — remove `timeLeft` state + `useEffect` + formatting helper → use hook

---

### Step 2.2 — `useAnswers`

#### [NEW] `src/hooks/useAnswers.jsx`

```js
// Replaces answers state + handleAnswerChange in: Listening, Reading, TestEnvironment
useAnswers(initial = {})
// returns: { answers, setAnswers, handleAnswerChange, resetAnswers }
```

Update:
- `[MODIFY] Listening.jsx`
- `[MODIFY] Reading.jsx`
- `[MODIFY] TestEnvironment.jsx`

---

### Step 2.3 — `useAdminQuery`

#### [NEW] `src/hooks/useAdminQuery.jsx`

**Scalable design** — accepts a full `options` pass-through object so callers can override `staleTime`, `gcTime`, `retry`, `enabled`, `select`, etc.:

```js
useAdminQuery(queryKey, endpoint, dataKey, options = {})
// options merges on top of sensible defaults:
//   staleTime: 1000 * 60 * 2  (2 min)
//   gcTime:    1000 * 60 * 10 (10 min)
//   retry: 2
// returns: { data, isLoading, isError, refetch, isFetching, queryClient }
```

**Safe adoption:** Each Manage page retains its own `axiosSecure` call — the hook only wraps the `useQuery` boilerplate and the `axiosSecure.get` call. Pages that need custom logic (e.g. `select`, data transformation) can pass `options.select`.

Update:
- `[MODIFY] ManageQuestions.jsx`
- `[MODIFY] ManageMockTests.jsx`
- `[MODIFY] ManageResources.jsx`
- `[MODIFY] ManageTrainers.jsx`
- `[MODIFY] ManageUsers.jsx`
- `[MODIFY] AdminDashboardHome.jsx`

---

### Step 2.4 — `useFormModal`

#### [NEW] `src/hooks/useFormModal.jsx`

```js
// Replaces isModalOpen + formData + handleChange + openModal + closeModal in:
// ManageResources, ManageTrainers
useFormModal(initialState)
// returns: { formData, isOpen, handleChange, openModal, closeModal, setFormData, resetForm }
```

Update:
- `[MODIFY] ManageResources.jsx`
- `[MODIFY] ManageTrainers.jsx`

---

### Step 2.5 — Verify Phase 2

- ✅ `npm run build` passes
- ✅ All 4 practice sections: timer counts down, answers save, submit works
- ✅ All 6 admin Manage pages load data correctly
- ✅ ManageResources and ManageTrainers modals open/close/submit correctly

---

## Phase 3 — Tier 3: UI Components

**Goal:** Extract 6 reusable presentational components. All go in `src/components/Common/`.

---

### Step 3.1 — `StatCard`

#### [NEW] `src/components/Common/StatCard.jsx`

```jsx
<StatCard icon="👥" value={42} label="Total Users" color="text-primary" />
```

Update: `AdminDashboardHome.jsx`, `ManageUsers.jsx` (StatsBar), `ManageTrainers.jsx` (metrics summary)

---

### Step 3.2 — `PageHeader`

#### [NEW] `src/components/Common/PageHeader.jsx`

```jsx
<PageHeader
  eyebrow="Administration"     // optional small label above title
  title="Manage Questions"
  subtitle="Manage all IELTS questions across different sections."
  icon={<PiBookOpen />}
  action={<button>Add Questions</button>}
/>
```

Update: `ManageQuestions.jsx`, `ManageMockTests.jsx`, `ManageTrainers.jsx`, `ManageResources.jsx`

---

### Step 3.3 — `TableShell`

#### [NEW] `src/components/Common/TableShell.jsx`

```jsx
<TableShell
  isLoading={isLoading}
  isError={isError}
  onRetry={refetch}
  emptyIcon={<PiUsersThree />}
  emptyTitle="No users found"
  emptySubtitle="Try adjusting your search or filters"
>
  <table>...</table>
</TableShell>
```

Internally handles the three states: loading spinner, error + retry button, empty state.

Update: `ManageQuestions.jsx`, `ManageUsers.jsx`, `ManageTrainers.jsx`, `ManageResources.jsx`

---

### Step 3.4 — `AdminModal`

#### [NEW] `src/components/Common/AdminModal.jsx`

```jsx
<AdminModal
  isOpen={isModalOpen}
  title="Add New Trainer"
  subtitle="Register a certified mentor"
  onClose={closeModal}
  footer={
    <>
      <button onClick={closeModal}>Cancel</button>
      <button onClick={handleSubmit}>Save</button>
    </>
  }
>
  {/* form content */}
</AdminModal>
```

Handles: `fixed inset-0` backdrop, `rounded-3xl` box, sticky header with `×` button, scrollable body, sticky footer.

Update: `ManageResources.jsx`, `ManageTrainers.jsx`, `ManageQuestions.jsx`

---

### Step 3.5 — `HoverActions`

#### [NEW] `src/components/Common/HoverActions.jsx`

```jsx
<HoverActions
  onView={() => setSelectedQuestion(q)}   // optional
  onEdit={() => navigate(`/edit/${q._id}`)} // optional
  onDelete={() => handleDelete(q._id)}
/>
```

All slots are optional — component only renders buttons that have a handler. Applies the `opacity-0 group-hover:opacity-100` reveal pattern automatically.

Update: `ManageQuestions.jsx`, `ManageMockTests.jsx`, `ManageUsers.jsx`

---

### Step 3.6 — `PracticeSetSelector`

#### [NEW] `src/components/Common/PracticeSetSelector.jsx`

```jsx
<PracticeSetSelector
  sets={listeningSets}
  loading={loading}
  icon={<PiEarFill />}
  gradientClass="from-purple-500 to-indigo-600"
  title="Listening Lab"
  subtitle="Immersive audio comprehension training"
  onSelect={(id) => { setSelectedSetId(id); enterFullscreen(); }}
/>
```

Update: `Listening.jsx`, `Reading.jsx`, `Writing.jsx`, `Speaking.jsx`

---

### Step 3.7 — Verify Phase 3

- ✅ `npm run build` passes
- ✅ All 4 admin Manage pages render correctly (header, table states, modals)
- ✅ All 4 practice sections show the set selection screen correctly
- ✅ AdminDashboardHome stat cards render correctly

---

## Phase 4 — Tier 4: Quick Wins

**Goal:** Consolidate remaining small patterns.

---

### Step 4.1 — Extend `alerts.js` with delete + action helpers

#### [MODIFY] `src/utils/alerts.js`

Add two new exports:
```js
alerts.confirmDelete(itemName)
// Pre-configured red danger dialog — replaces the 8 inline Swal blocks

alerts.confirmAction({ title, text, confirmText, danger = true })
// Generic confirm dialog for any non-delete destructive action

alerts.showSuccess(title, text)
// Replaces the 6 inline Swal success notifications
```

Update all inline `Swal.fire` calls in:
- `ManageQuestions.jsx` (delete confirm + success)
- `ManageMockTests.jsx` (delete confirm + success)
- `ManageResources.jsx` (delete confirm)
- `ManageTrainers.jsx` (delete confirm)
- `ManageUsers.jsx` (4× delete/ban/role/plan confirms + 4× success toasts)
- `Speaking.jsx` (submit confirm)
- `Writing.jsx` (task1 confirm)

---

### Step 4.2 — `getErrorMessage` utility

#### [MODIFY] `src/utils/apiConfig.js`

```js
export const getErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || fallback;
```

Replace `error.response?.data?.message || "fallback"` chains in `ManageResources.jsx` and `ManageTrainers.jsx`.

---

### Step 4.3 — `TestShell` wrapper

#### [NEW] `src/components/Common/TestShell.jsx`

```jsx
<TestShell
  isStarted={isStarted}
  showWarning={showWarning}
  setShowWarning={setShowWarning}
  enterFullscreen={enterFullscreen}
  onEnter={() => setIsStarted(true)}
>
  {/* practice/test UI */}
</TestShell>
```

Internally renders `<FullscreenGate>` + `<FullscreenWarningOverlay>` so pages don't repeat the wrapper JSX.

Update: `Listening.jsx`, `Reading.jsx`, `Writing.jsx`, `Speaking.jsx`, `TestEnvironment.jsx`

---

### Step 4.4 — Verify Phase 4

- ✅ `npm run build` passes
- ✅ All delete/confirm actions in admin pages still trigger correctly
- ✅ Fullscreen gate still activates when starting practice/tests
- ✅ FullscreenWarningOverlay still shows on tab switching

---

## Complete File Manifest

### New files (21 total)

| File | Phase |
|---|---|
| `Admin Dashboard/QuestionForm/questionFormConstants.js` | 1 |
| `Admin Dashboard/QuestionForm/QuestionTypeFields.jsx` | 1 |
| `Admin Dashboard/QuestionForm/TestSectionPicker.jsx` | 1 |
| `Admin Dashboard/QuestionForm/ListeningPartSelector.jsx` | 1 |
| `Admin Dashboard/QuestionForm/ListeningInlineGuide.jsx` | 1 |
| `Admin Dashboard/QuestionForm/GeneralInfoCard.jsx` | 1 |
| `Admin Dashboard/QuestionForm/ContentEditorCard.jsx` | 1 |
| `Admin Dashboard/QuestionForm/QuestionsBuilderCard.jsx` | 1 |
| `Admin Dashboard/QuestionForm/QuestionSetForm.jsx` | 1 |
| `hooks/useQuestionFormState.jsx` | 1 |
| `hooks/useCountdown.jsx` | 2 |
| `hooks/useAnswers.jsx` | 2 |
| `hooks/useAdminQuery.jsx` | 2 |
| `hooks/useFormModal.jsx` | 2 |
| `Common/StatCard.jsx` | 3 |
| `Common/PageHeader.jsx` | 3 |
| `Common/TableShell.jsx` | 3 |
| `Common/AdminModal.jsx` | 3 |
| `Common/HoverActions.jsx` | 3 |
| `Common/PracticeSetSelector.jsx` | 3 |
| `Common/TestShell.jsx` | 4 |

### Modified files (16 total)

| File | Phase |
|---|---|
| `AddQuestionForm.jsx` | 1 |
| `EditQuestionForm.jsx` | 1 |
| `Listening.jsx` | 2 |
| `Reading.jsx` | 2 |
| `Writing.jsx` | 2 |
| `TestEnvironment.jsx` | 2 |
| `ManageQuestions.jsx` | 2+3+4 |
| `ManageMockTests.jsx` | 2+3 |
| `ManageResources.jsx` | 2+3+4 |
| `ManageTrainers.jsx` | 2+3+4 |
| `ManageUsers.jsx` | 2+3+4 |
| `AdminDashboardHome.jsx` | 2+3 |
| `Speaking.jsx` | 3+4 |
| `ListeningSection.jsx` | 3 |
| `utils/alerts.js` | 4 |
| `utils/apiConfig.js` | 4 |
