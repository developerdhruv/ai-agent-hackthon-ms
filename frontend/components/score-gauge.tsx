"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [score]);
  
  const rotation = (animatedScore / 100) * 180;
  
  const getScoreColor = (score: number) => {
    if (score < 40) return "text-destructive";
    if (score < 70) return "text-chart-4"; // orange
    return "text-chart-2"; // green
  };
  
  const getScoreText = (score: number) => {
    if (score < 40) return "Needs Improvement";
    if (score < 70) return "Moderate";
    if (score < 85) return "Good";
    return "Excellent";
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-48 w-48">
        {/* Background track */}
        <div className="absolute h-full w-full rounded-full border-8 border-muted opacity-25"></div>
        
        {/* Score track - animated */}
        <div 
          className={cn(
            "absolute h-full w-full rounded-full border-8 border-transparent transition-all duration-1000 ease-out",
            getScoreColor(animatedScore)
          )}
          style={{ 
            clipPath: `polygon(50% 50%, 50% 0%, ${50 + rotation / 3.6}% 0%)`,
            borderLeftColor: "currentColor",
            borderTopColor: "currentColor",
            transform: `rotate(${rotation}deg)`,
          }}
        ></div>
        
        {/* Inner circle */}
        <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center flex-col">
          <span 
            className={cn(
              "text-4xl font-bold transition-colors duration-500",
              getScoreColor(animatedScore)
            )}
          >
            {Math.round(animatedScore)}%
          </span>
          <span className="text-sm text-muted-foreground mt-1">
            {getScoreText(animatedScore)}
          </span>
        </div>
      </div>
    </div>
  );
}