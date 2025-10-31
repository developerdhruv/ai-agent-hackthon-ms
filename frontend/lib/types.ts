export interface ScoreBreakdown {
  category: string;
  score: number;
  description: string;
}

export interface ImprovementSuggestion {
  title: string;
  description: string;
  section: string;
  priority: "high" | "medium" | "low";
  examples?: string[];
}

export interface JobRecommendation {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  matchPercentage: number;
  skills: string[];
  link?: string;
  salary?: {
    min: number;
    median: number;
    max: number;
  };
  sourceLink?: string;
}

export interface AnalysisResultType {
  atsScore: number;
  formatScore: number;
  keywordCount: number;
  yearsOfExperience: number;
  educationLevel: string;
  jobMatchScore: number;
  skills: string[];
  scoreBreakdown: ScoreBreakdown[];
  improvementSuggestions: ImprovementSuggestion[];
  jobRecommendations: JobRecommendation[];
}

// User profile types
export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  jobTitle: string;
  yearsOfExperience: number;
  skills: string[];
  targetRole: string;
  industry: string;
  interviewType: InterviewType;
}



// Interview session types
export interface InterviewSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  status: 'scheduled' | 'in-progress' | 'completed';
  settings: InterviewSettings;
}

export interface InterviewSettings {
  duration: number; // in minutes
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: QuestionType;
  timestamp: Date;
}



export interface InterviewResponse {
  id: string;
  questionId: string;
  audioUrl?: string;
  transcription: string;
  timestamp: Date;
  duration: number; // in seconds
  analysis?: ResponseAnalysis;
}

export interface ResponseAnalysis {
  clarity: number; // 0-100
  confidence: number; // 0-100
  relevance: number; // 0-100
  completeness: number; // 0-100
  technicalAccuracy?: number; // 0-100, only for technical questions
  strengths: string[];
  weaknesses: string[];
  suggestions: string;
}

// Feedback and metrics
export interface InterviewFeedback {
  id: string;
  sessionId: string;
  overallScore: number; // 0-100
  metrics: {
    clarity: number;
    confidence: number;
    relevance: number;
    completeness: number;
    technicalAccuracy?: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  summary: string;
  generatedAt: Date;
}

// OpenAI related types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// User profile types
export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  jobTitle: string;
  yearsOfExperience: number;
  skills: string[];
  targetRole: string;
  industry: string;
  interviewType: InterviewType;
}

export enum InterviewType {
  BEHAVIORAL = 'behavioral',
  TECHNICAL = 'technical',
  CASE_STUDY = 'case_study',
  GENERAL = 'general',
}

// Interview session types
export interface InterviewSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  status: 'scheduled' | 'in-progress' | 'completed';
  settings: InterviewSettings;
}

export interface InterviewSettings {
  duration: number; // in minutes
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: string[];
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: QuestionType;
  timestamp: Date;
}

export enum QuestionType {
  BEHAVIORAL = 'behavioral',
  TECHNICAL = 'technical',
  SITUATIONAL = 'situational',
  EXPERIENCE = 'experience',
  PROBLEM_SOLVING = 'problem_solving',
}

export interface InterviewResponse {
  id: string;
  questionId: string;
  audioUrl?: string;
  transcription: string;
  timestamp: Date;
  duration: number; // in seconds
  analysis?: ResponseAnalysis;
}

export interface ResponseAnalysis {
  clarity: number; // 0-100
  confidence: number; // 0-100
  relevance: number; // 0-100
  completeness: number; // 0-100
  technicalAccuracy?: number; // 0-100, only for technical questions
  strengths: string[];
  weaknesses: string[];
  suggestions: string;
}

// Feedback and metrics
export interface InterviewFeedback {
  id: string;
  sessionId: string;
  overallScore: number; // 0-100
  metrics: {
    clarity: number;
    confidence: number;
    relevance: number;
    completeness: number;
    technicalAccuracy?: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  summary: string;
  generatedAt: Date;
}

// OpenAI related types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}