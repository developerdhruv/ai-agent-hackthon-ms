"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
// import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Briefcase,
  FileText,
  Brain,
  Target,
  Sparkles,
  User,
  ChevronRight,
  // Github,
  // Linkedin,
  // Mail,
  Server,
  Code,
  Cpu,
  Star,
  CheckCircle,
  ArrowRight,
  Users,
} from "lucide-react"

// Custom hook for animations on scroll
const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [options])

  return [ref, isVisible]
}

// Animated component wrapper
import { ReactNode } from "react";

const AnimatedSection = ({ children, className = "", delay = 0, animation = "fade-up" }: { children: ReactNode, className?: string, delay?: number, animation?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible] = useIntersectionObserver({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : animation === "fade-up"
            ? "opacity-0 translate-y-10"
            : animation === "fade-left"
              ? "opacity-0 -translate-x-10"
              : animation === "fade-right"
                ? "opacity-0 translate-x-10"
                : "opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Typing animation component
const TypingAnimation = ({ text, className = "" }: { text: string, className?: string }) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 50) // Adjust typing speed here

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return <span className={className}>{displayText}</span>
}

// Counter animation component
const CounterAnimation = ({ end, duration = 2000, prefix = "", suffix = "" }: { end: number, duration?: number, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0)
  const [ isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true })

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    if (isVisible) {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        setCount(Math.floor(progress * end))

        if (progress < 1) {
          animationFrame = requestAnimationFrame(step)
        }
      }

      animationFrame = requestAnimationFrame(step)
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isVisible, end, duration])

  return (
    <span className="font-bold text-4xl md:text-5xl text-black">
      {prefix}
      {count}
      {suffix}
    </span>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection animation="fade-right">
                <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">
                  AI-Powered Career Companion
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                  <TypingAnimation text="Your Smart Career Companion for the AI Age" />
                </h1>
                <p className="text-lg text-slate-600 mb-8">
                  CareerPilot helps you navigate your career journey with AI-powered tools for resume optimization, job
                  matching, interview preparation, and skill development.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 transform transition-transform hover:scale-105"
                  >
                    Get Started <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="transform transition-transform hover:scale-105">
                    Learn More
                  </Button>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="fade-left" delay={300}>
                <div className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl duration-500">
                  <Image
                    src="/image.png?height=800&width=800"
                    alt="CareerPilot Dashboard"
                    fill
                    className="object-cover"
                  />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <AnimatedSection delay={100}>
                <div className="p-6 rounded-lg bg-purple-50 border border-purple-100 h-full flex flex-col justify-center items-center">
                  <Users className="h-8 w-8 text-black mb-4" />
                  <CounterAnimation end={10000} suffix="+" />
                  <p className="text-slate-600 mt-2">Active Users</p>
                </div>
              </AnimatedSection>


              

              <AnimatedSection delay={200}>
                <div className="p-6 rounded-lg bg-purple-50 border border-purple-100 h-full flex flex-col justify-center items-center">
                  <Briefcase className="h-8 w-8 text-black mb-4" />
                  <CounterAnimation end={25000} suffix="+" />
                  <p className="text-slate-600 mt-2">Jobs Matched</p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="p-6 rounded-lg bg-purple-50 border border-purple-100 h-full flex flex-col justify-center items-center">
                  <FileText className="h-8 w-8 text-black mb-4" />
                  <CounterAnimation end={50000} suffix="+" />
                  <p className="text-slate-600 mt-2">Resumes Optimized</p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <div className="p-6 rounded-lg bg-purple-50 border border-purple-100 h-full flex flex-col justify-center items-center">
                  <Brain className="h-8 w-8 text-black mb-4" />
                  <CounterAnimation end={15000} suffix="+" />
                  <p className="text-slate-600 mt-2">Mock Interviews</p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">Features</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Supercharge Your Job Hunt</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                CareerPilot combines AI and career expertise to give you the edge in today&apos;s competitive job market.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatedSection delay={100}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300">
                      <FileText className="h-6 w-6 text-black" />
                    </div>
                    <CardTitle className="text-xl">ATS Resume Scanner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      Uses Azure OpenAI to analyze your resume against ATS standards, providing actionable improvements
                      to increase your chances of getting past automated screening.
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={200}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300">
                      <Briefcase className="h-6 w-6 text-black" />
                    </div>
                    <CardTitle className="text-xl">Job Matching & Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      Intelligently matches your profile with trending jobs and provides personalized recommendations
                      based on your skills and experience.
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300">
                      <Brain className="h-6 w-6 text-black" />
                    </div>
                    <CardTitle className="text-xl">Mock Interviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      Practice with role-specific AI interviews that provide custom scoring and detailed feedback to
                      help you improve your interview skills.
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300">
                      <Sparkles className="h-6 w-6 text-black" />
                    </div>
                    <CardTitle className="text-xl">Resume Builder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      Build role-specific resumes in seconds with AI-powered content suggestions and automatic
                      formatting using industry best practices.
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={500}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300">
                      <Target className="h-6 w-6 text-black" />
                    </div>
                    <CardTitle className="text-xl">Skill Guidance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      Receive personalized learning paths based on your job interests and identify skill gaps between
                      your current profile and desired roles.
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={600}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full">
                  <CardHeader className="pb-2">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300">
                      <User className="h-6 w-6 text-black" />
                    </div>
                    <CardTitle className="text-xl">Profile Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      Get AI-powered suggestions to optimize your job-seeker profile, making you more attractive to
                      potential employers and recruiters.
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section id="tech" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">Technology</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powered by Modern Tech</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                CareerPilot is built with cutting-edge technologies to provide a seamless and intelligent experience.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <Tabs defaultValue="frontend" className="max-w-3xl mx-auto">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="frontend" className="transition-all hover:scale-105">
                    Frontend
                  </TabsTrigger>
                  <TabsTrigger value="backend" className="transition-all hover:scale-105">
                    Backend
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="transition-all hover:scale-105">
                    AI Services
                  </TabsTrigger>
                  <TabsTrigger value="devops" className="transition-all hover:scale-105">
                    DevOps
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="frontend" className="mt-6">
                  <Card className="transition-all hover:shadow-md duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Code className="mr-2 h-5 w-5 text-black" />
                        Frontend Stack
                      </CardTitle>
                      <CardDescription>Modern, responsive UI built with React and Tailwind CSS</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">React</Badge>
                          <span className="text-slate-600">Component-based UI library</span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">Next.js</Badge>
                          <span className="text-slate-600">React framework with SSR and API routes</span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">Tailwind CSS</Badge>
                          <span className="text-slate-600">Utility-first CSS framework</span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">TypeScript</Badge>
                          <span className="text-slate-600">Type-safe JavaScript</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="backend" className="mt-6">
                  <Card className="transition-all hover:shadow-md duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Server className="mr-2 h-5 w-5 text-black" />
                        Backend Stack
                      </CardTitle>
                      <CardDescription>Serverless architecture for scalability and performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">
                            Next.js API Routes
                          </Badge>
                          <span className="text-slate-600">Serverless functions for backend logic</span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">Azure Cosmos DB</Badge>
                          <span className="text-slate-600">MongoDB API for data storage</span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">
                            Azure Static Web Apps
                          </Badge>
                          <span className="text-slate-600">Hosting and serverless backend</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="ai" className="mt-6">
                  <Card className="transition-all hover:shadow-md duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Brain className="mr-2 h-5 w-5 text-black" />
                        AI Services
                      </CardTitle>
                      <CardDescription>Cutting-edge AI models for intelligent features</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">Azure OpenAI</Badge>
                          <span className="text-slate-600">
                            Advanced language models for text generation and analysis
                          </span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">ATSScannerAgent</Badge>
                          <span className="text-slate-600">Resume evaluation and suggestions</span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">JobMatchAgent</Badge>
                          <span className="text-slate-600">Personalized job recommendations</span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">
                            MockInterviewAgent
                          </Badge>
                          <span className="text-slate-600">AI-based interview simulation</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="devops" className="mt-6">
                  <Card className="transition-all hover:shadow-md duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Cpu className="mr-2 h-5 w-5 text-black" />
                        DevOps & Infrastructure
                      </CardTitle>
                      <CardDescription>Automated deployment and cloud infrastructure</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">GitHub Actions</Badge>
                          <span className="text-slate-600">CI/CD pipeline for automated deployment</span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">
                            Azure Static Web Apps
                          </Badge>
                          <span className="text-slate-600">Hosting and serverless backend</span>
                        </li>
                        <li className="flex items-center">
                          <Badge className="mr-2 bg-slate-200 text-slate-800 hover:bg-slate-200">Azure Cloud</Badge>
                          <span className="text-slate-600">Cloud infrastructure and services</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </AnimatedSection>
          </div>
        </section>

        {/* Architecture Diagram */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-12">
              <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">Architecture</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It All Works Together</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                CareerPilot&apos;s architecture leverages Azure&apos;s powerful cloud services for a scalable, reliable
                experience.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl border border-slate-200 transition-all hover:shadow-xl duration-500 hover:scale-[1.02]">
                <div className="aspect-[16/9] relative">
                  <Image
                    src="/diagram.png?height=900&width=1600"
                    alt="CareerPilot Architecture Diagram"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">Process</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How CareerPilot Works</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Our streamlined process helps you optimize your job search from start to finish
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <AnimatedSection delay={100}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 relative">
                    <span className="text-2xl font-bold text-black">1</span>
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
                  <p className="text-slate-600">
                    Sign up and build your comprehensive profile with your skills, experience, and career goals.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 relative">
                    <span className="text-2xl font-bold text-black">2</span>
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <FileText className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Optimize Your Resume</h3>
                  <p className="text-slate-600">
                    Upload your resume and let our AI analyze and optimize it for ATS compatibility and impact.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={500}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 relative">
                    <span className="text-2xl font-bold text-black">3</span>
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <Briefcase className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Get Matched to Jobs</h3>
                  <p className="text-slate-600">
                    Receive personalized job recommendations based on your profile and optimized resume.
                  </p>
                </div>
              </AnimatedSection>
            </div>

            <div className="hidden md:block h-20 relative my-4 max-w-5xl mx-auto">
              <div className="absolute top-1/2 left-[16.67%] right-[16.67%] h-1 bg-purple-200 transform -translate-y-1/2">
                <div className="absolute left-0 w-1/2 h-full bg-purple-500"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <AnimatedSection delay={700}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 relative">
                    <span className="text-2xl font-bold text-black">4</span>
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <Brain className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Practice Interviews</h3>
                  <p className="text-slate-600">
                    Prepare for interviews with our AI-powered mock interviews tailored to your target roles.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={900}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 relative">
                    <span className="text-2xl font-bold text-black">5</span>
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Improve Your Skills</h3>
                  <p className="text-slate-600">
                    Follow personalized learning paths to close skill gaps and become more competitive.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={1100}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4 relative">
                    <span className="text-2xl font-bold text-black">6</span>
                    <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Land Your Dream Job</h3>
                  <p className="text-slate-600">
                    Apply with confidence using your optimized profile, resume, and interview skills.
                  </p>
                </div>
              </AnimatedSection>
            </div>

            <div className="mt-12 text-center">
              <AnimatedSection delay={1200}>
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 transform transition-transform hover:scale-105"
                >
                  Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">Testimonials</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Hear from professionals who have transformed their job search with CareerPilot
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatedSection delay={100}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <CardTitle className="text-xl">&quot;Game-changing for my job search&quot;</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 mb-6">
                      &quot;CareerPilot completely transformed my job search. The ATS scanner helped me optimize my resume,
                      and I started getting interview calls within days. The mock interview feature prepared me
                      perfectly for the real thing!&quot;
                    </CardDescription>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-200 mr-3 overflow-hidden relative">
   
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Sarah J.</p>
                        <p className="text-sm text-slate-500">Software Engineer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <CardTitle className="text-xl">&quot;Found my dream job in weeks&quot;</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 mb-6">
                      &quot;After months of job searching with no success, I tried CareerPilot. The job matching algorithm
                      found opportunities I hadn&apos;t seen elsewhere, and the skill guidance helped me focus on what
                      mattered. I landed my dream job in just 3 weeks!&quot;
                    </CardDescription>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-200 mr-3 overflow-hidden relative">
                
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Michael T.</p>
                        <p className="text-sm text-slate-500">Marketing Manager</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={500}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <CardTitle className="text-xl">&quot;Career transition made easy&quot;</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 mb-6">
                      &quot;I was trying to switch industries after 10 years, and it seemed impossible until I found
                      CareerPilot. The skill guidance showed me exactly what I needed to learn, and the resume builder
                      helped me highlight my transferable skills. I&apos;m now in my new field and loving it!&quot;
                    </CardDescription>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-200 mr-3 overflow-hidden relative">
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Priya K.</p>
                        <p className="text-sm text-slate-500">Product Manager</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </section>





        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">FAQ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Find answers to common questions about CareerPilot
              </p>
            </AnimatedSection>

            <div className="max-w-3xl mx-auto">
              <AnimatedSection>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">How does the ATS Resume Scanner work?</AccordionTrigger>
                    <AccordionContent>
                      Our ATS Resume Scanner uses Azure OpenAI to analyze your resume against industry-standard
                      Applicant Tracking Systems. It checks for keyword optimization, formatting issues, and content
                      gaps, then provides actionable recommendations to improve your resume&apos;s chances of passing through
                      automated screening systems.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">Is CareerPilot free to use?</AccordionTrigger>
                    <AccordionContent>
                      CareerPilot offers a free tier with basic features including limited resume scans and job matches.
                      For full access to all features including unlimited mock interviews, resume building, and skill
                      guidance, we offer affordable premium plans starting at $9.99/month.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">How accurate are the job matches?</AccordionTrigger>
                    <AccordionContent>
                      Our job matching algorithm uses advanced AI to analyze both your profile and available job
                      listings. It considers skills, experience, location preferences, and career goals to provide
                      highly relevant matches. Our internal testing shows that users find 85% of matches to be highly
                      relevant to their career aspirations.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">Can I use CareerPilot for career changes?</AccordionTrigger>
                    <AccordionContent>
                      CareerPilot is especially valuable for career changers. Our Skill Guidance feature helps identify
                      transferable skills and learning opportunities to bridge gaps between your current experience and
                      desired roles. The Resume Builder also helps highlight relevant experience for your new career
                      path.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">How realistic are the mock interviews?</AccordionTrigger>
                    <AccordionContent>
                      Our mock interviews are powered by Azure OpenAI and designed to simulate real interview
                      experiences. They&apos;re customized based on the specific role, industry, and seniority level you&apos;re
                      targeting. Users report that our mock interviews have accurately prepared them for questions they
                      later encountered in actual interviews.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left">Is my data secure with CareerPilot?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we take data security very seriously. All personal information and resume data is encrypted
                      and stored securely in Azure Cosmos DB. We never share your personal information with third
                      parties without your explicit consent. Our platform complies with GDPR and other relevant data
                      protection regulations.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Blog/Resources Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100">Resources</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Career Resources</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Explore our latest articles and guides to help you navigate your career journey
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatedSection delay={100}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Resume Tips</Badge>
                      <span className="text-sm text-slate-500">5 min read</span>
                    </div>
                    <CardTitle className="text-xl">10 Resume Mistakes That Are Costing You Interviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      Learn the common resume mistakes that recruiters flag and how to fix them to boost your interview
                      chances.
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-black hover:text-purple-700 p-0 h-auto">
                      Read Article <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full overflow-hidden">

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Interview Prep</Badge>
                      <span className="text-sm text-slate-500">8 min read</span>
                    </div>
                    <CardTitle className="text-xl">How to Answer the 5 Toughest Interview Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      Master the art of answering challenging interview questions with our expert strategies and example
                      responses.
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-black hover:text-purple-700 p-0 h-auto">
                      Read Article <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={500}>
                <Card className="border-slate-200 transition-all hover:shadow-lg hover:-translate-y-2 duration-300 h-full overflow-hidden">

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Skill Development</Badge>
                      <span className="text-sm text-slate-500">6 min read</span>
                    </div>
                    <CardTitle className="text-xl">The Top 7 Skills Employers Are Looking For in 2025</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      Discover the most in-demand skills across industries and how you can develop them to stay
                      competitive in the job market.
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-black hover:text-purple-700 p-0 h-auto">
                      Read Article <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </AnimatedSection>
            </div>

            <div className="mt-12 text-center">
              <AnimatedSection>
                <Button variant="outline" className="transform transition-transform hover:scale-105">
                  View All Resources <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </AnimatedSection>
            </div>
          </div>
        </section>

        <section className="py-16 bg-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -inset-[10%] rotate-12 transform bg-purple-500 blur-3xl"></div>
            <div className="absolute inset-x-[60%] inset-y-[30%] rotate-45 transform bg-purple-700 blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <AnimatedSection className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Supercharge Your Career?</h2>
              <p className="text-lg text-purple-100 mb-8">
                Join CareerPilot today and take your job search to the next level with AI-powered tools and insights.
              </p>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-purple-50 transform transition-all hover:scale-105 hover:shadow-lg"
              >
                Get Started Now
              </Button>
            </AnimatedSection>
          </div>
        </section>
      </main>


    </div>
  )
}
