// import { OpenAIMessage, OpenAIRequest, OpenAIResponse, UserProfile, InterviewType } from './types';



// // Retry configuration
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 1000; // 1 second

// /**
//  * Delay utility for retries
//  */
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// /**
//  * Send a request to the Azure Open AI API with retry logic
//  */
// export async function sendOpenAIRequest(messages: OpenAIMessage[], retries: number = MAX_RETRIES): Promise<OpenAIResponse> {
//   const request: OpenAIRequest = {
//     model: AZURE_OPENAI_DEPLOYMENT, // Use the Azure deployment name (e.g., gpt-35-turbo)
//     messages,
//     temperature: 0.7,
//   };

//   try {
//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'api-key': AZURE_OPENAI_API_KEY, // Azure uses 'api-key' header
//       },
//       body: JSON.stringify(request),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`Azure Open AI API request failed: ${response.status} ${errorText}`);
//       if (response.status === 429 && retries > 0) {
//         // Handle rate limiting
//         await delay(RETRY_DELAY);
//         return sendOpenAIRequest(messages, retries - 1);
//       }
//       throw new Error(`Azure Open AI API error: ${response.status} ${errorText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     if (retries > 0) {
//       await delay(RETRY_DELAY);
//       return sendOpenAIRequest(messages, retries - 1);
//     }
//     console.error('Error calling Azure Open AI API:', error);
//     throw error;
//   }
// }

// /**
//  * Generate interview questions based on user profile, including DSA for technical roles
//  */
// export async function generateInterviewQuestions(
//   profile: UserProfile, 
//   count: number = 5
// ): Promise<string[]> {
//   const prompt = `
//     You are an expert interviewer for ${profile.targetRole} positions in the ${profile.industry} industry.
//     Generate ${count} challenging and relevant interview questions for a candidate with the following profile:
    
//     - Current job title: ${profile.jobTitle}
//     - Years of experience: ${profile.yearsOfExperience}
//     - Skills: ${profile.skills.join(', ')}
//     - Target role: ${profile.targetRole}
//     - Interview type: ${profile.interviewType}
    
//     Guidelines for questions:
//     1. For technical roles (interviewType: ${InterviewType.TECHNICAL}):
//        - Include at least one Data Structures and Algorithms (DSA) question focusing on topics like linked lists, trees, graphs, sorting, or searching
//        - Include system design questions relevant to the candidate's skills
//        - Ask about specific technologies in their skill set
//        - Include problem-solving scenarios
       
//     2. For behavioral questions (interviewType: ${InterviewType.BEHAVIORAL}):
//        - Focus on leadership and team collaboration
//        - Include conflict resolution scenarios
//        - Ask about project management experience
       
//     3. For case studies (interviewType: ${InterviewType.CASE_STUDY}):
//        - Create industry-specific scenarios
//        - Include data analysis components
//        - Focus on strategic thinking
       
//     4. For general interviews (interviewType: ${InterviewType.GENERAL}):
//        - Mix behavioral, situational, and experience-based questions
//        - Avoid overly technical questions unless specified in skills
       
//     5. Question structure:
//        - Be specific and detailed
//        - Avoid yes/no questions
//        - Include follow-up components
//        - Make questions challenging but appropriate for their experience level
    
//     For each question, provide only the question text without numbering or additional commentary.
//     Each question should be on a new line and end with a question mark.
//   `;

//   const messages: OpenAIMessage[] = [
//     { 
//       role: 'system', 
//       content: 'You are an expert technical interviewer with deep knowledge of industry best practices, system design, modern technology stacks, and Data Structures and Algorithms (DSA). Generate challenging but fair interview questions that assess both technical depth and practical experience.' 
//     },
//     { role: 'user', content: prompt }
//   ];

//   try {
//     const response = await sendOpenAIRequest(messages);
//     const content = response.choices[0].message.content;
    
//     // Extract questions
//     const questions = content.split('\n')
//       .map(line => line.trim())
//       .filter(line => line.length > 0 && line.endsWith('?'));
    
//     if (questions.length < count) {
//       console.warn(`Generated only ${questions.length} questions instead of ${count}`);
//     }
    
//     return questions;
//   } catch (error) {
//     console.error('Error generating interview questions:', error);
//     throw error;
//   }
// }

// /**
//  * Analyze a candidate's response to an interview question
//  */
// export async function analyzeResponse(
//   question: string,
//   response: string,
//   profile: UserProfile
// ): Promise<{
//   clarity: number;
//   confidence: number;
//   relevance: number;
//   completeness: number;
//   technicalAccuracy?: number;
//   strengths: string[];
//   weaknesses: string[];
//   suggestions: string;
// }> {
//   const prompt = `
//     Analyze the following candidate response for a ${profile.targetRole} position.
    
//     Question: "${question}"
//     Response: "${response}"
    
//     Candidate Profile:
//     - Target role: ${profile.targetRole}
//     - Industry: ${profile.industry}
//     - Experience: ${profile.yearsOfExperience} years
//     - Skills: ${profile.skills.join(', ')}
//     - Interview type: ${profile.interviewType}
    
//     Evaluation Criteria:
//     1. Clarity (0-100):
//        - Clear communication and structure
//        - Logical flow of ideas
//        - Use of relevant examples
       
//     2. Confidence (0-100):
//        - Assertiveness in delivery
//        - Command of subject matter
//        - Professional tone
       
//     3. Relevance (0-100):
//        - Direct answer to the question
//        - Industry-appropriate context
//        - Alignment with role requirements
       
//     4. Completeness (0-100):
//        - Comprehensive coverage
//        - Sufficient detail
//        - Well-rounded perspective
       
//     ${profile.interviewType === InterviewType.TECHNICAL ? `
//     5. Technical Accuracy (0-100):
//        - Correct technical concepts
//        - Appropriate use of terminology
//        - Understanding of best practices
//        - For DSA questions, evaluate algorithmic correctness, time/space complexity, and code efficiency
//     ` : ''}
    
//     Provide:
//     - Specific strengths (2-3 points)
//     - Areas for improvement (2-3 points)
//     - Actionable suggestions
    
//     Return your analysis as a JSON object with the following structure:
//     {
//       "clarity": number,
//       "confidence": number,
//       "relevance": number,
//       "completeness": number,
//       ${profile.interviewType === InterviewType.TECHNICAL ? '"technicalAccuracy": number,' : ''}
//       "strengths": string[],
//       "weaknesses": string[],
//       "suggestions": string
//     }
//   `;

//   const messages: OpenAIMessage[] = [
//     { 
//       role: 'system', 
//       content: 'You are an expert interview coach that analyzes candidate responses and provides constructive feedback. Return your response as a JSON object.' 
//     },
//     { role: 'user', content: prompt }
//   ];

//   try {
//     const response = await sendOpenAIRequest(messages);
//     const content = response.choices[0].message.content;
//     return JSON.parse(content);
//   } catch (error) {
//     console.error('Error analyzing response:', error);
//     throw error;
//   }
// }

// /**
//  * Generate a comprehensive interview feedback summary
//  */
// export async function generateInterviewFeedback(
//   profile: UserProfile,
//   questions: string[],
//   responses: string[],
//   analyses: any[]
// ): Promise<{
//   overallScore: number;
//   strengths: string[];
//   areasForImprovement: string[];
//   recommendations: string[];
//   summary: string;
// }> {
//   let interviewSummary = `Interview Summary:\n`;
  
//   for (let i = 0; i < questions.length; i++) {
//     interviewSummary += `\nQ${i+1}: ${questions[i]}\n`;
//     interviewSummary += `A${i+1}: ${responses[i]}\n`;
    
//     if (analyses[i]) {
//       interviewSummary += `Analysis: Clarity: ${analyses[i].clarity}, Confidence: ${analyses[i].confidence}, ` +
//         `Relevance: ${analyses[i].relevance}, Completeness: ${analyses[i].completeness}${analyses[i].technicalAccuracy ? `, Technical Accuracy: ${analyses[i].technicalAccuracy}` : ''}\n`;
//     }
//   }

//   const prompt = `
//     Generate comprehensive feedback for a ${profile.targetRole} interview candidate.
    
//     Candidate Profile:
//     - Target role: ${profile.targetRole}
//     - Industry: ${profile.industry}
//     - Experience: ${profile.yearsOfExperience} years
//     - Skills: ${profile.skills.join(', ')}
//     - Interview type: ${profile.interviewType}
    
//     ${interviewSummary}
    
//     Evaluation Guidelines:
//     1. Overall Score (0-100):
//        - Consider response quality across all questions
//        - Weight technical accuracy heavily for technical roles, especially for DSA questions
//        - Account for experience level expectations
       
//     2. Key Strengths:
//        - Identify consistent positive patterns
//        - Highlight standout responses
//        - Note professional competencies
       
//     3. Areas for Improvement:
//        - Identify skill gaps
//        - Note communication issues
//        - Suggest specific growth areas
       
//     4. Recommendations:
//        - Provide actionable next steps
//        - Suggest learning resources (e.g., for DSA: LeetCode, Cracking the Coding Interview)
//        - Include practice strategies
       
//     5. Summary:
//        - Overall performance assessment
//        - Readiness for target role
//        - Growth trajectory
    
//     Return your feedback as a JSON object with the following structure:
//     {
//       "overallScore": number,
//       "strengths": string[],
//       "areasForImprovement": string[],
//       "recommendations": string[],
//       "summary": string
//     }
//   `;

//   const messages: OpenAIMessage[] = [
//     { 
//       role: 'system', 
//       content: 'You are an expert interview coach that provides comprehensive feedback to help candidates improve. Return your response as a JSON object.' 
//     },
//     { role: 'user', content: prompt }
//   ];

//   try {
//     const response = await sendOpenAIRequest(messages);
//     const content = response.choices[0].message.content;
//     return JSON.parse(content);
//   } catch (error) {
//     console.error('Error generating interview feedback:', error);
//     throw error;
//   }
// }