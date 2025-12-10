# 🎓 AI Study Assistant

> **GDG on Campus Workshop Project**  
> Build an AI-powered study assistant using React, Firebase, and Google Gemini

![Workshop Banner](https://img.shields.io/badge/GDG-Workshop-4285F4?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase)
![Gemini](https://img.shields.io/badge/Gemini-AI-8E75B2?style=flat-square&logo=google)

## 🌟 Features

- **📄 PDF & Text Upload** - Extract content from PDFs or paste text directly
- **📅 AI Study Plans** - Generate personalized day-by-day study schedules
- **🧠 Smart Quizzes** - Take AI-generated quizzes (MCQ, True/False, Short Answer)
- **📊 Progress Tracking** - Track completed study days and quiz scores
- **🔐 Anonymous Auth** - No sign-up required, powered by Firebase

---

## 🛠️ Workshop Setup (15 minutes)

### Prerequisites

- Node.js 18+ installed ([download](https://nodejs.org))
- A Google account
- Code editor (VS Code recommended)

### Step 1: Clone & Install

```bash
# Clone the project (or download ZIP)
git clone <repository-url>
cd ai-study-assistant

# Install dependencies
npm install
npm install firebase
```

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or use existing)
3. Name it something like `gdg-study-assistant`
4. Disable Google Analytics (optional for workshop)
5. Click **Create project**

#### Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Click **Anonymous** → **Enable** → **Save**

#### Create Firestore Database

1. In Firebase Console → **Firestore Database** → **Create database**
2. Select **Start in test mode** (for workshop purposes)
3. Choose a location close to you → **Enable**

#### Get Firebase Config

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to **"Your apps"** → Click **Web** icon (`</>`)
3. Register app with nickname (e.g., `study-assistant-web`)
4. Copy the config object

#### Update Config in Code

Open `src/lib/firebase.js` and replace the config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 3: Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API key"**
3. Copy the API key

#### Update Config in Code

Open `src/lib/gemini.js` and replace:

```javascript
const API_KEY = 'YOUR_GEMINI_API_KEY';
```

### Step 4: Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser 🎉

---

## 📁 Project Structure

```
ai-study-assistant/
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx      # PDF/text upload component
│   │   ├── StudyPlanGenerator.jsx  # Study plan UI
│   │   └── QuizGenerator.jsx   # Quiz UI with scoring
│   ├── lib/
│   │   ├── firebase.js         # Firebase config & auth
│   │   ├── gemini.js           # Gemini API integration
│   │   ├── pdfParser.js        # PDF text extraction
│   │   └── database.js         # Firestore operations
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Tailwind styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🔍 Code Walkthrough

### 1. Firebase Authentication (`src/lib/firebase.js`)

```javascript
// Anonymous sign-in - no account needed!
export const signInAnon = async () => {
  const result = await signInAnonymously(auth);
  return result.user;
};
```

### 2. Gemini AI Integration (`src/lib/gemini.js`)

```javascript
// Generate study plan with Gemini
export const generateStudyPlan = async (content, numberOfDays) => {
  const prompt = `Create a ${numberOfDays}-day study plan for: ${content}`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
```

### 3. PDF Text Extraction (`src/lib/pdfParser.js`)

```javascript
// Extract text from uploaded PDF
export const extractTextFromPDF = async (file) => {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  // Extract text from each page...
};
```

### 4. Firestore Database (`src/lib/database.js`)

```javascript
// Save study material
export const saveMaterial = async (userId, material) => {
  return await addDoc(collection(db, 'materials'), {
    userId,
    ...material,
    createdAt: serverTimestamp()
  });
};
```

---

## 🎯 Workshop Challenges

### Challenge 1: Add Flashcard Mode
Create a flashcard component that shows terms/definitions from the material.

### Challenge 2: Export Study Plan
Add a button to download the study plan as a PDF or markdown file.

### Challenge 3: Quiz History
Show previous quiz scores and allow retaking old quizzes.

### Challenge 4: Share Feature
Generate a shareable link for study plans.

---

## 🔒 Security Notes

⚠️ **For Production:**

1. **Never expose API keys in frontend code!**
   - Use Firebase Cloud Functions or a backend server
   - Store keys in environment variables

2. **Update Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /materials/{doc} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    // Similar rules for studyPlans, quizzes, quizResults
  }
}
```

3. **Set up API key restrictions** in Google Cloud Console

---

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PDF.js](https://mozilla.github.io/pdf.js/)

---

## 🤝 Contributing

Found a bug or want to add a feature? PRs welcome!

---

## 📄 License

MIT License - Feel free to use this for your own workshops!

---

<div align="center">

**Built with ❤️ for GDG on Campus**

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>
