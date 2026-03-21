# SkillPath AI

SkillPath AI is an adaptive onboarding engine that analyzes skill gaps and generates personalized learning pathways for every role. It helps you skip what you already know and focus on learning what you need to succeed.

## Features

*   **Resume Analysis**: Parses resumes (PDF, DOCX) to extract existing skills.
*   **Skill Gap Analysis**: Compares existing skills with required skills for a target role.
*   **Personalized Pathway Generation**: Creates a customized learning roadmap with relevant courses.
*   **Interactive Skill Graph**: Visualizes the relationships between skills.
*   **Course Recommendations**: Suggests courses to bridge skill gaps.

## Tech Stack

### Backend

*   **Framework**: FastAPI
*   **LLM Integration**: Groq
*   **PDF/DOCX Parsing**: PyPDF2, pdfplumber, python-docx
*   **Graph Operations**: NetworkX
*   **Other**: Uvicorn, Pydantic

### Frontend

*   **Framework**: React
*   **Styling**: Tailwind CSS
*   **Build Tool**: Vite
*   **Testing**: Vitest, React Testing Library
*   **Animation**: GSAP
*   **PDF Export**: jsPDF, html2canvas

## Installation

### Prerequisites

*   Python 3.10+
*   Node.js 18+
*   `pip` and `npm`

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/skillpath-ai.git
    cd skillpath-ai/backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create a `.env` file** in the `backend` directory and add your Groq API key:
    ```
    GROQ_API_KEY=your_groq_api_key
    ```

5.  **Run the backend server:**
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be running at `http://127.0.0.1:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:5173`.

## Usage

1.  Open your browser and navigate to `http://localhost:5173`.
2.  Upload your resume.
3.  Select your target job role.
4.  Explore your personalized learning pathway and skill analysis.

## Contributors

*   **Ashvin Tiwari**: Backend + LLM
*   **Mahek Motwani**: Frontend + UI/UX
