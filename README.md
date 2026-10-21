# 🎓 AI-Powered Student Feedback Sentiment Analysis System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3%2B-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

**An intelligent, full-stack web application for academic institutions to collect, analyze, and visualize student feedback using NLP and sentiment classification.**

[🚀 Features](#-features) • [🛠️ Tech Stack](#-tech-stack) • [📦 Project Structure](#-project-structure) • [⚡ Getting Started](#-getting-started) • [🔐 Environment Variables](#-environment-variables) • [📄 API Reference](#-api-reference)

</div>

---

## 🚀 Features

### 🤖 AI & NLP
- **Sentiment Analysis** — Automatically classifies student comments as **Positive**, **Neutral**, or **Negative** with confidence scores using transformer-based models and VADER.
- **Aspect-Based Analysis** — Breaks feedback into key academic dimensions: **Teaching Quality**, **Course Content**, **Infrastructure**, **Support**, and **Assessment**.
- **Keyword Extraction** — Extracts dominant themes and actionable keywords from free-text responses.
- **Live Analyzer** — Real-time sentiment scoring as feedback is typed, with confidence gauges.

### 👥 Role-Based Access Control
| Role | Capabilities |
|---|---|
| **Student** | Submit feedback (anonymous or identified), view feedback history |
| **Faculty** | View aggregated insights, sentiment trends, aspect breakdowns per course |
| **Admin** | Full system management: departments, courses, faculty, students, analytics |

### 📊 Dashboards & Visualizations
- **Sentiment Donut Charts** — Visual breakdown of positive/neutral/negative distributions.
- **Aspect Radar Charts** — Multi-dimensional quality scoring across academic aspects.
- **Trend Line Charts** — Sentiment evolution over time (weekly/monthly).
- **Faculty Bar Charts** — Comparative faculty performance analytics.
- **Word Cloud** — Most frequent themes in student responses.
- **Gauge Meters** — Real-time confidence and performance scores.

### 🔧 System Features
- **Batch Upload** — Upload bulk feedback via CSV for offline data ingestion.
- **PDF Report Generation** — Export analytics reports as downloadable PDFs.
- **JWT Authentication** — Secure token-based auth with role enforcement.
- **Dark / Light Mode** — Full theme switching support.
- **Responsive UI** — Mobile-friendly, modern design with Lucide Icons.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | SPA framework & build tool |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Recharts / Chart.js | Data visualization |
| Lucide React | Icon library |
| React Router DOM | Client-side routing |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | High-performance REST API |
| SQLAlchemy 2.0 | ORM & database management |
| Pydantic v2 | Data validation & serialization |
| SQLite (default) | Embedded database (PostgreSQL-ready) |
| Python-JOSE | JWT token generation & validation |
| Passlib / Bcrypt | Password hashing |
| ReportLab | PDF report generation |

### AI / NLP
| Technology | Purpose |
|---|---|
| Hugging Face Transformers | Pre-trained sentiment models |
| PyTorch | Deep learning runtime |
| VADER Sentiment | Rule-based sentiment analysis |
| NLTK | Text preprocessing & tokenization |
| scikit-learn | ML utilities |
| pandas / numpy | Data manipulation |

---

## 📦 Project Structure

```
AI-Powered Student Feedback Sentiment Analysis System/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # App settings (env vars)
│   │   │   ├── database.py        # SQLAlchemy engine & session
│   │   │   ├── deps.py            # Dependency injection (auth, DB)
│   │   │   └── security.py        # JWT & password utilities
│   │   ├── models/
│   │   │   └── models.py          # SQLAlchemy ORM models
│   │   ├── nlp/
│   │   │   ├── sentiment.py       # Sentiment classification pipeline
│   │   │   ├── aspect.py          # Aspect-based analysis
│   │   │   ├── cleaner.py         # Text preprocessing
│   │   │   └── keywords.py        # Keyword extraction
│   │   ├── routers/
│   │   │   ├── auth.py            # Login / Register endpoints
│   │   │   ├── feedback.py        # Feedback submission & retrieval
│   │   │   ├── analytics.py       # Dashboard analytics endpoints
│   │   │   ├── admin.py           # Admin management endpoints
│   │   │   ├── analyze.py         # Live analysis endpoint
│   │   │   ├── model_insights.py  # NLP model metadata
│   │   │   └── reports.py         # PDF report generation
│   │   ├── schemas/
│   │   │   └── schemas.py         # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── analytics_service.py   # Aggregation & insights logic
│   │   │   ├── feedback_service.py    # Feedback processing service
│   │   │   └── report_service.py      # PDF generation service
│   │   └── main.py                # FastAPI app entry point
│   ├── tests/
│   │   ├── test_api.py            # API integration tests
│   │   └── test_nlp.py            # NLP unit tests
│   ├── seed.py                    # Database seeder with demo data
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/            # Recharts visualization components
│   │   │   ├── layout/            # Navbar, Sidebar, Footer, ProtectedRoute
│   │   │   └── ui/                # Reusable UI components (StatCard, GaugeMeter)
│   │   ├── context/
│   │   │   ├── AuthContext.tsx    # Global authentication state
│   │   │   └── ThemeContext.tsx   # Dark/light theme management
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── FacultyDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── LiveAnalyzerPage.tsx
│   │   │   ├── BatchUploadPage.tsx
│   │   │   ├── FeedbackHistoryPage.tsx
│   │   │   ├── ModelInsightsPage.tsx
│   │   │   ├── CourseManagementPage.tsx
│   │   │   ├── UserDirectoryPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── services/
│   │   │   └── api.ts             # Axios API client with interceptors
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript type definitions
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── data/
│   └── sample_feedback.csv        # Sample CSV for batch upload testing
├── .env.example                   # Environment variable template
├── .gitignore
└── package.json                   # Root-level scripts
```

---

## ⚡ Getting Started

### Prerequisites
- **Python** 3.10 or higher
- **Node.js** 18+ and npm
- **Git**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/kanishkar-d/student-feedback-sentiment-.git
cd student-feedback-sentiment-
```

### 2️⃣ Backend Setup

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# Create venv
python -m venv venv

# Activate — Windows
venv\Scripts\activate

# Activate — macOS / Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

> ⚠️ **Note:** Installing `torch` and `transformers` may take several minutes depending on your internet speed.

Set up environment variables:

```bash
# From the project root
cp .env.example .env
# Edit .env with your preferred settings
```

Seed the database with demo data (optional but recommended):

```bash
python seed.py
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload --port 8000
```

The backend API will be available at **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

---

### 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install npm dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

### 4️⃣ Demo Login Credentials

After running `python seed.py`, use the following demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@feedbackiq.edu` | `admin123` |
| Faculty | `faculty@feedbackiq.edu` | `faculty123` |
| Student | `student@feedbackiq.edu` | `student123` |

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | JWT signing secret (change in production!) | `feedbackiq_super_secret_jwt_key_2026_change_in_production` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry (minutes) | `1440` (24h) |
| `DATABASE_URL` | Database connection string | `sqlite:///./feedbackiq.db` |
| `PORT` | Backend server port | `8000` |
| `HOST` | Backend server host | `0.0.0.0` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173,...` |
| `VITE_API_BASE_URL` | Frontend API base URL | `http://localhost:8000/api/v1` |

> 💡 To switch to **PostgreSQL**, update `DATABASE_URL` to:
> `postgresql://user:password@localhost:5432/feedbackiq`

---

## 📄 API Reference

The full interactive API documentation is auto-generated by FastAPI:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | User login |
| `POST` | `/api/v1/auth/register` | User registration |
| `POST` | `/api/v1/feedback/submit` | Submit new feedback |
| `GET` | `/api/v1/feedback/history` | Get feedback history |
| `POST` | `/api/v1/analyze/live` | Real-time sentiment analysis |
| `GET` | `/api/v1/analytics/dashboard` | Aggregated analytics |
| `GET` | `/api/v1/analytics/trends` | Sentiment trends over time |
| `GET` | `/api/v1/reports/generate` | Generate PDF report |
| `GET` | `/api/v1/admin/users` | Admin: list all users |
| `GET` | `/api/v1/admin/courses` | Admin: manage courses |

---

## 🧪 Running Tests

```bash
cd backend

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api.py
pytest tests/test_nlp.py
```

---

## 🚀 Running Both Servers Together

From the project root, you can start both services simultaneously:

```bash
npm run dev
```

> This uses the root `package.json` to run both backend and frontend concurrently.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  Made with ❤️ for smarter academic feedback
</div>
