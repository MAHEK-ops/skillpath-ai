import { useState, useEffect } from "react"

const steps = [
    { id: 1, text: "Parsing your resume" },
    { id: 2, text: "Extracting skills & experience" },
    { id: 3, text: "Analyzing skill gaps" },
    { id: 4, text: "Building your learning pathway" },
]

const skills = [
    "Python", "SQL", "Data Analysis",
    "Excel", "Machine Learning", "Tableau", "Statistics"
]

function ProcessingPage({ onNavigate }) {
    const [activeStep, setActiveStep] = useState(1)
    const [visibleSkills, setVisibleSkills] = useState([])
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Progress through steps
        const stepInterval = setInterval(() => {
            setActiveStep((prev) => {
                if (prev < 4) return prev + 1
                return prev
            })
        }, 1500)

        // Progress bar
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev < 100) return prev + 1.67
                return 100
            })
        }, 100)

        // Show skills one by one
        const skillTimeouts = []
        skills.forEach((skill, index) => {
            const timeout = setTimeout(() => {
                setVisibleSkills((prev) => [...prev, skill])
            }, 1500 + index * 600)
            skillTimeouts.push(timeout)
        })

        // Navigate to results after 6 seconds
        const navTimeout = setTimeout(() => {
            onNavigate("results")
        }, 6000)

        return () => {
            clearInterval(stepInterval)
            clearInterval(progressInterval)
            skillTimeouts.forEach(clearTimeout)
            clearTimeout(navTimeout)
        }
    }, [onNavigate])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">

            {/* Spinner */}
            <div className="relative w-20 h-20 mb-8">
                <div
                    className="absolute inset-0 rounded-full"
                    style={{ border: "4px solid rgba(255,255,255,0.05)" }}
                />
                <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                        border: "4px solid transparent",
                        borderTopColor: "#60a5fa",
                        boxShadow: "0 0 24px rgba(96,165,250,0.35)"
                    }}
                />
            </div>

            {/* Loading text */}
            <h2 className="text-2xl font-semibold mb-12"
                style={{ color: "#e8edf5" }}>
                Analyzing your profile...
            </h2>

            {/* Steps */}
            <div className="flex flex-col gap-4 mb-12">
                {steps.map((step) => {
                    const isCompleted = step.id < activeStep
                    const isActive = step.id === activeStep
                    const isPending = step.id > activeStep

                    return (
                        <div key={step.id} className="flex items-center gap-4">

                            {/* Circle indicator */}
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
                                style={{
                                    background: isCompleted ? "#60a5fa" : "transparent",
                                    border: isCompleted
                                        ? "none"
                                        : isActive
                                            ? "2px solid #60a5fa"
                                            : "2px solid #8892a4",
                                    boxShadow: isCompleted
                                        ? "0 0 16px rgba(96,165,250,0.4)"
                                        : isActive
                                            ? "0 0 12px rgba(96,165,250,0.3)"
                                            : "none"
                                }}
                            >
                                {isCompleted && (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                        stroke="#0b0f1a" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {isActive && (
                                    <div
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{ background: "#60a5fa" }}
                                    />
                                )}
                            </div>

                            {/* Step text */}
                            <span
                                className="text-sm transition-colors duration-300"
                                style={{
                                    color: isCompleted
                                        ? "#60a5fa"
                                        : isActive
                                            ? "#e8edf5"
                                            : "#8892a4"
                                }}
                            >
                                {step.text}
                                {isCompleted && " ✓"}
                            </span>

                        </div>
                    )
                })}
            </div>

            {/* Skills detected */}
            <div className="text-center">
                <span
                    className="text-xs font-medium uppercase tracking-wider mb-4 block"
                    style={{ color: "#8892a4" }}
                >
                    Skills detected so far...
                </span>
                <div className="flex flex-wrap justify-center gap-2 max-w-md">
                    {visibleSkills.map((skill) => (
                        <span
                            key={skill}
                            className="text-xs font-medium px-3 py-1 rounded-full transition-all duration-300"
                            style={{
                                background: "rgba(96,165,250,0.08)",
                                border: "1px solid rgba(96,165,250,0.3)",
                                color: "#60a5fa"
                            }}
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

            {/* Bottom progress bar */}
            <div
                className="fixed bottom-0 left-0 right-0 h-1"
                style={{ background: "rgba(255,255,255,0.05)" }}
            >
                <div
                    className="h-full transition-all duration-100"
                    style={{
                        width: `${Math.min(progress, 100)}%`,
                        background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                        boxShadow: "0 0 8px rgba(96,165,250,0.6)"
                    }}
                />
            </div>

        </div>
    )
}

export default ProcessingPage