'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FeedbackOverview } from '@/components/interview/feedback-overview';
import { PerformanceRadarChart } from '@/components/interview/performance-radar-chart';
import { QuestionResponseList } from '@/components/interview/question-response-list';
import { useInterview } from '@/lib/contexts/interview-context';
import { InterviewFeedback } from '@/lib/types';
// use interviewer agent API instead of openai lib
import { v4 as uuidv4 } from '@/lib/uuid';
import { generatePDF } from '@/lib/pdf-generator';
import { Download, FileText, Home, Redo, Share2 } from 'lucide-react';
import Link from 'next/link';


// Define the metric keys type for type safety
type MetricKey = 'clarity' | 'confidence' | 'relevance' | 'completeness' | 'technicalAccuracy';

export default function ResultsPage() {
  const router = useRouter();
  const { userProfile, currentSession, feedback, setFeedback } = useInterview();
  const [isLoading, setIsLoading] = useState(!feedback);
  
  useEffect(() => {
    if (!userProfile || !currentSession) {
      router.push('/get-started');
      return;
    }
    
    // If we already have feedback, don't regenerate it
    if (feedback) {
      setIsLoading(false);
      return;
    }
    
    const generateFeedback = async () => {
      try {
        const questions = currentSession.questions.map(q => q.text);
        const responses = currentSession.responses.map(r => r.transcription);
        const analyses = currentSession.responses.map(r => r.analysis);
        // Call interviewer agent API
        const res = await fetch('/api/interviewer/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: userProfile,
            questions,
            responses,
            analyses
          })
        });
        if (!res.ok) throw new Error('Failed to generate feedback');
        const data = await res.json();
        const feedbackData = data.feedback;
        
        const newFeedback: InterviewFeedback = {
          id: uuidv4(),
          sessionId: currentSession.id,
          overallScore: feedbackData.overallScore,
          metrics: {
            clarity: averageMetric('clarity'),
            confidence: averageMetric('confidence'),
            relevance: averageMetric('relevance'),
            completeness: averageMetric('completeness'),
            technicalAccuracy: hasMetric('technicalAccuracy') ? averageMetric('technicalAccuracy') : undefined,
          },
          strengths: feedbackData.strengths,
          areasForImprovement: feedbackData.areasForImprovement,
          recommendations: feedbackData.recommendations,
          summary: feedbackData.summary,
          generatedAt: new Date(),
        };
        
        setFeedback(newFeedback);
      } catch (error) {
        console.error('Error generating feedback:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateFeedback();
  }, [userProfile, currentSession, feedback, router, setFeedback]);
  
  const averageMetric = (metric: MetricKey) => {
    const values = currentSession?.responses
      ?.filter(r => r.analysis && r.analysis[metric] !== undefined)
      .map(r => r.analysis ? r.analysis[metric] as number : undefined)
      .filter((val): val is number => val !== undefined) || [];
  
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  };
  
  const hasMetric = (metric: MetricKey) => {
    return currentSession?.responses.some(r => r.analysis && r.analysis[metric] !== undefined) || false;
  };
  
  const handleDownloadPDF = async () => {
    if (userProfile && currentSession && feedback) {
      try {
        await generatePDF(userProfile, currentSession, feedback);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-10 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 border-t-4 border-primary rounded-full animate-spin"></div>
          <h1 className="text-2xl font-bold">Generating Your Interview Report</h1>
          <p className="text-muted-foreground text-center max-w-md">
            We&apos;re analyzing your responses and preparing a comprehensive feedback report. This may take a moment...
          </p>
        </div>
      </div>
    );
  }
  
  if (!userProfile || !currentSession || !feedback) {
    return (
      <div className="container py-10 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Interview Results Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We couldn&apos;t find the results for your interview. This might be because:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>You haven&apos;t completed an interview yet</li>
              <li>There was an error processing your interview data</li>
              <li>Your session has expired</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/get-started">Start New Interview</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-10 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Interview Results</h1>
            <Badge variant="outline" className="ml-1">
              {new Date(feedback.generatedAt).toLocaleDateString()}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {userProfile.name} • {userProfile.targetRole} • {userProfile.industry}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/get-started">
              <Redo className="h-4 w-4 mr-2" />
              New Interview
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-3xl font-bold">
                    {feedback.overallScore}
                    <span className="text-lg font-normal text-muted-foreground">/100</span>
                  </h2>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
                
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <div className="text-sm text-muted-foreground">Interview Duration</div>
                  <div className="font-medium">
                    {Math.round(((currentSession.endTime ? new Date(currentSession.endTime) : new Date()).getTime() - 
                      new Date(currentSession.startTime).getTime()) / 60000)} minutes
                  </div>
                </div>
                
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <div className="text-sm text-muted-foreground">Questions</div>
                  <div className="font-medium">
                    {currentSession.questions.length} questions
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-muted-foreground">{feedback.summary}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Key Strengths</h3>
                    <ul className="space-y-2">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Areas for Improvement</h3>
                    <ul className="space-y-2">
                      {feedback.areasForImprovement.map((area, index) => (
                        <li key={index} className="flex gap-2 text-sm">
                          <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-500/20 text-red-600 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceRadarChart metrics={feedback.metrics} />
              
              <div className="mt-6 space-y-2">
                <h3 className="font-medium mb-2">Recommendations</h3>
                <ul className="space-y-3">
                  {feedback.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm border-l-2 border-primary pl-3 py-1">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="detailed-feedback">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detailed-feedback">Detailed Feedback</TabsTrigger>
          <TabsTrigger value="question-responses">Question & Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="detailed-feedback" className="mt-6">
          <FeedbackOverview feedback={feedback} />
        </TabsContent>
        
        <TabsContent value="question-responses" className="mt-6">
          <QuestionResponseList 
            questions={currentSession.questions}
            responses={currentSession.responses}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-10">
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}