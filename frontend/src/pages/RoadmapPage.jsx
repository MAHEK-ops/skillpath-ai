import { useState } from "react"

const courses = [
    {
        id: 1,
        title: "Python for Data Science — Intermediate",
        subtitle: "Bridge your Python knowledge to data workflows",
        duration: "4 hours",
        skill: "Python",
        priority: "HIGH PRIORITY",
        priorityColor: "#ff4d6a",
        reasoning: "Your resume demonstrates basic Python scripting but the Data Analyst role requires intermediate Python for pandas, numpy, and data manipulation workflows. This course bridges that specific gap directly."
    },
    {
        id: 2,
        title: "SQL Advanced Queries & Optimization",
        subtitle: "Master complex joins, subqueries and performance",
        duration: "3 hours",
        skill: "SQL",
        priority: "HIGH PRIORITY",
        priorityColor: "#ff4d6a",
        reasoning: "You have foundational SQL but the JD specifically mentions complex query optimization and window functions. This module targets exactly those requirements."
    },
    {
        id: 3,
        title: "Machine Learning Fundamentals",
        subtitle: "Core ML concepts every data analyst needs",
        duration: "5 hours",
        skill: "Machine Learning",
        priority: "HIGH PRIORITY",
        priorityColor: "#ff4d6a",
        reasoning: "Machine Learning appears 4 times in the job description with high importance weighting from O*NET data. Zero evidence of ML exposure found in your resume — this is your most critical gap."
    },
    {
        id: 4,
        title: "Tableau for Business Intelligence",
        subtitle: "Data visualization and dashboard creation",
        duration: "3 hours",
        skill: "Tableau",
        priority: "MEDIUM",
        priorityColor: "#ff9500",
        reasoning: "Tableau is listed as preferred in the JD. Your resume shows Excel visualization experience which provides a strong foundation — this course builds directly on what you already know."
    },
    {
        id: 5,
        title: "Deep Learning Introduction",
        subtitle: "Neural networks and modern AI fundamentals",
        duration: "3 hours",
        skill: "Deep Learning",
        priority: "MEDIUM",
        priorityColor: "#ff9500",
        reasoning: "While not critical, the role mentions AI familiarity as a growing requirement. Completing this after ML Fundamentals follows the natural learning dependency in your skill graph."
    }
]

const nodes = [
    { id: "python-basics", label: "Python Basics", x: 20, y: 40, status: "completed" },
    { id: "python-inter", label: "Python Intermediate", x: 160, y: 40, status: "current" },
    { id: "ml-foundations", label: "ML Foundations", x: 340, y: 40, status: "future" },
    { id: "sql-advanced", label: "SQL Advanced", x: 160, y: 110, status: "future" },
    { id: "data-analysis", label: "Data Analysis", x: 340, y: 110, status: "future" },
]

const edges = [
    { from: 0, to: 1, x1: 120, y1: 58, x2: 160, y2: 58 },
    { from: 1, to: 2, x1: 300, y1: 58, x2: 340, y2: 58 },
    { from: 1, to: 3, x1: 230, y1: 76, x2: 230, y2: 110 },
    { from: 3, to: 4, x1: 300, y1: 128, x2: 340, y2: 128 },
]

function SkillGraph() {
    const getNodeStyle = (status) => {
        if (status === "completed") return {
            background: "rgba(0,229,160,0.08)",
            border: "1px solid #00e5a0",
            color: "#00e5a0"
        }
        if (status === "current") return {
            background: "rgba(96,165,250,0.08)",
            border: "1px solid #60a5fa",
            color: "#e8edf5",
            boxShadow: "0 0 12px rgba(96,165,250,0.3)"
        }
        return {
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.05)",
            color: "#8892a4"
        }
    }

    return (
        <div
            className="p-6 rounded-2xl mb-8 overflow-x-auto"
            style={{
                background: "#141c2e",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
            }}
        >
            <h2
                className="text-xs font-medium uppercase tracking-wider mb-6"
                style={{ color: "#8892a4" }}
            >
                Skill Dependency Graph
            </h2>
            <div className="relative" style={{ minWidth: "480px", height: "170px" }}>
                <svg className="absolute inset-0 w-full h-full">
                    {edges.map((edge, i) => (
                        <line
                            key={i}
                            x1={edge.x1} y1={edge.y1}
                            x2={edge.x2} y2={edge.y2}
                            stroke="#60a5fa"
                            strokeWidth="1.5"
                            strokeDasharray="6 4"
                            opacity="0.5"
                        />
                    ))}
                    {edges.map((edge, i) => (
                        <polygon
                            key={`arrow-${i}`}
                            points={`${edge.x2},${edge.y2 - 4} ${edge.x2 + 8},${edge.y2} ${edge.x2},${edge.y2 + 4}`}
                            fill="#60a5fa"
                            opacity="0.7"
                        />
                    ))}
                </svg>

                {nodes.map((node) => (
                    <div
                        key={node.id}
                        className="absolute px-3 py-2 rounded-lg text-xs font-medium"
                        style={{
                            left: node.x,
                            top: node.y,
                            ...getNodeStyle(node.status)
                        }}
                    >
                        {node.status === "completed" && "✓ "}
                        {node.label}
                    </div>
                ))}
            </div>
        </div>
    )
}

function CourseCard({ course, index, isCompleted, onToggle }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div
            className="p-6 rounded-2xl transition-all duration-300"
            style={{
                background: "#141c2e",
                border: isCompleted
                    ? "1px solid #00e5a0"
                    : "1px solid rgba(255,255,255,0.06)",
                boxShadow: isCompleted
                    ? "0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0,229,160,0.1)"
                    : "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
            }}
        >
            <div className="flex items-start gap-4">

                {/* Step number */}
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                        background: isCompleted
                            ? "#00e5a0"
                            : "linear-gradient(90deg, #3b82f6, #60a5fa)",
                        color: isCompleted ? "#0b0f1a" : "#fff",
                        boxShadow: isCompleted
                            ? "0 0 16px rgba(0,229,160,0.4)"
                            : "0 0 16px rgba(96,165,250,0.25)"
                    }}
                >
                    {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        String(index + 1).padStart(2, "0")
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                            <h3
                                className="text-lg font-semibold"
                                style={{
                                    color: "#e8edf5",
                                    textDecoration: isCompleted ? "line-through" : "none",
                                    opacity: isCompleted ? 0.6 : 1
                                }}
                            >
                                {course.title}
                            </h3>
                            <p className="text-sm" style={{ color: "#8892a4" }}>
                                {course.subtitle}
                            </p>
                        </div>

                        {/* Priority badge */}
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
                            style={{
                                background: `${course.priorityColor}20`,
                                color: course.priorityColor,
                                border: `1px solid ${course.priorityColor}40`
                            }}
                        >
                            {course.priority}
                        </span>
                    </div>

                    {/* Duration + Skill tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {[course.duration, course.skill].map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-lg text-xs"
                                style={{
                                    background: "#111827",
                                    color: "#8892a4",
                                    border: "1px solid rgba(255,255,255,0.05)"
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Why this course — expandable */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm flex items-center gap-1 transition-colors"
                        style={{ color: "#60a5fa" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#93c5fd"}
                        onMouseLeave={e => e.currentTarget.style.color = "#60a5fa"}
                    >
                        Why this course?
                        <svg
                            className="w-4 h-4 transition-transform duration-300"
                            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Reasoning panel */}
                    <div
                        className="overflow-hidden transition-all duration-300"
                        style={{ maxHeight: isExpanded ? "160px" : "0px" }}
                    >
                        <div
                            className="p-4 rounded-lg text-sm mt-4"
                            style={{
                                background: "rgba(96,165,250,0.04)",
                                borderLeft: "3px solid #60a5fa",
                                color: "#8892a4"
                            }}
                        >
                            {course.reasoning}
                        </div>
                    </div>
                </div>

                {/* Checkbox */}
                <button
                    onClick={onToggle}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                        background: isCompleted ? "#00e5a0" : "transparent",
                        border: isCompleted
                            ? "2px solid #00e5a0"
                            : "2px solid rgba(255,255,255,0.08)",
                        boxShadow: isCompleted ? "0 0 12px rgba(0,229,160,0.4)" : "none"
                    }}
                    onMouseEnter={e => {
                        if (!isCompleted)
                            e.currentTarget.style.border = "2px solid #60a5fa"
                    }}
                    onMouseLeave={e => {
                        if (!isCompleted)
                            e.currentTarget.style.border = "2px solid rgba(255,255,255,0.08)"
                    }}
                >
                    {isCompleted && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                            stroke="#0b0f1a" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>

            </div>
        </div>
    )
}

function RoadmapPage({ onNavigate }) {
    const [completedCourses, setCompletedCourses] = useState([])

    const toggleCourse = (id) => {
        setCompletedCourses((prev) =>
            prev.includes(id)
                ? prev.filter((c) => c !== id)
                : [...prev, id]
        )
    }

    const totalHours = 18
    const completedHours = completedCourses.reduce((acc, id) => {
        const course = courses.find((c) => c.id === id)
        return acc + (course ? parseInt(course.duration) : 0)
    }, 0)
    const remainingHours = totalHours - completedHours
    const progressPercent = (completedCourses.length / courses.length) * 100

    return (
        <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                <div>
                    <h1
                        className="text-3xl sm:text-4xl font-bold mb-2"
                        style={{ color: "#e8edf5" }}
                    >
                        Your Learning Roadmap
                    </h1>
                    <p style={{ color: "#8892a4" }}>
                        Personalized pathway to Data Analyst role
                    </p>
                    <div className="flex gap-4 mt-4 text-sm">
                        <span style={{ color: "#e8edf5" }}>
                            <span className="font-semibold">5</span>{" "}
                            <span style={{ color: "#8892a4" }}>Courses</span>
                        </span>
                        <span style={{ color: "#e8edf5" }}>
                            <span className="font-semibold">18</span>{" "}
                            <span style={{ color: "#8892a4" }}>Hours Total</span>
                        </span>
                    </div>
                </div>

                {/* Download PDF button */}
                <button
                    className="px-6 py-2 rounded-lg text-sm transition-all duration-300 flex-shrink-0"
                    style={{
                        color: "#8892a4",
                        background: "#111827",
                        border: "1px solid rgba(255,255,255,0.05)"
                    }}
                    onMouseEnter={e => e.currentTarget.style.border = "1px solid #3b82f6"}
                    onMouseLeave={e => e.currentTarget.style.border = "1px solid rgba(255,255,255,0.05)"}
                >
                    Download PDF
                </button>
            </div>

            {/* Skill Graph */}
            <SkillGraph />

            {/* Course Cards */}
            <div className="space-y-4 mb-8">
                {courses.map((course, index) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        index={index}
                        isCompleted={completedCourses.includes(course.id)}
                        onToggle={() => toggleCourse(course.id)}
                    />
                ))}
            </div>

            {/* Progress Tracker */}
            <div
                className="p-6 rounded-2xl"
                style={{
                    background: "#141c2e",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
                }}
            >
                <h2
                    className="text-xs font-medium uppercase tracking-wider mb-4"
                    style={{ color: "#8892a4" }}
                >
                    Your Progress
                </h2>
                <div
                    className="h-3 rounded-full overflow-hidden mb-4"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${progressPercent}%`,
                            background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                            boxShadow: "0 0 8px rgba(96,165,250,0.6)"
                        }}
                    />
                </div>
                <p className="text-sm" style={{ color: "#8892a4" }}>
                    <span className="font-medium" style={{ color: "#e8edf5" }}>
                        {Math.round(progressPercent)}% Complete
                    </span>
                    {" · "}
                    {completedCourses.length} of {courses.length} courses
                    {" · "}
                    {remainingHours} hours remaining
                </p>
            </div>

        </div>
    )
}

export default RoadmapPage