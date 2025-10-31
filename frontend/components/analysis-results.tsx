"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "./score-gauge";
import { SuggestionsList } from "./suggestions-list";
import { JobRecommendations } from "./job-recommendations";
import { ResumeExport } from "./resume-export";
import { type AnalysisResultType } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

interface AnalysisResultsProps {
  results: AnalysisResultType;
  fileName?: string;
  onReset: () => void;
}

export function AnalysisResults({ results, fileName, onReset }: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState("score");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onReset} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Upload New Resume</span>
        </Button>
        <ResumeExport results={results} fileName={fileName} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>ATS Score</CardTitle>
            <CardDescription>
              Overall compatibility with Applicant Tracking Systems
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <ScoreGauge score={results.atsScore} />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resume Overview</CardTitle>
            <CardDescription>
              Key statistics and information from your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Skills Found</dt>
                <dd className="text-xl font-medium">{results.skills.length}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Experience</dt>
                <dd className="text-xl font-medium">{results.yearsOfExperience} years</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Job Match Score</dt>
                <dd className="text-xl font-medium">{results.jobMatchScore}%</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Keywords</dt>
                <dd className="text-xl font-medium">{results.keywordCount}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Education</dt>
                <dd className="text-xl font-medium">{results.educationLevel}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-muted-foreground">Format Score</dt>
                <dd className="text-xl font-medium">{results.formatScore}%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px] mb-6">
          <TabsTrigger value="score">Score Details</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="jobs">Job Matches</TabsTrigger>
        </TabsList>
        
        <TabsContent value="score" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>
                Detailed analysis of your resume&apos;s ATS compatibility factors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {results.scoreBreakdown.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{item.category}</h4>
                    <span className="font-medium">{item.score}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suggestions" className="space-y-6">
          <SuggestionsList suggestions={results.improvementSuggestions} />
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-6">
          <JobRecommendations jobs={results.jobRecommendations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}