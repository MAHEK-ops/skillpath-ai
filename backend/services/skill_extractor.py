"""
Skill Extractor Service — powered by Groq LLM (llama-3.3-70b-versatile).
Extracts structured skill profiles from resume and job description text.
Uses strict JSON output + Pydantic validation to prevent hallucinations.
"""

import json
import logging
import os
import re
import time
from pathlib import Path
from typing import List, Tuple, Optional

from groq import Groq, RateLimitError
from models.schemas import (
    ExtractedSkill,
    RoleSkillRequirement,
    ImportanceLevel,
    TraceEntry,
)
from services.trace_logger import TraceLogger

logger = logging.getLogger(__name__)


def _get_client() -> Groq:
    """Always create a fresh Groq client using the current GROQ_API_KEY env var.
    This ensures a new API key in .env takes effect after server restart."""
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set. Please add it to your .env file.")
    return Groq(api_key=api_key)



_onet_skills_cache: Optional[List[dict]] = None

def _load_onet_skills() -> List[dict]:
    global _onet_skills_cache
    if _onet_skills_cache is None:
        path = Path(__file__).parent.parent / "data" / "onet_skills.json"
        with open(path) as f:
            data = json.load(f)
            _onet_skills_cache = data.get("skills", [])
    return _onet_skills_cache


def _onet_context_snippet() -> str:
    """Build a compact skill reference for the LLM prompt. Samples 100 skills to fit in context window."""
    import random
    skills = _load_onet_skills()
    

    random.seed(42)
    sample_size = min(100, len(skills))
    sampled_skills = random.sample(skills, sample_size)
    
    lines = [f"  - {s['name']} (code: {s['code']}, category: {s['category']})" for s in sampled_skills]
    return "\n".join(lines)


RESUME_EXTRACTION_PROMPT = """You are an expert skills analyst. Extract all technical and professional skills from the resume text below.

Use canonical O*NET-aligned skill names and codes generally where possible. Here is a sample of the taxonomy format for reference:
{onet_context}

Rules:
- Proficiency level: 1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert
- Use snake_case for skill_code (e.g., "machine_learning", "project_management")
- Infer proficiency from years of experience, job titles, and context clues
- Include both technical and soft skills
- Be thorough but accurate — only extract clearly evidenced skills
- Evidence should be a brief quote from the resume

Return ONLY valid JSON (no markdown, no explanation):
{{
  "skills": [
    {{
      "skill_name": "Python Programming",
      "skill_code": "python",
      "proficiency_level": 4,
      "years_experience": 5.0,
      "evidence": "5 years of Python development at Google",
      "category": "Programming"
    }}
  ]
}}

RESUME TEXT:
{resume_text}
"""

JD_EXTRACTION_PROMPT = """You are an expert job requirements analyst. Extract all required and preferred skills from the job description below.

Use canonical O*NET-aligned skill names and codes generally where possible. Here is a sample of the taxonomy format for reference:
{onet_context}

Rules:
- Required level: 1=Basic awareness, 2=Working knowledge, 3=Proficient, 4=Advanced, 5=Expert
- Use snake_case for skill_code (e.g., "machine_learning", "project_management")
- Importance: "critical" = must-have, "important" = strongly preferred, "nice_to_have" = bonus
- Infer importance from words like "required", "must", "preferred", "plus", "bonus"
- Include both technical and soft skills

Return ONLY valid JSON (no markdown, no explanation):
{{
  "requirements": [
    {{
      "skill_name": "Python Programming",
      "skill_code": "python",
      "required_level": 4,
      "importance": "critical",
      "category": "Programming"
    }}
  ]
}}

JOB DESCRIPTION TEXT:
{jd_text}
"""


def _call_groq(prompt: str, max_tokens: int = 2048, max_retries: int = 2) -> str:
    """Call Groq API and return the text response.
    
    Retries on 429 rate-limit errors up to max_retries times,
    waiting the time suggested in the error message (capped at 30s).
    """
    for attempt in range(max_retries + 1):
        client = _get_client()
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a precise skills extraction AI. "
                            "Always return valid JSON only, with no markdown code blocks, no extra text."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                max_tokens=max_tokens,
                temperature=0.1,
            )
            return response.choices[0].message.content.strip()
        except RateLimitError as e:
            if attempt >= max_retries:
                raise

            wait_seconds = 10  
            msg = str(e)
            import re as _re
            m = _re.search(r"try again in ([\d.]+)s", msg)
            if m:
                wait_seconds = min(float(m.group(1)), 30) 
            logger.warning(
                f"Groq rate limit hit (attempt {attempt + 1}/{max_retries + 1}). "
                f"Retrying in {wait_seconds:.1f}s..."
            )
            time.sleep(wait_seconds)
    raise RuntimeError("Max retries exceeded calling Groq API")

def _clean_json_response(raw: str) -> str:
    """Strip markdown code fences if the LLM wraps output in them."""
    raw = re.sub(r"```(?:json)?\s*", "", raw)
    raw = re.sub(r"```\s*", "", raw)
    return raw.strip()


def extract_candidate_skills(
    resume_text: str,
    trace_logger: TraceLogger,
) -> List[ExtractedSkill]:
    """
    Use Groq LLM to extract structured skill profile from resume text.
    Returns a list of ExtractedSkill objects.
    """
    logger.info("Extracting candidate skills from resume via Groq LLM...")
    onet_ctx = _onet_context_snippet()
    prompt = RESUME_EXTRACTION_PROMPT.format(
        onet_context=onet_ctx,
        resume_text=resume_text[:6000], 
    )

    try:
        raw_response = _call_groq(prompt, max_tokens=2048)
        clean = _clean_json_response(raw_response)
        parsed = json.loads(clean)
        raw_skills = parsed.get("skills", [])
    except (json.JSONDecodeError, KeyError) as e:
        # pyre-ignore[16]
        logger.error(f"LLM response parse error for resume: {e}\nRaw: {raw_response[:500]}")
        trace_logger.log(
            step="resume_skill_extraction",
            input_summary=f"Resume text ({len(resume_text)} chars)",
            output_summary="PARSE ERROR — LLM returned invalid JSON",
            reasoning=f"LLM returned unparseable JSON: {str(e)[:200]}. Returning empty skill list.",
        )
        return []

    skills: List[ExtractedSkill] = []
    for item in raw_skills:
        try:
            skill = ExtractedSkill(
                skill_name=item.get("skill_name", "Unknown"),
                skill_code=item.get("skill_code", "unknown").lower().replace(" ", "_"),
                proficiency_level=max(0, min(5, int(item.get("proficiency_level", 1)))),
                years_experience=float(item.get("years_experience") or 0) or None,
                evidence=item.get("evidence"),
                category=item.get("category"),
            )
            skills.append(skill)
        except Exception as e:
            logger.warning(f"Skipping malformed skill entry: {item} — {e}")

    trace_logger.log(
        step="resume_skill_extraction",
        input_summary=f"Resume text ({len(resume_text)} chars)",
        output_summary=f"Extracted {len(skills)} skills from resume",
        reasoning=(
            f"Used Groq LLM (llama-3.3-70b-versatile) to parse the resume. "
            f"Found {len(skills)} skills including technical and soft skills. "
            f"O*NET canonical taxonomy was provided as context to ensure consistent naming."
        ),
        metadata={
            "total_skills": len(skills),
            "model": "llama-3.3-70b-versatile",
            "resume_length": len(resume_text),
        },
    )
    return skills


def extract_role_requirements(
    jd_text: str,
    trace_logger: TraceLogger,
) -> List[RoleSkillRequirement]:
    """
    Use Groq LLM to extract structured skill requirements from a job description.
    Returns a list of RoleSkillRequirement objects.
    """
    logger.info("Extracting role requirements from JD via Groq LLM...")
    onet_ctx = _onet_context_snippet()
    prompt = JD_EXTRACTION_PROMPT.format(
        onet_context=onet_ctx,
        jd_text=jd_text[:6000],
    )

    try:
        raw_response = _call_groq(prompt, max_tokens=2048)
        clean = _clean_json_response(raw_response)
        parsed = json.loads(clean)
        raw_reqs = parsed.get("requirements", [])
    except (json.JSONDecodeError, KeyError) as e:

        logger.error(f"LLM response parse error for JD: {e}\nRaw: {raw_response[:500]}")
        trace_logger.log(
            step="jd_requirement_extraction",
            input_summary=f"JD text ({len(jd_text)} chars)",
            output_summary="PARSE ERROR — LLM returned invalid JSON",
            reasoning=f"LLM returned unparseable JSON: {str(e)[:200]}. Returning empty requirements list.",
        )
        return []

    requirements: List[RoleSkillRequirement] = []
    for item in raw_reqs:
        try:
            importance_str = item.get("importance", "important").lower()
            if importance_str not in [e.value for e in ImportanceLevel]:
                importance_str = "important"
            req = RoleSkillRequirement(
                skill_name=item.get("skill_name", "Unknown"),
                skill_code=item.get("skill_code", "unknown").lower().replace(" ", "_"),
                required_level=max(1, min(5, int(item.get("required_level", 3)))),
                importance=ImportanceLevel(importance_str),
                category=item.get("category"),
            )
            requirements.append(req)
        except Exception as e:
            logger.warning(f"Skipping malformed requirement: {item} — {e}")

    trace_logger.log(
        step="jd_requirement_extraction",
        input_summary=f"Job description text ({len(jd_text)} chars)",
        output_summary=f"Extracted {len(requirements)} role requirements",
        reasoning=(
            f"Used Groq LLM (llama-3.3-70b-versatile) to parse the job description. "
            f"Identified {len(requirements)} skill requirements with importance levels "
            f"(critical/important/nice_to_have) to weight the gap analysis."
        ),
        metadata={
            "total_requirements": len(requirements),
            "model": "llama-3.3-70b-versatile",
            "jd_length": len(jd_text),
        },
    )
    return requirements


def extract_skills_from_texts(
    resume_text: str,
    jd_text: str,
    trace_logger: TraceLogger,
) -> Tuple[List[ExtractedSkill], List[RoleSkillRequirement]]:
    """
    Main entry point: extract candidate skills and role requirements in sequence.
    """
    candidate_skills = extract_candidate_skills(resume_text, trace_logger)
    role_requirements = extract_role_requirements(jd_text, trace_logger)
    return candidate_skills, role_requirements
