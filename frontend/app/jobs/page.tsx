"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookmarkIcon,
  CheckIcon,
  ExternalLinkIcon,
  SearchIcon,
} from "lucide-react";
import { sampleJobs } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";

// Define Job type for TypeScript (if you're using TypeScript)
interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  matchPercentage: number;
}

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [jobs] = useState<Job[]>(sampleJobs); // State for jobs data

  // Optional: Fetch job recommendations on mount (client-side)
  /*
  useEffect(() => {
    async function fetchJobs() {
      try {
        const jobRecommendations = await fetchJobRecommendations();
        setJobs(jobRecommendations);
      } catch (error) {
        console.error("Failed to fetch job recommendations:", error);
      }
    }
    fetchJobs();
  }, []);
  */

  const toggleSaveJob = (id: number) => {
    setSavedJobs((prev) =>
      prev.includes(id)
        ? prev.filter((jobId) => jobId !== id)
        : [...prev, id]
    );
  };

  const filteredJobs = jobs.filter((job) => {
    // Filter by search term
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Filter by match percentage
    if (filter === "all") return matchesSearch;
    if (filter === "high") return matchesSearch && job.matchPercentage >= 80;
    if (filter === "medium")
      return matchesSearch && job.matchPercentage >= 60 && job.matchPercentage < 80;
    if (filter === "low") return matchesSearch && job.matchPercentage < 60;

    return matchesSearch;
  });

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
            <h1 className="text-3xl font-bold mb-2">Job Recommendations</h1>
            <p className="text-muted-foreground mb-8">
              Discover job opportunities matched to your skills and experience
            </p>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Search & Filter</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => {
                          console.log("Search term:", e.target.value); // Debug
                          setSearchTerm(e.target.value);
                        }}
                        className="pl-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Match Level</label>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All matches" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All matches</SelectItem>
                          <SelectItem value="high">High match (80%+)</SelectItem>
                          <SelectItem value="medium">
                            Medium match (60-79%)
                          </SelectItem>
                          <SelectItem value="low">
                            Low match (Below 60%)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Job Type</label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Experience Level
                      </label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue placeholder="All levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All levels</SelectItem>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior Level</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Applied Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {filter !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {filter === "high"
                            ? "High match"
                            : filter === "medium"
                            ? "Medium match"
                            : "Low match"}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => setFilter("all")}
                          >
                            <CheckIcon className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}

                      {searchTerm && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          Search: {searchTerm}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 p-0"
                            onClick={() => setSearchTerm("")}
                          >
                            <CheckIcon className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}

                      {!searchTerm && filter === "all" && (
                        <span className="text-sm text-muted-foreground">
                          No filters applied
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-3">
                <Tabs defaultValue="all">
                  <div className="flex items-center justify-between mb-6">
                    <TabsList>
                      <TabsTrigger value="all">All Jobs</TabsTrigger>
                      <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
                    </TabsList>
                    <span className="text-sm text-muted-foreground">
                      {filteredJobs.length} jobs found
                    </span>
                  </div>

                  <TabsContent value="all">
                    {filteredJobs.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                          <SearchIcon className="h-8 w-8 text-muted-foreground mb-4" />
                          <h3 className="font-medium text-lg mb-2">
                            No jobs found
                          </h3>
                          <p className="text-muted-foreground max-w-sm">
                            Try adjusting your search filters to find more job
                            opportunities.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {filteredJobs.map((job) => (
                          <Card key={job.id}>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <CardTitle>{job.title}</CardTitle>
                                  <CardDescription className="mt-1">
                                    {job.company} • {job.location}
                                  </CardDescription>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "font-bold shrink-0",
                                    job.matchPercentage >= 80
                                      ? "bg-chart-2/20 text-chart-2"
                                      : job.matchPercentage >= 60
                                      ? "bg-chart-4/20 text-chart-4"
                                      : "bg-muted"
                                  )}
                                >
                                  {job.matchPercentage}% Match
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                              <p className="text-muted-foreground mb-4">
                                {job.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {job.skills.map((skill, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="bg-muted/50"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between gap-4 pt-0">
                              <Button
                                variant="ghost"
                                className="flex items-center gap-2"
                                onClick={() => toggleSaveJob(job.id)}
                              >
                                <BookmarkIcon
                                  className={cn(
                                    "h-4 w-4",
                                    savedJobs.includes(job.id) ? "fill-primary" : ""
                                  )}
                                />
                                {savedJobs.includes(job.id) ? "Saved" : "Save"}
                              </Button>
                              <Button className="flex items-center gap-2">
                                <ExternalLinkIcon className="h-4 w-4" />
                                Apply Now
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="saved">
                    {savedJobs.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                          <BookmarkIcon className="h-8 w-8 text-muted-foreground mb-4" />
                          <h3 className="font-medium text-lg mb-2">
                            No saved jobs
                          </h3>
                          <p className="text-muted-foreground max-w-sm">
                            Jobs you save will appear here for easy access.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {jobs
                          .filter((job) => savedJobs.includes(job.id))
                          .map((job) => (
                            <Card key={job.id}>
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <CardTitle>{job.title}</CardTitle>
                                    <CardDescription className="mt-1">
                                      {job.company} • {job.location}
                                    </CardDescription>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "font-bold shrink-0",
                                      job.matchPercentage >= 80
                                        ? "bg-chart-2/20 text-chart-2"
                                        : job.matchPercentage >= 60
                                        ? "bg-chart-4/20 text-chart-4"
                                        : "bg-muted"
                                    )}
                                  >
                                    {job.matchPercentage}% Match
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-3">
                                <p className="text-muted-foreground mb-4">
                                  {job.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {job.skills.map((skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="bg-muted/50"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                              <CardFooter className="flex justify-between gap-4 pt-0">
                                <Button
                                  variant="ghost"
                                  className="flex items-center gap-2"
                                  onClick={() => toggleSaveJob(job.id)}
                                >
                                  <BookmarkIcon className="h-4 w-4 fill-primary" />
                                  Remove
                                </Button>
                                <Button className="flex items-center gap-2">
                                  <ExternalLinkIcon className="h-4 w-4" />
                                  Apply Now
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}