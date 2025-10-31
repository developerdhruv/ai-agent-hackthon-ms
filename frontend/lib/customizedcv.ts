// lib/customizedcv.ts
import { AzureOpenAI } from "openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT!;
const apiVersion = "2024-04-01-preview";
const model = "gpt-35-turbo";

const client = new AzureOpenAI({
  endpoint,
  apiKey,
  deployment,
  apiVersion,
});

export async function generateResumeContent(jobDescription: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer who creates tailored resumes from job descriptions.",
        },
        {
          role: "user",
          content: jobDescription,
        },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "No resume content returned.";
  } catch (error) {
    console.error("Error generating resume:", error);
    throw new Error("Failed to generate resume content.");
  }
}
