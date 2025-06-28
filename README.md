# 🎓 CurriBuilder

CurriBuilder is a smart learning app that generates a personalized curriculum for any topic using AI. Just pick a topic, choose your level, and set the number of days — and CurriBuilder builds a day-wise plan with explanations, MCQs, and progress tracking.

## 🔗 Live App

👉 [Click to Try CurriBuilder](https://eazylearn.vercel.app)

## 🚀 Features

- AI-powered daily curriculum generation (using Groq LLaMA-3)
- Interactive MCQs with instant feedback
- Daily unlock system (can't skip ahead)
- Progress tracking with visual indicators
- Google & Email login via Firebase

## ⚙️ Tech Stack

- **Frontend:** Next.js + Tailwind CSS
- **AI:** Groq (LLaMA-3 API)
- **Auth & DB:** Firebase Auth + Firestore
- **Hosting:** Vercel

## 🛠️ Setup Instructions

1. Clone the repo  
   `git clone https://github.com/Tarun-Rajan/eazylearn.git`

2. Install dependencies  
   `npm install`

3. Create a `.env.local` file with:
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GROQ_API_KEY=your_groq_api_key

4. Start the dev server  
`npm run dev`

## 📁 Pages Overview

- `/` – Login page  
- `/dashboard` – Topic selection + progress  
- `/curriculum/[topic]` – Day buttons  
- `/curriculum/[topic]/[day]` – Day content & MCQs

---

