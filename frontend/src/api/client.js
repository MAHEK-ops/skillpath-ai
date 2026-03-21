const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = {
  async parseDocs(resumeFile, jdFile, resumeText, jdText) {
    try {
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resume_file', resumeFile);
      } else if (resumeText) {
        formData.append('resume_text', resumeText);
      }
      
      if (jdFile) {
        formData.append('jd_file', jdFile);
      } else if (jdText) {
        formData.append('jd_text', jdText);
      }

      const response = await fetch(`${API_BASE_URL}/parse`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (parseDocs):', error);
      throw error;
    }
  },

  async analyzeGaps(candidateSkills, roleRequirements) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          candidate_skills: candidateSkills,
          role_requirements: roleRequirements,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (analyzeGaps):', error);
      throw error;
    }
  },

  async generatePathway(skillGaps, candidateSkills) {
    try {
      const response = await fetch(`${API_BASE_URL}/pathway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          skill_gaps: skillGaps,
          candidate_skills: candidateSkills,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (generatePathway):', error);
      throw error;
    }
  },

  async fullAnalysis(resumeFile, jdFile, resumeText, jdText) {
    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resume_file', resumeFile);
      else if (resumeText) formData.append('resume_text', resumeText);
      
      if (jdFile) formData.append('jd_file', jdFile);
      else if (jdText) formData.append('jd_text', jdText);

      const response = await fetch(`${API_BASE_URL}/full-analysis`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (fullAnalysis):', error);
      throw error;
    }
  }
};
