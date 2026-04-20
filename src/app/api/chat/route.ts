import { NextRequest, NextResponse } from 'next/server';

const GROQ_MODELS: Record<string, string> = {
  groq_120: 'openai/gpt-oss-120b',
  groq_20: 'openai/gpt-oss-20b',
  llama4: 'meta-llama/llama-4-scout-17b-16e-instruct',
  llama33: 'llama-3.3-70b-versatile',
  llama_8b: 'llama-3.1-8b-instant',
};

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function POST(req: NextRequest) {
  try {
    const { model, messages, systemMessage, knowledgeBase } = await req.json() as {
      model: string;
      messages: ChatMessage[];
      systemMessage: string;
      knowledgeBase: string;
    };

    // Build system prompt, injecting KB if present
    let sysPrompt = systemMessage || 'You are a helpful AI assistant for the Build With AI Palembang 2026 workshop.';
    if (knowledgeBase) {
      sysPrompt += `\n\n[KNOWLEDGE BASE - use this to answer relevant questions]\n${knowledgeBase}\n[END KNOWLEDGE BASE]`;
    }

    // Limit to last 5 turns (10 messages) for memory
    const ctx = messages.slice(-10);

    let reply = '';

    if (model === 'gemini') {
      reply = await callGemini(sysPrompt, ctx);
    } else if (model === 'ollama') {
      reply = await callOllama(sysPrompt, ctx);
    } else {
      reply = await callGroq(sysPrompt, ctx, GROQ_MODELS[model] ?? 'llama-3.3-70b-versatile');
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Gemini
async function callGemini(systemPrompt: string, messages: ChatMessage[]) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? 'Gemini API error');
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '(no response)';
}

// Groq
async function callGroq(systemPrompt: string, messages: ChatMessage[], modelId: string) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? 'Groq API error');
  return data.choices?.[0]?.message?.content ?? '(no response)';
}

// Ollama
async function callOllama(systemPrompt: string, messages: ChatMessage[]) {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      stream: false,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? 'Ollama error');
  return data.message?.content ?? '(no response)';
}
