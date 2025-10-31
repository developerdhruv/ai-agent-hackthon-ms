'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, InterviewSession, InterviewFeedback } from '@/lib/types';

interface InterviewContextType {
  userProfile: UserProfile | null;
  currentSession: InterviewSession | null;
  feedback: InterviewFeedback | null;
  updateProfile: (profile: UserProfile) => void;
  startInterview: (session: InterviewSession) => void;
  updateSession: (data: Partial<InterviewSession>) => void;
  setFeedback: (feedback: InterviewFeedback) => void;
  isInterviewActive: boolean;
  resetInterview: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [feedback, setFeedbackState] = useState<InterviewFeedback | null>(null);
  
  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  const startInterview = (session: InterviewSession) => {
    setCurrentSession(session);
  };
  
  const updateSession = (data: Partial<InterviewSession>) => {
    if (currentSession) {
      setCurrentSession({ ...currentSession, ...data });
    }
  };
  
  const setFeedback = (newFeedback: InterviewFeedback) => {
    setFeedbackState(newFeedback);
  };
  
  const resetInterview = () => {
    setCurrentSession(null);
    setFeedbackState(null);
  };
  
  return (
    <InterviewContext.Provider
      value={{
        userProfile,
        currentSession,
        feedback,
        updateProfile,
        startInterview,
        updateSession,
        setFeedback,
        isInterviewActive: !!currentSession && !feedback,
        resetInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};