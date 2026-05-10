# MOCKEA - Comprehensive IELTS Preparation Platform

Welcome to the **MOCKEA** project repository! MOCKEA is a full-stack web application designed to help users prepare for the IELTS exam through interactive practice tests and performance analytics.

## 🚀 Project Overview

MOCKEA provides a robust platform for IELTS test-takers to practice all four modules of the exam: Reading, Listening, Writing, and Speaking. The application offers a user-friendly dashboard to track progress, review past tests, and analyze performance metrics over time.

This project is built using the **MERN** stack (MongoDB, Express.js, React, Node.js) with **Firebase** integration for secure authentication and a modern UI powered by **TailwindCSS**, **DaisyUI**, **Framer Motion**, and **GSAP**.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **Routing:** React Router 7
- **Styling:** TailwindCSS 4, DaisyUI
- **Animations:** Framer Motion, GSAP
- **Audio/Media:** Howler.js (for Listening tests)
- **Form Management:** React Hook Form
- **State/Notifications:** React Toastify
- **Authentication:** Firebase Auth

### Backend
- **Environment:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Security & Auth:** Firebase Admin SDK, CORS
- **Environment Management:** Dotenv
- **Deployment & Hosting:** Vercel

---

## 📂 Project Architecture

The repository is structured as a monorepo containing both the client and server codebases:

```text
MOCKEA/
├── frontend/             # React/Vite Frontend Application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── Layout/       # Page layout structures
│   │   ├── Router/       # Application routing logic
│   │   ├── context/      # React context (e.g., Auth, PrivateRoutes)
│   │   ├── hooks/        # Custom React hooks
│   │   └── index.css     # Global Tailwind styles
│   ├── package.json
│   └── vite.config.js
│
└── backend/              # Node/Express Backend API
    ├── src/
    │   ├── controllers/  # Route logic and request handling
    │   ├── lib/          # Database connection and utilities
    │   ├── middlewares/  # Error handlers, auth verification
    │   ├── model/        # Mongoose database schemas
    │   ├── routes/       # Express route definitions
    │   └── index.js      # Server entry point
    ├── package.json
    └── vercel.json       # Vercel deployment configuration
```

---

## ✨ Key Features

1. **User Authentication:** Secure login and registration using Firebase Authentication.
2. **Interactive Dashboard:** A centralized hub for users to view their progress, access tests, and manage their profiles.
3. **IELTS Practice Modules:**
   - **Reading:** Text-based comprehension tests.
   - **Listening:** Audio playback tests integrated seamlessly with `howler.js`.
   - **Writing:** Text submission and review features.
   - **Speaking:** Practice modules for oral expression.
4. **Analytics & Review:** Track test scores, analyze performance data, and review past notes and test submissions.
5. **Modern UI/UX:** Smooth page transitions and dynamic animations using Framer Motion and GSAP.

---

## ⚙️ Environment Configuration

To run the project locally, you need to configure the environment variables for both the frontend and backend.

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory with the following keys:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
FIREBASE_KEY=your_firebase_admin_service_account_json_string
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` directory with the following keys:
```env
VITE_local_url=http://localhost:3000/api/
VITE_live_url=https://your-production-backend-url.com/api/
VITE_apiKey=your_firebase_api_key
VITE_authDomain=your_firebase_auth_domain
VITE_projectId=your_firebase_project_id
VITE_storageBucket=your_firebase_storage_bucket
VITE_messagingSenderId=your_firebase_messaging_sender_id
VITE_appId=your_firebase_app_id
```

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- A [Firebase](https://firebase.google.com/) Project

### 1. Clone the repository
```bash
git clone https://github.com/armanislams/MOCKEA.git
cd MOCKEA
```

### 2. Backend Setup
```bash
cd backend
npm install
# Ensure your .env file is created and populated
npm run dev
```
The server will start on `http://localhost:3000`.

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
# Ensure your .env file is created and populated
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 📡 API Endpoints Summary

The backend exposes several RESTful endpoints under the `/api` prefix:

- **`/api/user`**: User creation, profile retrieval, and authentication state syncing.
- **`/api/note`**: CRUD operations for user study notes.
- **`/api/reading`**: Fetching reading passages and submitting answers.
- **`/api/questions`**: Managing test questions and formats.
- **`/api/analytics`**: Retrieving user performance data and test statistics.

*Detailed API documentation (Swagger/Postman collection) should be referenced separately.*

---

## 🛠️ Maintenance & Deployment

- **Frontend Deployment:** The frontend is configured for deployment on standard static hosting platforms or Vercel. Use `npm run build` to generate the production `dist` folder.
- **Backend Deployment:** The backend includes a `vercel.json` configuration file, indicating it is set up for serverless deployment on Vercel. Ensure environment variables are securely added to the Vercel project settings.
- **Error Handling:** The backend features a centralized `errorHandler.js` middleware. Refer to `backend/ERROR_HANDLER_GUIDE.md` for details on extending error management.

---

*For any technical issues or onboarding questions, please reach out to the engineering team lead.*
