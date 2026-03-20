"""
Course Matcher Service.
Grounds every skill gap to a course from the catalog.
Never hallucinate a course — only select from the catalog DB.
"""

import json
import logging
from pathlib import Path
from typing import List, Optional, Dict, Tuple

from models.schemas import SkillGap, Course
from services.trace_logger import TraceLogger

logger = logging.getLogger(__name__)

CATALOG_PATH = Path(__file__).parent.parent / "data" / "course_catalog.json"
_catalog_cache: Optional[List[Dict]] = None


def _load_catalog() -> List[Dict]:
    global _catalog_cache
    if _catalog_cache is None:
        with open(CATALOG_PATH, "r") as f:
            _catalog_cache = json.load(f)
    return _catalog_cache


def match_courses(
    skill_gaps: List[SkillGap],
    trace_logger: TraceLogger,
) -> List[Tuple[SkillGap, Optional[Course]]]:
    """
    For each skill gap, find the best-matching course from the catalog.

    Matching logic (in priority order):
    1. Exact skill_code match
    2. Partial skill_code overlap (course covers the skill)
    3. Difficulty alignment: prefer course difficulty closest to required_level

    Returns a list of (SkillGap, Course | None) tuples.
    """
    catalog = _load_catalog()


    skill_index: Dict[str, List[Dict]] = {}
    for course in catalog:
        for code in course.get("skill_codes", []):
            if code not in skill_index:
                skill_index[code] = []
            skill_index[code].append(course)

    results: List[Tuple[SkillGap, Optional[Course]]] = []

    for gap in skill_gaps:
        code = gap.skill_code.lower().strip()


        candidates = skill_index.get(code, [])


        if not candidates:
            gap_tokens = set(code.replace("_", " ").split())
            for course in catalog:
                course_tokens = set(" ".join(course.get("skill_codes", [])).replace("_", " ").split())
                if gap_tokens & course_tokens:
                    candidates.append(course)

        if not candidates:
            trace_logger.log(
                step="course_matching",
                input_summary=f"Skill: {gap.skill_name} ({code})",
                output_summary="No course found in catalog",
                reasoning=(
                    f"No course in the catalog directly covers '{gap.skill_name}'. "
                    f"This is a catalog gap — recommend adding a course for this skill. "
                    f"Pathway step will show estimated self-study time."
                ),
                metadata={"skill_code": code, "matched": False},
            )
            results.append((gap, None))
            continue


        def score_course(c: Dict) -> float:
            diff_match = -abs(c.get("difficulty", 3) - gap.required_level)

            exact_bonus = 2.0 if code in c.get("skill_codes", []) else 0.0
            return diff_match + exact_bonus

        best = max(candidates, key=score_course)
        course = Course(
            id=best["id"],
            title=best["title"],
            provider=best["provider"],
            skill_codes=best["skill_codes"],
            difficulty=best["difficulty"],
            duration_hours=best["duration_hours"],
            url=best["url"],
            description=best["description"],
        )

        course.__dict__["skill_code"] = code  

        trace_logger.log(
            step="course_matching",
            input_summary=f"Skill: {gap.skill_name} ({code}), required level: {gap.required_level}",
            output_summary=f"Matched: '{course.title}' by {course.provider} (difficulty {course.difficulty})",
            reasoning=(
                f"Found {len(candidates)} candidate courses for '{gap.skill_name}'. "
                f"Selected '{course.title}' (difficulty {course.difficulty}) because it best "
                f"matches the required proficiency level {gap.required_level}/5 "
                f"and directly covers the skill code '{code}'. "
                f"Course is sourced from catalog (ID: {course.id}) — no hallucination."
            ),
            metadata={
                "skill_code": code,
                "course_id": course.id,
                "candidates_count": len(candidates),
                "matched": True,
            },
        )
        results.append((gap, course))

    return results


def build_course_map(matched_pairs: List[Tuple[SkillGap, Optional[Course]]]) -> Dict[str, Course]:
    """Convert matched pairs to a skill_code -> Course dict for the pathway generator."""
    course_map: Dict[str, Course] = {}
    for gap, course in matched_pairs:
        if course is not None:

            course_map[gap.skill_code] = course
    return course_map


def estimate_full_curriculum_hours(catalog: Optional[List[Dict]] = None) -> float:
    """Estimate the total hours if someone took the full course catalog (baseline)."""
    if catalog is None:
        catalog = _load_catalog()
    return sum(c.get("duration_hours", 0) for c in catalog)
