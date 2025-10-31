export interface Milestone {
  title: string;
  type: "learning" | "project" | "concept" | "assessment" | string;
  description: string;
  duration: string;
  tasks: string[];
}

export interface Resource {
  title: string;
  type: "book" | "video" | "course" | "website" | "repository" | "tutorial" | "youtube" | "podcast" | string;
  description: string;
  url?: string;
  level?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  cost?: "free" | "paid";
}

export interface Roadmap {
  title: string;
  description: string;
  milestones: Milestone[];
  resources: Resource[];
}