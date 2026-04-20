import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dir = path.join(process.cwd(), 'public', 'knowledge');
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv') || f.endsWith('.txt'));
    const result = files.map(f => ({
      name: f,
      content: fs.readFileSync(path.join(dir, f), 'utf-8'),
    }));
    return NextResponse.json({ files: result });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
