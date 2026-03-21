"""
/api/analyze router.
Runs the gap analysis algorithm on candidate skills vs. role requirements.
"""

import logging
from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.gap_analyzer import (
    analyze_gaps,
    compute_coverage_score,
    compute_projected_score,
    compute_category_gaps,
)
from services.trace_logger import TraceLogger

logger = logging.getLogger(__name__)
router = APIRouter()


FULL_CURRICULUM_HOURS = 3200.0  


@router.post("/analyze", response_model=AnalyzeResponse, summary="Analyze skill gaps")
async def analyze(body: AnalyzeRequest):
    """
    Analyze the gap between candidate skills and role requirements.

    Input:
    - candidate_skills: output from /api/parse
    - role_requirements: output from /api/parse

    Returns:
    - Detailed list of skill gaps with priority scores
    - Skills the candidate already satisfies
    - Coverage score (% of role requirements met)
    - Projected score after completing the roadmap
    - Skill gaps grouped by category
    - Time saved estimate vs full curriculum
    - Reasoning trace
    """
    if not body.candidate_skills:
        raise HTTPException(status_code=422, detail="candidate_skills cannot be empty")
    if not body.role_requirements:
        raise HTTPException(status_code=422, detail="role_requirements cannot be empty")

    trace = TraceLogger()

    trace.log(
        step="analyze_input",
        input_summary=f"{len(body.candidate_skills)} candidate skills, {len(body.role_requirements)} role requirements",
        output_summary="Starting gap analysis",
        reasoning="Received parsed skill profiles. Beginning gap scoring algorithm.",
    )

    try:
        skill_gaps, skills_satisfied = analyze_gaps(
            candidate_skills=body.candidate_skills,
            role_requirements=body.role_requirements,
            trace_logger=trace,
        )
    except Exception as e:
        logger.error(f"Gap analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Gap analysis failed: {str(e)}")

    total_gap_score = sum(g.gap_score for g in skill_gaps)
    coverage_score = compute_coverage_score(body.role_requirements, skill_gaps, body.candidate_skills)
    projected_score = compute_projected_score(coverage_score, skill_gaps)
    category_gaps = compute_category_gaps(skill_gaps)

    time_saved_hours = round((coverage_score / 100) * FULL_CURRICULUM_HOURS, 1)

    return AnalyzeResponse(
        skill_gaps=skill_gaps,
        skills_satisfied=skills_satisfied,
        total_gap_score=round(total_gap_score, 2),
        coverage_score=coverage_score,
        time_saved_hours=time_saved_hours,
        projected_score=projected_score,
        category_gaps=category_gaps,
        trace=trace.get_entries(),
    )
