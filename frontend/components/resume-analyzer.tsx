'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileUploader } from './file-uploader';
import { AnalysisResults } from './analysis-results';
import { LoadingSpinner } from './loading-spinner';
import { ResumePreview } from './ResumePreview';
import { analyzeResume } from '@/lib/resume-analyzer';
import { type AnalysisResultType } from '@/lib/types';

export function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResultType | null>(null);
  const [showPreview , setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (file: File | null, text: string) => {
    console.log('Uploaded file:', file?.name, 'Extracted text length:', text.length);
    setFile(file);
    setResumeText(text);
  };

  const handleAnalyze = async () => {
    if (!resumeText) {
      toast({
        title: 'Error',
        description: 'Please upload a resume file first.',
        variant: 'destructive',
      });
      return;
    }

    if (resumeText.length < 50) {
      toast({
        title: 'Error',
        description: 'Resume text is too short. Please upload a valid resume.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResults = await analyzeResume(resumeText);
      setResults(analysisResults);

      try {
        const history = JSON.parse(localStorage.getItem('resumeHistory') || '[]');
        const newEntry = {
          id: Date.now(),
          fileName: file?.name || 'Unnamed Resume',
          date: new Date().toISOString(),
          score: analysisResults.atsScore,
          results: analysisResults,
        };
        localStorage.setItem('resumeHistory', JSON.stringify([newEntry, ...history]));
      } catch (storageError) {
        console.warn('Failed to save to localStorage:', storageError);
        toast({
          title: 'Warning',
          description: 'Analysis saved, but history could not be updated.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = (error as Error).message.includes('OPENAI_API_KEY')
        ? 'Server configuration error. Please contact support.'
        : (error as Error).message.includes('parse')
        ? 'Failed to process resume. Please ensure the resume is valid.'
        : (error as Error).message || 'We encountered an error analyzing your resume. Please try again.';
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (isAnalyzing) return;
    setFile(null);
    setResumeText('');
    setResults(null);
    setShowPreview(false);
  };

  return (
    <div className="space-y-8">
      {!results ? (
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
            <CardDescription>
              Upload your resume in PDF or TXT format to analyze its ATS compatibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploader onChange={handleFileChange} file={file} />
            {resumeText && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="mb-4"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                {showPreview && <ResumePreview resumeText={resumeText} />}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={!file || isAnalyzing}
            >
              Reset
            </Button>
            <Button onClick={handleAnalyze} disabled={!file || isAnalyzing}>
              {isAnalyzing ? <LoadingSpinner /> : 'Analyze Resume'}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="">
          {/* <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Resume Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResumePreview resumeText={resumeText} />
            </CardContent>
          </Card> */}
          <AnalysisResults
            results={results}
            fileName={file?.name}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}