import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/promptAssembly";
import { DartzModeId } from "@/lib/modes";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") as DartzModeId | null;

    const systemMessage = await buildSystemPrompt({ mode: mode || undefined });

    return NextResponse.json({ systemMessage });
  } catch (error) {
    console.error("Error getting system message:", error);
    return NextResponse.json(
      { error: "Failed to get system message" },
      { status: 500 }
    );
  }
}
