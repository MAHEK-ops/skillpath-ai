import pytest
from services.resume_parser import clean_text, extract_text_from_bytes

def test_clean_text():
    raw_text = "This is a \n\n dirty   text\t with  spaces."
    cleaned = clean_text(raw_text)
    assert "\n\n" not in cleaned
    assert "  " not in cleaned
    assert cleaned == "This is a dirty text with spaces."

def test_extract_text_txt():
    content = b"Hello World"
    result = extract_text_from_bytes(content, "test.txt")
    assert "Hello World" in result

def test_extract_text_unsupported():
    with pytest.raises(Exception):
         extract_text_from_bytes(b"dummy data", "test.unknown")
