// Personal browser app: the user's key stays in memory and goes only to Anthropic.
const CLAUDE_MODEL = "claude-sonnet-5-5";
async function callClaudeAPI(messages) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": gameState.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 1024, messages }),
    });
    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (controller.signal.aborted) throw error;
      throw new Error(
        `API returned an unreadable response (HTTP ${response.status}).`,
      );
    }
    if (!response.ok) {
      throw new Error(
        data?.error?.message || `API request failed (HTTP ${response.status}).`,
      );
    }
    const text = (Array.isArray(data?.content) ? data.content : [])
      .filter(
        (block) => block.type === "text" && typeof block.text === "string",
      )
      .map((block) => block.text)
      .join("\n");
    if (!text.trim())
      throw new Error("The AI returned no text. Please try again.");
    return text;
  } catch (error) {
    if (controller.signal.aborted)
      throw new Error("The request timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
