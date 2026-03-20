function Navbar({ currentPage, onNavigate }) {
    const navLinks = [
        { id: "landing", label: "Home", icon: "home" },
        { id: "results", label: "Analysis", icon: "chart" },
        { id: "roadmap", label: "Roadmap", icon: "map" },
    ]

    const getIcon = (icon) => {
        if (icon === "home") return (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
        )
        if (icon === "chart") return (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        )
        if (icon === "map") return (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
        )
        return null
    }

    const canNavigate = (targetPage) => {
        if (targetPage === "landing") return true
        if (targetPage === "results" || targetPage === "roadmap") {
            return currentPage !== "landing" && currentPage !== "upload"
        }
        return true
    }

    const isActive = (linkId) => {
        if (currentPage === linkId) return true
        if (linkId === "results" && currentPage === "processing") return true
        if (linkId === "landing" && currentPage === "upload") return true
        return false
    }

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6"
            style={{
                background: "rgba(11,15,26,0.9)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)"
            }}
        >
            {/* Logo */}
            <button
                onClick={() => onNavigate("landing")}
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                        boxShadow: "0 0 20px rgba(59,130,246,0.3)"
                    }}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                        stroke="white" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <span
                    className="text-lg font-bold"
                    style={{
                        background: "linear-gradient(135deg, #e8edf5, #93c5fd)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}
                >
                    SkillPath AI
                </span>
            </button>

            {/* Center nav links */}
            <div
                className="flex items-center gap-1 p-1 rounded-full"
                style={{
                    background: "rgba(17,24,39,0.8)",
                    border: "1px solid rgba(255,255,255,0.06)"
                }}
            >
                {navLinks.map((link) => {
                    const active = isActive(link.id)
                    const disabled = !canNavigate(link.id)

                    return (
                        <button
                            key={link.id}
                            onClick={() => !disabled && onNavigate(link.id)}
                            disabled={disabled}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                            style={{
                                background: active
                                    ? "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(96,165,250,0.9))"
                                    : "transparent",
                                color: active ? "#fff" : disabled ? "#4a5568" : "#8892a4",
                                boxShadow: active
                                    ? "0 0 20px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
                                    : "none",
                                cursor: disabled ? "not-allowed" : "pointer"
                            }}
                            onMouseEnter={e => {
                                if (!active && !disabled)
                                    e.currentTarget.style.color = "#e8edf5"
                            }}
                            onMouseLeave={e => {
                                if (!active && !disabled)
                                    e.currentTarget.style.color = "#8892a4"
                            }}
                        >
                            {getIcon(link.icon)}
                            <span className="hidden sm:inline">{link.label}</span>
                        </button>
                    )
                })}
            </div>
            {/* Right side — hackathon badge */}
            <div
                className="text-xs font-medium px-3 py-1.5 rounded-full hidden sm:block"
                style={{
                    background: "rgba(17,24,39,0.8)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#8892a4"
                }}
            >
                ✦ IISc Hackathon 2025
            </div>
        </nav>
    )
}

export default Navbar