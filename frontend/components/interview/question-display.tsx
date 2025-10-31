'use client';

import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { InterviewQuestion, QuestionType } from '@/lib/types';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionDisplayProps {
  question: InterviewQuestion;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
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

  const speakQuestion = () => {
    const utterance = new SpeechSynthesisUtterance(question.text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Speak the question when it changes
    speakQuestion();
    
    // Cleanup function to cancel speech when component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [question.text]);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant={getBadgeVariant(question.type)}>
          {getQuestionTypeLabel(question.type)}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={speakQuestion}
          title="Read question aloud"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>
      
      <h2 className="text-xl font-semibold leading-7">{question.text}</h2>
    </div>
  );
}