'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function ResumePage() {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate resume');
      }

      setResumeText(data.resume);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate resume. Please try again.';
      setError(errorMessage);
      console.error('Resume generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsDoc = () => {
    const blob = new Blob([resumeText], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_resume.doc';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="container px-4 py-8 md:py-12 mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-center mb-4">AI Resume Generator</h1>
          <p className="text-muted-foreground text-center mb-6">
            Paste a job description to generate a tailored resume using AI. Edit as needed and download.
          </p>

          <textarea
            placeholder="Paste Job Description Here"
            className="w-full min-h-[150px] border rounded-md p-2"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <Button onClick={generateResume} disabled={loading} className="mb-6">
            {loading ? 'Generating Resume...' : 'Generate'}
          </Button>

          {resumeText && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Generated Resume</h2>
              <textarea
                className="w-full min-h-[300px] border rounded-md p-2"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <div className="flex gap-4 mt-4">
                <Button onClick={downloadAsDoc}>Download as .doc</Button>
                <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}