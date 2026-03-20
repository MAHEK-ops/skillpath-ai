import { useState, useEffect } from "react"

const existingSkills = [
    { name: "Python", value: 85 },
    { name: "SQL", value: 78 },
    { name: "Data Analysis", value: 72 },
    { name: "Excel", value: 90 },
    { name: "Statistics", value: 65 },
    { name: "Communication", value: 80 },
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

function SkillBar({ name, value, color = "blue", delay = 0 }) {
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const timeout = setTimeout(() => {
            setWidth(value)
        }, delay)
        return () => clearTimeout(timeout)
    }, [value, delay])

    const getBarStyle = () => {
        if (color === "blue") {
            return {
                background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                boxShadow: "0 0 8px rgba(96,165,250,0.5)"
            }
        }
        if (color === "#ff9500") {
            return { background: "#ff9500" }
        }
        return { background: "#ff4d6a" }
    }

    return (
        <div
            className="p-4 rounded-xl"
            style={{
                background: "#141c2e",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
            }}
        >
            <div className="flex justify-between items-center mb-2">
                <span className="font-medium" style={{ color: "#e8edf5" }}>
                    {name}
                </span>
                <span className="text-sm" style={{ color: "#8892a4" }}>
                    {value}%
                </span>
            </div>
            <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)" }}
            >
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${width}%`,
                        ...getBarStyle()
                    }}
                />
            </div>
        </div>
    )
}

function ResultsPage({ onNavigate }) {
    return (
        <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3"
                    style={{ color: "#e8edf5" }}>
                    Your Skill Analysis
                </h1>
                <p style={{ color: "#8892a4" }}>
                    Here's how you match up for the role
                </p>
            </div>

            {/* Hero Stats — 43% and 91% */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                {/* Current Match */}
                <div
                    className="p-8 text-center rounded-2xl"
                    style={{
                        background: "#141c2e",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
                    }}
                >
                    <span
                        className="text-xs font-medium uppercase tracking-wider mb-4 block"
                        style={{ color: "#8892a4" }}
                    >
                        Current Match
                    </span>
                    <div
                        className="text-8xl font-extrabold mb-2"
                        style={{ color: "#ff4d6a" }}
                    >
                        <AnimatedNumber value={43} />%
                    </div>
                    <span style={{ color: "#8892a4" }}>
                        of role requirements met
                    </span>
                </div>

                {/* After Roadmap */}
                <div
                    className="p-8 text-center rounded-2xl"
                    style={{
                        background: "#141c2e",
                        border: "1px solid rgba(255,255,255,0.06)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
                    }}
                >
                    <span
                        className="text-xs font-medium uppercase tracking-wider mb-4 block"
                        style={{ color: "#8892a4" }}
                    >
                        After This Roadmap
                    </span>
                    <div
                        className="text-8xl font-extrabold mb-2"
                        style={{ color: "#00e5a0" }}
                    >
                        <AnimatedNumber value={91} />%
                    </div>
                    <span style={{ color: "#8892a4" }}>
                        projected readiness
                    </span>
                    <div
                        className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-sm"
                        style={{
                            background: "rgba(0,229,160,0.08)",
                            color: "#00e5a0",
                            border: "1px solid rgba(0,229,160,0.2)"
                        }}
                    >
                        +48% improvement
                    </div>
                </div>
            </div>

            {/* Gap Summary */}
            <div
                className="p-6 rounded-2xl mb-12"
                style={{
                    background: "#141c2e",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
                }}
            >
                <p className="font-medium mb-4" style={{ color: "#e8edf5" }}>
                    4 critical skill gaps identified across 3 categories
                </p>
                <div className="flex flex-wrap gap-3">
                    {["4 Missing Skills", "6 Strong Skills", "18 Hours to close gap"].map((stat) => (
                        <span
                            key={stat}
                            className="px-4 py-2 rounded-lg text-sm"
                            style={{
                                background: "#111827",
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
            <div className="mb-12">
                <h2
                    className="text-xs font-medium uppercase tracking-wider mb-4"
                    style={{ color: "#8892a4" }}
                >
                    Skills You Have
                </h2>
                <div className="space-y-3">
                    {existingSkills.map((skill, index) => (
                        <SkillBar
                            key={skill.name}
                            name={skill.name}
                            value={skill.value}
                            color="blue"
                            delay={400 + index * 100}
                        />
                    ))}
                </div>
            </div>

            {/* Skill Gaps */}
            <div className="mb-12">
                <h2
                    className="text-xs font-medium uppercase tracking-wider mb-4"
                    style={{ color: "#8892a4" }}
                >
                    Skill Gaps
                </h2>
                <div className="space-y-3">
                    {missingSkills.map((skill, index) => (
                        <SkillBar
                            key={skill.name}
                            name={skill.name}
                            value={skill.value}
                            color={skill.color}
                            delay={1000 + index * 100}
                        />
                    ))}
                </div>
            </div>

            {/* CTA Card */}
            <div
                className="p-8 text-center rounded-2xl"
                style={{
                    background: "#141c2e",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
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
                        background: "linear-gradient(90deg, #4d9fff, #00d4ff)",
                        boxShadow: "0 0 20px rgba(0,212,255,0.25)"
                    }}
                    onMouseEnter={e => {
                        e.target.style.boxShadow = "0 0 35px rgba(0,212,255,0.45)"
                        e.target.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={e => {
                        e.target.style.boxShadow = "0 0 20px rgba(0,212,255,0.25)"
                        e.target.style.transform = "translateY(0)"
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