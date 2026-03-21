import { useState, useRef } from "react"

const sampleResume = `Jane Smith - Data Analyst
Skills: Python, SQL, Excel, Data Analysis, Statistics, Communication
Experience: 3 years as Junior Data Analyst at TechCorp
Education: BS in Mathematics`

const sampleJobDescription = `We're looking for a Data Analyst to join our team.

Requirements:
- 3+ years of experience with Python and SQL
- Experience with data visualization tools (Tableau preferred)
- Strong understanding of machine learning concepts
- Advanced SQL skills including complex queries and optimization
- Experience with deep learning frameworks is a plus
- Excellent communication and presentation skills

Nice to have:
- Experience with cloud platforms (AWS, GCP)
- Knowledge of A/B testing methodologies`

function UploadPage({ onNavigate }) {
    const [resumeFile, setResumeFile] = useState(null)
    const [jobDescription, setJobDescription] = useState("")
    const [roleType, setRoleType] = useState("technical")
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => setIsDragging(false)

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type === "application/pdf") setResumeFile(file)
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) setResumeFile(file)
    }

    const loadSampleData = () => {
        setResumeFile(
            new File([sampleResume], "sample-resume.pdf", {
                type: "application/pdf",
            })
        )
        setJobDescription(sampleJobDescription)
    }

    const canProceed = resumeFile && jobDescription.trim().length > 0

    return (
        <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">

            {/* Page Header */}
            <div className="text-center mb-12 animate-fade-up">
                <h1
                    className="text-3xl sm:text-4xl font-bold mb-3"
                    style={{ color: "#e8edf5" }}
                >
                    Upload Your Details
                </h1>
                <p style={{ color: "#8892a4" }}>
                    We'll analyze your resume against the job requirements
                </p>
            </div>

            {/* Two Column Grid */}
            <div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-up"
                style={{ animationDelay: "0.1s" }}
            >

                {/* Resume Upload */}
                <div>
                    <label
                        className="text-xs font-medium uppercase tracking-wider mb-3 block"
                        style={{ color: "#8892a4" }}
                    >
                        Your Resume
                    </label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className="h-56 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                        style={{
                            background: resumeFile
                                ? "rgba(96,165,250,0.04)"
                                : isDragging
                                    ? "rgba(59,130,246,0.06)"
                                    : "rgba(96,165,250,0.03)",
                            border: resumeFile
                                ? "2px solid #60a5fa"
                                : isDragging
                                    ? "2px solid #3b82f6"
                                    : "2px dashed rgba(96,165,250,0.25)",
                            boxShadow: resumeFile
                                ? "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 20px rgba(96,165,250,0.15)"
                                : "inset 0 1px 0 rgba(255,255,255,0.03)"
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {resumeFile ? (
                            <>
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                                    style={{ background: "#00e5a0" }}
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                        stroke="#0b0f1a" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="font-medium" style={{ color: "#e8edf5" }}>
                                    {resumeFile.name}
                                </span>
                                <span className="text-sm mt-1" style={{ color: "#8892a4" }}>
                                    Click to change file
                                </span>
                            </>
                        ) : (
                            <>
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                                    style={{
                                        background: "#111827",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
                                    }}
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                        stroke="#8892a4" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <span style={{ color: "#e8edf5" }}>
                                    Drag your resume here
                                </span>
                                <span className="text-sm mt-1" style={{ color: "#8892a4" }}>
                                    or click to browse — PDF only
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Job Description */}
                <div>
                    <label
                        className="text-xs font-medium uppercase tracking-wider mb-3 block"
                        style={{ color: "#8892a4" }}
                    >
                        Job Description
                    </label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                        className="w-full h-56 rounded-xl p-4 text-sm resize-none transition-all duration-300 focus:outline-none"
                        style={{
                            background: "#0d1520",
                            border: "1px solid rgba(255,255,255,0.05)",
                            color: "#e8edf5",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.3)"
                        }}
                        onFocus={e => e.target.style.border = "1px solid #3b82f6"}
                        onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.05)"}
                    />
                </div>
            </div>

            {/* Role Type */}
            <div
                className="mb-8 animate-fade-up"
                style={{ animationDelay: "0.2s" }}
            >
                <label
                    className="text-xs font-medium uppercase tracking-wider mb-3 block"
                    style={{ color: "#8892a4" }}
                >
                    Role Type
                </label>
                <div className="flex flex-wrap gap-4">
                    {[
                        { value: "technical", label: "Technical Role", sub: "Software, Data, Engineering" },
                        { value: "operational", label: "Operational Role", sub: "HR, Logistics, Management" }
                    ].map((role) => (
                        <button
                            key={role.value}
                            onClick={() => setRoleType(role.value)}
                            className="px-6 py-4 rounded-xl font-medium transition-all duration-300 text-left"
                            style={{
                                background: roleType === role.value
                                    ? "linear-gradient(135deg, #3b82f6, #60a5fa)"
                                    : "#0d1520",
                                color: roleType === role.value ? "#fff" : "#8892a4",
                                border: roleType === role.value
                                    ? "1px solid rgba(96,165,250,0.5)"
                                    : "1px solid rgba(255,255,255,0.06)",
                                boxShadow: roleType === role.value
                                    ? "0 0 10px rgba(96,165,250,0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
                                    : "inset 0 1px 0 rgba(255,255,255,0.03)"
                            }}
                        >
                            <div className="font-semibold text-sm">{role.label}</div>
                            <div
                                className="text-xs mt-1"
                                style={{
                                    opacity: 0.7,
                                    color: roleType === role.value ? "#e8edf5" : "#8892a4"
                                }}
                            >
                                {role.sub}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div
                className="animate-fade-up"
                style={{ animationDelay: "0.3s" }}
            >
                <button
                    onClick={() => canProceed && onNavigate("processing")}
                    disabled={!canProceed}
                    className="w-full text-lg py-4 rounded-xl font-semibold transition-all duration-300"
                    style={{
                        background: canProceed
                            ? "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(96,165,250,0.9))"
                            : "rgba(255,255,255,0.05)",
                        color: canProceed ? "#fff" : "#8892a4",
                        boxShadow: canProceed
                            ? "0 0 24px rgba(96,165,250,0.3)"
                            : "none",
                        cursor: canProceed ? "pointer" : "not-allowed",
                        border: "none"
                    }}
                    onMouseEnter={e => {
                        if (canProceed) {
                            e.currentTarget.style.boxShadow = "0 0 35px rgba(96,165,250,0.5)"
                            e.currentTarget.style.transform = "translateY(-2px)"
                        }
                    }}
                    onMouseLeave={e => {
                        if (canProceed) {
                            e.currentTarget.style.boxShadow = "0 0 24px rgba(96,165,250,0.3)"
                            e.currentTarget.style.transform = "translateY(0)"
                        }
                    }}
                >
                    {canProceed
                        ? "Analyze My Skills →"
                        : "Upload resume and paste job description to continue"}
                </button>

                <div className="flex items-center justify-center mt-6 text-sm">
                    <span style={{ color: "#8892a4" }}>
                        Don't have a resume?{" "}
                        <button
                            className="transition-colors"
                            style={{ color: "#60a5fa" }}
                            onMouseEnter={e => e.target.style.color = "#93c5fd"}
                            onMouseLeave={e => e.target.style.color = "#60a5fa"}
                        >
                            Take our 5-min skill quiz instead
                        </button>
                    </span>
                </div>

                <div className="text-center mt-4">
                    <button
                        onClick={loadSampleData}
                        className="px-6 py-2 rounded-lg text-sm transition-all duration-300"
                        style={{
                            color: "#8892a4",
                            background: "#0d1520",
                            border: "1px solid rgba(255,255,255,0.06)"
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.border = "1px solid #3b82f6"
                            e.currentTarget.style.color = "#e8edf5"
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.border = "1px solid rgba(255,255,255,0.06)"
                            e.currentTarget.style.color = "#8892a4"
                        }}
                    >
                        Try with sample data
                    </button>
                </div>
            </div>

        </div>
    )
}

export default UploadPage