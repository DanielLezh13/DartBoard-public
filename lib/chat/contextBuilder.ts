// lib/chat/contextBuilder.ts
export type ChatMode = "tactical" | "simplicity" | "adversarial";

export const MODE_CONFIG: Record<ChatMode, { label: string; description: string }> = {
  tactical: {
    label: "Tactical",
    description: [
      "short, structural, adversarial-but-practical",
      "assumptions → constraints → options → risks → next 1–3 actions",
      "prioritize usable output over endless critique",
    ].join(". "),
  },
  simplicity: {
    label: "Simple",
    description: [
      "minimal, low-branching, no extra concepts",
      "2–5 sentences or 3–5 bullets max",
      "keep only what is necessary to act or understand",
    ].join(". "),
  },
  adversarial: {
    label: "Adversarial",
    description: [
      "forensic, interrogative, zero comfort",
      "extract main claims, list assumptions, list contradictions / missing data",
      "optimize for truth tension, not usefulness",
    ].join(". "),
  },
};

const GLOBAL_SYSTEM_RULES = `
You are LYNX-Core, a structural cognition engine.

Global rules (apply in all modes):
- Direct, compressed, impersonal.
- No flattery, no hype, no emotional comfort, no moralizing.
- Prefer cause–effect chains, constraints, and tradeoffs.
- Every claim must be falsifiable or clearly uncertain.
- Compress aggressively; avoid narrative storytelling and long wrap-ups.
- Detect and strip vague, self-flattering, or trendy language.
- Avoid emotional mirroring unless explicitly requested.
- Close reasoning loops; avoid endless speculation or recursion.
`.trim();

export interface PersistentMemorySnippet {
  text: string; // short profile summary
}

export interface VaultContextSnippet {
  text: string; // from /folder or /memory
}

export interface PerMessageCommands {
  certainty?: boolean;
  validity?: boolean;
  noVault?: boolean;
  noHistory?: boolean;
  short?: boolean;
}

export interface BuildContextArgs {
  mode: ChatMode;
  persistentMemory?: PersistentMemorySnippet | null;
  vaultSnippets?: VaultContextSnippet[];
  recentMessages: { role: "user" | "assistant"; content: string }[];
  userInput: string;
  commands?: PerMessageCommands;
}

export function buildChatMessages(args: BuildContextArgs) {
  const {
    mode,
    persistentMemory,
    vaultSnippets = [],
    recentMessages,
    userInput,
    commands = {},
  } = args;

  const modeConfig = MODE_CONFIG[mode];

  const systemPieces: string[] = [];
  systemPieces.push(GLOBAL_SYSTEM_RULES);
  systemPieces.push("");
  systemPieces.push(`Active mode: ${modeConfig.label}.`);
  systemPieces.push(`Mode behavior: ${modeConfig.description}.`);

  if (commands.short) {
    systemPieces.push(
      "For this message: respond even more tightly than usual (ultra-compressed)."
    );
  }
  if (commands.certainty) {
    systemPieces.push(
      "For this message: if appropriate, include an approximate certainty percentage at the end."
    );
  }
  if (commands.validity) {
    systemPieces.push(
      "For this message: focus on whether the reasoning is sound, not on giving advice."
    );
  }
  if (commands.noHistory) {
    systemPieces.push(
      "For this message: ignore prior conversation history unless absolutely necessary."
    );
  }
  if (commands.noVault) {
    systemPieces.push(
      "For this message: ignore any external vault context even if provided."
    );
  }

  const systemMessage = {
    role: "system" as const,
    content: systemPieces.join("\n"),
  };

  const contextMessages: { role: "system" | "user"; content: string }[] = [systemMessage];

  if (persistentMemory) {
    contextMessages.push({
      role: "system",
      content: `User profile (persistent):\n${persistentMemory.text}`,
    });
  }

  if (!commands.noVault && vaultSnippets.length > 0) {
    const combinedVault = vaultSnippets.map(v => v.text).join("\n\n---\n\n");
    contextMessages.push({
      role: "system",
      content: `Attached vault context (for this chat):\n${combinedVault}`,
    });
  }

  const historyToUse = commands.noHistory ? [] : recentMessages;

  const finalMessages = [
    ...contextMessages,
    ...historyToUse,
    { role: "user" as const, content: userInput },
  ];

  return finalMessages;
}
