import { useState, useEffect, useRef } from "react"

const existingSkills = [
    { name: "Python", value: 85, color: "#60a5fa" },
    { name: "SQL", value: 78, color: "#60a5fa" },
    { name: "Data Analysis", value: 72, color: "#60a5fa" },
    { name: "Excel", value: 90, color: "#60a5fa" },
    { name: "Statistics", value: 65, color: "#60a5fa" },
    { name: "Communication", value: 80, color: "#60a5fa" },
]

const missingSkills = [
    { name: "Machine Learning", value: 12, color: "#ff4d6a" },
    { name: "Tableau", value: 0, color: "#ff4d6a" },
    { name: "Python Advanced", value: 35, color: "#ff9500" },
    { name: "Deep Learning", value: 0, color: "#ff4d6a" },
]

function AnimatedNumber({ value, duration = 1500 }) {
    const [current, setCurrent] = useState(0)
    useEffect(() => {
        const steps = 60
        const increment = value / steps
        const stepDuration = duration / steps
        let step = 0
        const interval = setInterval(() => {
            step++
            setCurrent(Math.min(Math.round(increment * step), value))
            if (step >= steps) clearInterval(interval)
        }, stepDuration)
        return () => clearInterval(interval)
    }, [value, duration])
    return <>{current}</>
}

function SparklineChart({ color, finalVal }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        const pts = [
            10, 18, 14, 22, 17, 26, 20, 30,
            finalVal * 0.5,
            finalVal * 0.7,
            finalVal * 0.85,
            finalVal
        ]
        const w = canvas.offsetWidth || 300
        const h = 52
        canvas.width = w
        canvas.height = h
        const max = Math.max(...pts)
        const min = Math.min(...pts)

        ctx.clearRect(0, 0, w, h)

        const getX = (i) => (i / (pts.length - 1)) * w
        const getY = (pt) => h - ((pt - min) / (max - min)) * h * 0.8 - 4

        // Fill area
        ctx.beginPath()
        pts.forEach((pt, i) => {
            i === 0
                ? ctx.moveTo(getX(i), getY(pt))
                : ctx.lineTo(getX(i), getY(pt))
        })
        ctx.lineTo(w, h)
        ctx.lineTo(0, h)
        ctx.closePath()
        ctx.fillStyle = color + "15"
        ctx.fill()

        // Line
        ctx.beginPath()
        pts.forEach((pt, i) => {
            i === 0
                ? ctx.moveTo(getX(i), getY(pt))
                : ctx.lineTo(getX(i), getY(pt))
        })
        ctx.shadowColor = color
        ctx.shadowBlur = 6
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.shadowBlur = 0

        // End dot
        const lastX = getX(pts.length - 1)
        const lastY = getY(pts[pts.length - 1])
        ctx.beginPath()
        ctx.arc(lastX, lastY, 3, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0

    }, [color, finalVal])

    return (
        <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "52px", display: "block" }}
        />
    )
}

function MatchCard({ label, value, color, bgColor, subtitle, badge }) {
    return (
        <div
            className="p-5 rounded-2xl"
            style={{
                background: bgColor,
                border: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
                position: "relative"
            }}
        >
            {/* Label */}
            <div
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "#8892a4", letterSpacing: "0.1em" }}
            >
                {label}
            </div>

            {/* Sparkline */}
            <SparklineChart color={color} finalVal={value} />

            {/* Big number */}
            <div
                className="font-extrabold mt-3 mb-1"
                style={{
                    color: color,
                    fontSize: "52px",
                    lineHeight: 1,
                    textShadow: `0 0 40px ${color}40`
                }}
            >
                <AnimatedNumber value={value} />%
            </div>

            <div className="text-xs" style={{ color: "#8892a4" }}>
                {subtitle}
            </div>

            {badge && (
                <div
                    className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                        background: `${color}12`,
                        color: color,
                        border: `1px solid ${color}20`
                    }}
                >
                    <svg
                        style={{ width: "10px", height: "10px" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                    {badge}
                </div>
            )}
        </div>
    )
}

function SkillStepBar({ name, value, color, delay = 0 }) {
    const [animated, setAnimated] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => setAnimated(true), delay)
        return () => clearTimeout(timeout)
    }, [delay])

    const pct = animated ? value : 0

    return (
        <div className="mb-7">
            <div className="flex justify-between items-center mb-2">
                <span
                    className="text-sm font-semibold"
                    style={{ color: "#e8edf5" }}
                >
                    {name}
                </span>
            </div>

            <div style={{ position: "relative", paddingTop: "20px" }}>

                {/* Percentage label with drop line */}
                <div
                    style={{
                        position: "absolute",
                        left: `${pct <= 2 ? 2 : pct >= 98 ? 98 : pct}%`,
                        top: 0,
                        transform: "translateX(-50%)",
                        transition: "left 1.2s cubic-bezier(0.4,0,0.2,1)",
                        textAlign: "center",
                        pointerEvents: "none"
                    }}
                >
                    <span
                        style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: color,
                            whiteSpace: "nowrap",
                            display: "block"
                        }}
                    >
                        {value}%
                    </span>
                    <div
                        style={{
                            width: "1px",
                            height: "6px",
                            background: color,
                            opacity: 0.4,
                            margin: "0 auto"
                        }}
                    />
                </div>

                {/* Track */}
                <div
                    style={{
                        position: "relative",
                        height: "2px",
                        background: "rgba(255,255,255,0.07)",
                        borderRadius: "99px"
                    }}
                >
                    {/* Fill */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            height: "100%",
                            width: `${pct}%`,
                            background: color,
                            opacity: 0.3,
                            borderRadius: "99px",
                            transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)"
                        }}
                    />

                    {/* Dot */}
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: `${pct <= 2 ? 2 : pct >= 98 ? 98 : pct}%`,
                            transform: "translate(-50%, -50%)",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: color,
                            boxShadow: `0 0 6px ${color}80`,
                            transition: "left 1.2s cubic-bezier(0.4,0,0.2,1)",
                            zIndex: 2
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "4px",
                                height: "4px",
                                borderRadius: "50%",
                                background: "#080b14"
                            }}
                        />
                    </div>
                </div>

                {/* Step labels */}
                <div
                    className="flex justify-between mt-2"
                    style={{ paddingTop: "4px" }}
                >
                    {["Beginner", "Intermediate", "Advanced", "Expert"].map((label) => (
                        <span
                            key={label}
                            style={{
                                fontSize: "9px",
                                color: "rgba(255,255,255,0.18)",
                                letterSpacing: "0.05em",
                                textTransform: "uppercase"
                            }}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ResultsPage({ onNavigate }) {
    return (
        <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">

            {/* Header */}
            <div className="text-center mb-10">
                <h1
                    className="text-3xl sm:text-4xl font-bold mb-3"
                    style={{ color: "#e8edf5" }}
                >
                    Your Skill Analysis
                </h1>
                <p style={{ color: "#8892a4" }}>
                    Here's how you match up for the role
                </p>
            </div>

            {/* Match Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <MatchCard
                    label="Current Match"
                    value={43}
                    color="#ff4d6a"
                    bgColor="#0f0d0d"
                    subtitle="of role requirements met"
                />
                <MatchCard
                    label="After This Roadmap"
                    value={91}
                    color="#00e5a0"
                    bgColor="#0a0f0d"
                    subtitle="projected readiness"
                    badge="+48% improvement"
                />
            </div>

            {/* Gap Summary */}
            <div
                className="p-5 rounded-2xl mb-10"
                style={{
                    background: "#141c2e",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
                }}
            >
                <p
                    className="font-medium mb-3"
                    style={{ color: "#e8edf5" }}
                >
                    4 critical skill gaps identified across 3 categories
                </p>
                <div className="flex flex-wrap gap-2">
                    {["4 Missing Skills", "6 Strong Skills", "3 Categories"].map((stat) => (
                        <span
                            key={stat}
                            className="px-3 py-1.5 rounded-lg text-sm"
                            style={{
                                background: "#1a2340",
                                color: "#e8edf5",
                                border: "1px solid rgba(255,255,255,0.06)"
                            }}
                        >
                            {stat}
                        </span>
                    ))}
                </div>
            </div>

            {/* Skills You Have */}
            <div>
                <h2
                    className="text-xs font-bold uppercase tracking-wider mb-6"
                    style={{ color: "#8892a4", letterSpacing: "0.1em" }}
                >
                    Skills You Have
                </h2>
                <div
                    className="p-6 rounded-2xl mb-10"
                    style={{
                        background: "#141c2e",
                        border: "1px solid rgba(255,255,255,0.06)"
                    }}
                >
                    {existingSkills.map((skill, i) => (
                        <SkillStepBar
                            key={skill.name}
                            name={skill.name}
                            value={skill.value}
                            color={skill.color}
                            delay={300 + i * 120}
                        />
                    ))}
                </div>
            </div>

            {/* Skill Gaps */}
            <div>
                <h2
                    className="text-xs font-bold uppercase tracking-wider mb-6"
                    style={{ color: "#8892a4", letterSpacing: "0.1em" }}
                >
                    Skill Gaps
                </h2>
                <div
                    className="p-6 rounded-2xl mb-10"
                    style={{
                        background: "#141c2e",
                        border: "1px solid rgba(255,255,255,0.06)"
                    }}
                >
                    {missingSkills.map((skill, i) => (
                        <SkillStepBar
                            key={skill.name}
                            name={skill.name}
                            value={skill.value}
                            color={skill.color}
                            delay={900 + i * 120}
                        />
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div
                className="p-8 text-center rounded-2xl"
                style={{
                    background: "#141c2e",
                    border: "1px solid rgba(255,255,255,0.06)"
                }}
            >
                <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#e8edf5" }}
                >
                    Ready to close these gaps?
                </h3>
                <button
                    onClick={() => onNavigate("roadmap")}
                    className="px-8 py-4 text-lg font-semibold rounded-xl text-white transition-all duration-300"
                    style={{
                        background: "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(96,165,250,0.9))",
                        boxShadow: "0 0 20px rgba(59,130,246,0.3)"
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = "0 0 35px rgba(59,130,246,0.5)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(59,130,246,0.3)"
                        e.currentTarget.style.transform = "translateY(0)"
                    }}
                >
                    Build My Learning Roadmap →
                </button>
                <p className="text-sm mt-4" style={{ color: "#8892a4" }}>
                    Estimated completion: 18 hours of learning
                </p>
            </div>

        </div>
    )
}

export default ResultsPage