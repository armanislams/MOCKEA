# Reusable Components — Revised & Extended Execution Plan

This document outlines the step-by-step refactoring plan to consolidate duplicated logic, extract reusable UI components, and build modular hooks across the MOCKEA frontend application.

## Core Decisions & Enhancements Applied
1. **Form Consolidation:** Merge `AddQuestionForm` and `EditQuestionForm` into a unified `QuestionSetForm` component with modular sub-components.
2. **Safe Hydration:** Separate state parsing from rendering. Use key-based mounting (`key={id}`) in Edit Mode to ensure state is initialized only when data is fully loaded.
3. **Flexible Timer Hook:** Update `useCountdown` to accept an `onExpiry` callback for automatic submission.
4. **Hydratable Modals:** Update `useFormModal` to accept existing record data when opening in edit mode.
5. **Configurable Practice Selectors:** Enable `PracticeSetSelector` to support custom empty state text, instructions, and target links.

---

## 🛠️ Part 1: Form Refactoring & Extraction (Unified Question Form)

**Goal:** Replaces two huge, highly duplicated files (~77KB and ~78KB) with a single `QuestionSetForm` component backed by a shared state hook, constant file, and 8 sub-components.

### Step 1.1 — Extract Constants & Factories
#### [NEW] `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/questionFormConstants.js`
Extract all static constants verbatim from `AddQuestionForm.jsx` to prevent duplication:
- `TEST_SECTIONS` array
- `QUESTION_TYPE_GROUPS` select options
- `NEEDS_OPTIONS`, `NEEDS_PAIRS`, `NEEDS_IMAGE` arrays
- `LISTENING_PARTS` array
- `makeQuestion()` factory function
- `initialForm()` factory function

### Step 1.2 — Extract Form State & Parser Hook
#### [NEW] `frontend/src/hooks/useQuestionFormState.jsx`
Extracts state actions, sub-question builders, and options/pairs handlers. Includes a parser utility to reverse-engineer database HTML wrappers back into editable form state (crucial for Edit Mode).
```js
export function useQuestionFormState(initialData = initialForm()) {
  const [formData, setFormData] = useState(initialData);
  // ... exposes: patch, patchQuestion, handleAddQuestion, handleRemoveQuestion,
  // ... handleAddOption, updateOption, handleAddPair, updatePair
  return { formData, setFormData, ... };
}
```

### Step 1.3 — Extract Presentational Sub-components
Extract specific sections of the form into isolated sub-components inside `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/`:
1. **`QuestionTypeFields.jsx`:** Renders the grouped select dropdown and handles conditional rendering for MCQ options, matching pairs, and map image inputs.
2. **`TestSectionPicker.jsx`:** Renders the selection tiles (Reading, Listening, Writing, Speaking). In Edit Mode, locks interaction (`locked={mode === "edit"}`).
3. **`ListeningPartSelector.jsx`:** Dropdown showing Parts 1–4 when Listening is selected.
4. **`ListeningInlineGuide.jsx`:** Static display guide box detailing markdown formats for Part 3/4 notes.
5. **`GeneralInfoCard.jsx`:** Inputs for Title, Exam Program (IELTS/PTE/BOTH), Plan Type (free/premium), public visibility, mock-only status, and Global Instructions.
6. **`ContentEditorCard.jsx`:** Conditional rendering for reading passage, listening audio + notes, writing prompts, or speaking part tasks.
7. **`QuestionsBuilderCard.jsx`:** Handles the nested list of sub-questions, addition/deletion, type selection, and answer inputs.

### Step 1.4 — Build Unified Form Component
#### [NEW] `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/QuestionSetForm.jsx`
Implements the main wrapper layout:
- If `mode === "edit"`, performs a query to fetch the question set by `questionId`.
- Once data is loaded and parsed, it mounts the presentation form using `key={questionId}` to force React to reset state with the fetched content.
- Dynamically selects the query mutation endpoint: `POST /questions/add` vs `PUT /questions/:id`.

### Step 1.5 — Update Route Entries
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/AddQuestionForm.jsx`:** Renders `<QuestionSetForm mode="add" />`
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/EditQuestionForm.jsx`:** Renders `<QuestionSetForm mode="edit" questionId={id} />`

---

## ⚡ Part 2: Custom React Hooks (State & Timer Logic)

**Goal:** Extract 4 reusable state hooks to standardize common user interactions and telemetry across practice interfaces and dashboards.

### Step 2.1 — Timer Hook (`useCountdown`)
#### [NEW] `frontend/src/hooks/useCountdown.jsx`
Manages countdown timing, ticks, formatting, and includes an `onExpiry` callback to trigger actions when the timer reaches 0.
```js
export function useCountdown(initialSeconds, active, submitted, onExpiry) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  // Tick logic: if timeLeft reaches 0, trigger onExpiry()
  // Returns: { timeLeft, setTimeLeft, fmtTime, resetCountdown }
}
```
Update pages:
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/Listening/Listening.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/Reading/Reading.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/Writing/Writing.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/FullMockTest/TestEnvironment.jsx`**

### Step 2.2 — Answer Manager (`useAnswers`)
#### [NEW] `frontend/src/hooks/useAnswers.jsx`
Standardizes the tracking of structured test responses.
```js
export function useAnswers(initial = {}) {
  const [answers, setAnswers] = useState(initial);
  const handleAnswerChange = useCallback((qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  }, []);
  return { answers, setAnswers, handleAnswerChange, resetAnswers: () => setAnswers(initial) };
}
```
Update pages:
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/Listening/Listening.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/Reading/Reading.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/FullMockTest/TestEnvironment.jsx`**

### Step 2.3 — Admin Fetch Wrapper (`useAdminQuery`)
#### [NEW] `frontend/src/hooks/useAdminQuery.jsx`
Bundles authentication axios headers and TanStack Query configs with options pass-through support.
```js
export function useAdminQuery(queryKey, endpoint, dataKey, options = {}) {
  const axiosSecure = useAxiosSecure();
  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axiosSecure.get(endpoint);
      return dataKey ? res.data[dataKey] : res.data;
    },
    staleTime: 120000,
    ...options
  });
}
```
Update pages:
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/ManageQuestions.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/ManageMockTests.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/ManageResources.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/ManageTrainers.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/ManageUsers.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/AdminDashboardHome.jsx`**

### Step 2.4 — Modal Form State (`useFormModal`)
#### [NEW] `frontend/src/hooks/useFormModal.jsx`
Simplifies the boilerplate of opening, closing, modifying, and populating simple forms.
```js
export function useFormModal(initialState) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  
  const openModal = (dataToEdit = null) => {
    setFormData(dataToEdit ? { ...initialState, ...dataToEdit } : initialState);
    setIsOpen(true);
  };
  
  const closeModal = () => {
    setIsOpen(false);
    setFormData(initialState);
  };
  
  return { isOpen, formData, setFormData, openModal, closeModal, handleChange };
}
```
Update pages:
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/ManageResources.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Admin Dashboard/ManageTrainers.jsx`**

---

## 🎨 Part 3: Presentational & UI Components

**Goal:** Create 6 reusable styled components inside `src/components/Common/` to clean up dashboard layouts, modals, and list screens.

### Step 3.1 — Metrics Card (`StatCard`)
#### [NEW] `frontend/src/components/Common/StatCard.jsx`
Standard glassmorphic numeric stat box. Replaces inline flex cards.
Props: `icon`, `value`, `label`, `color`.

### Step 3.2 — Dashboard Header (`PageHeader`)
#### [NEW] `frontend/src/components/Common/PageHeader.jsx`
Standardizes the header sections of all admin screens, providing slots for action buttons, titles, subtitles, and icons.

### Step 3.3 — Loading & Empty State Table Wrapper (`TableShell`)
#### [NEW] `frontend/src/components/Common/TableShell.jsx`
A shell that automatically displays a loading spinner, an error box with retry, or an empty state indicator. If data is successfully loaded, it renders the HTML table passed as `children`.

### Step 3.4 — Unified Overlay Modal (`AdminModal`)
#### [NEW] `frontend/src/components/Common/AdminModal.jsx`
Standardizes dialog overlays with sticky scrollbars, blur backdrops, action footers, and uniform border-radius.

### Step 3.5 — Row Hover Utilities (`HoverActions`)
#### [NEW] `frontend/src/components/Common/HoverActions.jsx`
Extracts action buttons (Edit, View, Delete) that appear on table row hover, reducing duplicate inline JSX.

### Step 3.6 — Modular Set List (`PracticeSetSelector`)
#### [NEW] `frontend/src/components/Common/PracticeSetSelector.jsx`
Standardizes selection views in practice labs. Supports custom empty state properties or slots (`emptyTitle`, `emptySuggestions`, `actionText`, `actionLink`) to adapt content dynamically for Reading, Listening, Writing, or Speaking tracks.

---

## ⚡ Part 4: Telemetry, Alerts & Shell Wrappers

**Goal:** Unify global alerts, API error messages, and browser-safe full-screen anti-cheat layouts.

### Step 4.1 — Alert Helpers
#### [MODIFY] `frontend/src/utils/alerts.js`
Add centralized SweetAlert2 calls:
- `alerts.confirmDelete(itemName)`
- `alerts.confirmAction({ title, text, confirmText, danger })`
- Reuses the existing `alerts.success(title, text)` method instead of creating a new duplicate success alert helper.

### Step 4.2 — Centralized Error Parsing
#### [MODIFY] `frontend/src/utils/apiConfig.js`
Add `getErrorMessage(error, fallback)` to parse nested axios responses consistently.

### Step 4.3 — Anti-Cheat Wrapper Shell (`TestShell`)
#### [NEW] `frontend/src/components/Common/TestShell.jsx`
Wraps the test layouts, encapsulating `<FullscreenGate>` and `<FullscreenWarningOverlay>` so student testing pages don't repeat this layout block.
Update pages:
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/Listening/Listening.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/Reading/Reading.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/Writing/Writing.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/Speaking/Speaking.jsx`**
- **`[MODIFY] frontend/src/components/Dashboard/Student Dashboard/FullMockTest/TestEnvironment.jsx`**

---

## Complete File Manifest

### New files (21 total)

| File Path | Part |
|---|---|
| `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/questionFormConstants.js` | 1 |
| `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/QuestionTypeFields.jsx` | 1 |
| `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/TestSectionPicker.jsx` | 1 |
| `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/ListeningPartSelector.jsx` | 1 |
| `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/ListeningInlineGuide.jsx` | 1 |
| `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/GeneralInfoCard.jsx` | 1 |
| `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/ContentEditorCard.jsx` | 1 |
| `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/QuestionsBuilderCard.jsx` | 1 |
| `frontend/src/components/Dashboard/Admin Dashboard/QuestionForm/QuestionSetForm.jsx` | 1 |
| `frontend/src/hooks/useQuestionFormState.jsx` | 1 |
| `frontend/src/hooks/useCountdown.jsx` | 2 |
| `frontend/src/hooks/useAnswers.jsx` | 2 |
| `frontend/src/hooks/useAdminQuery.jsx` | 2 |
| `frontend/src/hooks/useFormModal.jsx` | 2 |
| `frontend/src/components/Common/StatCard.jsx` | 3 |
| `frontend/src/components/Common/PageHeader.jsx` | 3 |
| `frontend/src/components/Common/TableShell.jsx` | 3 |
| `frontend/src/components/Common/AdminModal.jsx` | 3 |
| `frontend/src/components/Common/HoverActions.jsx` | 3 |
| `frontend/src/components/Common/PracticeSetSelector.jsx` | 3 |
| `frontend/src/components/Common/TestShell.jsx` | 4 |

### Modified files (15 total)

| File Path | Part |
|---|---|
| `frontend/src/components/Dashboard/Admin Dashboard/AddQuestionForm.jsx` | 1 |
| `frontend/src/components/Dashboard/Admin Dashboard/EditQuestionForm.jsx` | 1 |
| `frontend/src/components/Dashboard/Student Dashboard/Listening/Listening.jsx` | 2 + 4 |
| `frontend/src/components/Dashboard/Student Dashboard/Reading/Reading.jsx` | 2 + 4 |
| `frontend/src/components/Dashboard/Student Dashboard/Writing/Writing.jsx` | 2 + 4 |
| `frontend/src/components/Dashboard/Student Dashboard/FullMockTest/TestEnvironment.jsx` | 2 + 4 |
| `frontend/src/components/Dashboard/Admin Dashboard/ManageQuestions.jsx` | 2 + 3 + 4 |
| `frontend/src/components/Dashboard/Admin Dashboard/ManageMockTests.jsx` | 2 + 3 |
| `frontend/src/components/Dashboard/Admin Dashboard/ManageResources.jsx` | 2 + 3 + 4 |
| `frontend/src/components/Dashboard/Admin Dashboard/ManageTrainers.jsx` | 2 + 3 + 4 |
| `frontend/src/components/Dashboard/Admin Dashboard/ManageUsers.jsx` | 2 + 3 + 4 |
| `frontend/src/components/Dashboard/Admin Dashboard/AdminDashboardHome.jsx` | 2 + 3 |
| `frontend/src/components/Dashboard/Student Dashboard/Speaking/Speaking.jsx` | 3 + 4 |
| `frontend/src/utils/alerts.js` | 4 |
| `frontend/src/utils/apiConfig.js` | 4 |
