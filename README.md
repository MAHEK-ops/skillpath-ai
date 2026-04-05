<div align="center">

# SkillPath AI

### Skip what you know. Learn what you need.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://react.dev)
[![Groq](https://img.shields.io/badge/LLM-Groq%20%2B%20Llama--3-orange?style=flat)](https://groq.com)
[![NetworkX](https://img.shields.io/badge/Graph-NetworkX-blue?style=flat)](https://networkx.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

**An AI-driven adaptive onboarding engine that parses your resume,
identifies exact skill gaps against any job description, and generates
a personalized learning roadmap powered by Groq + Llama-3 and O\*NET.**

[Usage](#usage) · [Architecture](#architecture) · [API](#api-endpoints) · [Setup](#installation)

</div>

---

## The Problem

Corporate onboarding is broken. Every new hire whether a fresher
or a 5-year veteran receives the same generic training curriculum.
Experienced hires waste time on concepts they already know.
Beginners get overwhelmed by advanced content.
Neither reaches productivity efficiently.

## Our Solution

SkillPath AI analyzes each hire's resume against their target job
description, mathematically identifies the exact skill gaps, and
generates a personalized step-by-step learning roadmap unique
to every individual.

---

## What Makes Us Different

### Explainable AI (XAI) via TraceLogger
Most AI apps output answers without explanation. SkillPath AI
outputs every recommendation with full mathematical and semantic
reasoning. The frontend renders a Reasoning Panel showing exactly
WHY each course was recommended down to the O*NET importance
weight that triggered it.

### O\*NET Standardization
Raw skill matching fails silently "NLP" and "Natural Language
Processing" and "Text Analysis" are the same skill but a string
match would miss this entirely. We ground all extraction to the
O*NET database, ensuring apples-to-apples comparison across
every resume and job description.

### Graph-Based Adaptive Pathing
We treat skill acquisition as a Directed Acyclic Graph (DAG)
rather than a flat list. Topological sort ensures prerequisites
are always taught before advanced concepts. The shortest path
through the DAG = minimum time to role readiness.

---

## Features

- **Resume Analysis** Parses PDF and DOCX resumes to extract
  skills with confidence scores 0-100
- **Skill Gap Analysis** Computes `gap_score = role_level −
  candidate_level`, weighted by O*NET importance
- **Adaptive Pathway Generation** DAG-based topological sort
  produces an ordered learning curriculum
- **Reasoning Trace** Every recommendation explained with
  mathematical justification via TraceLogger
- **Interactive Skill Graph** Visualizes skill dependencies
  and learning path in real time
- **PDF Export** Download your personalized roadmap as PDF
- **Cross-Domain Support** Works for Technical and
  Operational roles

---

## Architecture
```
Resume PDF + Job Description
         │
         ▼
┌─────────────────────┐
│   Phase 1: Parse    │  /api/parse
│   Groq + Llama-3    │  Zero-shot NER
│   skill_extractor   │  O*NET normalization
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Phase 2: Analyze   │  /api/analyze
│   gap_analyzer.py   │  gap_score formula
│   O*NET grounding   │  coverage_score %
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Phase 3: Pathway   │  /api/pathway
│  graph_builder.py   │  DAG construction
│  pathway_generator  │  Topological sort
└────────┬────────────┘
         │
         ▼
  Personalized Roadmap
  + Reasoning Trace
  + PDF Export
```

### Gap Scoring Algorithm
```
gap_score      = role_required_level - candidate_level
priority_score = gap_score × onet_importance_weight
coverage_score = matched_skills / total_required_skills
```

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| FastAPI Python 3.10+ | Async API framework |
| Groq API | LPU inference significantly faster than GPU |
| Llama-3 / Mixtral | Zero-shot + few-shot skill NER |
| NetworkX | DAG construction and pathfinding |
| Pydantic | Structured JSON validation |
| PyPDF2 / pdfplumber | Resume PDF parsing |
| python-docx | DOCX resume parsing |
| Uvicorn | ASGI server |

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + Vite | Component-based UI |
| TailwindCSS | Styling |
| GSAP Flip | Interactive before/after animations |
| jsPDF + html2canvas | PDF export |
| Vitest | Unit testing |

---

## Datasets Used

| Dataset | Source | Usage |
|---|---|---|
| O*NET Database | [onetcenter.org](https://www.onetcenter.org/db_releases.html) | Skill taxonomy + importance weights for 1,000+ job roles |
| Kaggle Resume Dataset | [kaggle.com/snehaanbhawal](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset) | Parser testing against real-world resume formats |
| Jobs & JD Dataset | [kaggle.com/kshitizregmi](https://www.kaggle.com/datasets/kshitizregmi/jobs-and-job-description) | JD parsing validation across diverse role categories |

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/parse` | POST | Upload resume + JD, returns extracted skills with confidence scores |
| `/api/analyze` | POST | Returns gap_score, priority_score, coverage_score per skill |
| `/api/pathway` | POST | Returns ordered PathwayStep array with reasoning trace |

### Sample Request — /api/parse
```json
{
  "resume": "<PDF file upload>",
  "job_description": "We are looking for a Data Analyst...",
  "role_type": "technical"
}
```

### Sample Response — /api/pathway
```json
{
  "coverage_score": 0.43,
  "pathway": [
    {
      "step": 1,
      "course": "Python for Data Science — Intermediate",
      "skill": "python_programming",
      "duration": "4 hours",
      "priority": "HIGH",
      "reasoning": "Resume shows basic Python but role requires
                    intermediate pandas/numpy workflows."
    }
  ]
}
```

---

## Installation

### Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API key free at [groq.com](https://groq.com)

### Backend Setup

1. **Clone the repository:**
```bash
   git clone https://github.com/MAHEK-ops/skillpath-ai.git
   cd skillpath-ai/backend
```

2. **Create and activate virtual environment:**
```bash
   python -m venv venv
   source venv/bin/activate
   # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
   pip install -r requirements.txt
```

4. **Create environment file:**
```bash
   echo "GROQ_API_KEY=your_groq_api_key_here" > .env
```

5. **Start the server:**
```bash
   uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**
```bash
   cd ../frontend
```

2. **Install dependencies:**
```bash
   npm install
```

3. **Start development server:**
```bash
   npm run dev
```

Frontend runs at `http://localhost:5173`

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GROQ_API_KEY` | Your Groq API key from groq.com | Yes |

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Upload your resume in PDF format
3. Paste the target job description
4. Select role type - Technical or Operational
5. Click **Analyze My Skills**
6. View your personalized skill analysis with confidence scores
7. Explore your learning roadmap with AI reasoning per course
8. Download your roadmap as a PDF

---

## Project Structure
```
skillpath-ai/
├── backend/
│   ├── main.py               # FastAPI entry point + routes
│   ├── resume_parser.py      # PDF/DOCX text extraction
│   ├── skill_extractor.py    # Groq + Llama-3 NER
│   ├── gap_analyzer.py       # Gap scoring algorithm
│   ├── graph_builder.py      # DAG construction
│   ├── course_matcher.py     # Course catalog matching
│   ├── pathway_generator.py  # Topological sort
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/            # LandingPage, UploadPage,
│   │   │                     # ProcessingPage, ResultsPage,
│   │   │                     # RoadmapPage
│   │   ├── components/       # Navbar, SkillBar, CourseCard,
│   │   │                     # ReasoningPanel, SkillGraph,
│   │   │                     # BeforeAfter
│   │   ├── utils/            # exportPDF.js
│   │   └── api/              # client.js
│   └── package.json
├── Onet-datafiles/           # O*NET database reference files
└── README.md
```

---

## Running Tests
```bash
# Frontend tests
cd frontend
npm run test

# Backend
cd backend
python -m pytest
```

---

## Contributors

| Name | Role |
|---|---|
| **Ashvin Tiwari** | Backend + LLM integration + Graph algorithms |
| **Mahek Motwani** | Frontend + UI/UX + PDF export |

---

<div align="center">

Built for **IISc Bangalore Hackathon 2026**

</div>
