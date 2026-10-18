export interface ChatSource {
  title: string;
  source: string;
  topic: string;
}

export interface ChatEvent {
  type: 'token' | 'done' | 'error';
  text?: string;
  answer?: string;
  conversationId?: string;
  sources?: ChatSource[];
  suggestions?: string[];
  message?: string;
}

export type ChatLanguage = 'en' | 'hi' | 'mr';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export async function streamChat(
  values: {
    text: string;
    conversationId?: string;
    language?: ChatLanguage;
    image?: { uri: string; name: string; type: string };
  },
  onEvent: (event: ChatEvent) => void,
): Promise<void> {
  const body = new FormData();
  body.append('text', values.text);
  if (values.conversationId) body.append('conversation_id', values.conversationId);
  body.append('language', values.language || 'en');
  if (values.image) {
    if (typeof Blob !== 'undefined' && typeof window !== 'undefined') {
      const imageResponse = await fetch(values.image.uri);
      if (!imageResponse.ok) throw new Error('Unable to read the selected image.');
      const imageBlob = await imageResponse.blob();
      body.append('image', imageBlob, values.image.name);
    } else {
      body.append('image', values.image as unknown as Blob);
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { Accept: 'application/x-ndjson' },
    body,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Chat request failed (${response.status})`);
  }
  if (!response.body) {
    onEvent({ type: 'done', answer: await response.text() });
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    buffer += decoder.decode(result.value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    lines.filter(Boolean).forEach((line) => onEvent(JSON.parse(line) as ChatEvent));
  }
}

export async function transcribeVoice(
  recording: { uri: string; name: string; type: string },
  language: ChatLanguage,
): Promise<string> {
  const body = new FormData();
  body.append('language', language);
  body.append('audio', recording as unknown as Blob);
  const response = await fetch(`${API_BASE_URL}/api/transcribe`, { method: 'POST', body });
  if (!response.ok) throw new Error((await response.text()) || 'Voice transcription failed.');
  const result = await response.json() as { text?: string };
  return result.text?.trim() || '';
}
