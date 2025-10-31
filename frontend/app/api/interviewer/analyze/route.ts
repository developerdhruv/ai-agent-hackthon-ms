import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { profile, question, response } = await request.json();
    const base = process.env.UAGENT_INTERVIEWER_BASE_URL;
    if (!base) return NextResponse.json({ error: 'UAGENT_INTERVIEWER_BASE_URL not set' }, { status: 500 });

    const res = await fetch(`${base}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, question, response }),
    });
    const data = await res.json();
    return res.ok ? NextResponse.json(data) : NextResponse.json({ error: data.error || 'uAgent error' }, { status: res.status });
  } catch (error) {
    console.error('Interviewer analyze error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


