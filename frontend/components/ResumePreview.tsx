'use client';

import { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';

interface ResumePreviewProps {
  resumeText: string;
}

export function ResumePreview({ resumeText }: ResumePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  // Preprocess resume text to clean OCR artifacts
  const cleanText = resumeText
    .replace(/\$(\d+)\+\$/g, '$1+') // Fix $100+$ → 100+
    .replace(/retcn\.al/g, 'Fetch.ai') // Fix OCR artifact
    .replace(/NuExt\.js/g, 'Next.js') // Fix NuExt.js → Next.js
    .replace(/\$\cdot\$/g, '•') // Fix $cdot$ → •
    .replace(/\$1\$/g, '') // Remove stray $1$
    .replace(/Collabo- rated/g, 'Collaborated') // Fix OCR split
    .replace(/\s+/g, ' '); // Normalize multiple spaces

  // Parse resume text into lines
  const lines = cleanText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const sections: { [key: string]: string[] } = {};
  let currentSection = '';

  // Enhanced section detection
  lines.forEach((line, index) => {
    // Broader regex for section headers
    const sectionMatch = line.match(
      /^(Summary|Professional Summary|Education|Work Experience|Experience|Work History|Skills|Technical Skills|Projects|Certifications|References|Contact Information|Personal Information|Profile|Accomplishments|Achievements|Community|Community Leader|Community Leaders|Fetch\.ai Community Leader.*|MeerutCodeHub Community)/i
    );

    // Additional heuristic: detect sections by known patterns (e.g., company names, dates)
    const isPotentialSection =
      sectionMatch ||
      line.match(/^[A-Z][a-zA-Z\s]+\s+\d{4}\s*-\s*(Present|\d{4})/) || // e.g., Fetch.AI Nov 2023 - Present
      (index > 0 && lines[index - 1].match(/^[A-Z][a-zA-Z\s]+, India$/) && line.match(/^\w+\s+\d{4}\s*-\s*(Present|\d{4})/)); // After location

    if (isPotentialSection) {
      currentSection = sectionMatch
        ? sectionMatch[1]
        : line.split(' ').slice(0, 3).join(' '); // Use first few words as section name
      currentSection = currentSection
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .replace('Fetch.ai', 'Fetch.AI'); // Preserve brand casing
      sections[currentSection] = [];
    } else if (line.length > 2) {
      // Convert to Markdown list syntax
      const formattedLine = line.startsWith('•') ? `- ${line.slice(1).trim()}` : `- ${line}`;
      if (currentSection) {
        sections[currentSection].push(formattedLine);
      } else {
        sections['Resume Content'] = sections['Resume Content'] || [];
        sections['Resume Content'].push(formattedLine);
      }
    }
  });

  // Remove empty sections
  Object.keys(sections).forEach(section => {
    if (sections[section].length === 0) {
      delete sections[section];
    }
  });

  // Contact Info Extraction
  const contactInfo: string[] = [];
  const contentLines = [...lines];
  const contactPatterns = [
    /^[\w\s]+\(?\w*\)?, India$/, // Name and location, e.g., , India
    /^\+?\d{10,12}$/, // Phone number
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email
    /^linkedin\.com\/in\/[\w-]+$/i, // LinkedIn
    /^https:\/\/github\.com\/[\w-]+$/i, // GitHub
    /^https:\/\/[\w-]+\.vercel\.app\/$/i // Portfolio
  ];

  for (let i = 0; i < contentLines.length; i++) {
    if (contactPatterns.some(pattern => pattern.test(contentLines[i]))) {
      contactInfo.push(`- ${contentLines[i]}`);
      contentLines[i] = '';
    } else {
      break;
    }
  }

  if (contactInfo.length > 0) {
    sections['Contact Information'] = contactInfo;
    if (sections['Resume Content']) {
      sections['Resume Content'] = sections['Resume Content'].filter(
        line => !contactInfo.includes(line.replace('- ', '• '))
      );
      if (sections['Resume Content'].length === 0) {
        delete sections['Resume Content'];
      }
    }
  }

  // Fallback for content without sections
  if (Object.keys(sections).length === 0 && lines.length > 0) {
    sections['Resume Content'] = lines.map(line =>
      line.startsWith('•') ? `- ${line.slice(1).trim()}` : `- ${line}`
    );
  }

  // Debug content
  console.log('Cleaned Text:', cleanText);
  console.log('Sections:', sections);

  // Download as PDF
  const handleDownloadPDF = async () => {
    if (typeof window !== 'undefined' && previewRef.current) {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: 'resume-preview.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: ['h2', 'ul'] }
      };
      html2pdf().set(opt).from(previewRef.current).save();
    }
  };

  return (
    <Card className="border border-gray-200 shadow-md max-w-[816px] mx-auto">
      <CardContent className="p-8 bg-white min-h-[1056px]" ref={previewRef}>
        <div className="space-y-8">
          {Object.entries(sections).map(([section, content]) => (
            <div key={section} className="break-inside-avoid">
              <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-1 mb-3 uppercase tracking-wide">
                {section}
              </h2>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({ ...props }) => (
                    <ul className="list-disc pl-5 space-y-1.5" {...props} />
                  ),
                  li: ({ ...props }) => (
                    <li className="text-sm text-gray-800 leading-relaxed" {...props} />
                  )
                }}
              >
                {content.join('\n')}
              </ReactMarkdown>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="p-4 flex justify-end">
        <Button onClick={handleDownloadPDF}>Download as PDF</Button>
      </div>
    </Card>
  );
}