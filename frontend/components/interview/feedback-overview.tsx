import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { InterviewFeedback } from '@/lib/types';

interface FeedbackOverviewProps {
  feedback: InterviewFeedback;
}

export function FeedbackOverview({ feedback }: FeedbackOverviewProps) {
  // Function to get appropriate color based on score
  const getColorClass = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Function to get appropriate progress color based on score
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const metricsData = [
    { name: 'Clarity', value: feedback.metrics.clarity },
    { name: 'Confidence', value: feedback.metrics.confidence },
    { name: 'Relevance', value: feedback.metrics.relevance },
    { name: 'Completeness', value: feedback.metrics.completeness },
  ];
  
  if (feedback.metrics.technicalAccuracy !== undefined) {
    metricsData.push({ name: 'Technical Accuracy', value: feedback.metrics.technicalAccuracy });
  }
  
  const getScoreCategory = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Satisfactory';
    return 'Needs Improvement';
  };
  
  const getScoreCategoryDescription = (score: number) => {
    if (score >= 85) return 'Your interview performance was outstanding. You\'re ready for real interviews!';
    if (score >= 75) return 'Your interview performance was strong with minor areas for improvement.';
    if (score >= 65) return 'Your interview performance was good. Some specific areas need attention.';
    if (score >= 50) return 'Your interview was adequate but requires significant improvement in key areas.';
    return 'Your interview performance needs substantial improvement. More practice is recommended.';
  };
  
  const getScoreCategoryIcon = (score: number) => {
    if (score >= 65) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 50) return <TrendingUp className="h-5 w-5 text-yellow-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Performance Assessment</CardTitle>
              <CardDescription>Detailed breakdown of your interview metrics</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getScoreCategoryIcon(feedback.overallScore)}
              <Badge className={getColorClass(feedback.overallScore)}>
                {getScoreCategory(feedback.overallScore)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            {getScoreCategoryDescription(feedback.overallScore)}
          </p>
          
          <div className="space-y-4">
            {metricsData.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className={`text-sm font-bold ${getColorClass(metric.value)}`}>
                    {metric.value}/100
                  </span>
                </div>
                <Progress value={metric.value} className={getProgressColor(metric.value)} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="col-span-1 md:col-span-3 text-xs text-muted-foreground mt-1 mb-4">
                    {getMetricDescription(metric.name, metric.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Strengths</CardTitle>
            <CardDescription>Areas where you performed well</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p>{strength}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Areas for Improvement</CardTitle>
            <CardDescription>Points to focus on for better results</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-red-500/20 text-red-600 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p>{area}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommendations for Improvement</CardTitle>
          <CardDescription>Actionable steps to enhance your interview performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {feedback.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="mt-1 flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <div>
                  <p>{recommendation}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function getMetricDescription(metric: string, score: number): string {
  const descriptions = {
    Clarity: {
      high: "You communicated your thoughts clearly and effectively, making it easy for the interviewer to understand your points.",
      medium: "Your communication was mostly clear, but some points could have been expressed more effectively.",
      low: "Your responses were difficult to follow at times. Work on organizing your thoughts before speaking."
    },
    Confidence: {
      high: "You demonstrated strong confidence in your responses, which enhances your credibility.",
      medium: "You showed reasonable confidence but appeared hesitant at times. Work on projecting more assurance.",
      low: "You appeared uncertain in your responses. Practice more to build confidence in your knowledge and abilities."
    },
    Relevance: {
      high: "Your answers were highly relevant to the questions asked, demonstrating good understanding of what was being asked.",
      medium: "Most of your answers were on topic, but occasionally you veered off into less relevant areas.",
      low: "Your responses often missed the main point of the questions. Focus on addressing the specific question asked."
    },
    Completeness: {
      high: "Your answers were comprehensive and covered all important aspects of the questions.",
      medium: "Your answers covered the basics but sometimes missed opportunities to provide additional valuable information.",
      low: "Your responses were often too brief or incomplete. Aim to provide more thorough answers."
    },
    "Technical Accuracy": {
      high: "Your technical knowledge was accurate and well-applied to the questions asked.",
      medium: "Your technical understanding was generally accurate with some minor errors or gaps.",
      low: "There were significant gaps or inaccuracies in your technical knowledge. Further study is recommended."
    }
  };

  if (score >= 80) {
    return descriptions[metric as keyof typeof descriptions].high;
  } else if (score >= 60) {
    return descriptions[metric as keyof typeof descriptions].medium;
  } else {
    return descriptions[metric as keyof typeof descriptions].low;
  }
}