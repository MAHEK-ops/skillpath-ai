"""
Pydantic schemas for SkillPath AI backend.
All request and response models for the API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum




class ImportanceLevel(str, Enum):
    CRITICAL = "critical"
    IMPORTANT = "important"
    NICE_TO_HAVE = "nice_to_have"


class ProficiencyLevel(int, Enum):
    NONE = 0
    BEGINNER = 1
    ELEMENTARY = 2
    INTERMEDIATE = 3
    ADVANCED = 4
    EXPERT = 5




class ExtractedSkill(BaseModel):
    skill_name: str = Field(..., description="Canonical skill name")
    skill_code: str = Field(..., description="Normalized skill code (lowercase, underscored)")
    proficiency_level: int = Field(..., ge=0, le=5, description="Level 0-5")
    years_experience: Optional[float] = Field(None, description="Years of experience with this skill")
    evidence: Optional[str] = Field(None, description="Text snippet evidence for this skill")
    category: Optional[str] = Field(None, description="Skill category (e.g., Programming, Marketing)")


class RoleSkillRequirement(BaseModel):
    skill_name: str = Field(..., description="Canonical skill name")
    skill_code: str = Field(..., description="Normalized skill code")
    required_level: int = Field(..., ge=1, le=5, description="Required proficiency level 1-5")
    importance: ImportanceLevel = Field(..., description="How critical is this skill for the role")
    category: Optional[str] = Field(None, description="Skill category")


class SkillGap(BaseModel):
    skill_code: str
    skill_name: str
    candidate_level: int = Field(..., ge=0, le=5)
    required_level: int = Field(..., ge=1, le=5)
    gap_score: float = Field(..., description="Gap score (0–5), higher = bigger gap")
    priority_score: float = Field(..., description="Gap × importance weight")
    importance: ImportanceLevel
    category: Optional[str] = None




class Course(BaseModel):
    id: str
    title: str
    provider: str
    skill_codes: List[str]
    difficulty: int = Field(..., ge=1, le=5)
    duration_hours: float
    url: str
    description: str


class PathwayStep(BaseModel):
    order: int = Field(..., description="Step number in the learning path (1-indexed)")
    skill_code: str
    skill_name: str
    gap_score: float
    priority_score: float
    estimated_hours: float
    course: Optional[Course] = None
    prerequisite_skills: List[str] = Field(default_factory=list)
    reasoning: str = Field(..., description="Why this step is here")




class TraceEntry(BaseModel):
    step: str = Field(..., description="Step name, e.g. skill_extraction, gap_analysis")
    input_summary: str
    output_summary: str
    reasoning: str
    metadata: Optional[Dict[str, Any]] = None




class ParseRequest(BaseModel):
    resume_text: Optional[str] = None
    job_description_text: Optional[str] = None


class ParseResponse(BaseModel):
    candidate_skills: List[ExtractedSkill]
    role_requirements: List[RoleSkillRequirement]
    trace: List[TraceEntry]
    raw_resume_text: Optional[str] = None
    raw_jd_text: Optional[str] = None


class AnalyzeRequest(BaseModel):
    candidate_skills: List[ExtractedSkill]
    role_requirements: List[RoleSkillRequirement]


class AnalyzeResponse(BaseModel):
    skill_gaps: List[SkillGap]
    skills_satisfied: List[ExtractedSkill]
    total_gap_score: float
    coverage_score: float = Field(..., description="% of role skills the candidate already meets")
    time_saved_hours: float = Field(..., description="Estimated hours saved vs full curriculum")
    trace: List[TraceEntry]


class PathwayRequest(BaseModel):
    skill_gaps: List[SkillGap]
    candidate_skills: List[ExtractedSkill]


class PathwayResponse(BaseModel):
    pathway: List[PathwayStep]
    total_estimated_hours: float
    efficiency_ratio: float = Field(..., description="Skills covered per hour of training")
    graph_data: Dict[str, Any] = Field(..., description="Graph nodes/edges for frontend visualization")
    metrics: Dict[str, Any]
    trace: List[TraceEntry]




class FullAnalysisRequest(BaseModel):
    resume_text: Optional[str] = None
    job_description_text: Optional[str] = None


class FullAnalysisResponse(BaseModel):
    parse: ParseResponse
    analyze: AnalyzeResponse
    pathway: PathwayResponse
