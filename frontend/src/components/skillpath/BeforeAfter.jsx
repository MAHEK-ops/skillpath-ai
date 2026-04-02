import { useRef, useState } from "react"
import { gsap } from "gsap"
import { Flip } from "gsap/Flip"

gsap.registerPlugin(Flip)

const beforePoints = [
    { color: "#ff4d6a", text: "Generic training for everyone" },
    { color: "#ff4d6a", text: "No skill gap identification" },
    { color: "#ff4d6a", text: "Wastes time on known topics" },
    { color: "#ff4d6a", text: "No reasoning behind modules" },
]

const afterPoints = [
    { color: "#00e5a0", text: "Personalized to your skill gaps" },
    { color: "#00e5a0", text: "AI identifies what's missing" },
    { color: "#00e5a0", text: "Skip what you already know" },
    { color: "#00e5a0", text: "Every course explained with reasoning" },
]

function BeforeAfter() {
    const cardRef = useRef(null)
    const beforeSlotRef = useRef(null)
    const afterSlotRef = useRef(null)
    const [isAfter, setIsAfter] = useState(false)
    const [animating, setAnimating] = useState(false)

    const points = isAfter ? afterPoints : beforePoints

    const handleFlip = () => {
        if (animating) return
        const card = cardRef.current
        const targetSlot = isAfter
            ? beforeSlotRef.current
            : afterSlotRef.current

        const state = Flip.getState(card)
        targetSlot.appendChild(card)

        setAnimating(true)
        Flip.from(state, {
            duration: 1.1,
            ease: "power1.inOut",
            spin: 1,
            onComplete: () => {
                setIsAfter(prev => !prev)
                setAnimating(false)
            }
        })
    }

    return (
        <div className="w-full pt-8 pb-16 px-6 flex flex-col items-center gap-6">

            {/* Section heading */}
            <div className="text-center mb-2">
                <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: "#e8edf5" }}
                >
                    The Difference Is Clear
                </h2>
                <p className="text-sm" style={{ color: "#8892a4" }}>
                    See how SkillPath AI transforms the onboarding experience
                </p>
            </div>

            {/* Button — top center */}
            <button
                onClick={handleFlip}
                disabled={animating}
                className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                style={{
                    background: "rgba(17,24,39,0.9)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: animating ? "#4a5568" : "#e8edf5",
                    cursor: animating ? "not-allowed" : "pointer"
                }}
                onMouseEnter={e => {
                    if (!animating) {
                        e.currentTarget.style.borderColor = "rgba(96,165,250,0.5)"
                        e.currentTarget.style.boxShadow = "0 0 16px rgba(96,165,250,0.2)"
                    }
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"
                    e.currentTarget.style.boxShadow = "none"
                }}
            >
                {isAfter ? "← See Without" : "✦ Click here to see the Difference"}
            </button>

            {/* Scene — diagonal layout */}
            <div
                className="relative w-full max-w-2xl"
                style={{ height: "320px" }}
            >

                {/* Before slot — TOP LEFT */}
                <div
                    ref={beforeSlotRef}
                    className="absolute"
                    style={{ top: "0px", left: "0px" }}
                >
                    {/* Card starts here */}
                    <div
                        ref={cardRef}
                        className="p-5"
                        style={{
                            width: "220px",
                            borderRadius: "16px",
                            background: isAfter ? "#0a1628" : "#1a0f10",
                            border: isAfter
                                ? "1.5px solid rgba(96,165,250,0.4)"
                                : "1.5px solid rgba(255,77,106,0.4)",
                            boxShadow: isAfter
                                ? "0 0 28px rgba(96,165,250,0.2)"
                                : "0 0 20px rgba(255,77,106,0.15)",
                            transition: "background 0.4s, border-color 0.4s, box-shadow 0.4s"
                        }}
                    >
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                            style={{
                                background: isAfter
                                    ? "rgba(96,165,250,0.12)"
                                    : "rgba(255,77,106,0.12)",
                                color: isAfter ? "#60a5fa" : "#ff4d6a",
                                border: isAfter
                                    ? "1px solid rgba(96,165,250,0.2)"
                                    : "1px solid rgba(255,77,106,0.2)"
                            }}
                        >
                            <span>{isAfter ? "✓" : "✕"}</span>
                            <span>
                                {isAfter ? "With SkillPath AI" : "Without SkillPath"}
                            </span>
                        </div>

                        {/* Title */}
                        <div
                            className="text-sm font-bold mb-3"
                            style={{ color: "#e8edf5" }}
                        >
                            {isAfter ? "Adaptive Onboarding" : "Generic Onboarding"}
                        </div>

                        {/* Points */}
                        <div className="flex flex-col gap-2">
                            {points.map((point) => (
                                <div key={point.text} className="flex items-center gap-2">
                                    <div
                                        className="flex-shrink-0 rounded-full"
                                        style={{
                                            width: "5px",
                                            height: "5px",
                                            background: point.color
                                        }}
                                    />
                                    <span
                                        className="text-xs"
                                        style={{ color: "#8892a4" }}
                                    >
                                        {point.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* After slot — BOTTOM RIGHT (dashed ghost) */}
                <div
                    ref={afterSlotRef}
                    className="absolute"
                    style={{
                        bottom: "0px",
                        right: "0px",
                        width: "220px",
                        height: "235px",
                        borderRadius: "16px",
                        outline: "2px dashed rgba(255,255,255,0.12)",
                        outlineOffset: "6px",
                    }}
                />

            </div>

        </div>
    )
}

export default BeforeAfter