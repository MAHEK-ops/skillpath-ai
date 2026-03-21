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
        question: "What type of role are you targeting next?",
        options: ["Entry-level contributor", "Mid-level specialist", "Senior/Lead role", "Management/Leadership"]
    }
];

export default function QuizPage({ onNavigate }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});

    const handleSelect = (option) => {
        setAnswers({ ...answers, [currentStep]: option });
        
        if (currentStep < quizQuestions.length - 1) {
            setTimeout(() => setCurrentStep(currentStep + 1), 300);
        } else {
            // Finish quiz - navigate to results or processing
            setTimeout(() => {
                // Here we might normally send the quiz answers to the backend to generate a resume/profile
                // For now, we mock the transition back to the main flow or directly to a processing state
                const simulatedResumeText = Object.values(answers).join(", ") + ", " + option;
                onNavigate('processing', {
                    resumeText: simulatedResumeText,
                    jdText: "Standard Job Description based on quiz" 
                });
            }, 500);
        }
    };

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
                                if(answers[currentStep] !== option) {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                    e.currentTarget.style.color = "#e8edf5";
                                }
                            }}
                            onMouseLeave={e => {
                                if(answers[currentStep] !== option) {
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
                        >
                            ← Back
                        </button>
                    ) : <div></div>}
                    
                    <button 
                        onClick={() => onNavigate('upload')}
                        className="text-sm px-4 py-2 opacity-60 hover:opacity-100 transition-opacity"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
