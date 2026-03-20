"""
/api/pathway router.
Generates the personalized, topologically-sorted, grounded learning pathway.
"""

import logging
from fastapi import APIRouter, HTTPException
from models.schemas import PathwayRequest, PathwayResponse
from services.graph_builder import build_skill_gap_graph
from services.course_matcher import match_courses, build_course_map, estimate_full_curriculum_hours
from services.pathway_generator import generate_pathway, compute_metrics
from services.trace_logger import TraceLogger

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/pathway", response_model=PathwayResponse, summary="Generate personalized learning pathway")
async def generate_learning_pathway(body: PathwayRequest):
    """
    Generate a personalized, prerequisite-aware, course-grounded learning pathway.

    Input:
    - skill_gaps: output from /api/analyze
    - candidate_skills: output from /api/parse

    Returns:
    - Ordered list of PathwayStep objects (each with a course, reasoning, and estimated hours)
    - Interactive graph data (React Flow nodes/edges)
    - Impact metrics (time saved, efficiency ratio, coverage)
    - Full reasoning trace
    """
    if not body.skill_gaps:
        raise HTTPException(status_code=422, detail="skill_gaps cannot be empty")

    trace = TraceLogger()

    trace.log(
        step="pathway_input",
        input_summary=f"{len(body.skill_gaps)} skill gaps to address",
        output_summary="Starting pathway generation pipeline",
        reasoning=(
            "Received skill gaps from analysis step. Will now: "
            "1) Build prerequisite DAG, 2) Match courses from catalog, "
            "3) Topologically sort + priority optimize the pathway."
        ),
    )


    try:
        graph, graph_data = build_skill_gap_graph(body.skill_gaps, trace)
    except Exception as e:
        logger.error(f"Graph building failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Graph construction failed: {str(e)}")


    try:
        matched_pairs = match_courses(body.skill_gaps, trace)
        course_map = build_course_map(matched_pairs)
        matched_courses = list(course_map.values())
    except Exception as e:
        logger.error(f"Course matching failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Course matching failed: {str(e)}")


    try:
        pathway = generate_pathway(
            graph=graph,
            skill_gaps=body.skill_gaps,
            courses=matched_courses,
            trace_logger=trace,
        )
    except Exception as e:
        logger.error(f"Pathway generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Pathway generation failed: {str(e)}")


    full_catalog_hours = estimate_full_curriculum_hours()
    total_pathway_hours = sum(s.estimated_hours for s in pathway)
    metrics = compute_metrics(
        pathway=pathway,
        full_curriculum_hours=full_catalog_hours,
        role_requirements_count=len(body.skill_gaps),
    )
    efficiency_ratio = metrics.get("efficiency_ratio", 0.0)

    return PathwayResponse(
        pathway=pathway,
        total_estimated_hours=total_pathway_hours,
        efficiency_ratio=efficiency_ratio,
        graph_data=graph_data,
        metrics=metrics,
        trace=trace.get_entries(),
    )
