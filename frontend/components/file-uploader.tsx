"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

// Ensure pdfjs-dist worker is loaded from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

interface FileUploaderProps {
  onChange: (file: File | null, text: string) => void;
  file: File | null;
}

export function FileUploader({ onChange, file }: FileUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Ensure we're in a browser environment
      if (typeof window === "undefined") {
        throw new Error("PDF processing is not supported on the server");
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.str || "") // Handle potential undefined str
          .join(" ");
        fullText += pageText + "\n";
      }

      return fullText;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error extracting PDF text:", error);
      toast({
        title: "PDF Processing Error",
        description:
          error.message.includes("Worker was destroyed")
            ? "PDF worker issue. Please refresh and try again."
            : "Failed to extract text from PDF. Please try again.",
        variant: "destructive",
      });
      throw new Error("Failed to extract text from PDF");
    }
  };

  const validateResumeContent = (text: string): boolean => {
    const resumeSections = [
      "experience",
      "education",
      "skills",
      "objective",
      "summary",
      "work",
      "employment",
      "qualification",
      "achievement",
      "certification",
      "project",
      "reference",
      "contact",
    ];

    const professionalKeywords = [
      "developed",
      "managed",
      "led",
      "created",
      "implemented",
      "degree",
      "university",
      "college",
      "graduate",
      "bachelor",
      "master",
      "certified",
      "responsible",
      "team",
      "project",
      "experience",
      "skill",
      "professional",
      "work",
    ];

    const textLower = text.toLowerCase();

    if (text.length < 200) {
      toast({
        title: "Invalid Resume",
        description: "Resume content is too short. Please upload a complete resume.",
        variant: "destructive",
      });
      return false;
    }

    const sectionCount = resumeSections.filter((section) =>
      textLower.includes(section)
    ).length;

    const keywordCount = professionalKeywords.filter((keyword) =>
      textLower.includes(keyword)
    ).length;

    if (sectionCount < 2) {
      toast({
        title: "Invalid Resume",
        description:
          "Could not detect standard resume sections (Experience, Education, Skills, etc.)",
        variant: "destructive",
      });
      return false;
    }

    if (keywordCount < 3) {
      toast({
        title: "Invalid Resume",
        description:
          "Resume lacks professional content. Please ensure it includes your experience and qualifications.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploadProgress(0);

      try {
        setUploadProgress(30);
        let text = "";

        if (file.type === "application/pdf") {
          text = await extractTextFromPDF(file);
        } else {
          text = await file.text();
        }

        setUploadProgress(60);

        if (!validateResumeContent(text)) {
          setUploadProgress(0);
          return;
        }

        setUploadProgress(100);
        onChange(file, text);
      } catch (error) {
        console.error("Error processing file:", error);
        setUploadProgress(0);
        toast({
          title: "Error",
          description: "Failed to process the file. Please try again.",
          variant: "destructive",
        });
      }
    },
    [onChange, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeFile = () => {
    onChange(null, "");
    setUploadProgress(0);
  };

  if (file && uploadProgress === 100) {
    return (
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB • {file.type || "Unknown type"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={removeFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer transition-colors duration-200",
          isDragActive ? "bg-primary/5 border-primary/50" : "hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-medium text-lg">Upload your resume</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Drag and drop your resume file here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supported formats: PDF, TXT (max 5MB)
          </p>
        </div>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4 space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            Processing: {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
}