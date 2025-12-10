# 🎤 Workshop Presenter Guide

## AI Study Assistant - 2 Hour Workshop

---

## ⏱️ Timeline

| Time | Section | Duration |
|------|---------|----------|
| 0:00 | Introduction & Demo | 10 min |
| 0:10 | Environment Setup | 15 min |
| 0:25 | Firebase Setup | 15 min |
| 0:40 | Gemini API Setup | 10 min |
| 0:50 | Code Walkthrough | 30 min |
| 1:20 | Hands-on Building | 30 min |
| 1:50 | Q&A & Wrap-up | 10 min |

---

## 🎯 Section 1: Introduction (10 min)

### Demo the finished app
1. Upload a sample PDF (bring one about a simple topic)
2. Generate a 7-day study plan
3. Take a quick quiz
4. Show the quiz results

### Explain the tech stack
- **React** - UI framework
- **Vite** - Fast build tool
- **Firebase** - Auth & Database
- **Gemini** - AI brain
- **Tailwind** - Styling

---

## 🔧 Section 2: Environment Setup (15 min)

### Have attendees run:
```bash
# Check Node version
node --version  # Should be 18+

# Clone/Download project
git clone <repo-url>
cd ai-study-assistant

# Install dependencies
npm install
```

### Common issues:
- **Node version too old**: Install nvm or download latest Node
- **npm permission errors**: Use `sudo` on Mac/Linux
- **Windows path issues**: Use PowerShell as admin

---

## 🔥 Section 3: Firebase Setup (15 min)

### Live demo on screen:

1. **Create Project**
   - console.firebase.google.com
   - "Create a project"
   - Name: `gdg-study-assistant-[yourname]`
   - Skip analytics

2. **Enable Auth**
   - Authentication → Get started
   - Sign-in method → Anonymous → Enable

3. **Create Firestore**
   - Firestore Database → Create database
   - Test mode → Enable

4. **Get Config**
   - Project Settings → Your apps → Web
   - Register app
   - Copy config to `src/lib/firebase.js`

### 💡 Tip: Have a backup Firebase project ready in case of issues

---

## 🤖 Section 4: Gemini Setup (10 min)

### Live demo:

1. Go to aistudio.google.com/app/apikey
2. Create API key
3. Copy to `src/lib/gemini.js`

### Explain:
- Free tier limits (enough for workshop)
- In production: use backend, not frontend
- Rate limiting considerations

---

## 📖 Section 5: Code Walkthrough (30 min)

### File order to explain:

#### 1. `src/lib/firebase.js` (5 min)
```javascript
// Key concepts:
// - initializeApp() creates the Firebase instance
// - getAuth() for authentication
// - getFirestore() for database
// - signInAnonymously() - no email needed!
```

#### 2. `src/lib/gemini.js` (10 min)
```javascript
// Key concepts:
// - GoogleGenerativeAI client
// - Prompt engineering for structured output
// - JSON response parsing
// - Error handling
```

**Show the prompts:**
- Study plan prompt structure
- Quiz generation prompt
- Why we request JSON format

#### 3. `src/lib/pdfParser.js` (5 min)
```javascript
// Key concepts:
// - PDF.js library
// - Page-by-page extraction
// - Text content aggregation
// - Truncation for API limits
```

#### 4. `src/components/FileUpload.jsx` (5 min)
```javascript
// Key concepts:
// - File input handling
// - Mode switching (upload vs text)
// - Async PDF processing
// - State management
```

#### 5. `src/components/StudyPlanGenerator.jsx` (5 min)
```javascript
// Key concepts:
// - Calling Gemini API
// - Displaying structured data
// - Progress tracking
// - Firestore integration
```

---

## 🛠️ Section 6: Hands-on Building (30 min)

### Option A: Follow Along
Have everyone type out key parts:

1. The Gemini prompt (5 min)
2. Quiz question rendering (10 min)
3. Firestore save function (5 min)
4. Test the full flow (10 min)

### Option B: Challenges (for faster groups)

**Easy:**
- Change the color scheme in tailwind.config.js
- Modify the number of quiz questions options

**Medium:**
- Add a "difficulty" selector for quizzes
- Show character count on text input

**Hard:**
- Add flashcard mode
- Export study plan to markdown

---

## ❓ Section 7: Q&A Topics to Prepare

### Common questions:

**Q: Can I use this with other AI models?**
A: Yes! OpenAI, Claude, etc. Just change the API calls in gemini.js

**Q: How do I deploy this?**
A: Vercel, Netlify, or Firebase Hosting. Run `npm run build` first.

**Q: Is it secure to put API keys in frontend?**
A: No! For production, use Cloud Functions or a backend server.

**Q: How much does Gemini API cost?**
A: Free tier is generous. Check ai.google.dev for limits.

**Q: Can I use real authentication?**
A: Yes! Firebase supports Google, Email, GitHub, etc.

---

## 🎁 Bonus Content (if time permits)

### Show these improvements:

1. **Better error handling**
```javascript
try {
  const result = await generateStudyPlan(content, days);
} catch (error) {
  if (error.message.includes('quota')) {
    setError('API limit reached. Try again later.');
  }
}
```

2. **Loading states**
```javascript
// Show skeleton loaders while generating
```

3. **Responsive design**
```javascript
// Mobile-first approach with Tailwind
```

---

## 📋 Checklist Before Workshop

- [ ] Test the app end-to-end
- [ ] Have backup Firebase project
- [ ] Have backup Gemini API key
- [ ] Prepare sample PDF for demo
- [ ] Test screen sharing
- [ ] Have code snippets ready to paste
- [ ] Charge laptop / check power
- [ ] Test WiFi / have hotspot backup

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Firebase permission denied | Check Firestore is in test mode |
| Gemini API error | Verify API key, check quotas |
| PDF not parsing | Try a different PDF, check file size |
| Styles not loading | Restart dev server |
| Module not found | Run `npm install` again |

---

## 📧 Follow-up

After workshop, share:
- GitHub repo link
- Firebase docs link
- Gemini API docs link
- Your contact for questions

---

**Good luck with your workshop! 🚀**
