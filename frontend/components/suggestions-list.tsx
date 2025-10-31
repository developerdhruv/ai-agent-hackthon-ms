"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type ImprovementSuggestion } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SuggestionsListProps {
  suggestions: ImprovementSuggestion[];
}

export function SuggestionsList({ suggestions }: SuggestionsListProps) {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  
  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === "all") return true;
    return suggestion.priority === filter;
  });
  
  const suggestionCounts = {
    high: suggestions.filter(s => s.priority === "high").length,
    medium: suggestions.filter(s => s.priority === "medium").length,
    low: suggestions.filter(s => s.priority === "low").length,
  };
  
  const priorityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-chart-4/10 text-chart-4 border-chart-4/20", // orange
    low: "bg-chart-2/10 text-chart-2 border-chart-2/20", // green
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Improvement Suggestions</CardTitle>
        <CardDescription>
          Recommendations to improve your resume&apos;s ATS compatibility and overall quality
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("all")}
            className="rounded-full"
          >
            All ({suggestions.length})
          </Button>
          <Button 
            variant={filter === "high" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("high")}
            className="rounded-full"
          >
            High Priority ({suggestionCounts.high})
          </Button>
          <Button 
            variant={filter === "medium" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("medium")}
            className="rounded-full"
          >
            Medium ({suggestionCounts.medium})
          </Button>
          <Button 
            variant={filter === "low" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("low")}
            className="rounded-full"
          >
            Low ({suggestionCounts.low})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSuggestions.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No suggestions found for the selected filter.
          </p>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {filteredSuggestions.map((suggestion, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className={cn(
                  "border rounded-lg px-4",
                  priorityColors[suggestion.priority]
                )}
              >
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-left">
                    <span className="font-medium">{suggestion.title}</span>
                    <Badge 
                      variant="outline" 
                      className="ml-0 sm:ml-2 w-fit capitalize"
                    >
                      {suggestion.section}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-1">
                  <div className="space-y-3">
                    <p>{suggestion.description}</p>
                    {suggestion.examples && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-1">Examples:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {suggestion.examples.map((example, i) => (
                            <li key={i}>{example}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}