const features = [
    {
        title: "Skill Gap Analysis",
        description: "We find exactly what's missing between your resume and the role"
    },
    {
        title: "Personalized Pathway",
        description: "A custom learning roadmap built just for you — not a generic course list"
    },
    {
        title: "AI Reasoning",
        description: "Every recommendation explained — know why you're learning what you're learning"
    }
]

function LandingPage({ onNavigate }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">

            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto">

                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                    style={{
                        background: "rgba(96, 165, 250, 0.08)",
                        border: "1px solid rgba(96, 165, 250, 0.25)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
                    }}
                >
                    <span style={{ color: "#60a5fa" }}>✦</span>
                    <span className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: "#8892a4" }}>
                        AI-Powered Onboarding
                    </span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                    <span style={{ color: "#e8edf5" }}>Skip what you know.</span>
                    <br />
                    <span style={{
                        background: "linear-gradient(90deg, #4d9fff, #00d4ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        Learn what you need.
                    </span>
                </h1>

                {/* Subheading */}
                <p className="text-lg max-w-xl mx-auto mb-10"
                    style={{ color: "#8892a4" }}>
                    Upload your resume. Paste a job description. Get a personalized
                    AI learning roadmap in seconds.
                </p>

                {/* CTA Button */}
                <button
                    onClick={() => onNavigate('upload')}
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
                    Get My Roadmap →
                </button>

                <p className="text-sm mt-4" style={{ color: "#8892a4" }}>
                    No account needed · Takes 60 seconds
                </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto w-full">
                {features.map((feature) => (
                    <div
                        key={feature.title}
                        className="p-6 text-center rounded-2xl transition-all duration-300"
                        style={{
                            background: "#141c2e",
                            border: "1px solid rgba(255,255,255,0.06)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.border = "1px solid rgba(96,165,250,0.3)"
                            e.currentTarget.style.transform = "translateY(-4px)"
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)"
                            e.currentTarget.style.transform = "translateY(0)"
                        }}
                    >
                        <div
                            className="w-3 h-3 rounded-full mx-auto mb-4"
                            style={{
                                background: "#60a5fa",
                                boxShadow: "0 0 12px rgba(96,165,250,0.6)"
                            }}
                        />
                        <h3 className="text-lg font-semibold mb-2"
                            style={{ color: "#e8edf5" }}>
                            {feature.title}
                        </h3>
                        <p className="text-sm" style={{ color: "#8892a4" }}>
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default LandingPage