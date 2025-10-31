"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Code, Lightbulb, CheckCircle2, GraduationCap, ArrowRight, Play, Pause } from "lucide-react";
import type { Milestone } from "@/types/roadmap";

interface WorkflowAnimationProps {
  milestones: Milestone[];
}

export default function WorkflowAnimation({ milestones }: WorkflowAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % milestones.length);
      }, 4000); // Increased interval for better readability
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, milestones.length]);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlayPause}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
          aria-label={isPlaying ? "Pause animation" : "Play animation"}
        >
          <motion.div
            animate={{ rotate: isPlaying ? 0 : 360 }}
            transition={{ duration: 0.3 }}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </motion.div>
          {isPlaying ? "Pause" : "Play"}
        </motion.button>
      </div>

      <div className="relative h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-lg w-full border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <motion.div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center mr-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getMilestoneIcon(milestones[currentStep].type)}
                </motion.div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white">{milestones[currentStep].title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{milestones[currentStep].duration}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{milestones[currentStep].description}</p>

              {milestones[currentStep].tasks && milestones[currentStep].tasks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Key Tasks:</h4>
                  <ul className="space-y-2">
                    {milestones[currentStep].tasks.slice(0, 4).map((task, taskIndex) => (
                      <motion.li
                        key={taskIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + taskIndex * 0.1 }}
                        className="flex items-start"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">{task}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center">
              <motion.button
                onClick={() => handleStepClick(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={`w-4 h-4 rounded-full transition-colors relative group ${
                  currentStep === index
                    ? "bg-blue-600 dark:bg-blue-400"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to milestone ${index + 1}: ${milestone.title}`}
              >
                <span className="absolute hidden group-hover:block -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2">
                  {milestone.title}
                </span>
              </motion.button>
              {index < milestones.length - 1 && (
                <ArrowRight className="w-4 h-4 mx-1 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getMilestoneIcon(type: string) {
  switch (type) {
    case "learning":
      return <BookOpen className="w-6 h-6 text-blue-500" />;
    case "project":
      return <Code className="w-6 h-6 text-purple-500" />;
    case "concept":
      return <Lightbulb className="w-6 h-6 text-yellow-500" />;
    case "assessment":
      return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    default:
      return <GraduationCap className="w-6 h-6 text-gray-500" />;
  }
}