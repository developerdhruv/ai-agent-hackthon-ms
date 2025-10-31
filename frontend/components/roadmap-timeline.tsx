"use client"

import { CheckCircle2, Circle, Clock, GraduationCap, BookOpen, Code, Lightbulb } from "lucide-react"
import type { Milestone } from "@/types/roadmap"

interface RoadmapTimelineProps {
  milestones: Milestone[]
}

export default function RoadmapTimeline({ milestones }: RoadmapTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-8">
        {milestones.map((milestone, index) => (
          <div key={index} className="relative pl-10">
            <div className="absolute left-0 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white">
              {getMilestoneIcon(milestone.type)}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{milestone.title}</h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{milestone.duration}</span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-3">{milestone.description}</p>

              {milestone.tasks && milestone.tasks.length > 0 && (
                <div className="space-y-2 mt-3">
                  <h4 className="text-sm font-medium">Key Tasks:</h4>
                  <ul className="space-y-1">
                    {milestone.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="flex items-start">
                        <Circle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="text-sm">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getMilestoneIcon(type: string) {
  switch (type) {
    case "learning":
      return <BookOpen className="w-4 h-4" />
    case "project":
      return <Code className="w-4 h-4" />
    case "concept":
      return <Lightbulb className="w-4 h-4" />
    case "assessment":
      return <CheckCircle2 className="w-4 h-4" />
    default:
      return <GraduationCap className="w-4 h-4" />
  }
}
