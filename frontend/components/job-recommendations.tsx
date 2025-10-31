"use client";

import { useState } from "react";
import { SearchIcon, BookmarkIcon, ExternalLinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type JobRecommendation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface JobRecommendationsProps {
  jobs: JobRecommendation[];
}

export function JobRecommendations({ jobs }: JobRecommendationsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleSaveJob = (id: number) => {
    setSavedJobs((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Recommendations</CardTitle>
          <CardDescription>
            Jobs that match your skills and experience based on your resume
          </CardDescription>
          <div className="relative mt-4">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, company, location or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredJobs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No job recommendations found matching your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {job.company} • {job.location}
                        </CardDescription>
                        {job.salary && (
                          <CardDescription className="mt-1">
                            Salary: ${job.salary.median.toLocaleString()} (Range: $
                            {job.salary.min.toLocaleString()} - $
                            {job.salary.max.toLocaleString()})
                          </CardDescription>
                        )}
                        {job.sourceLink && (
                          <a
                            href={job.sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            Source: Glassdoor
                          </a>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-bold",
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
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-muted/50">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 5 && (
                        <Badge variant="outline" className="bg-muted/50">
                          +{job.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button variant="ghost" size="sm" onClick={() => toggleSaveJob(job.id)}>
                      <BookmarkIcon
                        className={cn(
                          "h-4 w-4 mr-2",
                          savedJobs.includes(job.id) ? "fill-primary" : ""
                        )}
                      />
                      {savedJobs.includes(job.id) ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={job.link || "#"} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon className="h-4 w-4 mr-2" />
                        Apply
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}