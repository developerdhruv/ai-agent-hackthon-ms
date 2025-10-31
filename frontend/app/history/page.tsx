"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ExternalLink, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface HistoryEntry {
  id: number;
  fileName: string;
  date: string;
  score: number;
  results: ResultsType;
}

interface ResultsType {
  // specify the structure of the results data
  // for example:
  data: string;
  status: string;
  // add more properties as needed
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const savedHistory = JSON.parse(localStorage.getItem("resumeHistory") || "[]");
    setHistory(savedHistory);
  }, []);
  
  const handleClearHistory = () => {
    localStorage.removeItem("resumeHistory");
    setHistory([]);
  };
  
  const handleDeleteEntry = (id: number) => {
    const updatedHistory = history.filter(entry => entry.id !== id);
    localStorage.setItem("resumeHistory", JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };
  
  if (!isClient) {
    return null;
  }
  
  return (
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
    <main className="min-h-screen bg-background">

      <div className="container px-4 py-8 md:py-12 mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Resume History</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your previously analyzed resumes
            </p>
          </div>
          
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear resume history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all your resume analysis history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        {history.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-2">No resume history</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven&apos;t analyzed any resumes yet. Upload a resume to see your analysis history here.
              </p>
              <Link href="/">
                <Button>Analyze a Resume</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((entry) => (
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{entry.fileName}</CardTitle>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {entry.fileName} from your history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <CardDescription>
                    Analyzed on {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">ATS Score</p>
                      <p className="text-2xl font-bold">{entry.score}%</p>
                    </div>
                    <Link href={`/atsresume`} className="w-full max-w-[120px]">
                      <Button variant="outline" className="w-full" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
    </SidebarInset>
    </SidebarProvider>
  );
}