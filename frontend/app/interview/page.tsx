"use client";

import "regenerator-runtime/runtime";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoDisplay } from "@/components/interview/video-display";
import { QuestionDisplay } from "@/components/interview/question-display";
import { ResponseAnalysis } from "@/components/interview/response-analysis";
import { useInterview } from "@/lib/contexts/interview-context";
import {
  InterviewQuestion,
  QuestionType,
  InterviewSession,
  InterviewResponse,
} from "@/lib/types";
// Calls to backend API routes that proxy to ai-interviewer-agent
import { v4 as uuidv4 } from "@/lib/uuid";
import { Mic, MicOff, Loader2, Clock, CheckCheck } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default function InterviewPage() {
  const router = useRouter();
  const {
    userProfile,
    startInterview,
    updateSession,
    currentSession,
    isInterviewActive,
  } = useInterview();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Redirect if no user profile
  useEffect(() => {
    if (!userProfile) {
      router.push("/get-started");
    } else if (!isInterviewActive && !loading) {
      router.push("/dashboard");
    }
  }, [userProfile, router, isInterviewActive, loading]);

  // Initialize interview session
  useEffect(() => {
    if (userProfile && !currentSession) {
      const initInterview = async () => {
        try {
          // Generate questions via interviewer agent API
          const qRes = await fetch("/api/interviewer/questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile: userProfile, count: 5 }),
          });
          if (!qRes.ok) throw new Error("Failed to fetch interview questions");
          const qData = await qRes.json();
          const questionTexts: string[] = qData.questions || [];

          const formattedQuestions: InterviewQuestion[] = questionTexts.map(
            (text) => ({
              id: uuidv4(),
              text,
              type: mapToQuestionType(text, userProfile.interviewType),
              timestamp: new Date(),
            })
          );

          setQuestions(formattedQuestions);

          // Create a new interview session
          const newSession: InterviewSession = {
            id: uuidv4(),
            userId: userProfile.id || uuidv4(),
            startTime: new Date(),
            questions: formattedQuestions,
            responses: [],
            status: "in-progress",
            settings: {
              duration: 15, // Default to 15 minutes
              difficultyLevel: "intermediate",
              focusAreas: userProfile.skills,
            },
          };

          startInterview(newSession);
          setLoading(false);

          // Start timer
          startTimer();
        } catch (error) {
          console.error("Error initializing interview:", error);
          setLoading(false);
        }
      };

      initInterview();
    } else if (currentSession) {
      setQuestions(currentSession.questions);
      setLoading(false);
      startTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userProfile, currentSession, startInterview]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
  };

  const mapToQuestionType = (
    question: string,
    interviewType: string
  ): QuestionType => {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes("situation") ||
      lowerQuestion.includes("example") ||
      lowerQuestion.includes("time when")
    ) {
      return QuestionType.BEHAVIORAL;
    } else if (
      lowerQuestion.includes("how would you") ||
      lowerQuestion.includes("what would you do")
    ) {
      return QuestionType.SITUATIONAL;
    } else if (
      lowerQuestion.includes("experience") ||
      lowerQuestion.includes("project") ||
      lowerQuestion.includes("worked on")
    ) {
      return QuestionType.EXPERIENCE;
    } else if (
      interviewType === "technical" ||
      lowerQuestion.includes("technical") ||
      lowerQuestion.includes("algorithm") ||
      lowerQuestion.includes("code")
    ) {
      return QuestionType.TECHNICAL;
    } else {
      return QuestionType.PROBLEM_SOLVING;
    }
  };

  const toggleMicrophone = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    if (!listening) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setIsRecording(true);
    } else {
      SpeechRecognition.stopListening();
      setIsRecording(false);
      submitResponse();
    }
  };

  const submitResponse = async () => {
    if (!userProfile || !currentSession || !transcript.trim()) return;

    setIsAnalyzing(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];

      // Analyze the response via interviewer agent API
      const aRes = await fetch("/api/interviewer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: userProfile,
          question: currentQuestion.text,
          response: transcript,
        }),
      });
      if (!aRes.ok) throw new Error("Failed to analyze response");
      const aData = await aRes.json();
      const analysis = aData.analysis;

      // Create a new response
      const newResponse: InterviewResponse = {
        id: uuidv4(),
        questionId: currentQuestion.id,
        transcription: transcript,
        timestamp: new Date(),
        duration: 60, // Mock duration
        analysis,
      };

      // Update the session with the new response
      const updatedResponses = [
        ...(currentSession.responses || []),
        newResponse,
      ];
      updateSession({ responses: updatedResponses });

      // Move to the next question if available
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetTranscript();
      } else {
        // End the interview and redirect to results
        updateSession({
          status: "completed",
          endTime: new Date(),
        });

        router.push("/interview/results");
      }
    } catch (error) {
      console.error("Error analyzing response:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="container py-10 max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Preparing Your Interview</h1>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="flex justify-center">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile || !currentSession || questions.length === 0) {
    return (
      <div className="container py-10 max-w-5xl mx-auto">
        <div className="p-10 text-center">
          <h1 className="text-3xl font-bold mb-4">Interview Setup Error</h1>
          <p className="mb-6 text-muted-foreground">
            We encountered an issue setting up your interview. Please return to
            the setup page.
          </p>
          <Button onClick={() => router.push("/get-started")}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentResponse = currentSession.responses.find(
    (r) => r.questionId === currentQuestion.id
  );

  return (
    <div className="container py-10 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Interview Session</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(timeElapsed)}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <VideoDisplay />

          <div className="flex justify-center">
            <Button
              variant={listening ? "destructive" : "default"}
              size="lg"
              className="rounded-full h-14 w-14"
              onClick={toggleMicrophone}
              disabled={isAnalyzing || !browserSupportsSpeechRecognition}
            >
              {listening ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </div>

          {isRecording && (
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Your Answer</h3>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Recording
                  </span>
                </div>
              </div>

              <div className="w-full h-32 bg-background border rounded-md p-3 text-sm overflow-y-auto">
                {transcript}
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center p-4 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing your response...</span>
            </div>
          )}

          {currentResponse && !isAnalyzing && (
            <ResponseAnalysis response={currentResponse} />
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <QuestionDisplay question={currentQuestion} />

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Tips for this question:</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      Structure your answer clearly with an introduction, main
                      points, and conclusion.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      Provide specific examples from your experience to support
                      your points.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      For behavioral questions, consider using the STAR method
                      (Situation, Task, Action, Result).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>
                      Speak clearly and maintain a moderate pace to ensure your
                      points are understood.
                    </span>
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  disabled={
                    currentQuestionIndex === 0 || isRecording || isAnalyzing
                  }
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex - 1)
                  }
                >
                  Previous
                </Button>

                <Button
                  disabled={
                    currentQuestionIndex === questions.length - 1 ||
                    isRecording ||
                    isAnalyzing
                  }
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
