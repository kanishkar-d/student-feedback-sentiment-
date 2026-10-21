# AI-Powered Student Feedback Sentiment Analysis System

An end-to-end full-stack web application designed for academic institutions to collect, analyze, and visualize student feedback using Natural Language Processing (NLP) and sentiment classification.

## 🚀 Features

- **Sentiment Analysis**: Automatically analyzes student comments into Positive, Neutral, and Negative sentiments with confidence scores.
- **Aspect-Based Categorization**: Evaluates specific dimensions such as Teaching Quality, Course Content, Infrastructure, Support, and Assessment.
- **Role-Based Access Control**:
  - **Student**: Submit anonymous or identified feedback for enrolled courses.
  - **Faculty**: View real-time aggregated insights, sentiment trends, and feedback breakdown.
  - **Admin**: Manage departments, courses, faculty, students, and system-wide analytics.
- **Interactive Dashboards**: Modern responsive UI with sentiment gauge meters, trend charts, and actionable recommendations.

## 🛠️ Tech Stack

- **Frontend**: React (Vite, TypeScript), Tailwind CSS, Lucide Icons, Chart.js / Recharts
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic, SQLite
- **NLP / AI**: Sentiment classification pipeline and aspect-based keyword analytics

## 📦 Project Structure

```
├── backend/          # FastAPI application & API endpoints
│   ├── app/          # Core routers, models, schemas, and services
│   ├── tests/        # Backend test suite
│   ├── requirements.txt
│   └── seed.py       # Seed data for demo
├── frontend/         # React + Vite frontend application
│   ├── src/          # Components, pages, contexts, services
│   ├── public/
│   └── package.json
└── README.md
```

## ⚡ Getting Started

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations / seed data (optional):
   ```bash
   python seed.py
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.
