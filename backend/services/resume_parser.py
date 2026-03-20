"""
Resume Parser Service.
Extracts raw text from PDF, DOCX, and plain text files/strings.
"""

import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file's bytes."""
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return "\n".join(text_parts).strip()
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}, falling back to PyPDF2")
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
            return "\n".join(text_parts).strip()
        except Exception as e2:
            logger.error(f"PyPDF2 also failed: {e2}")
            raise ValueError(f"Could not extract text from PDF: {e2}")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX file's bytes."""
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
        return "\n".join(paragraphs).strip()
    except Exception as e:
        logger.error(f"Failed to extract DOCX: {e}")
        raise ValueError(f"Could not extract text from DOCX: {e}")


def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """
    Dispatch to the appropriate parser based on file extension.
    Supports PDF, DOCX, DOC, TXT, and MD files.
    """
    filename_lower = filename.lower()
    if filename_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename_lower.endswith((".docx", ".doc")):
        return extract_text_from_docx(file_bytes)
    elif filename_lower.endswith((".txt", ".md")):
        try:
            return file_bytes.decode("utf-8").strip()
        except UnicodeDecodeError:
            return file_bytes.decode("latin-1").strip()
    else:

        try:
            return file_bytes.decode("utf-8").strip()
        except Exception as e:
            raise ValueError(f"Unsupported file type: {filename}. Please upload PDF, DOCX, or TXT.")


def clean_text(text: str) -> str:
    """Remove excessive whitespace and normalize the text."""
    import re

    text = text.replace("\x00", "")

    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()
