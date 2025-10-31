import type { NextApiRequest, NextApiResponse } from 'next';
import { formidable } from 'formidable';
import pdfParse from 'pdf-parse';
import { readFile } from 'fs/promises';
import mammoth from 'mammoth';
import { sendOpenAIRequest } from '@/lib/openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 }); // 5MB limit

    const { files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const file = files.resume;
    if (!file || !file[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = file[0];
    let text = '';
    const buffer = await readFile(uploadedFile.filepath);

    if (uploadedFile.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (
      uploadedFile.mimetype === 'application/msword' ||
      uploadedFile.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert resume analyzer. Extract key information and return it in a structured JSON format.',
      },
      {
        role: 'user',
        content: `
          Analyze this resume text and extract:
          1. Name
          2. Email
          3. Current job title
          4. Years of experience
          5. Skills (comma-separated string)
          6. Target role (if mentioned, otherwise infer based on experience)
          7. Industry (if mentioned, otherwise infer based on experience)
          8. Education
          9. Certifications
          
          Resume text: ${text}
          
          Return the analysis as a JSON object with the structure:
          {
            "name": string,
            "email": string,
            "jobTitle": string,
            "yearsOfExperience": number,
            "skills": string,
            "targetRole": string,
            "industry": string,
            "education": string[],
            "certifications": string[]
          }
          Ensure the response contains only the JSON object, without markdown or code block formatting.
        `,
      },
    ];

    const response = await sendOpenAIRequest(messages);
    let content = response.choices[0].message.content;

    // Clean the response by removing markdown code blocks
    content = content
      .replace(/```json/g, '') // Remove ```json
      .replace(/```/g, '') // Remove ```
      .trim(); // Remove leading/trailing whitespace

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return res.status(500).json({ error: 'Failed to parse resume analysis' });
    }

    res.status(200).json({
      text,
      analysis,
    });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
}