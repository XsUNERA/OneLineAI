# OneLine AI ⚡

> **One question. One clear answer. Less, but better.**

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/backend-Flask-black.svg)](https://flask.palletsprojects.com/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Cloud-f55036.svg)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/deployment-Vercel-black.svg)](https://vercel.com/)

OneLine AI is a minimalist AI assistant designed to eliminate verbose conversational fluff. Instead of multi-paragraph essays and repetitive disclaimers, OneLine AI answers every question in **exactly one concise, high-impact sentence**.

---

## 🌟 Features

- **Strict One-Sentence Precision:** Enforces clear, direct answers without unnecessary filler or cognitive overload.
- **Ultra-Fast Inference:** Powered by Groq Cloud API for lightning-fast token generation.
- **Multi-Chat Management:** Create, switch, and delete multiple conversations seamlessly.
- **Persistent Storage:** Conversations persist automatically in your browser using `localStorage`.
- **Minimalist Dark UI:** Thoughtfully crafted dark theme with custom design tokens, fluid typography (Nunito & Nunito Sans), and responsive layout.
- **Keyboard-First Experience:** 
  - `Enter` to submit
  - `Shift + Enter` for new lines
  - `N` shortcut to start a fresh conversation
- **Dual Deployment Architecture:** Run locally with Flask, or deploy directly to Vercel via Python Serverless Functions.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, Modern Vanilla JavaScript (ES6+), Vanilla CSS (Custom Design System & Glassmorphism)
- **Backend:** Python, Flask, Flask-CORS, python-dotenv
- **AI Engine:** [Groq Cloud SDK](https://console.groq.com/) (`openai/gpt-oss-20b`)
- **Deployment:** Vercel Serverless Functions (`api/index.py`, `vercel.json`) & Vercel Web Analytics

---

## 📁 Project Structure

```text
oneLine_AI/
├── api/
│   └── index.py            # Vercel serverless function entrypoint
├── backend/
│   ├── app.py              # Local Flask development server
│   ├── requirements.txt    # Local backend dependencies
│   └── .env                # Local environment variables (ignored by Git)
├── gemini-svg (1).svg      # Application favicon
├── index.html              # Main web application layout
├── requirements.txt        # Root requirements for Vercel deployment
├── script.js               # Client state, API caller, and DOM management
├── style.css               # Design system, responsive rules, and theme styles
├── vercel.json             # Serverless route rewrites for Vercel
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- [Python 3.9+](https://www.python.org/downloads/)
- A free [Groq API Key](https://console.groq.com/keys)

---

### Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/XsUNERA/OneLineAI.git
   cd OneLineAI
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # On Windows:
   python -m venv .venv
   .venv\Scripts\activate

   # On macOS/Linux:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file inside the `backend/` directory (or project root):
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Start the backend server:**
   ```bash
   python backend/app.py
   ```
   The backend will be running at `http://127.0.0.1:5000`.

6. **Launch the frontend:**
   Open `index.html` in your browser, or use the VS Code **Live Server** extension (recommended).
   > The frontend automatically detects local static servers and connects to `http://127.0.0.1:5000/api/chat`.

---

## ☁️ Deployment (Vercel)

This project is configured out-of-the-box for zero-config Vercel deployment:

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `GROQ_API_KEY` = `your_groq_api_key_here`
4. Click **Deploy**. Vercel will automatically build the static frontend and mount `api/index.py` as a serverless endpoint.

---

## 🔒 Security & Best Practices

- API keys are never exposed on the client side; all requests are proxied securely through the Python backend.
- `.env` files and virtual environments are excluded from Git via `.gitignore`.
- User input is validated and sanitized against excessive payload sizes.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

- **GitHub:** [@XsUNERA](https://github.com/XsUNERA)
- **LinkedIn:** [Your LinkedIn Profile](https://www.linkedin.com/)
