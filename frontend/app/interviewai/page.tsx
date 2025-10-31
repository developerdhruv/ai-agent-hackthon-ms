import Head from 'next/head';
import Link from 'next/link';

import { AppSidebar } from '@/components/app-sidebar';
import { HeroSection } from '@/components/home/hero-section';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';

import {
  Code,
  Users,
  BriefcaseBusiness,
  BookOpen
} from 'lucide-react';

export default function InterviewPage() {
  return (
    <>
      <Head>
        <title>Interview Practice - Ace Your Interviews</title>
        <meta
          name="description"
          content="Practice technical, behavioral, leadership, and case study interviews to boost your confidence."
        />
      </Head>

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
          <HeroSection />

          <section className="bg-muted py-20">
            <div className="container px-4 md:px-6">
              <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Interview Practice for Every Role
                </h2>
                <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                  Whether you&apos;re applying for technical positions, management roles, or entry-level jobs, we&apos;ve got you covered.
                </p>
              </div>

              <Tabs defaultValue="technical" className="mx-auto max-w-3xl">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger
                    value="technical"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Code className="h-4 w-4 mr-2" aria-hidden="true" />
                    Technical
                  </TabsTrigger>
                  <TabsTrigger
                    value="behavioral"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                    Behavioral
                  </TabsTrigger>
                  <TabsTrigger
                    value="leadership"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <BriefcaseBusiness className="h-4 w-4 mr-2" aria-hidden="true" />
                    Leadership
                  </TabsTrigger>
                  <TabsTrigger
                    value="case-study"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                    Case Study
                  </TabsTrigger>
                </TabsList>

                {/* Technical Tab */}
                <TabsContent value="technical" className="p-6 border rounded-lg mt-4 bg-card">
                  <h3 className="text-xl font-bold mb-3">Technical Interviews</h3>
                  <p className="mb-4">Practice coding challenges, system design questions, and technical concepts for software engineering, data science, and IT roles.</p>
                  <ul className="mb-5 space-y-2">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Coding challenges with real-time feedback</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>System design and architecture questions</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Technical concept explanations</span>
                    </li>
                  </ul>
                  <Button asChild>
                    <Link href="/get-started?type=technical">Try Technical Interview</Link>
                  </Button>
                </TabsContent>

                {/* Behavioral Tab */}
                <TabsContent value="behavioral" className="p-6 border rounded-lg mt-4 bg-card">
                  <h3 className="text-xl font-bold mb-3">Behavioral Interviews</h3>
                  <p className="mb-4">Master the art of sharing your experiences using the STAR method to showcase your soft skills and problem-solving abilities.</p>
                  <ul className="mb-5 space-y-2">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Situation-Task-Action-Result structure guidance</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Common behavioral questions with example answers</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Feedback on communication effectiveness</span>
                    </li>
                  </ul>
                  <Button asChild>
                    <Link href="/get-started?type=behavioral">Try Behavioral Interview</Link>
                  </Button>
                </TabsContent>

                {/* Leadership Tab */}
                <TabsContent value="leadership" className="p-6 border rounded-lg mt-4 bg-card">
                  <h3 className="text-xl font-bold mb-3">Leadership Interviews</h3>
                  <p className="mb-4">Practice handling complex leadership scenarios, team management questions, and strategic decision-making challenges.</p>
                  <ul className="mb-5 space-y-2">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Team conflict resolution scenarios</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Strategic thinking and vision questions</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Change management and organizational challenges</span>
                    </li>
                  </ul>
                  <Button asChild>
                    <Link href="/get-started?type=leadership">Try Leadership Interview</Link>
                  </Button>
                </TabsContent>

                {/* Case Study Tab */}
                <TabsContent value="case-study" className="p-6 border rounded-lg mt-4 bg-card">
                  <h3 className="text-xl font-bold mb-3">Case Study Interviews</h3>
                  <p className="mb-4">Practice analyzing business problems, market sizing questions, and client-facing scenarios for consulting and business roles.</p>
                  <ul className="mb-5 space-y-2">
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Business problem-solving frameworks</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Market sizing and estimation techniques</span>
                    </li>
                    <li className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>Client scenario role-playing with feedback</span>
                    </li>
                  </ul>
                  <Button asChild>
                    <Link href="/get-started?type=case-study">Try Case Study Interview</Link>
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          <section className="py-20">
            <div className="container px-4 md:px-6">
              <div className="mx-auto text-center md:max-w-[58rem]">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Ace Your Next Interview?
                </h2>
                <p className="mt-4 text-muted-foreground md:text-xl">
                  Start practicing now and see your confidence grow with each interview session.
                </p>
                <div className="mt-8">
                  <Button
                    size="lg"
                    asChild
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                  >
                    <Link href="/get-started">Start Your Interview Journey</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
