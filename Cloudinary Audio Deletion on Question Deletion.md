# Cloudinary Audio Deletion on Question Deletion

This plan details the steps to automatically delete associated audio files from Cloudinary when an admin deletes a question from the MongoDB database.

## User Review Required

> [!IMPORTANT]
> The admin must configure three new keys in their backend `.env` file for the Cloudinary API connection to work:
> ```env
> CLOUDINARY_CLOUD_NAME=your_cloud_name
> CLOUDINARY_API_KEY=your_api_key
> CLOUDINARY_API_SECRET=your_api_secret
> ```

## Proposed Changes

---

### Backend Components

#### [MODIFY] [package.json](file:///g:/project/MOCKEA/backend/package.json)
- Add `"cloudinary": "^2.2.0"` dependency.

#### [MODIFY] [questions.controller.js](file:///g:/project/MOCKEA/backend/src/controllers/questions.controller.js)
- Import `cloudinary` SDK.
- Configure it using backend `.env` environment variables.
- Update `deleteQuestion` to check if `audioUrl` belongs to Cloudinary.
- Extract the public ID from the URL using a regex.
- Request Cloudinary to delete the asset asynchronously before removing the question record from MongoDB.

---

## Verification Plan

### Automated Tests
1. Install backend dependencies:
   ```bash
   npm install
   ```
2. Verify that the server starts successfully without compilation or import errors.

### Manual Verification
1. Upload an audio file to Cloudinary and paste the URL when creating a Listening question in the Admin Dashboard.
2. Delete the question from the admin panel.
3. Check the backend server console log for the `Deleting Cloudinary audio with public ID` notification.
4. Verify in the Cloudinary dashboard console that the corresponding audio file has been permanently removed.
