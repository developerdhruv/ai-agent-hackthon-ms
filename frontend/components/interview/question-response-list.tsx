import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { InterviewQuestion, InterviewResponse, QuestionType } from '@/lib/types';

interface QuestionResponseListProps {
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
}

export function QuestionResponseList({ questions, responses }: QuestionResponseListProps) {
  // Function to match responses to questions
  const getResponseForQuestion = (questionId: string) => {
    return responses.find(response => response.questionId === questionId);
  };
  
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
  
  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.BEHAVIORAL:
        return 'Behavioral';
      case QuestionType.TECHNICAL:
        return 'Technical';
      case QuestionType.SITUATIONAL:
        return 'Situational';
      case QuestionType.EXPERIENCE:
        return 'Experience';
      case QuestionType.PROBLEM_SOLVING:
        return 'Problem Solving';
      default:
        return 'General';
    }
  };
  
  const getBadgeVariant = (type: QuestionType) => {
    switch (type) {
      case QuestionType.BEHAVIORAL:
        return 'default';
      case QuestionType.TECHNICAL:
        return 'destructive';
      case QuestionType.SITUATIONAL:
        return 'secondary';
      case QuestionType.EXPERIENCE:
        return 'outline';
      case QuestionType.PROBLEM_SOLVING:
      default:
        return 'default';
    }
  };

  return (
    <Accordion type="multiple" className="w-full">
      {questions.map((question, index) => {
        const response = getResponseForQuestion(question.id);
        
        return (
          <AccordionItem key={question.id} value={question.id} className="border rounded-lg mb-4 overflow-hidden">
            <AccordionTrigger className="p-4 hover:bg-muted/50 data-[state=open]:bg-muted/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full text-left">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-muted-foreground/20 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium truncate">{question.text}</span>
                </div>
                <Badge variant={getBadgeVariant(question.type)} className="ml-auto">
                  {getQuestionTypeLabel(question.type)}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-2">
              {response ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Your Response:</h4>
                    <Card>
                      <CardContent className="p-3 text-sm">
                        {response.transcription}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {response.analysis && (
                    <>
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Analysis:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs">Clarity</span>
                              <span className={`text-xs font-bold ${getColorClass(response.analysis.clarity)}`}>
                                {response.analysis.clarity}/100
                              </span>
                            </div>
                            <Progress value={response.analysis.clarity} className={getProgressColor(response.analysis.clarity)} />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs">Confidence</span>
                              <span className={`text-xs font-bold ${getColorClass(response.analysis.confidence)}`}>
                                {response.analysis.confidence}/100
                              </span>
                            </div>
                            <Progress value={response.analysis.confidence} className={getProgressColor(response.analysis.confidence)} />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs">Relevance</span>
                              <span className={`text-xs font-bold ${getColorClass(response.analysis.relevance)}`}>
                                {response.analysis.relevance}/100
                              </span>
                            </div>
                            <Progress value={response.analysis.relevance} className={getProgressColor(response.analysis.relevance)} />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs">Completeness</span>
                              <span className={`text-xs font-bold ${getColorClass(response.analysis.completeness)}`}>
                                {response.analysis.completeness}/100
                              </span>
                            </div>
                            <Progress value={response.analysis.completeness} className={getProgressColor(response.analysis.completeness)} />
                          </div>
                          
                          {response.analysis.technicalAccuracy !== undefined && (
                            <div className="space-y-2 col-span-1 sm:col-span-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs">Technical Accuracy</span>
                                <span className={`text-xs font-bold ${getColorClass(response.analysis.technicalAccuracy)}`}>
                                  {response.analysis.technicalAccuracy}/100
                                </span>
                              </div>
                              <Progress value={response.analysis.technicalAccuracy} className={getProgressColor(response.analysis.technicalAccuracy)} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-medium text-green-600 mb-1">Strengths:</h4>
                          <ul className="space-y-1">
                            {response.analysis.strengths.map((strength, i) => (
                              <li key={i} className="text-xs pl-4 relative">
                                <span className="absolute left-0 top-1.5 h-1 w-1 rounded-full bg-green-500"></span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-red-600 mb-1">Areas to Improve:</h4>
                          <ul className="space-y-1">
                            {response.analysis.weaknesses.map((weakness, i) => (
                              <li key={i} className="text-xs pl-4 relative">
                                <span className="absolute left-0 top-1.5 h-1 w-1 rounded-full bg-red-500"></span>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {response.analysis.suggestions && (
                        <div className="p-2 bg-muted rounded-md text-xs">
                          <p className="font-medium mb-1">Suggestion:</p>
                          <p>{response.analysis.suggestions}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No response recorded for this question.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}