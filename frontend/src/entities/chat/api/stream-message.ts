import { API_BASE_URL } from "@/shared/api/http-transport";
import { getAccessToken, isAccessTokenExpired } from "@/shared/api/session.store";
import { refresh } from "@/shared/api/refresh";
import { chatStreamEventDtoSchema, type ChatStreamEventDto } from "@capsule/common";

async function ensureFreshAccessToken(): Promise<string> {
  if (isAccessTokenExpired()) {
    await refresh(async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      return { data: await response.json() };
    });
  }

  return getAccessToken();
}

// Ответ приходит построчным NDJSON (ChatStreamEventDto на строку), а не
// единым JSON — это позволяет читать fetch()-стрим прогрессивно, по мере
// поступления чанков от сервера, вместо ожидания полного ответа.
export async function* streamChatMessage(
  threadId: string,
  text: string,
  signal?: AbortSignal
): AsyncGenerator<ChatStreamEventDto> {
  const accessToken = await ensureFreshAccessToken();

  const response = await fetch(
    `${API_BASE_URL}/chat/threads/${threadId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text }),
      signal,
    }
  );

  if (!response.ok || !response.body) {
    throw new Error(`Не удалось отправить сообщение (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;

      yield chatStreamEventDtoSchema.parse(JSON.parse(line));
    }
  }

  const trailing = buffer.trim();

  if (trailing) {
    yield chatStreamEventDtoSchema.parse(JSON.parse(trailing));
  }
}
