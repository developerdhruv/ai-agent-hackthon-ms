

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }

    const uAgentUrl = `${process.env.UAGENT_ANALYZER_BASE_URL}/analyze-resume`;

    const response = await fetch(uAgentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText }),
    });

    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data.analysis);
    } else {
      return NextResponse.json({ error: data.error || 'Error analyzing resume' }, { status: response.status });
    }
  } catch (error) {
    console.error('Error in resume analysis:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}