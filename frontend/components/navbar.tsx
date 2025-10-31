import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <FileText className="h-6 w-6" />
          <span className="font-bold hidden sm:inline-block">Resume Analyzer</span>
        </Link>
        <nav className="flex-1 flex items-center">
          <ul className="flex gap-4 md:gap-6">
            <li>
              <Link 
                href="/" 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/history" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                History
              </Link>
            </li>
            <li>
              <Link 
                href="/jobs" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Jobs
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}