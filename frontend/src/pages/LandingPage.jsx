import BeforeAfter from '../components/skillpath/BeforeAfter'
const features = [
  {
    title: "Skill Gap Analysis",
    description: "We find exactly what's missing between your resume and the role"
  },
  {
    title: "Personalized Pathway",
    description: "A custom learning roadmap built just for you, not a generic course list"
  },
  {
    title: "AI Reasoning",
    description: "Every recommendation explained, know why you're learning what you're learning"
  }
]

function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-up"
          style={{
            background: "rgba(96,165,250,0.08)",
            border: "1px solid rgba(96,165,250,0.25)",
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
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <span style={{ color: "#e8edf5" }}>Skip what you know.</span>
          <br />
          <span className="gradient-text">Learn what you need.</span>
        </h1>

        {/* Subheading */}
        <p
          className="text-base sm:text-lg max-w-xl mx-auto mb-10 animate-fade-up"
          style={{
            color: "#8892a4",
            animationDelay: "0.2s"
          }}
        >
          Upload your resume. Paste a job description. Get a personalized
          AI learning roadmap in seconds.
        </p>

        {/* CTA */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          <button
            onClick={() => onNavigate("upload")}
            className="btn-primary text-base sm:text-lg px-8 py-4"
          >
            Get My Roadmap →
          </button>
          <p className="text-sm mt-4" style={{ color: "#8892a4" }}>
            No account needed · Takes 60 seconds
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto w-full">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="card p-6 text-center animate-fade-up"
            style={{ animationDelay: `${0.4 + index * 0.1}s` }}
          >
            <div
              className="w-3 h-3 rounded-full mx-auto mb-4"
              style={{
                background: "#60a5fa",
                boxShadow: "0 0 12px rgba(96,165,250,0.5)"
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

      {/* Add this divider space */}
      <div className="w-full max-w-4xl mx-auto mt-10 mb-10"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)"
        }}
      />

      <BeforeAfter />


    </div>
  )
}

export default LandingPage