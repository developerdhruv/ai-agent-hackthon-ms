import { AppSidebar } from "@/components/app-sidebar"
import RoadmapGenerator from "@/components/roadmap-generator"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function Home() {
  return (
    <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }
    
  >     

<AppSidebar variant="inset" />
   <SidebarInset>
        <SiteHeader />
    <main className="min-h-screen p-4 md:p-8 lg:p-24 bg-white text-black dark:bg-black dark:text-white">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Education & Development Roadmap Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Generate personalized learning paths and resource recommendations for your educational and software
            development journey.
          </p>
        </div>

        <RoadmapGenerator />
      </div>
    </main>
    </SidebarInset>
    </SidebarProvider>
  )
}
