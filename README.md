# ResumeBot 🤖

A full-stack AI-powered resume analyzer that provides instant ATS (Applicant Tracking System) feedback and scoring.
## 🔗 Live Demo
https://resumebot-1.onrender.com/
## 🚀 Features

- Upload resume in PDF or Word (.doc, .docx) format
- AI-generated ATS compatibility score
- Detailed feedback on content strength, formatting, writing quality
- Role alignment and recruiter interest scoring
- Actionable improvement suggestions
- Secure authentication via Clerk
- Responsive design for all devices
## 👤 Profile & Scan History

- Every resume scan is saved to MongoDB after analysis
- Users can view all their previous scans in the **Profile** section
- Each scan record stores:
  - ATS scores (content strength, formatting, writing quality, etc.)
  - Hireability score
  - Strengths, weaknesses, role fit
  - Improvement suggestions
  - Timestamp of the scan
- Scan history is tied to the authenticated user via Clerk


## 🛠️ Tech Stack

**Frontend:** React, React Router, Clerk Authentication

**Backend:** Node.js, Express.js

**AI:** meta-llama/llama-3-8b-instruct"

**Database:** MongoDB

**File Parsing:** pdf-parse, mammoth, textract

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/ankit240405/ResumeBOT.git
cd ResumeBOT
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLERK_SECRET_KEY=your_clerk_secret_key
OPENROUTER_API_KEY=your_api_key
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📋 Environment Variables

| Variable | 
|----------|
| `VITE_CLERK_PUBLISHABLE_KEY`|
| `VITE_API_BASE_URL` |

## 🎯 How It Works

1. User signs in via Clerk authentication
2. Upload resume (PDF or Word)
3. Backend extracts text from the document
4. AI analyzes the resume and returns JSON scores
5. Results displayed with detailed breakdown and tips

## 📊 Scoring System

| Metric | Weight |
|--------|--------|
| Content Strength | 35% |
| Writing Quality | 20% |
| Role Alignment | 20% |
| Formatting Score | 15% |
| Section Completeness | 10% |

## 📁 Project Structure

```
ResumeBOT/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── ResumeScan.js
│   │   └── Scan.js
│   ├── routes/
│   │   ├── analyzeRoutes.js
│   │   └── profileRoutes.js
│   ├── utils/
│   │   └── parseResume.js
│   ├── server.js
│   └── .env
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── Protected.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── lib/
    │   │   └── api.js
    │   ├── pages/
    │   │   ├── AuthLanding.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Result.jsx
    │   │   └── Upload.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    └── package.json
```



