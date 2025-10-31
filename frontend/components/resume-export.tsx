"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { Download, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type AnalysisResultType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface ResumeExportProps {
  results: AnalysisResultType;
  fileName?: string;
}

export function ResumeExport({ results, fileName }: ResumeExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(22);
      doc.text("Resume Analysis Report", 20, 20);
      
      // Subtitle with date
      doc.setFontSize(12);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
      if (fileName) {
        doc.text(`Resume: ${fileName}`, 20, 38);
      }
      
      // Score
      doc.setFontSize(16);
      doc.text("ATS Score", 20, 50);
      doc.setFontSize(14);
      doc.text(`${results.atsScore}% - ${results.atsScore >= 70 ? "Good" : "Needs Improvement"}`, 20, 58);
      
      // Score breakdown
      doc.setFontSize(16);
      doc.text("Score Breakdown", 20, 70);
      let yPos = 78;
      results.scoreBreakdown.forEach(item => {
        doc.setFontSize(12);
        doc.text(`${item.category}: ${item.score}%`, 25, yPos);
        yPos += 8;
      });
      
      // Top suggestions
      doc.setFontSize(16);
      doc.text("Key Improvement Suggestions", 20, yPos + 10);
      yPos += 18;
      
      const highPrioritySuggestions = results.improvementSuggestions
        .filter(item => item.priority === "high")
        .slice(0, 3);
      
      highPrioritySuggestions.forEach(suggestion => {
        doc.setFontSize(12);
        doc.text(suggestion.title, 25, yPos);
        yPos += 6;
        doc.setFontSize(10);
        
        // Split long descriptions into multiple lines
        const description = suggestion.description;
        const splitText = doc.splitTextToSize(description, 170);
        doc.text(splitText, 25, yPos);
        yPos += 6 * splitText.length + 8;
      });
      
      // Top job matches
      if (results.jobRecommendations.length > 0) {
        doc.setFontSize(16);
        doc.text("Top Job Matches", 20, yPos);
        yPos += 8;
        
        results.jobRecommendations.slice(0, 3).forEach(job => {
          doc.setFontSize(12);
          doc.text(`${job.title} (${job.matchPercentage}% match)`, 25, yPos);
          yPos += 6;
          doc.setFontSize(10);
          doc.text(`${job.company} - ${job.location}`, 25, yPos);
          yPos += 10;
        });
      }
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text('Resume Analyzer - ATS Score Report', 20, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
      }
      
      const outputFileName = fileName 
        ? `${fileName.split('.')[0]}_ATS_Analysis.pdf`
        : 'Resume_ATS_Analysis.pdf';
        
      doc.save(outputFileName);
      
      toast({
        title: "Export Complete",
        description: "Your analysis has been exported to PDF",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resume ATS Analysis',
          text: `ATS Score: ${results.atsScore}%`,
        });
        toast({
          title: "Shared Successfully",
          description: "Your analysis has been shared",
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      toast({
        title: "Sharing Not Available",
        description: "Sharing is not supported on this device or browser",
        variant: "destructive",
      });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          <span>Print</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          <span>Share</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}