'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/interview/profile-form';
import { useInterview } from '@/lib/contexts/interview-context';
import { InterviewType, UserProfile } from '@/lib/types';
import { Code,BriefcaseBusiness,BookOpen, ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { InterviewProvider } from '@/lib/contexts/interview-context';
// side navbar
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';




export default function GetStartedPage() {
 
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewTypeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<string>('profile');
  const { updateProfile } = useInterview();
  // Map URL param to InterviewType enum
  const getInterviewTypeFromParam = (param: string | null): InterviewType => {
    switch (param) {
      case 'technical':
        return InterviewType.TECHNICAL;
      case 'behavioral':
        return InterviewType.BEHAVIORAL;
      case 'case-study':
        return InterviewType.CASE_STUDY;
      default:
        return InterviewType.GENERAL;
    }
  };

  const defaultInterviewType = getInterviewTypeFromParam(interviewTypeParam);
  
  const handleProfileSubmit = (data: UserProfile) => {
    // Set interview type based on URL param if available
    const profileWithType = {
      ...data,
      interviewType: data.interviewType || defaultInterviewType,
    };
    
    updateProfile(profileWithType);
    setActiveTab('settings');
  };
  
  const handleStartInterview = () => {
    router.push('/interview');
  };
  
  return (
    <>
     <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
    <InterviewProvider>
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-5 flex items-center gap-2 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <span>InterviewAI</span>
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-center">Get Started</h1>
            <p className="mb-8 text-center text-muted-foreground">
              Complete your profile to begin your personalized interview experience
            </p>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="settings" disabled={activeTab !== 'settings'}>Interview Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Professional Profile</CardTitle>
                    <CardDescription>
                      Tell us about yourself so we can tailor the interview experience to your needs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm onSubmit={handleProfileSubmit} defaultInterviewType={defaultInterviewType} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Settings</CardTitle>
                    <CardDescription>
                      Customize your interview experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Interview Duration</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <Button variant="outline" className="flex flex-col h-auto py-4 border-primary">
                          <span className="text-lg font-bold">15</span>
                          <span className="text-xs text-muted-foreground">minutes</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col h-auto py-4">
                          <span className="text-lg font-bold">30</span>
                          <span className="text-xs text-muted-foreground">minutes</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col h-auto py-4">
                          <span className="text-lg font-bold">45</span>
                          <span className="text-xs text-muted-foreground">minutes</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Difficulty Level</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <Button variant="outline" className="flex flex-col h-auto py-4">
                          <span className="text-lg font-bold">Beginner</span>
                          <span className="text-xs text-muted-foreground">For practice</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col h-auto py-4 border-primary">
                          <span className="text-lg font-bold">Intermediate</span>
                          <span className="text-xs text-muted-foreground">Standard</span>
                        </Button>
                        <Button variant="outline" className="flex flex-col h-auto py-4">
                          <span className="text-lg font-bold">Advanced</span>
                          <span className="text-xs text-muted-foreground">Challenge</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleStartInterview} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300">
                      Start Interview
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
    </InterviewProvider>
    </SidebarInset>
      </SidebarProvider>
    </>
  );
}