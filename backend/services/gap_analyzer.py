"""
Gap Analyzer Service.
Computes skill gaps between candidate profile and job description requirements.
Uses a graph-based scoring algorithm with importance weighting.
"""

import logging
from typing import List, Dict, Tuple
from models.schemas import (
    ExtractedSkill,
    RoleSkillRequirement,
    SkillGap,
    ImportanceLevel,
    TraceEntry,
)
from services.trace_logger import TraceLogger

logger = logging.getLogger(__name__)


IMPORTANCE_WEIGHTS: Dict[str, float] = {
    ImportanceLevel.CRITICAL: 3.0,
    ImportanceLevel.IMPORTANT: 2.0,
    ImportanceLevel.NICE_TO_HAVE: 1.0,
}


def analyze_gaps(
    candidate_skills: List[ExtractedSkill],
    role_requirements: List[RoleSkillRequirement],
    trace_logger: TraceLogger,
) -> Tuple[List[SkillGap], List[ExtractedSkill]]:
    """
    Compare candidate skills against role requirements to find gaps.

    Returns:
        - skill_gaps: Skills where the candidate doesn't meet requirements
        - skills_satisfied: Skills the candidate already meets
    """

    candidate_map: Dict[str, int] = {}
    for skill in candidate_skills:
        code = skill.skill_code.lower().strip()

        candidate_map[code] = max(candidate_map.get(code, 0), skill.proficiency_level)

    skill_gaps: List[SkillGap] = []
    skills_satisfied: List[ExtractedSkill] = []

    for req in role_requirements:
        code = req.skill_code.lower().strip()
        candidate_level = candidate_map.get(code, 0)
        gap_score = max(0.0, float(req.required_level - candidate_level))
        weight = IMPORTANCE_WEIGHTS.get(req.importance, 1.0)
        priority_score = gap_score * weight

        if gap_score > 0:
            skill_gaps.append(
                SkillGap(
                    skill_code=code,
                    skill_name=req.skill_name,
                    candidate_level=candidate_level,
                    required_level=req.required_level,
                    gap_score=gap_score,
                    priority_score=priority_score,
                    importance=req.importance,
                    category=req.category,
                )
            )
            trace_logger.log(
                step="gap_analysis",
                input_summary=f"Skill: {req.skill_name}, Candidate: {candidate_level}/5, Required: {req.required_level}/5",
                output_summary=f"Gap: {gap_score}, Priority: {priority_score:.2f}",
                reasoning=(
                    f"Candidate has level {candidate_level} but role requires level {req.required_level}. "
                    f"Gap score = {gap_score}. Importance: {req.importance.value}, "
                    f"so priority = {gap_score} × {weight} = {priority_score:.2f}."
                ),
                metadata={"skill_code": code, "importance": req.importance.value},
            )
        else:

            cand_obj = next(
                (s for s in candidate_skills if s.skill_code.lower() == code), None
            )
            if cand_obj:
                skills_satisfied.append(cand_obj)
            trace_logger.log(
                step="gap_analysis",
                input_summary=f"Skill: {req.skill_name}, Candidate: {candidate_level}/5, Required: {req.required_level}/5",
                output_summary="No gap — requirement satisfied",
                reasoning=(
                    f"Candidate already meets or exceeds requirement for '{req.skill_name}' "
                    f"(has level {candidate_level}, needs level {req.required_level})."
                ),
                metadata={"skill_code": code},
            )


    skill_gaps.sort(key=lambda g: g.priority_score, reverse=True)

    trace_logger.log(
        step="gap_analysis_summary",
        input_summary=f"{len(role_requirements)} role requirements, {len(candidate_skills)} candidate skills",
        output_summary=f"{len(skill_gaps)} gaps found, {len(skills_satisfied)} requirements satisfied",
        reasoning=(
            f"Analyzed all {len(role_requirements)} role requirements. "
            f"Found {len(skill_gaps)} skill gaps sorted by priority score. "
            f"Candidate already meets {len(skills_satisfied)} requirements."
        ),
        metadata={
            "total_requirements": len(role_requirements),
            "gaps": len(skill_gaps),
            "satisfied": len(skills_satisfied),
        },
    )

    return skill_gaps, skills_satisfied


def compute_coverage_score(
    role_requirements: List[RoleSkillRequirement],
    skill_gaps: List[SkillGap],
) -> float:
    """Return % of role skills the candidate already meets (0.0–100.0)."""
    if not role_requirements:
        return 100.0
    satisfied = len(role_requirements) - len(skill_gaps)
    return round((satisfied / len(role_requirements)) * 100, 1)
