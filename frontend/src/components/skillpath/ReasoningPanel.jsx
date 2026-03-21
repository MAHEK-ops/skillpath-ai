export default function ReasoningPanel({ course }) {
    if (!course) return null

    return (
        <div className="flex flex-col gap-4">

            {/* Course title */}
            <div
                className="p-4 rounded-xl"
                style={{
                    background: "rgba(96,165,250,0.06)",
                    border: "1px solid rgba(96,165,250,0.15)"
                }}
            >
                <div className="flex items-center justify-between mb-1">
                    <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                            color: course.priorityColor || "#60a5fa",
                            background: `${course.priorityColor || "#60a5fa"}15`,
                            border: `1px solid ${course.priorityColor || "#60a5fa"}30`
                        }}
                    >
                        {course.priority}
                    </span>
                    <span className="text-xs" style={{ color: "#8892a4" }}>
                        {course.duration}
                    </span>
                </div>
                <h4 className="text-sm font-semibold mt-2" style={{ color: "#e8edf5" }}>
                    {course.title}
                </h4>
                <p className="text-xs mt-1" style={{ color: "#8892a4" }}>
                    {course.subtitle}
                </p>
            </div>

            {/* AI Reasoning */}
            <div
                className="p-4 rounded-xl"
                style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)"
                }}
            >
                <div className="flex items-center gap-2 mb-3">
                    {/* Brain icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2a2.5 2.5 0 0 1 5 0v.5a2.5 2.5 0 0 1-5 0V2z"/>
                        <path d="M4 12a8 8 0 0 1 16 0"/>
                        <path d="M12 12v9"/>
                        <path d="M8 17l4-5 4 5"/>
                    </svg>
                    <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: "#60a5fa", letterSpacing: "0.1em" }}
                    >
                        AI Reasoning
                    </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#b0bac8" }}>
                    {course.reasoning || "No reasoning available for this course."}
                </p>
            </div>

            {/* Skill tag */}
            {course.skill && (
                <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#8892a4" }}>Skill covered:</span>
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                            background: "rgba(96,165,250,0.08)",
                            border: "1px solid rgba(96,165,250,0.2)",
                            color: "#60a5fa"
                        }}
                    >
                        {course.skill}
                    </span>
                </div>
            )}

            {/* View course link */}
            {course.courseUrl && (
                <a
                    href={course.courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 w-fit"
                    style={{
                        background: "rgba(59,130,246,0.12)",
                        border: "1px solid rgba(59,130,246,0.25)",
                        color: "#60a5fa"
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Start This Course
                </a>
            )}
        </div>
    )
}