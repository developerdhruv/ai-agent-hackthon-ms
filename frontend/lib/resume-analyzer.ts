import { type AnalysisResultType } from './types';

export async function analyzeResume(resumeText: string): Promise<AnalysisResultType> {
  try {
    const response = await fetch('/api/analyze-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resumeText }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to analyze resume');
    }

    return data as AnalysisResultType;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}