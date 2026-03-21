import jsPDF from "jspdf"

export const downloadRoadmapPDF = async (courses, completedCourses) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let y = 20

    // ── Header ──────────────────────────────────
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 0, pageWidth, 32, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("SkillPath AI", margin, 14)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Personalized Learning Roadmap", margin, 22)
    doc.text(
        `Generated: ${new Date().toLocaleDateString()}`,
        pageWidth - margin,
        22,
        { align: "right" }
    )

    y = 46

    // ── Role + Progress ──────────────────────────
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 3, 3, "F")

    doc.setTextColor(30, 41, 59)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Target Role: Data Analyst", margin + 8, y + 8)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(
        `Progress: ${completedCourses.length} of ${courses.length} courses complete`,
        margin + 8,
        y + 15
    )

    y = 76

    // ── Match score cards ────────────────────────
    // Current match card
    doc.setFillColor(255, 241, 242)
    doc.roundedRect(margin, y, 78, 28, 3, 3, "F")
    doc.setDrawColor(255, 77, 106)
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, y, 78, 28, 3, 3, "S")

    doc.setTextColor(180, 50, 80)
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text("CURRENT MATCH", margin + 39, y + 8, { align: "center" })
    doc.setFontSize(20)
    doc.setTextColor(220, 38, 38)
    doc.text("43%", margin + 39, y + 21, { align: "center" })

    // After roadmap card
    doc.setFillColor(240, 253, 244)
    doc.roundedRect(pageWidth - margin - 78, y, 78, 28, 3, 3, "F")
    doc.setDrawColor(0, 200, 100)
    doc.roundedRect(pageWidth - margin - 78, y, 78, 28, 3, 3, "S")

    doc.setTextColor(20, 120, 60)
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text("AFTER ROADMAP", pageWidth - margin - 39, y + 8, { align: "center" })
    doc.setFontSize(20)
    doc.setTextColor(22, 163, 74)
    doc.text("91%", pageWidth - margin - 39, y + 21, { align: "center" })

    // Improvement badge center
    doc.setFillColor(220, 252, 231)
    doc.roundedRect(pageWidth / 2 - 22, y + 8, 44, 12, 6, 6, "F")
    doc.setTextColor(22, 163, 74)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("+48% improvement", pageWidth / 2, y + 16, { align: "center" })

    y = 116

    // ── Section title ────────────────────────────
    doc.setTextColor(59, 130, 246)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("YOUR LEARNING PATHWAY", margin, y)
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(0.3)
    doc.line(margin, y + 2, pageWidth - margin, y + 2)

    y = 124

    // ── Course cards ─────────────────────────────
    courses.forEach((course, index) => {
        const isCompleted = completedCourses.includes(course.id)
        const cardHeight = 32

        // Check for page break
        if (y + cardHeight > 270) {
            doc.addPage()
            y = 20
        }

        // Card background
        if (isCompleted) {
            doc.setFillColor(240, 253, 244)
            doc.setDrawColor(0, 200, 100)
        } else {
            doc.setFillColor(248, 250, 252)
            doc.setDrawColor(226, 232, 240)
        }
        doc.setLineWidth(0.4)
        doc.roundedRect(margin, y, pageWidth - margin * 2, cardHeight, 3, 3, "FD")

        // Left priority accent bar
        if (isCompleted) {
            doc.setFillColor(0, 200, 100)
        } else if (course.priority === "HIGH PRIORITY") {
            doc.setFillColor(255, 77, 106)
        } else {
            doc.setFillColor(255, 149, 0)
        }
        doc.rect(margin, y, 3, cardHeight, "F")

        // Step number circle
        doc.setFillColor(59, 130, 246)
        doc.circle(margin + 13, y + 16, 7, "F")
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text(
            String(index + 1).padStart(2, "0"),
            margin + 13,
            y + 18,
            { align: "center" }
        )

        // Course title
        doc.setTextColor(isCompleted ? 100 : 30, isCompleted ? 116 : 41, isCompleted ? 139 : 59)
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text(course.title, margin + 26, y + 11)

        // Subtitle
        doc.setTextColor(100, 116, 139)
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        doc.text(course.subtitle, margin + 26, y + 18)

        // Tags
        doc.setTextColor(148, 163, 184)
        doc.setFontSize(8)
        doc.text(`${course.duration}  ·  ${course.skill}`, margin + 26, y + 25)

        // Priority badge
        if (course.priority === "HIGH PRIORITY") {
            doc.setTextColor(220, 38, 38)
        } else {
            doc.setTextColor(234, 88, 12)
        }
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.text(course.priority, pageWidth - margin - 2, y + 11, { align: "right" })

        // Completed status
        if (isCompleted) {
            doc.setFillColor(220, 252, 231)
            doc.roundedRect(pageWidth - margin - 28, y + 18, 26, 9, 2, 2, "F")
            doc.setTextColor(22, 163, 74)
            doc.setFontSize(7.5)
            doc.setFont("helvetica", "bold")
            doc.text("DONE", pageWidth - margin - 15, y + 24, { align: "center" })
        }

        y += cardHeight + 4
    })

    // ── Progress bar ─────────────────────────────
    if (y + 30 > 270) {
        doc.addPage()
        y = 20
    }

    y += 8
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("YOUR PROGRESS", margin, y)

    y += 6

    // Track
    doc.setFillColor(226, 232, 240)
    doc.roundedRect(margin, y, pageWidth - margin * 2, 6, 3, 3, "F")

    // Fill
    const fillWidth = ((completedCourses.length / courses.length) * (pageWidth - margin * 2))
    if (fillWidth > 0) {
        doc.setFillColor(59, 130, 246)
        doc.roundedRect(margin, y, fillWidth, 6, 3, 3, "F")
    }

    y += 12
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(
        `${Math.round((completedCourses.length / courses.length) * 100)}% Complete  ·  ${completedCourses.length} of ${courses.length} courses`,
        margin,
        y
    )

    // ── Footer on every page ─────────────────────
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFillColor(248, 250, 252)
        doc.rect(0, 282, pageWidth, 15, "F")
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.3)
        doc.line(0, 282, pageWidth, 282)
        doc.setTextColor(148, 163, 184)
        doc.setFontSize(7.5)
        doc.setFont("helvetica", "normal")
        doc.text(
            "Generated by SkillPath AI  •  Skip what you know. Learn what you need.",
            pageWidth / 2,
            290,
            { align: "center" }
        )
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth - margin,
            290,
            { align: "right" }
        )
    }

    doc.save("SkillPath-AI-Roadmap.pdf")
}