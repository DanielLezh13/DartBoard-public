from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

OUTPUT_PATH = "output/pdf/dartboard-app-summary.pdf"

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "Title",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=18,
    leading=22,
    spaceAfter=10,
)

header_style = ParagraphStyle(
    "Header",
    parent=styles["Heading3"],
    fontName="Helvetica-Bold",
    fontSize=11,
    leading=14,
    spaceBefore=6,
    spaceAfter=4,
)

body_style = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=10,
    leading=13,
    spaceAfter=2,
)

small_style = ParagraphStyle(
    "Small",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9,
    leading=12,
    spaceAfter=2,
)


def bullet(text: str) -> Paragraph:
    return Paragraph(f"- {text}", body_style)


doc = SimpleDocTemplate(
    OUTPUT_PATH,
    pagesize=LETTER,
    leftMargin=0.6 * inch,
    rightMargin=0.6 * inch,
    topMargin=0.6 * inch,
    bottomMargin=0.6 * inch,
)

story = []

story.append(Paragraph("DartBoard App Summary", title_style))

story.append(Paragraph("What it is", header_style))
story.append(
    Paragraph(
        "Local AI environment built with Next.js. Provides a chat-first UI with a local data store for sessions, memories, and archives.",
        body_style,
    )
)

story.append(Paragraph("Who it is for", header_style))
story.append(Paragraph("Not found in repo.", body_style))

story.append(Paragraph("What it does", header_style))
story.append(bullet("Chat interface with session-based conversations and modes."))
story.append(bullet("Stores sessions, messages, memories, and folders in a local SQLite database."))
story.append(bullet("Memory vault with folders and session attachments for context control."))
story.append(bullet("Archive view and search across message history."))
story.append(bullet("Document APIs for storing, updating, and exporting documents."))
story.append(bullet("Supabase-based sign-in, guest mode, and auth-related endpoints."))

story.append(Paragraph("How it works", header_style))
story.append(
    Paragraph(
        "Next.js App Router pages in app/ render the UI, with reusable React components in components/. "
        "Client calls hit app/api routes for chat, sessions, memory, archive, and documents. "
        "API handlers authenticate via Supabase server client and read/write SQLite via lib/db.ts. "
        "Chat requests assemble system prompts with lib/LYNX_BOOT_SEQUENCE.ts and call OpenAI via lib/openai.ts. "
        "Some guest/session state is persisted in sessionStorage on the client.",
        small_style,
    )
)

story.append(Paragraph("How to run", header_style))
story.append(bullet("npm install"))
story.append(bullet("npm run dev"))
story.append(bullet("Open http://localhost:3000 in your browser"))
story.append(bullet("Optional OpenAI key: Not found in repo (.env.local.example is referenced in README, but missing)"))

story.append(Spacer(1, 6))

# Footer note for transparency
story.append(
    Paragraph(
        "Sources: README.md, package.json, app/ routes, lib/db.ts, lib/openai.ts, lib/LYNX_BOOT_SEQUENCE.ts.",
        small_style,
    )
)

doc.build(story)
