import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Video, PieChart, Award } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Master Your Interview Skills with{" "}
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Feedback
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Practice with our AI interviewer, get real-time feedback, and improve your chances of landing your dream job.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button asChild size="lg" className="gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300">
              <Link href="/get-started">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1.5">
              <Link href="/how-it-works">
                Learn More
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-3">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Real-time Interviews</h3>
              <p className="text-center text-muted-foreground">
                Practice with AI-driven video interviews that simulate real job interviews.
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-3">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Detailed Analytics</h3>
              <p className="text-center text-muted-foreground">
                Get insights on your performance, confidence, clarity, and areas for improvement.
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Expert Feedback</h3>
              <p className="text-center text-muted-foreground">
                Receive professional recommendations to improve your interview skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}