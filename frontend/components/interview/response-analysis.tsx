import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InterviewResponse } from '@/lib/types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ResponseAnalysisProps {
  response: InterviewResponse;
}

export function ResponseAnalysis({ response }: ResponseAnalysisProps) {
  const { analysis } = response;
  
  if (!analysis) {
    return null;
  }
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          Response Analysis
          <Badge variant="outline" className="ml-2 text-xs">
            AI Generated
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Clarity</span>
              <span className={`text-sm font-bold ${getScoreColor(analysis.clarity)}`}>
                {analysis.clarity}/100
              </span>
            </div>
            <Progress value={analysis.clarity} className={getProgressColor(analysis.clarity)} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Confidence</span>
              <span className={`text-sm font-bold ${getScoreColor(analysis.confidence)}`}>
                {analysis.confidence}/100
              </span>
            </div>
            <Progress value={analysis.confidence} className={getProgressColor(analysis.confidence)} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Relevance</span>
              <span className={`text-sm font-bold ${getScoreColor(analysis.relevance)}`}>
                {analysis.relevance}/100
              </span>
            </div>
            <Progress value={analysis.relevance} className={getProgressColor(analysis.relevance)} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completeness</span>
              <span className={`text-sm font-bold ${getScoreColor(analysis.completeness)}`}>
                {analysis.completeness}/100
              </span>
            </div>
            <Progress value={analysis.completeness} className={getProgressColor(analysis.completeness)} />
          </div>
          
          {analysis.technicalAccuracy !== undefined && (
            <div className="space-y-2 col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Technical Accuracy</span>
                <span className={`text-sm font-bold ${getScoreColor(analysis.technicalAccuracy)}`}>
                  {analysis.technicalAccuracy}/100
                </span>
              </div>
              <Progress value={analysis.technicalAccuracy} className={getProgressColor(analysis.technicalAccuracy)} />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-600 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="text-sm pl-5 relative">
                  <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600 flex items-center">
              <XCircle className="h-4 w-4 mr-1" />
              Areas to Improve
            </h4>
            <ul className="space-y-1">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm pl-5 relative">
                  <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {analysis.suggestions && (
          <div className="p-3 bg-muted rounded-md text-sm mt-2">
            <p className="font-medium mb-1">Suggestion:</p>
            <p>{analysis.suggestions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}