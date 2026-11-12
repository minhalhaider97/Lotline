export type ApiHistoryTurn = {
  role: "user" | "assistant";
  content: string;
};

export type ApiVisit = {
  status: "needs_vehicle" | "needs_datetime" | "illustrative_confirmed";
  vehicle_id?: string | null;
  resolved_local_time?: string | null;
  timezone: string;
};

export type ChatTurnResponse = {
  message_id: string;
  assistant_text: string;
  vehicles: string[];
  visit: ApiVisit | null;
  suggestions: string[];
};

export type VoiceTurnResponse = ChatTurnResponse & {
  transcript: string;
  voice_turns_remaining: number;
};

type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class LotLineApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "API_ERROR", status = 500) {
    super(message);
    this.name = "LotLineApiError";
    this.code = code;
    this.status = status;
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

async function parseResponse<T>(response: Response): Promise<T> {
  let body: T | ApiErrorPayload | null = null;
  try {
    body = await response.json() as T | ApiErrorPayload;
  } catch {
    // The public error below deliberately avoids provider/server details.
  }
  if (!response.ok) {
    const error = (body as ApiErrorPayload | null)?.error;
    throw new LotLineApiError(
      error?.message ?? "The LotLine demo is temporarily unavailable.",
      error?.code ?? "API_ERROR",
      response.status,
    );
  }
  return body as T;
}

export async function sendChatTurn(input: {
  sessionId: string;
  message: string;
  history: ApiHistoryTurn[];
  signal?: AbortSignal;
}): Promise<ChatTurnResponse> {
  const response = await fetch(`${API_BASE}/api/chat/turn`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: input.sessionId,
      message: input.message,
      history: input.history.slice(-6),
    }),
    signal: input.signal,
  });
  return parseResponse<ChatTurnResponse>(response);
}

export async function sendVoiceTurn(input: {
  sessionId: string;
  audio: Blob;
  durationMs: number;
  history: ApiHistoryTurn[];
  signal?: AbortSignal;
}): Promise<VoiceTurnResponse> {
  const form = new FormData();
  form.append("session_id", input.sessionId);
  form.append("recorded_duration_ms", String(Math.max(1, Math.round(input.durationMs))));
  form.append("history_json", JSON.stringify(input.history.slice(-6)));
  const extension = input.audio.type.includes("ogg") ? "ogg" : "webm";
  form.append("audio", input.audio, `lotline-voice.${extension}`);

  const response = await fetch(`${API_BASE}/api/voice/turn`, {
    method: "POST",
    credentials: "include",
    body: form,
    signal: input.signal,
  });
  return parseResponse<VoiceTurnResponse>(response);
}
