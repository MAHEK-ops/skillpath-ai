"""
Pathway Generator Service.
Uses topological sort + priority optimization to produce an ordered learning pathway.
This is the core differentiator algorithm of SkillPath AI.
"""

import logging
from typing import List, Dict, Tuple, Any

import networkx as nx

from models.schemas import SkillGap, ExtractedSkill, PathwayStep, Course
from services.trace_logger import TraceLogger

logger = logging.getLogger(__name__)


def generate_pathway(
    graph: nx.DiGraph,
    skill_gaps: List[SkillGap],
    courses: List[Course],  
    trace_logger: TraceLogger,
) -> List[PathwayStep]:
    """
    Generate a topologically sorted, priority-optimized learning pathway.

    Algorithm:
    1. Topological sort the DAG → valid learning orderings
    2. Within each topological "level", sort by priority_score DESC, then duration ASC
    3. Map each step to its pre-matched course
    4. Attach prerequisite info and reasoning

    Returns a list of PathwayStep objects in recommended learning order.
    """
    gap_map: Dict[str, SkillGap] = {g.skill_code: g for g in skill_gaps}
    course_map: Dict[str, Course] = {c.skill_code: c for c in courses}  

    pathway_steps: List[PathwayStep] = []


    try:
        topo_order: List[str] = list(nx.topological_sort(graph))
    except nx.NetworkXUnfeasible:
        logger.warning("Graph has cycles — falling back to priority-sorted order")
        topo_order = [g.skill_code for g in sorted(skill_gaps, key=lambda x: x.priority_score, reverse=True)]

    trace_logger.log(
        step="topological_sort",
        input_summary=f"DAG with {graph.number_of_nodes()} nodes",
        output_summary=f"Topological order: {topo_order[:10]}{'...' if len(topo_order) > 10 else ''}",
        reasoning=(
            "Applied topological sort to the skill gap DAG to ensure prerequisite skills "
            "are always placed before the skills that depend on them. This guarantees "
            "a learnable sequence — you never encounter a skill before its prerequisites."
        ),
    )


    levels: Dict[str, int] = {}
    for node in topo_order:
        preds = list(graph.predecessors(node))
        if not preds:
            levels[node] = 0
        else:
            levels[node] = max(levels.get(p, 0) for p in preds) + 1


    def sort_key(skill_code: str) -> Tuple:
        gap = gap_map.get(skill_code)
        level = levels.get(skill_code, 0)
        priority = gap.priority_score if gap else 0
        duration = courses_by_skill(skill_code, course_map)
        return (level, -priority, duration)

    sorted_order = sorted(topo_order, key=sort_key)

    trace_logger.log(
        step="priority_optimization",
        input_summary="Topologically sorted skill order",
        output_summary="Reordered within each level by priority score (desc) then duration (asc)",
        reasoning=(
            "Within each topological level (skills at the same prerequisite depth), "
            "skills are sorted by priority score descending so high-importance, large-gap "
            "skills are addressed first. Within the same priority, shorter courses are "
            "preferred for quick wins."
        ),
    )


    for order_idx, skill_code in enumerate(sorted_order, start=1):
        gap = gap_map.get(skill_code)
        if gap is None:
            continue

        matched_course = course_map.get(skill_code)
        estimated_hours = matched_course.duration_hours if matched_course else estimate_hours(gap)
        prereqs = list(graph.predecessors(skill_code))

        reasoning = (
            f"This skill has a gap of {gap.gap_score}/5 and priority score {gap.priority_score:.2f}. "
            f"Importance: {gap.importance.value}. "
        )
        if prereqs:
            reasoning += f"Placed after prerequisites: {', '.join(prereqs)}. "
        if matched_course:
            reasoning += f"Mapped to: '{matched_course.title}' by {matched_course.provider} ({estimated_hours}h)."
        else:
            reasoning += "No exact course match found; estimated learning time applied."

        step = PathwayStep(
            order=order_idx,
            skill_code=skill_code,
            skill_name=gap.skill_name,
            gap_score=gap.gap_score,
            priority_score=gap.priority_score,
            estimated_hours=estimated_hours,
            course=matched_course,
            prerequisite_skills=prereqs,
            reasoning=reasoning,
        )
        pathway_steps.append(step)

        trace_logger.log(
            step="pathway_step",
            input_summary=f"Skill: {gap.skill_name} (gap={gap.gap_score}, priority={gap.priority_score:.2f})",
            output_summary=f"Step {order_idx}: {matched_course.title if matched_course else 'No course matched'}",
            reasoning=reasoning,
            metadata={
                "order": order_idx,
                "skill_code": skill_code,
                "course_id": matched_course.id if matched_course else None,
                "estimated_hours": estimated_hours,
                "prerequisites": prereqs,
            },
        )

    trace_logger.log(
        step="pathway_complete",
        input_summary=f"{len(skill_gaps)} skill gaps",
        output_summary=f"Generated {len(pathway_steps)}-step personalized learning pathway",
        reasoning=(
            f"Successfully generated a {len(pathway_steps)}-step learning pathway. "
            f"Total estimated time: {sum(s.estimated_hours for s in pathway_steps):.1f} hours. "
            f"All prerequisite orderings are respected."
        ),
        metadata={"total_steps": len(pathway_steps)},
    )

    return pathway_steps


def courses_by_skill(skill_code: str, course_map: Dict[str, "Course"]) -> float:
    """Return estimated hours for a skill, 0 if no course matched."""
    c = course_map.get(skill_code)
    return c.duration_hours if c else 0.0


def estimate_hours(gap: SkillGap) -> float:
    """Rough hour estimate when no course is found."""
    base = gap.gap_score * 8 
    return max(5.0, base)


def compute_metrics(
    pathway: List[PathwayStep],
    full_curriculum_hours: float,
    role_requirements_count: int,
) -> Dict[str, Any]:
    """Compute impact metrics for the results dashboard."""
    total_hours = sum(s.estimated_hours for s in pathway)
    time_saved = max(0.0, full_curriculum_hours - total_hours)
    time_saved_pct = (time_saved / full_curriculum_hours * 100) if full_curriculum_hours > 0 else 0
    efficiency_ratio = (len(pathway) / total_hours) if total_hours > 0 else 0

    return {
        "total_estimated_hours": round(total_hours, 1),
        "full_curriculum_hours": round(full_curriculum_hours, 1),
        "time_saved_hours": round(time_saved, 1),
        "time_saved_percentage": round(time_saved_pct, 1),
        "efficiency_ratio": round(efficiency_ratio, 3),
        "skills_in_pathway": len(pathway),
        "role_requirements_count": role_requirements_count,
    }
