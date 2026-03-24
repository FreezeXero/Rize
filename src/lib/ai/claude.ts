export class ClaudeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeError";
  }
}

type ClaudeMessage = { role: "user" | "assistant"; content: string };

export async function claudeComplete(args: {
  system?: string;
  user: string;
  maxTokens?: number;
}) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Missing CLAUDE_API_KEY in env.");

  const model = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: args.maxTokens ?? 800,
      temperature: 0.2,
      system: args.system,
      messages: [{ role: "user", content: args.user } satisfies ClaudeMessage],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ClaudeError(
      `Claude API error: ${res.status} ${res.statusText}. ${text}`
    );
  }

  const json = (await res.json()) as unknown;
  const content = (json as { content?: Array<{ text?: unknown }> } | null)?.content?.[0]
    ?.text;
  if (typeof content !== "string") {
    throw new ClaudeError("Claude response did not include text content.");
  }
  return content.trim();
}

