/**
 * SkillGraph — Topological Skill Dependency Graph
 *
 * Fixes:
 *  1. Nodes without x/y get auto-placed via a topological layer layout
 *  2. Guards against NaN in SVG transform attribute
 *
 * Visual improvements:
 *  - Multi-row layered layout (dependency-aware)
 *  - Curved bezier edges with caret arrows
 *  - Glow rings, gradient fills, animated pulses for current node
 *  - Responsive SVG viewBox
 */

const STATUS = {
    completed: { fill: "rgba(0,229,160,0.12)", stroke: "#00e5a0", dot: "#00e5a0", text: "#00e5a0" },
    current:   { fill: "rgba(96,165,250,0.15)", stroke: "#60a5fa", dot: "#60a5fa", text: "#60a5fa" },
    future:    { fill: "rgba(255,255,255,0.03)", stroke: "rgba(255,255,255,0.18)", dot: "#4a5568", text: "#6b7280" },
}

// ── Auto-layout: assign (x, y) using topological layers ─────────────────────
function autoLayout(nodes, edges) {
    if (!nodes.length) return []

    // Check if all nodes already have valid numeric x,y
    const allHavePos = nodes.every(n => typeof n.x === "number" && !isNaN(n.x) && typeof n.y === "number" && !isNaN(n.y))
    if (allHavePos) return nodes

    // Build adjacency for layer assignment
    const inDegree = {}
    const children = {}
    nodes.forEach(n => { inDegree[n.id] = 0; children[n.id] = [] })
    edges.forEach(e => {
        if (children[e.source] !== undefined) children[e.source].push(e.target)
        if (inDegree[e.target] !== undefined) inDegree[e.target]++
    })

    // Kahn's algo for layers
    const layers = []
    let current = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id)
    const visited = new Set()

    while (current.length) {
        layers.push([...current])
        current.forEach(id => visited.add(id))
        const next = []
        current.forEach(id => {
            children[id].forEach(child => {
                if (!visited.has(child)) {
                    inDegree[child]--
                    if (inDegree[child] === 0) next.push(child)
                }
            })
        })
        current = next
    }

    // Any nodes not visited (cycles, disconnected) go in a final layer
    const unvisited = nodes.filter(n => !visited.has(n.id)).map(n => n.id)
    if (unvisited.length) layers.push(unvisited)

    // Assign coordinates
    const NODE_W = 130
    const NODE_H = 36
    const H_GAP = 50   // horizontal gap between nodes in same layer
    const V_GAP = 64   // vertical gap between layers
    const PAD_X = 20
    const PAD_Y = 20

    const posMap = {}
    layers.forEach((layer, li) => {
        const rowWidth = layer.length * NODE_W + (layer.length - 1) * H_GAP
        const startX = PAD_X + Math.max(0, (500 - rowWidth) / 2)  // centre in ~500px viewbox
        layer.forEach((id, idx) => {
            posMap[id] = {
                x: startX + idx * (NODE_W + H_GAP),
                y: PAD_Y + li * (NODE_H + V_GAP)
            }
        })
    })

    return nodes.map(n => ({
        ...n,
        x: typeof n.x === "number" && !isNaN(n.x) ? n.x : (posMap[n.id]?.x ?? PAD_X),
        y: typeof n.y === "number" && !isNaN(n.y) ? n.y : (posMap[n.id]?.y ?? PAD_Y),
    }))
}

// Compute svg viewBox from laid-out nodes
function computeViewBox(nodes) {
    if (!nodes.length) return "0 0 500 200"
    const xs = nodes.map(n => n.x)
    const ys = nodes.map(n => n.y)
    const minX = Math.min(...xs) - 20
    const minY = Math.min(...ys) - 20
    const maxX = Math.max(...xs) + 150
    const maxY = Math.max(...ys) + 56
    const w = Math.max(500, maxX - minX)
    const h = Math.max(200, maxY - minY)
    return `${minX} ${minY} ${w} ${h}`
}

export default function SkillGraph({ nodes = [], edges = [] }) {
    const laidOut = autoLayout(nodes, edges)
    const nodeMap = Object.fromEntries(laidOut.map(n => [n.id, n]))
    const viewBox = computeViewBox(laidOut)

    return (
        <div
            className="w-full h-full relative"
            style={{ background: "transparent", minHeight: "220px" }}
        >
            <svg
                width="100%"
                height="100%"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                style={{ minWidth: "300px", minHeight: "220px", overflow: "visible" }}
            >
                <defs>
                    {/* Arrow marker */}
                    <marker
                        id="sg-arrow"
                        markerWidth="8" markerHeight="8"
                        refX="6" refY="3"
                        orient="auto"
                    >
                        <path d="M0,0 L0,6 L8,3 z" fill="rgba(96,165,250,0.6)" />
                    </marker>
                    {/* Glow filter for current node */}
                    <filter id="sg-glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* ── Edges ── */}
                {edges.map((edge) => {
                    const s = nodeMap[edge.source]
                    const t = nodeMap[edge.target]
                    if (!s || !t) return null

                    // Exit from right-center, enter at left-center of target
                    const x1 = s.x + 130
                    const y1 = s.y + 18
                    const x2 = t.x
                    const y2 = t.y + 18
                    const mx = (x1 + x2) / 2

                    return (
                        <g key={edge.id}>
                            <path
                                d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                                fill="none"
                                stroke="rgba(96,165,250,0.3)"
                                strokeWidth="1.5"
                                strokeDasharray="6,4"
                                markerEnd="url(#sg-arrow)"
                            >
                                {edge.animated && (
                                    <animate
                                        attributeName="stroke-dashoffset"
                                        from="0"
                                        to="-20"
                                        dur="1.4s"
                                        repeatCount="indefinite"
                                    />
                                )}
                            </path>
                        </g>
                    )
                })}

                {/* ── Nodes ── */}
                {laidOut.map((node) => {
                    const s = STATUS[node.status] || STATUS.future
                    const isCompleted = node.status === "completed"
                    const isCurrent = node.status === "current"
                    const x = Number(node.x) || 20
                    const y = Number(node.y) || 20

                    return (
                        <g key={node.id} transform={`translate(${x}, ${y})`} filter={isCurrent ? "url(#sg-glow)" : undefined}>

                            {/* Animated pulse ring for current */}
                            {isCurrent && (
                                <rect
                                    x="-4" y="-4"
                                    width="138" height="44"
                                    rx="12"
                                    fill="none"
                                    stroke="#60a5fa"
                                    strokeWidth="1.5"
                                >
                                    <animate
                                        attributeName="opacity"
                                        values="0.15;0.55;0.15"
                                        dur="2.2s"
                                        repeatCount="indefinite"
                                    />
                                </rect>
                            )}

                            {/* Node body */}
                            <rect
                                x="0" y="0"
                                width="130" height="36"
                                rx="9"
                                fill={s.fill}
                                stroke={s.stroke}
                                strokeWidth={isCurrent ? "1.5" : "1"}
                                strokeOpacity={isCompleted || isCurrent ? "0.85" : "0.35"}
                            />

                            {/* Status dot */}
                            <circle
                                cx="17" cy="18"
                                r="5"
                                fill={s.dot}
                                opacity={node.status === "future" ? 0.35 : 1}
                            />

                            {/* Check mark for completed */}
                            {isCompleted && (
                                <text
                                    x="17" y="22"
                                    textAnchor="middle"
                                    fill="#080b14"
                                    fontSize="7"
                                    fontWeight="bold"
                                >✓</text>
                            )}

                            {/* Truncate label to fit in node */}
                            <text
                                x="30" y="23"
                                fill={s.text}
                                fontSize="10"
                                fontWeight={isCurrent ? "700" : "500"}
                                dominantBaseline="middle"
                            >
                                {(node.label || node.id || "").length > 16
                                    ? (node.label || node.id || "").slice(0, 15) + "…"
                                    : (node.label || node.id || "")}
                            </text>
                        </g>
                    )
                })}
            </svg>

            {/* Legend */}
            <div
                className="absolute bottom-2 right-3 flex gap-4"
                style={{ fontSize: "10px", pointerEvents: "none" }}
            >
                {[
                    { label: "Completed", color: "#00e5a0" },
                    { label: "Current",   color: "#60a5fa" },
                    { label: "Upcoming",  color: "#4a5568" },
                ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1">
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: color }} />
                        <span style={{ color: "#8892a4" }}>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}