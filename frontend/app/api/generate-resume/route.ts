import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const uAgentUrl = `${process.env.UAGENT_RESUME_BASE_URL}/resume`;

    const response = await fetch(uAgentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription }),
    });

    const data = await response.json();
    if (response.ok) {
      return NextResponse.json({ resume: data.resume });
    } else {
      return NextResponse.json({ error: data.error || 'Error communicating with uAgent' }, { status: response.status });
    }
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}