<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# CodeCrux: Advanced AI Exam Proctoring System
*A comprehensive solution for secure, monitored, and automated examination management.*

</div>

---

## 🚀 Project Overview

CodeCrux is a sophisticated exam proctoring platform that combines a modern **React** frontend with a robust **Django** backend. It features real-time AI-driven monitoring to detect violations such as unauthorized devices, multiple people, or suspicious activity during exams.

## 🏗️ Architecture

- **Frontend:** React with Vite, TypeScript, and modern UI components.
- **Backend:** Django with SQLite database and integrated AI models for object detection and proctoring.
- **AI Integration:** Real-time webcam monitoring and ID verification.

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Git**

### 2. Frontend Setup (React)
```bash
# Install dependencies
npm install

# Configure environment
# Add your GEMINI_API_KEY to .env.local
GEMINI_API_KEY=your_api_key_here

# Run development server
npm run dev
```

### 3. Backend Setup (Django)
```bash
# Navigate to the backend directory
cd "Exam Proactor"

# Install dependencies (recommended to use a venv)
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver 8000
```

---

## 🔒 Security & Confidentiality

> [!IMPORTANT]
> - Never commit your `.env` or `.env.local` files.
> - The database (`db.sqlite3`) and logs are ignored by default to keep the repository clean.
> - Always use environment variables for sensitive API keys (e.g., Gemini API).

---

## 📁 Repository Structure
- `/screens`: React components for various user roles (Faculty, Student).
- `/services`: API integration and Authentication context.
- `/Exam Proactor`: Django project containing proctoring logic and database models.
- `/hooks`: Custom React hooks for proctoring and detection.

---

<div align="center">
Developed with ❤️ by the CodeCrux Team.
</div>
