// app/api/chat-debug/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildChatMessages, ChatMode } from "@/lib/chat/contextBuilder";
import { getServerScope } from "@/lib/scope-server";

export async function POST(req: NextRequest) {
  try {
    const scope = await getServerScope(req);
    if (scope.kind !== "user") {
      return NextResponse.json(
        { error: "Sign in required for chat debug" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      message,
      mode = "tactical",
      history = [],
    } = body as {
      message: string;
      mode?: ChatMode;
      history?: { role: "user" | "assistant"; content: string }[];
    };

    const messages = buildChatMessages({
      mode,
      persistentMemory: null,
      vaultSnippets: [],
      recentMessages: history,
      userInput: message,
      commands: {},
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("chat-debug error:", err);
    return NextResponse.json(
      { error: "Route crashed", detail: String(err) },
      { status: 500 },
    );
  }
}
