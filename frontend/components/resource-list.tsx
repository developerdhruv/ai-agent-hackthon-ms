"use client";

import { motion } from "framer-motion";
import { ExternalLink, Book, Video, Globe, Code2, Mic, BookOpen } from "lucide-react";
import type { Resource } from "@/types/roadmap";

interface ResourceListProps {
  resources: Resource[];
}

export default function ResourceList({ resources }: ResourceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {resources.map((resource, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getResourceIcon(resource.type)}
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{resource.title}</h3>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{resource.level}</span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4">{resource.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {resource.tags?.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{resource.cost}</span>
          </div>

          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View Resource
            </a>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function getResourceIcon(type: string) {
  switch (type) {
    case "book":
      return <Book className="w-4 h-4 text-blue-500" />;
    case "video":
    case "youtube":
      return <Video className="w-4 h-4 text-blue-500" />;
    case "course":
    case "tutorial":
      return <BookOpen className="w-4 h-4 text-blue-500" />;
    case "website":
      return <Globe className="w-4 h-4 text-blue-500" />;
    case "repository":
      return <Code2 className="w-4 h-4 text-blue-500" />;
    case "podcast":
      return <Mic className="w-4 h-4 text-blue-500" />;
    default:
      return <Globe className="w-4 h-4 text-blue-500" />;
  }
}