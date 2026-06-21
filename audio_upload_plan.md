# Implementation Plan - Upload Audio to Cloudinary for Listening Questions

This plan outlines the implementation of a new feature that allows administrators to upload audio files directly to Cloudinary when creating or editing IELTS Listening questions, instead of having to manually copy and paste an external URL.

## User Review Required

> [!NOTE]
> - Cloudinary uploads are signed using a backend API key and secret, keeping credentials secure.
> - The files are uploaded directly from the browser to Cloudinary to prevent backend memory consumption issues.
> - Uploaded audio files are placed in a dedicated folder: `mockea_listening_questions`.

## Proposed Changes

### Backend

Modify the backend to support generating a secure signature for question audio uploads.

#### [MODIFY] [questions.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/questions.controller.js)
- Add a new controller function `getQuestionsUploadSignature` that generates a secure signed signature for uploading files to Cloudinary under the `mockea_listening_questions` folder.

#### [MODIFY] [questions.route.js](file:///g:/project/MOCKEA/backend/src/routes/questions.route.js)
- Register the `GET /upload-signature` endpoint.
- Protect this endpoint with `verifyUserRole(['admin'])` so only admins can request upload signatures for questions.
- Position the route correctly before the `/:id` route handler to prevent route resolution conflicts.

---

### Frontend

Modify the Listening question editor component to include an audio upload interface.

#### [MODIFY] [ContentEditorCard.jsx](file:///g:/project/MOCKEA/frontend/src/components/Dashboard/Admin%20Dashboard/QuestionForm/ContentEditorCard.jsx)
- Import `useState`, `useRef`, `axios`, `toast`, and icons (`PiUploadSimple`, `PiSpinnerGap`, `PiMusicNote`).
- Implement the signed upload flow using `useAxiosSecure` to request the signature, and upload the selected audio file directly to Cloudinary.
- Add an "Upload Audio" button and a hidden file input selector that accepts audio files.
- Add a progress indicator showing the upload completion percentage (e.g. `Uploading (45%)`).
- Display a preview audio player with controls when an `audioUrl` is present, allowing the administrator to test/listen to the uploaded track.
- Add a "Clear" button to easily clear or replace the audio URL.

## Verification Plan

### Automated Tests
Currently, there are no automated tests for Cloudinary uploads, but we can verify endpoint returns by testing manually or checking node server logs.

### Manual Verification
1. Login as an Admin user.
2. Navigate to Admin Dashboard -> Create/Manage Questions.
3. Choose/Create a **Listening** question.
4. Click the "Upload Audio" button, select an `.mp3` or `.wav` file, and observe the upload progress percentage.
5. Verify that:
   - The upload completes successfully.
   - The `audioUrl` input is updated with the returned Cloudinary URL.
   - The audio preview player renders and allows playing the audio.
   - The question saves successfully and playing works on the Student/Practice page.
