"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoadmapTimeline from "@/components/roadmap-timeline";
import ResourceList from "@/components/resource-list";
import WorkflowAnimation from "@/components/workflow-animation";
import type { Roadmap } from "@/types/roadmap";

interface RoadmapModalProps {
  roadmap: Roadmap;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoadmapModal({ roadmap, isOpen, onClose }: RoadmapModalProps) {
  const [activeTab, setActiveTab] = useState("timeline");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-black dark:text-white rounded-2xl p-8">
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              {roadmap.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
              {roadmap.description}
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <TabsTrigger value="timeline" className="text-sm">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-sm">
              Resources
            </TabsTrigger>
            <TabsTrigger value="workflow" className="text-sm">
              Workflow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="pt-6">
            <RoadmapTimeline milestones={roadmap.milestones} />
          </TabsContent>

          <TabsContent value="resources" className="pt-6">
            <ResourceList resources={roadmap.resources} />
          </TabsContent>

          <TabsContent value="workflow" className="pt-6">
            <WorkflowAnimation milestones={roadmap.milestones} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-8 flex justify-between">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
          >
            Print Roadmap
          </Button>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-lg"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}