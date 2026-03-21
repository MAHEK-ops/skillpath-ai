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
        - strong_skills: Skills the candidate already meets (renamed from skills_satisfied
                         to match the frontend's expected key)
    """

    candidate_map: Dict[str, int] = {}
    for skill in candidate_skills:
        code = skill.skill_code.lower().strip()
        candidate_map[code] = max(candidate_map.get(code, 0), skill.proficiency_level)

    skill_gaps: List[SkillGap] = []
    strong_skills: List[ExtractedSkill] = [] 

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
                strong_skills.append(cand_obj) 
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
        output_summary=f"{len(skill_gaps)} gaps found, {len(strong_skills)} requirements satisfied",
        reasoning=(
            f"Analyzed all {len(role_requirements)} role requirements. "
            f"Found {len(skill_gaps)} skill gaps sorted by priority score. "
            f"Candidate already meets {len(strong_skills)} requirements."
        ),
        metadata={
            "total_requirements": len(role_requirements),
            "gaps": len(skill_gaps),
            "satisfied": len(strong_skills),
        },
    )

    return skill_gaps, strong_skills  


def compute_coverage_score(
    role_requirements: List[RoleSkillRequirement],
    skill_gaps: List[SkillGap],
    candidate_skills: List[ExtractedSkill],
) -> float:
    """
    FIX 1: Return weighted partial-credit coverage score (0.0–100.0).

    Old version was binary (met/not-met), which ignored candidates who were
    close to meeting a requirement. This version gives partial credit based
    on how much of each requirement is fulfilled, weighted by importance.
    """
    if not role_requirements:
        return 100.0

    candidate_map: Dict[str, int] = {
        s.skill_code.lower(): s.proficiency_level for s in candidate_skills
    }

    total_weight = 0.0
    covered_weight = 0.0

    for req in role_requirements:
        code = req.skill_code.lower().strip()
        weight = IMPORTANCE_WEIGHTS.get(req.importance, 1.0)
        candidate_level = candidate_map.get(code, 0)

        coverage = min(candidate_level / req.required_level, 1.0) if req.required_level > 0 else 1.0

        total_weight += weight
        covered_weight += coverage * weight

    return round((covered_weight / total_weight) * 100, 1)


def compute_category_gaps(skill_gaps: List[SkillGap]) -> Dict[str, List[SkillGap]]:
    """
    FIX 3: Group skill gaps by category.

    Previously, category data existed on each SkillGap object but was never
    aggregated — so the frontend always received an empty dict and showed
    '0 Categories'. This function builds the grouped structure the frontend needs.
    """
    categories: Dict[str, List[SkillGap]] = {}
    for gap in skill_gaps:
        cat = gap.category or "Uncategorized"
        categories.setdefault(cat, []).append(gap)
    return categories


def compute_projected_score(
    coverage_score: float,
    skill_gaps: List[SkillGap],
) -> float:
    """
    FIX 4: Estimate the candidate's match score after completing the roadmap.

    Previously this was never computed — the frontend hardcoded 91% as a
    placeholder. This uses a weighted model: critical gaps contribute more
    to the improvement potential than nice-to-have gaps. Capped at 97 to
    remain realistic (no roadmap guarantees 100% readiness).

    Formula:
        improvement = sum of (gap_score * weight) for each gap, normalised
        projected   = coverage_score + improvement_potential * 0.85
    """
    if not skill_gaps:
        return min(round(coverage_score + 5.0, 1), 97.0)


    total_weighted_gap = sum(
        g.gap_score * IMPORTANCE_WEIGHTS.get(g.importance, 1.0)
        for g in skill_gaps
    )


    max_possible_gap = sum(
        5.0 * IMPORTANCE_WEIGHTS.get(g.importance, 1.0)
        for g in skill_gaps
    )


    improvement_potential = (total_weighted_gap / max_possible_gap) * 100 if max_possible_gap > 0 else 0.0


    projected = coverage_score + (improvement_potential * 0.85)

    return round(min(projected, 97.0), 1)