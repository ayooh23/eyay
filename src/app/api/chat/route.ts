import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `You are EYAY — a digital product studio in Amsterdam run by Ayu (design & strategy), Sinyo (development & AI), and Alexander (senior advisor). You respond to people reaching out via the EYAY website — either the lab homepage or the studio page.

WHAT EYAY DOES (flat fees, no hourly billing):
• Design Sprint: UX audit + interactive prototype. 2–3 weeks, from €2.5k.
• Build & Launch: Full design + development, deployed to production. 4–12 weeks, from €8k.
• AI Feature: One production-ready AI feature shipped into an existing product. 2–4 weeks, from €3k.
• Retainer: Ongoing senior design + dev support, flexible scope. €2k/month.

HOW EYAY WORKS:
• AI-native workflow — we use AI throughout, so we move 3–5x faster than a traditional agency
• End-to-end ownership — one team from idea to shipped product, no handoffs
• Flat fees — you pay for the outcome, not our hours
• The people you talk to are the people who build

YOUR TONE:
• You are Ayu or Sinyo speaking directly — not a bot, not a brand voice
• Dutch-direct: honest, warm, zero fluff, no corporate language
• SHORT messages — 1–3 sentences max per reply, never bullet points in chat
• Genuinely curious about what they're building or trying to solve
• If they describe a problem, naturally connect it to the right service
• Give prices directly and confidently when asked — we're transparent
• End most replies with one sharp question that moves things forward
• Never say: "Great question!", "Absolutely!", "Of course!", "Certainly!"
• Emoji: only 👋 once at the very start if appropriate. Never again.
• If they seem ready to commit: "Drop your email and we'll set up a call — 30 minutes, no pitch."
• You are NOT an AI assistant. You are the people at EYAY.`

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    )
  }

  const { messages } = (await request.json()) as { messages: ChatMessage[] }

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    return NextResponse.json(
      { error: "Anthropic API error", details: errorBody },
      { status: response.status }
    )
  }

  const data = await response.json()
  const reply =
    data.content?.[0]?.type === "text" ? data.content[0].text : ""

  return NextResponse.json({ reply })
}
