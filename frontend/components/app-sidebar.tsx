"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconCamera,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconUsers,
} from "@tabler/icons-react"
import { Briefcase } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"

const data = {
  // user: {
  //   name: "shadcn",
  //   email: "m@example.com",
  //   avatar: "/avatars/shadcn.jpg",
  // },
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: IconDashboard,
    },
    // {
    //   title: "Dashboard",
    //   url: "/dashboard",
    //   icon: IconChartBar,
    // },
    {
      title: "Find Jobs",
      url: "/jobs",
      icon: Briefcase,
    },

    {
      title: "ATS Resume Scan",
      url: "/atsresume",
      icon: IconUsers,
    },
    {
      title: "AI Interviewer",
      url: "/interviewai",
      icon: IconUsers,
    },
    {
      title: "Skill Developer",
      url: "/resource",
      icon: IconFolder,
    },

    {
      title: "Resume Generator",
      url: "/resumebuilder",
      icon: IconUsers,
    },
    {
      title: "Your History",
      url: "/history",
      icon: IconFileDescription,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  // navSecondary: [
  //   {
  //     title: "Settings",
  //     url: "/settings",
  //     icon: IconSettings,
  //   },
  //   {
  //     title: "Get Help",
  //     url: "/help",
  //     icon: IconHelp,
  //   },
  //   {
  //     title: "Search",
  //     url: "/search",
  //     icon: IconSearch,
  //   },
  // ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "/data-library",
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: "Reports",
  //     url: "/reports",
  //     icon: IconReport,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "/word-assistant",
  //     icon: IconFileWord,
  //   },
  // ],
}

// Custom NavMain component to ensure Link is used for navigation
function NavMain({ items }: { items: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[] }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <Link
              href={item.url}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
             <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Acme Inc. Logo"
                  className="h-25 w-25 object-contain"
                />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}