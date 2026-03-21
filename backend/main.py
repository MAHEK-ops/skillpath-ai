"""
SkillPath AI — FastAPI Backend Entry Point
Start: uvicorn main:app --reload --port 8000
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv


load_dotenv()


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


from routers import parse, analyze, pathway


from models.schemas import FullAnalysisRequest, FullAnalysisResponse, ParseRequest
from services.resume_parser import clean_text
from services.skill_extractor import extract_skills_from_texts
from services.gap_analyzer import analyze_gaps, compute_coverage_score
from services.graph_builder import build_skill_gap_graph
from services.course_matcher import match_courses, build_course_map, estimate_full_curriculum_hours
from services.pathway_generator import generate_pathway, compute_metrics
from services.trace_logger import TraceLogger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle handler."""
    groq_key = os.environ.get("GROQ_API_KEY", "")
    if not groq_key:
        logger.warning("GROQ_API_KEY not set! LLM features will fail.")
    else:
        logger.info("GROQ_API_KEY loaded successfully.")
    logger.info("SkillPath AI backend starting up...")
    yield
    logger.info("SkillPath AI backend shutting down.")


app = FastAPI(
    title="SkillPath AI",
    description=(
        "AI-powered adaptive onboarding engine. "
        "Parses resumes and JDs, identifies skill gaps, and generates personalized learning pathways "
        "grounded in a curated course catalog — with full reasoning traces."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://skillpath-ai.vercel.app",
        "*", 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(parse.router, prefix="/api", tags=["Parse"])
app.include_router(analyze.router, prefix="/api", tags=["Analyze"])
app.include_router(pathway.router, prefix="/api", tags=["Pathway"])



@app.get("/health", tags=["Health"])
async def health_check():
    """Simple health check endpoint."""
    groq_key_set = bool(os.environ.get("GROQ_API_KEY", ""))
    return {
        "status": "ok",
        "service": "skillpath-ai-backend",
        "version": "1.0.0",
        "groq_configured": groq_key_set,
    }



@app.post(
    "/api/full-analysis",
    response_model=FullAnalysisResponse,
    tags=["Full Pipeline"],
    summary="Run the complete SkillPath AI pipeline in one request",
)
async def full_analysis(body: FullAnalysisRequest):
    """
    🚀 Full pipeline: Parse → Analyze → Pathway in a single API call.

    Accepts resume_text and job_description_text, runs the entire engine,
    and returns the complete analysis including:
    - Extracted candidate skills
    - Role requirements
    - Skill gaps (priority ranked)
    - Personalized learning pathway (prerequisite-ordered, course-grounded)
    - Interactive graph data for visualization
    - Full reasoning trace for every decision

    This is the primary endpoint for the frontend.
    """
    if not body.resume_text:
        raise HTTPException(status_code=422, detail="resume_text is required")
    if not body.job_description_text:
        raise HTTPException(status_code=422, detail="job_description_text is required")

    master_trace = TraceLogger()
    resume_text = clean_text(body.resume_text)
    jd_text = clean_text(body.job_description_text)


    master_trace.log(
        step="pipeline_start",
        input_summary=f"Resume: {len(resume_text)} chars, JD: {len(jd_text)} chars",
        output_summary="Starting full analysis pipeline",
        reasoning="Initiating 3-step pipeline: Parse → Analyze → Pathway",
    )

    try:
        candidate_skills, role_requirements = extract_skills_from_texts(
            resume_text=resume_text,
            jd_text=jd_text,
            trace_logger=master_trace,
        )
    except Exception as e:
        logger.error(f"Parse step failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {str(e)}")

    from models.schemas import ParseResponse
    parse_response = ParseResponse(
        candidate_skills=candidate_skills,
        role_requirements=role_requirements,
        trace=master_trace.get_entries(),
        raw_resume_text=resume_text[:1000],
        raw_jd_text=jd_text[:1000],
    )


    try:
        skill_gaps, skills_satisfied = analyze_gaps(
            candidate_skills=candidate_skills,
            role_requirements=role_requirements,
            trace_logger=master_trace,
        )
    except Exception as e:
        logger.error(f"Analyze step failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Gap analysis failed: {str(e)}")

    total_gap_score = sum(g.gap_score for g in skill_gaps)
    coverage_score = compute_coverage_score(role_requirements, skill_gaps)
    FULL_CURRICULUM_HOURS = 3200.0
    time_saved_hours = round((coverage_score / 100) * FULL_CURRICULUM_HOURS, 1)

    from models.schemas import AnalyzeResponse
    analyze_response = AnalyzeResponse(
        skill_gaps=skill_gaps,
        skills_satisfied=skills_satisfied,
        total_gap_score=round(total_gap_score, 2),
        coverage_score=coverage_score,
        time_saved_hours=time_saved_hours,
        trace=master_trace.get_entries(),
    )


    if not skill_gaps:

        from models.schemas import PathwayResponse
        pathway_response = PathwayResponse(
            pathway=[],
            total_estimated_hours=0.0,
            efficiency_ratio=0.0,
            graph_data={"nodes": [], "edges": []},
            metrics={
                "total_estimated_hours": 0,
                "time_saved_hours": time_saved_hours,
                "coverage_score": coverage_score,
                "message": "Candidate already meets all role requirements!",
            },
            trace=master_trace.get_entries(),
        )
    else:
        try:
            graph, graph_data = build_skill_gap_graph(skill_gaps, master_trace)
            matched_pairs = match_courses(skill_gaps, master_trace)
            course_map = build_course_map(matched_pairs)
            matched_courses = list(course_map.values())
            pathway = generate_pathway(
                graph=graph,
                skill_gaps=skill_gaps,
                courses=matched_courses,
                trace_logger=master_trace,
            )
            full_catalog_hours = estimate_full_curriculum_hours()
            total_pathway_hours = sum(s.estimated_hours for s in pathway)
            metrics = compute_metrics(
                pathway=pathway,
                full_curriculum_hours=full_catalog_hours,
                role_requirements_count=len(skill_gaps),
            )
            from models.schemas import PathwayResponse
            pathway_response = PathwayResponse(
                pathway=pathway,
                total_estimated_hours=total_pathway_hours,
                efficiency_ratio=metrics.get("efficiency_ratio", 0.0),
                graph_data=graph_data,
                metrics=metrics,
                trace=master_trace.get_entries(),
            )
        except Exception as e:
            logger.error(f"Pathway step failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Pathway generation failed: {str(e)}")

    return FullAnalysisResponse(
        parse=parse_response,
        analyze=analyze_response,
        pathway=pathway_response,
    )



@app.get("/api/demo-presets", tags=["Demo"])
async def get_demo_presets():
    """Return pre-loaded demo resume + JD pairs from Kaggle datasets."""
    try:
        import json
        import random
        data_path = os.path.join(os.path.dirname(__file__), "data", "demo_presets.json")
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        resumes = data.get("resumes", [])
        jds = data.get("job_descriptions", [])
        

        sample_resumes = random.sample(resumes, min(5, len(resumes)))
        sample_jds = random.sample(jds, min(5, len(jds)))
        
        presets = []
        for i in range(min(5, len(resumes), len(jds))):
            r = sample_resumes[i]
            j = sample_jds[i]
            

            r_title = r.get("title", "Candidate").replace("Resume - ", "").strip()
            j_title = j.get("title", "Role").strip()
            
            presets.append({
                "id": f"demo_{i}_{r['id']}_{j['id']}",
                "label": f"{r_title} ➔ {j_title}",
                "icon": "📄",
                "resume": r['content'],
                "jd": j['content']
            })
        return {"presets": presets}
    except Exception as e:
        logger.error(f"Failed to load demo presets: {e}")

        return {"presets": []}
