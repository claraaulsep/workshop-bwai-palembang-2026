import { NextResponse } from 'next/server';

// Pings Ollama at localhost:11434 and returns the first available model name
export async function GET() {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (!res.ok) {
      return NextResponse.json({ available: false, model: null });
    }

    const data = await res.json() as { models?: { name: string }[] };
    const models = data.models ?? [];

    if (models.length === 0) {
      // Ollama is running but no models are installed
      return NextResponse.json({ available: true, model: null, noModels: true });
    }

    // Return the first installed model
    const firstModel = models[0].name;
    return NextResponse.json({ available: true, model: firstModel, models: models.map(m => m.name) });

  } catch {
    // Ollama not running or unreachable
    return NextResponse.json({ available: false, model: null });
  }
}
