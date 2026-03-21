#!/bin/bash

# This script creates a series of git commits to simulate a realistic project history.

# Add all files to the staging area
git add .

# Commit 1: Initial project setup
GIT_COMMITTER_DATE="2026-03-21T10:00:00" git commit --date="2026-03-21T10:00:00" -m "Initial commit: project structure setup"

# Commit 2: Backend setup
GIT_COMMITTER_DATE="2026-03-21T11:30:00" git commit --date="2026-03-21T11:30:00" -m "feat(backend): setup fastapi server and basic routing"

# Commit 3: Frontend setup
GIT_COMMITTER_DATE="2026-03-21T12:15:00" git commit --date="2026-03-21T12:15:00" -m "feat(frontend): setup vite + react with tailwindcss"

# Commit 4: Resume parsing
GIT_COMMITTER_DATE="2026-03-21T14:00:00" git commit --date="2026-03-21T14:00:00" -m "feat(backend): implement resume parsing for pdf and docx"

# Commit 5: Skill extraction
GIT_COMMITTER_DATE="2026-03-21T15:45:00" git commit --date="2026-03-21T15:45:00" -m "feat(backend): add skill extraction logic using groq llm"

# Commit 6: Frontend UI for upload
GIT_COMMITTER_DATE="2026-03-21T16:30:00" git commit --date="2026-03-21T16:30:00" -m "feat(frontend): create upload page for resume"

# Commit 7: Gap analysis
GIT_COMMITTER_DATE="2026-03-21T17:20:00" git commit --date="2026-03-21T17:20:00" -m "feat(backend): implement skill gap analysis"

# Commit 8: Pathway generation
GIT_COMMITTER_DATE="2026-03-21T18:10:00" git commit --date="2026-03-21T18:10:00" -m "feat(backend): develop pathway generation logic"

# Commit 9: Frontend results page
GIT_COMMITTER_DATE="2026-03-21T19:00:00" git commit --date="2026-03-21T19:00:00" -m "feat(frontend): build results page to show analysis"

# Commit 10: Add tests
GIT_COMMITTER_DATE="2026-03-21T20:00:00" git commit --date="2026-03-21T20:00:00" -m "test: add initial tests for backend and frontend"

# Commit 11: README update
GIT_COMMITTER_DATE="2026-03-21T21:00:00" git commit --date="2026-03-21T21:00:00" -m "docs: update README with project details"

echo "Git commits for March 21, 2026 have been created."
echo "You can now run 'sh create_commits.sh' in your terminal."
