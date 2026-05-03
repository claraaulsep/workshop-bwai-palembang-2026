import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json() as {
      username: string;
      password: string;
    };

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    // If credentials aren't configured at all, this route shouldn't be reachable
    if (!validUsername || !validPassword) {
      return NextResponse.json({ success: false, error: 'Not configured' }, { status: 403 });
    }

    const isValid = username === validUsername && password === validPassword;

    if (isValid) {
      return NextResponse.json({ success: true });
    }

    // Artificial delay on failure to slow brute-force attempts
    await new Promise(r => setTimeout(r, 800));
    return NextResponse.json({ success: false }, { status: 401 });

  } catch {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 });
  }
}
