import { useState } from "react"
import { downloadRoadmapPDF } from '../utils/exportPDF'
import ReasoningPanel from '../components/skillpath/ReasoningPanel'

function SkillGraph({ nodes, edges }) {
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

    if (!nodes || nodes.length === 0) return null

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
                        style={{ left: node.x, top: node.y, ...getNodeStyle(node.status) }}
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
                                    color: isCompleted ? "#00e5a0" : "#e8edf5",
                                    textDecoration: isCompleted ? "line-through" : "none",
                                    opacity: isCompleted ? 0.7 : 1
                                }}
                            >
                                {course.title}
                            </h3>
                            <p className="text-sm mt-0.5" style={{ color: "#8892a4" }}>
                                {course.subtitle}
                            </p>
                        </div>
                        <span
                            className="text-xs font-bold px-2 py-1 rounded flex-shrink-0"
                            style={{
                                color: course.priorityColor,
                                background: `${course.priorityColor}12`,
                                border: `1px solid ${course.priorityColor}20`
                            }}
                        >
                            {course.priority}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: "#8892a4" }}>
                        <span>⏱ {course.duration}</span>
                        <span
                            className="px-2 py-0.5 rounded"
                            style={{ background: "#1a2340", color: "#60a5fa" }}
                        >
                            {course.skill}
                        </span>
                    </div>

                    {course.reasoning && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-3 text-xs flex items-center gap-1 transition-colors"
                            style={{ color: "#60a5fa" }}
                        >
                            <svg
                                className="w-3 h-3 transition-transform"
                                style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                            Why this course?
                        </button>
                    )}

                    {isExpanded && course.reasoning && (
                        <div
                            className="mt-3 p-3 rounded-lg text-xs leading-relaxed"
                            style={{
                                background: "rgba(96,165,250,0.06)",
                                border: "1px solid rgba(96,165,250,0.12)",
                                color: "#8892a4"
                            }}
                        >
                            {course.reasoning}
                        </div>
                    )}
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
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    )
}

function RoadmapPage({ onNavigate, resultData }) {
    const [completedCourses, setCompletedCourses] = useState([])
    const [downloading, setDownloading] = useState(false)

    // Build courses from real backend data
    const pathway = resultData?.pathway || {}
    const courses = Array.isArray(pathway.courses)
        ? pathway.courses.map((c, i) => ({
            id: c.id || i + 1,
            title: c.title || c.course_name || `Course ${i + 1}`,
            subtitle: c.subtitle || c.description || "",
            duration: c.duration || c.estimated_hours ? `${c.estimated_hours} hours` : "N/A",
            skill: c.skill || c.target_skill || "",
            priority: c.priority || (c.priority_score >= 4 ? "HIGH PRIORITY" : "MEDIUM"),
            priorityColor: (c.priority === "HIGH PRIORITY" || c.priority_score >= 4) ? "#ff4d6a" : "#ff9500",
            reasoning: c.reasoning || c.why || ""
        }))
        : []

    // Build graph nodes/edges from real backend data
    const nodes = Array.isArray(pathway.graph_nodes) ? pathway.graph_nodes : []
    const edges = Array.isArray(pathway.graph_edges) ? pathway.graph_edges : []

    const toggleCourse = (id) => {
        setCompletedCourses((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        )
    }

    const totalHours = courses.reduce((acc, c) => acc + (parseInt(c.duration) || 0), 0)
    const completedHours = completedCourses.reduce((acc, id) => {
        const course = courses.find((c) => c.id === id)
        return acc + (course ? parseInt(course.duration) || 0 : 0)
    }, 0)
    const remainingHours = totalHours - completedHours
    const progressPercent = courses.length > 0 ? (completedCourses.length / courses.length) * 100 : 0

    const handleDownload = async () => {
        setDownloading(true)
        try {
            await downloadRoadmapPDF(courses, completedCourses)
        } finally {
            setDownloading(false)
        }
    }

    // No data state
    if (!resultData || courses.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg mb-4" style={{ color: "#8892a4" }}>
                        No roadmap data yet.
                    </p>
                    <button
                        onClick={() => onNavigate("upload")}
                        className="px-6 py-3 rounded-xl text-white font-semibold"
                        style={{
                            background: "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(96,165,250,0.9))",
                            boxShadow: "0 0 20px rgba(59,130,246,0.3)"
                        }}
                    >
                        Upload your resume to get started →
                    </button>
                </div>
            </div>
        )
    }

    const roleName = resultData?.parsed?.target_role || "your target role"

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
                        Personalized pathway to {roleName}
                    </p>
                    <div className="flex gap-4 mt-4 text-sm">
                        <span style={{ color: "#e8edf5" }}>
                            <span className="font-semibold">{courses.length}</span>{" "}
                            <span style={{ color: "#8892a4" }}>Courses</span>
                        </span>
                        <span style={{ color: "#e8edf5" }}>
                            <span className="font-semibold">{totalHours}</span>{" "}
                            <span style={{ color: "#8892a4" }}>Hours Total</span>
                        </span>
                    </div>
                </div>

                {/* Download PDF */}
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="px-6 py-2 rounded-lg text-sm transition-all duration-300 flex-shrink-0 flex items-center gap-2"
                    style={{
                        color: downloading ? "#4a5568" : "#8892a4",
                        background: "#111827",
                        border: "1px solid rgba(255,255,255,0.05)",
                        cursor: downloading ? "not-allowed" : "pointer"
                    }}
                    onMouseEnter={e => {
                        if (!downloading) e.currentTarget.style.border = "1px solid #3b82f6"
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.05)"
                    }}
                >
                    {downloading ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                    stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                        </>
                    )}
                </button>
            </div>

            {/* Skill Graph — only if backend sends graph data */}
            <SkillGraph nodes={nodes} edges={edges} />

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