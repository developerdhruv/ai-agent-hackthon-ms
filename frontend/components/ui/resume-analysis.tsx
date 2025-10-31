'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResumeAnalysis } from '@/lib/types';

interface ResumeAnalysisProps {
  analysis: ResumeAnalysis;
}

export function ResumeAnalysis({ analysis }: ResumeAnalysisProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Resume Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Name</h3>
            <p>{analysis.name || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Email</h3>
            <p>{analysis.email || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Current Job Title</h3>
            <p>{analysis.jobTitle || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Experience</h3>
            <p>{analysis.yearsOfExperience} years</p>
          </div>
          <div>
            <h3 className="font-semibold">Skills</h3>
            <p>{analysis.skills || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Target Role</h3>
            <p>{analysis.targetRole || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Industry</h3>
            <p>{analysis.industry || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Education</h3>
            <ul className="list-disc pl-5">
              {analysis.education.length > 0 ? (
                analysis.education.map((edu, index) => (
                  <li key={index}>{edu}</li>
                ))
              ) : (
                <li>No education identified</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Certifications</h3>
            <ul className="list-disc pl-5">
              {analysis.certifications.length > 0 ? (
                analysis.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))
              ) : (
                <li>No certifications identified</li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}