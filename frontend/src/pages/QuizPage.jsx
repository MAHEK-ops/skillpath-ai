import React, { useState } from 'react';

const quizQuestions = [
    {
        id: 1,
        question: "What is your primary area of expertise?",
        options: ["Data Science & Analytics", "Software Engineering", "Product Management", "Design & UX"]
    },
    {
        id: 2,
        question: "How many years of professional experience do you have?",
        options: ["0-2 years", "3-5 years", "6-10 years", "10+ years"]
    },
    {
        id: 3,
        question: "Which of these languages/tools are you most comfortable with?",
        options: ["Python / SQL", "JavaScript / TypeScript", "Java / C#", "Figma / Adobe XD"]
    },
    {
        id: 4,
        question: "What best describes your current skill level?",
        options: ["Beginner — just starting out", "Some experience — worked on projects", "Comfortable — used professionally", "Advanced — deep expertise"]
    }
];

// Maps quiz answers to a realistic synthetic resume only
function generateResume(answers) {
    const area = answers[0] || "Software Engineering"
    const experience = answers[1] || "3-5 years"
    const tools = answers[2] || "Python / SQL"
    const skillLevel = answers[3] || "Some experience — worked on projects"

    const yearsMap = {
        "0-2 years": "1",
        "3-5 years": "4",
        "6-10 years": "8",
        "10+ years": "12"
    }
    const years = yearsMap[experience] || "3"

    const skillProfiles = {
        "Data Science & Analytics": {
            skills: ["Python", "SQL", "Data Analysis", "Excel", "Statistics", "Pandas", "Numpy"],
            resumeRole: "Data Analyst",
        },
        "Software Engineering": {
            skills: ["JavaScript", "TypeScript", "React", "Node.js", "Git", "REST APIs"],
            resumeRole: "Software Engineer",
        },
        "Product Management": {
            skills: ["Product Strategy", "Roadmapping", "Agile", "Stakeholder Management", "User Research"],
            resumeRole: "Product Manager",
        },
        "Design & UX": {
            skills: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"],
            resumeRole: "UX Designer",
        }
    }

    const toolSkillMap = {
        "Python / SQL": ["Python", "SQL", "Pandas", "NumPy"],
        "JavaScript / TypeScript": ["JavaScript", "TypeScript", "React", "Node.js"],
        "Java / C#": ["Java", "C#", ".NET", "Spring Boot"],
        "Figma / Adobe XD": ["Figma", "Adobe XD", "Sketch", "Prototyping"]
    }

    const levelMap = {
        "Beginner — just starting out": "junior",
        "Some experience — worked on projects": "mid-level",
        "Comfortable — used professionally": "senior",
        "Advanced — deep expertise": "lead"
    }

    const profile = skillProfiles[area] || skillProfiles["Software Engineering"]
    const toolSkills = toolSkillMap[tools] || []
    const allSkills = [...new Set([...profile.skills, ...toolSkills])]
    const level = levelMap[skillLevel] || "mid-level"

    return `
${level.toUpperCase()} ${profile.resumeRole.toUpperCase()}

PROFESSIONAL SUMMARY
${level.charAt(0).toUpperCase() + level.slice(1)} ${profile.resumeRole} with ${years} years of experience in ${area}.
Proficient in ${allSkills.slice(0, 4).join(", ")} with hands-on experience in real-world projects.

EXPERIENCE
${profile.resumeRole} | ABC Company | ${getStartYear(years)} – Present
- Worked with ${allSkills.slice(0, 3).join(", ")} on production systems
- Collaborated with cross-functional teams on ${area.toLowerCase()} initiatives
- Delivered ${area.toLowerCase()} solutions with measurable business impact

Junior ${profile.resumeRole} | XYZ Corp | ${getStartYear(String(parseInt(years) + 2))} – ${getStartYear(years)}
- Learned and applied ${allSkills.slice(0, 2).join(" and ")} in real-world projects
- Developed foundational skills in ${allSkills.slice(2, 4).join(" and ")}

SKILLS
Technical: ${allSkills.join(", ")}
Soft Skills: Communication, Problem Solving, Team Collaboration

EDUCATION
Bachelor's degree in Computer Science / related field
Graduated: ${getStartYear(String(parseInt(years) + 4))}
`.trim()
}

function getStartYear(yearsAgo) {
    return new Date().getFullYear() - parseInt(yearsAgo)
}

export default function QuizPage({ onNavigate }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showJD, setShowJD] = useState(false);
    const [jdText, setJdText] = useState('');
    const [jdError, setJdError] = useState('');

    const handleSelect = (option) => {
        const newAnswers = { ...answers, [currentStep]: option };
        setAnswers(newAnswers);

        if (currentStep < quizQuestions.length - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 300);
        } else {
            // All questions answered — show JD input
            setTimeout(() => setShowJD(true), 300);
        }
    };

    const handleSubmit = () => {
        if (!jdText.trim() || jdText.trim().length < 50) {
            setJdError('Please paste the job description (at least a few sentences).')
            return
        }
        const answerValues = quizQuestions.map((_, i) => answers[i])
        const resumeText = generateResume(answerValues)
        onNavigate('processing', { resumeText, jdText: jdText.trim() })
    }

    // JD input screen
    if (showJD) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                <div className="max-w-2xl w-full p-8 rounded-2xl border"
                    style={{ background: "#0b0f19", borderColor: "rgba(255,255,255,0.05)" }}>

                    <div className="mb-6">
                        <p className="text-sm font-medium tracking-wider mb-2" style={{ color: "#00e5a0" }}>
                            ✓ PROFILE BUILT — ONE LAST STEP
                        </p>
                        <h2 className="text-2xl font-semibold text-white mb-2">
                            Paste the Job Description
                        </h2>
                        <p className="text-sm" style={{ color: "#8892a4" }}>
                            We've built your skill profile from the quiz. Now paste the JD for the role you're targeting so we can identify your exact skill gaps.
                        </p>
                    </div>

                    <textarea
                        value={jdText}
                        onChange={e => { setJdText(e.target.value); setJdError('') }}
                        placeholder="Paste the full job description here...&#10;&#10;e.g. We are looking for a Senior Data Scientist with experience in Python, Machine Learning, SQL..."
                        rows={10}
                        className="w-full rounded-xl p-4 text-sm resize-none outline-none transition-all"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: jdError ? "1px solid #ff4d6a" : "1px solid rgba(255,255,255,0.08)",
                            color: "#e8edf5",
                            lineHeight: "1.6"
                        }}
                        onFocus={e => e.currentTarget.style.border = "1px solid #60a5fa"}
                        onBlur={e => e.currentTarget.style.border = jdError ? "1px solid #ff4d6a" : "1px solid rgba(255,255,255,0.08)"}
                    />

                    {jdError && (
                        <p className="text-xs mt-2" style={{ color: "#ff4d6a" }}>{jdError}</p>
                    )}

                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={() => setShowJD(false)}
                            className="text-sm px-4 py-2 opacity-60 hover:opacity-100 transition-opacity"
                            style={{ color: "#8892a4" }}
                        >
                            ← Back to quiz
                        </button>

                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300"
                            style={{
                                background: "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(96,165,250,0.9))",
                                boxShadow: "0 0 20px rgba(59,130,246,0.3)"
                            }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 35px rgba(59,130,246,0.5)"}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(59,130,246,0.3)"}
                        >
                            Analyze My Gaps →
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Quiz questions screen
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="max-w-2xl w-full p-8 rounded-2xl border"
                style={{ background: "#0b0f19", borderColor: "rgba(255,255,255,0.05)" }}>

                <div className="mb-8">
                    <p className="text-sm font-medium tracking-wider mb-2" style={{ color: "#60a5fa" }}>
                        QUESTION {currentStep + 1} OF {quizQuestions.length}
                    </p>
                    <h2 className="text-2xl font-semibold text-white">
                        {quizQuestions[currentStep].question}
                    </h2>
                </div>

                <div className="space-y-3">
                    {quizQuestions[currentStep].options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(option)}
                            className="w-full text-left px-6 py-4 rounded-xl border transition-all duration-200"
                            style={{
                                background: answers[currentStep] === option ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                                borderColor: answers[currentStep] === option ? "#3b82f6" : "rgba(255,255,255,0.05)",
                                color: answers[currentStep] === option ? "#e8edf5" : "#8892a4"
                            }}
                            onMouseEnter={e => {
                                if (answers[currentStep] !== option) {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                    e.currentTarget.style.color = "#e8edf5";
                                }
                            }}
                            onMouseLeave={e => {
                                if (answers[currentStep] !== option) {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                                    e.currentTarget.style.color = "#8892a4";
                                }
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex justify-between">
                    {currentStep > 0 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="text-sm px-4 py-2 opacity-60 hover:opacity-100 transition-opacity"
                            style={{ color: "#8892a4" }}
                        >
                            ← Back
                        </button>
                    ) : <div />}

                    <button
                        onClick={() => onNavigate('upload')}
                        className="text-sm px-4 py-2 opacity-60 hover:opacity-100 transition-opacity"
                        style={{ color: "#8892a4" }}
                    >
                        Cancel
                    </button>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {quizQuestions.map((_, i) => (
                        <div
                            key={i}
                            className="rounded-full transition-all duration-300"
                            style={{
                                width: i === currentStep ? "20px" : "6px",
                                height: "6px",
                                background: i <= currentStep ? "#60a5fa" : "rgba(255,255,255,0.15)"
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}