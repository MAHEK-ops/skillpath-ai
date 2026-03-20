"""
/api/parse router.
Accepts resume and JD as file uploads or plain text,
extracts structured skills using the Groq LLM extractor.
"""

import logging
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from models.schemas import ParseRequest, ParseResponse
from services.resume_parser import extract_text_from_bytes, clean_text
from services.skill_extractor import extract_skills_from_texts
from services.trace_logger import TraceLogger

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/parse", response_model=ParseResponse, summary="Parse resume and job description")
async def parse_documents(
    resume_file: Optional[UploadFile] = File(None, description="Resume PDF, DOCX, or TXT"),
    jd_file: Optional[UploadFile] = File(None, description="Job description file"),
    resume_text: Optional[str] = Form(None, description="Resume as plain text"),
    jd_text: Optional[str] = Form(None, description="Job description as plain text"),
):
    """
    Parse a resume and job description to extract structured skill profiles.

    Accepts:
    - File uploads (PDF, DOCX, TXT) via multipart form, OR
    - Plain text via form fields

    Returns:
    - Candidate skill profile (with proficiency levels and evidence)
    - Role skill requirements (with importance levels)
    - Full reasoning trace
    """
    trace = TraceLogger()


    final_resume_text = ""
    if resume_file and resume_file.filename:
        try:
            file_bytes = await resume_file.read()
            final_resume_text = clean_text(extract_text_from_bytes(file_bytes, resume_file.filename))
            trace.log(
                step="resume_file_extraction",
                input_summary=f"Uploaded file: {resume_file.filename} ({len(file_bytes)} bytes)",
                output_summary=f"Extracted {len(final_resume_text)} characters of text",
                reasoning=f"Used file parser to extract text from '{resume_file.filename}'.",
            )
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to parse resume file: {str(e)}")
    elif resume_text:
        final_resume_text = clean_text(resume_text)
        trace.log(
            step="resume_text_input",
            input_summary=f"Plain text resume ({len(resume_text)} chars)",
            output_summary=f"Using provided resume text directly",
            reasoning="Resume provided as plain text — no file extraction needed.",
        )

    if not final_resume_text:
        raise HTTPException(status_code=422, detail="Please provide a resume file or resume_text.")


    final_jd_text = ""
    if jd_file and jd_file.filename:
        try:
            file_bytes = await jd_file.read()
            final_jd_text = clean_text(extract_text_from_bytes(file_bytes, jd_file.filename))
            trace.log(
                step="jd_file_extraction",
                input_summary=f"Uploaded file: {jd_file.filename} ({len(file_bytes)} bytes)",
                output_summary=f"Extracted {len(final_jd_text)} characters of text",
                reasoning=f"Used file parser to extract text from '{jd_file.filename}'.",
            )
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to parse JD file: {str(e)}")
    elif jd_text:
        final_jd_text = clean_text(jd_text)
        trace.log(
            step="jd_text_input",
            input_summary=f"Plain text JD ({len(jd_text)} chars)",
            output_summary="Using provided JD text directly",
            reasoning="JD provided as plain text — no file extraction needed.",
        )

    if not final_jd_text:
        raise HTTPException(status_code=422, detail="Please provide a job description file or jd_text.")


    try:
        candidate_skills, role_requirements = extract_skills_from_texts(
            resume_text=final_resume_text,
            jd_text=final_jd_text,
            trace_logger=trace,
        )
    except Exception as e:
        logger.error(f"Skill extraction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {str(e)}")

    return ParseResponse(
        candidate_skills=candidate_skills,
        role_requirements=role_requirements,
        trace=trace.get_entries(),
        raw_resume_text=final_resume_text[:1000], 
        raw_jd_text=final_jd_text[:1000],
    )


@router.post("/parse/text", response_model=ParseResponse, summary="Parse from plain text (JSON body)")
async def parse_text(body: ParseRequest):
    """
    JSON body version of /parse — accepts resume_text and job_description_text in the request body.
    Useful for testing and frontend integration without file uploads.
    """
    trace = TraceLogger()

    if not body.resume_text:
        raise HTTPException(status_code=422, detail="resume_text is required")
    if not body.job_description_text:
        raise HTTPException(status_code=422, detail="job_description_text is required")

    trace.log(
        step="text_input",
        input_summary=f"Resume: {len(body.resume_text)} chars, JD: {len(body.job_description_text)} chars",
        output_summary="Proceeding with plain text inputs",
        reasoning="Both resume and JD provided as plain text via JSON body.",
    )

    try:
        candidate_skills, role_requirements = extract_skills_from_texts(
            resume_text=clean_text(body.resume_text),
            jd_text=clean_text(body.job_description_text),
            trace_logger=trace,
        )
    except Exception as e:
        logger.error(f"Skill extraction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {str(e)}")

    return ParseResponse(
        candidate_skills=candidate_skills,
        role_requirements=role_requirements,
        trace=trace.get_entries(),
        raw_resume_text=body.resume_text[:1000],
        raw_jd_text=body.job_description_text[:1000],
    )
