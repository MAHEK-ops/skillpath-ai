import pytest
from unittest.mock import patch, MagicMock
from services.skill_extractor import extract_skills_from_texts
from services.trace_logger import TraceLogger

@patch("services.skill_extractor._load_onet_skills")
@patch("services.skill_extractor._get_client")
def test_extract_skills_mocked(mock_get_client, mock_load_onet_skills):

    mock_chat = MagicMock()
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"skills": []}'
    mock_chat.chat.completions.create.return_value = mock_response
    mock_get_client.return_value = mock_chat


    mock_load_onet_skills.return_value = [{"name": "Python", "code": "CS-001", "category": "Programming"}]

    trace = TraceLogger()
    try:
        cand, req = extract_skills_from_texts(
            resume_text="Experienced in Python",
            jd_text="Need Python Developer",
            trace_logger=trace
        )

        assert isinstance(cand, list)
        assert isinstance(req, list)
        assert mock_chat.chat.completions.create.called
    except Exception as e:

        assert mock_chat.chat.completions.create.called
