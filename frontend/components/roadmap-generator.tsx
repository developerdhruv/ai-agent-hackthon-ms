"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, Code } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoadmapModal from "@/components/roadmap-modal";
import { Roadmap } from "@/types/roadmap";

const formSchema = z.object({
  category: z.enum(["education", "software"], {
    required_error: "Please select a category.",
  }),
  topic: z.string().min(2, {
    message: "Topic must be at least 2 characters.",
  }),
  currentLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Please select your current level.",
  }),
  goals: z.string().min(10, {
    message: "Please describe your goals in at least 10 characters.",
  }),
  timeframe: z.enum(["1month", "3months", "6months", "1year"], {
    required_error: "Please select a timeframe.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function RoadmapGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "education",
      topic: "",
      currentLevel: "beginner",
      goals: "",
      timeframe: "3months",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        setRoadmap(data);
        setIsModalOpen(true);
      } else {
        throw new Error(data.error || "Failed to generate roadmap");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate roadmap. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-gray-200 dark:border-gray-700"
      >
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Create Your Learning Roadmap
        </h1>
        <Tabs defaultValue="education" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <TabsTrigger value="education" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Education
            </TabsTrigger>
            <TabsTrigger value="software" className="flex items-center gap-2">
              <Code className="w-4 h-4" /> Software Development
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Select
                        onValueChange={(value: "education" | "software") => {
                          field.onChange(value);
                          form.setValue("topic", "");
                        }}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="software">
                            Software Development
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TabsContent value="education">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Educational Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Machine Learning, History, Mathematics"
                          className="rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the subject or field you want to learn about.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="software">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Development Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Web Development, Mobile Apps, DevOps"
                          className="rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the technology or development area you want to
                        learn.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select your current level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Your current knowledge level in this area.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeframe</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select your timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1month">1 Month</SelectItem>
                          <SelectItem value="3months">3 Months</SelectItem>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How long you plan to spend on this learning journey.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what you want to achieve with this learning path..."
                        className="min-h-[120px] rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific about what you want to accomplish.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-lg py-3 transition-all duration-300"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  "Generate Roadmap"
                )}
              </Button>
            </form>
          </Form>
        </Tabs>
      </motion.div>

      <AnimatePresence>
        {roadmap && (
          <RoadmapModal
            roadmap={roadmap}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}