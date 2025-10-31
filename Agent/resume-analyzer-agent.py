

from uagents import Agent, Context, Model, Protocol
import aiohttp
import json
import asyncio
import urllib.parse
import re
from typing import Dict, Any, List
import logging
import time
import PyPDF2
from io import BytesIO
import base64
from datetime import datetime, timezone
from uuid import uuid4
from uagents.setup import fund_agent_if_low
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    StartSessionContent,
    TextContent,
    chat_protocol_spec,
)
from hyperon import MeTTa
from metta import ResumeRAG, initialize_resume_knowledge

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Configuration
class Config:
   
    ASI1_MINI_API_KEY = "sk_10be0258afc94d998426fffc24d36ee535297ec558da44d0bb04f6e6094af9d4"
    ASI1_MINI_ENDPOINT = "https://api.asi1.ai/v1"
    ASI1_MINI_DEPLOYMENT = "asi1-mini"
    API_URL = f"{ASI1_MINI_ENDPOINT}/chat/completions"
    RAPIDAPI_KEY = "d3440a70b0msh4af35b9f69e8ca8p10f887jsnf7f2de43fb2f"
    RAPIDAPI_HOST = "jsearch.p.rapidapi.com"
    RAPIDAPI_URL = "https://jsearch.p.rapidapi.com/search"
    MAX_RETRIES = 3
    RETRY_DELAY = 1000  # milliseconds
    CACHE_TTL = 3600  # seconds

# Validate configuration
if not all([Config.ASI1_MINI_API_KEY, Config.ASI1_MINI_ENDPOINT, Config.ASI1_MINI_DEPLOYMENT]):
    logger.error("ASI1 Mini configuration is incomplete.")
    raise ValueError("Missing ASI1 Mini configuration")

# In-memory cache with TTL
class Cache:
    def __init__(self):
        self.storage = {}
        self.timestamps = {}

    def get(self, key: str) -> Any:
        if key in self.storage and (time.time() - self.timestamps[key]) < Config.CACHE_TTL:
            return self.storage[key]
        return None

    def set(self, key: str, value: Any):
        self.storage[key] = value
        self.timestamps[key] = time.time()

analysis_cache = Cache()
# Initialize MeTTa RAG for resume intelligence
metta = MeTTa()
initialize_resume_knowledge(metta)
resume_rag = ResumeRAG(metta)


# Models
class ResumeAnalysisParams(Model):
    resumeText: str

    def to_dict(self) -> Dict[str, str]:
        return {"resumeText": self.resumeText}

class ResumeAnalysisRequest(Model):
    params: ResumeAnalysisParams

class ResumeAnalysisResponse(Model):
    analysis: Dict[str, Any]

class PdfUploadRequest(Model):
    pdfBase64: str

# Agent setup
analyzer_agent = Agent(
    name="resume-analyzer-agent",
    port=5053,
    mailbox=True,
    publish_agent_details=True,
    seed = "resume-analyzer-agent-seed-0001"
)

# Initialize the chat protocol with the standard chat spec
chat_proto = Protocol(spec=chat_protocol_spec)


# Utility function to wrap plain text into a ChatMessage
def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    content = [TextContent(type="text", text=text)]
    if end_session:
        content.append(EndSessionContent(type="end-session"))
    return ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=content,
    )


def format_analysis(analysis: Dict[str, Any]) -> str:
    """Format analysis dict into a readable text block for chat."""
    try:
        lines: List[str] = []
        lines.append("ATS Score: {}".format(analysis.get("atsScore", "-")))
        lines.append("Format Score: {}".format(analysis.get("formatScore", "-")))
        lines.append("Keyword Count: {}".format(analysis.get("keywordCount", "-")))
        lines.append("Years of Experience: {}".format(analysis.get("yearsOfExperience", "-")))
        lines.append("Education: {}".format(analysis.get("educationLevel", "-")))
        lines.append("Job Match Score: {}".format(analysis.get("jobMatchScore", "-")))
        skills = analysis.get("skills", []) or []
        if isinstance(skills, list):
            lines.append("Skills: " + ", ".join(skills))
        # Score breakdown
        sb = analysis.get("scoreBreakdown", []) or []
        if sb:
            lines.append("\nScore Breakdown:")
            for item in sb:
                lines.append("- {}: {} - {}".format(
                    item.get("category", "-"), item.get("score", "-"), item.get("description", "")
                ))
        # Improvements
        imp = analysis.get("improvementSuggestions", []) or []
        if imp:
            lines.append("\nImprovement Suggestions:")
            for s in imp:
                ex = s.get("examples", []) or []
                example_line = (" Examples: " + "; ".join(ex)) if ex else ""
                lines.append("- [{}] {} ({}): {}{}".format(
                    s.get("priority", "-"), s.get("title", "-"), s.get("section", "-"), s.get("description", ""), example_line
                ))
        # Jobs
        jobs = analysis.get("jobRecommendations", []) or []
        if jobs:
            lines.append("\nJob Recommendations:")
            for j in jobs:
                parts = [
                    j.get("title", "-"),
                    j.get("company", "-"),
                    j.get("location", "-"),
                ]
                header = " - {} at {} ({})".format(parts[0], parts[1], parts[2])
                lines.append(header)
                mp = j.get("matchPercentage")
                if mp is not None:
                    lines.append("   Match: {}%".format(mp))
                link = j.get("link") or j.get("sourceLink")
                if link:
                    lines.append("   Link: {}".format(link))
        # Web search jobs
        web_jobs = analysis.get("webJobSearch", []) or []
        if web_jobs:
            lines.append("\nWeb Search Jobs:")
            for j in web_jobs:
                title = j.get("title", "-")
                company = j.get("company", "-")
                location = j.get("location", "-")
                link = j.get("link") or j.get("url")
                lines.append(f" - {title} at {company} ({location})")
                if link:
                    lines.append(f"   Link: {link}")
        return "\n".join(lines).strip()
    except Exception:
        # Fallback to JSON pretty
        return json.dumps(analysis, indent=2)


async def fetch_pdf_text_from_gdrive(url: str) -> str:
    """Download a Google Drive file (public) and extract text if PDF."""
    try:
        # Extract file id from /file/d/<id>/ pattern
        m = re.search(r"drive\.google\.com/file/d/([a-zA-Z0-9_-]+)", url)
        if not m:
            raise ValueError("Invalid Google Drive file URL")
        file_id = m.group(1)
        download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        async with aiohttp.ClientSession() as session:
            async with session.get(download_url) as resp:
                if not resp.ok:
                    text = await resp.text()
                    raise Exception(f"Drive download failed: {resp.status} - {text}")
                content = await resp.read()
        pdf_file = BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        resume_text = ""
        for page in pdf_reader.pages:
            extracted_text = page.extract_text() or ""
            resume_text += extracted_text
        return resume_text
    except Exception as e:
        raise Exception(f"Failed to read Google Drive PDF: {str(e)}")


async def search_jobs_via_asi_web(query: str, retries: int = Config.MAX_RETRIES) -> List[Dict[str, Any]]:
    """Use ASI1 with web_search to find current jobs and return a structured list."""
    system_prompt = (
        "Be precise and concise. Return ONLY a JSON array named jobs with items of the form "
        "{title, company, location, link, description?, salary?}."
    )
    user_prompt = (
        f"Find 3-5 current software job openings for: {query}. "
        "Prefer reputable sources. Return just the JSON array without extra text."
    )
    request = {
        "model": Config.ASI1_MINI_DEPLOYMENT,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "top_p": 0.9,
        "max_tokens": 1000,
        "presence_penalty": 0,
        "frequency_penalty": 0,
        "stream": False,
        "extra_body": {"web_search": True},
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                Config.API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": f"Bearer {Config.ASI1_MINI_API_KEY}",
                },
                json=request,
            ) as response:
                text = await response.text()
                if not response.ok:
                    if response.status in (429, 500, 503) and retries > 0:
                        await asyncio.sleep(Config.RETRY_DELAY * (Config.MAX_RETRIES - retries + 1) / 1000)
                        return await search_jobs_via_asi_web(query, retries - 1)
                    raise Exception(f"ASI web search error: {response.status} - {text}")
                data = json.loads(text)
                content = (
                    data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
                )
                # Try parse JSON array directly
                try:
                    parsed = json.loads(content)
                    if isinstance(parsed, list):
                        return parsed
                    if isinstance(parsed, dict) and "jobs" in parsed and isinstance(parsed["jobs"], list):
                        return parsed["jobs"]
                except Exception:
                    pass
                # Try extract from code block
                m = re.search(r"```json\n([\s\S]*?)\n```", content)
                if m:
                    try:
                        arr = json.loads(m.group(1))
                        if isinstance(arr, list):
                            return arr
                        if isinstance(arr, dict) and "jobs" in arr and isinstance(arr["jobs"], list):
                            return arr["jobs"]
                    except Exception:
                        pass
                # Fallback empty
                return []
    except Exception as e:
        logger.warning(f"Web job search failed: {str(e)}")
        return []


# Handle incoming chat messages
@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info(f"Received message from {sender}")

    # Always send back an acknowledgement when a message is received
    await ctx.send(sender, ChatAcknowledgement(timestamp=datetime.now(timezone.utc), acknowledged_msg_id=msg.msg_id))

    # Aggregate any text parts into a single text block
    text_parts: List[str] = []
    for item in msg.content:
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"Session started with {sender}")
        elif isinstance(item, TextContent):
            ctx.logger.info(f"Text message from {sender}: {item.text}")
            if item.text:
                text_parts.append(item.text)
        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"Session ended with {sender}")
        else:
            ctx.logger.info(f"Received unexpected content type from {sender}")

    full_text = "\n".join([p for p in text_parts if p]).strip()
    if not full_text:
        await ctx.send(sender, create_text_chat("Please provide resume text or a Google Drive PDF link to analyze.", end_session=True))
        return

    # Case 1: If user pasted a JSON analysis, just format and return
    try:
        if full_text.startswith("{") and full_text.endswith("}"):
            parsed = json.loads(full_text)
            formatted = format_analysis(parsed)
            await ctx.send(sender, create_text_chat(formatted, end_session=True))
            return
    except Exception:
        pass

    # Case 2: If Google Drive link present, fetch PDF and extract text
    if "drive.google.com/file/d/" in full_text:
        try:
            resume_text = await fetch_pdf_text_from_gdrive(full_text)
        except Exception as e:
            await ctx.send(sender, create_text_chat(f"Error reading PDF: {str(e)}", end_session=True))
            return
    else:
        resume_text = full_text

    # Analyze the resume text and return formatted output
    try:
        params = ResumeAnalysisParams(resumeText=resume_text)
        analysis = await analyze_resume(params)
        # Optional: augment with live web search jobs if the resume implies a role
        try:
            primary_skill = (analysis.get("skills") or ["software engineer"])[0]
            # Map skill to likely role using RAG
            mapped_roles = resume_rag.map_skill_to_role(primary_skill)
            role_query = mapped_roles[0] if mapped_roles else primary_skill
            # Try to detect country or location words from resume text
            location_hint = resume_rag.normalize_country(resume_text) or "india"
            # Compose query with role and location
            web_query = f"{role_query} in {location_hint}"
            web_jobs = await search_jobs_via_asi_web(web_query)
            if web_jobs:
                # Filter jobs to match India if location_hint is India (user requested localized results)
                if location_hint == "india":
                    web_jobs = [j for j in web_jobs if (j.get("location") or "").lower().find("india") != -1]
                # Light filter by years of experience bucket if possible
                try:
                    yoe = int(analysis.get("yearsOfExperience") or 0)
                except Exception:
                    yoe = 0
                bucket = resume_rag.experience_bucket(yoe)
                # Heuristic: filter out roles that mention senior/lead if bucket <= 3
                if bucket in ("0-1", "2", "3"):
                    web_jobs = [j for j in web_jobs if not re.search(r"senior|lead|principal", (j.get("title") or ""), re.I)]
                analysis["webJobSearch"] = web_jobs
        except Exception as _:
            pass
        formatted = format_analysis(analysis)
        await ctx.send(sender, create_text_chat(formatted, end_session=True))
    except Exception as e:
        ctx.logger.error(f"Failed to analyze resume: {str(e)}", exc_info=True)
        await ctx.send(sender, create_text_chat(f"Error analyzing resume: {str(e)}", end_session=True))


# Handle acknowledgements for messages this agent has sent out
@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")


# Include the chat protocol and publish the manifest to Agentverse
analyzer_agent.include(chat_proto, publish_manifest=True)

@analyzer_agent.on_event("startup")
async def startup_handler(ctx: Context):
    logger.info(f"Starting uAgent with address: {ctx.agent.address}")

@analyzer_agent.on_message(model=ResumeAnalysisRequest, replies=ResumeAnalysisResponse)
async def handle_analysis_request(ctx: Context, sender: str, msg: ResumeAnalysisRequest):
    await process_analysis_request(ctx, sender, msg.params)

@analyzer_agent.on_rest_post("/analyze-resume", ResumeAnalysisParams, ResumeAnalysisResponse)
async def handle_rest_analysis_request(ctx: Context, req: ResumeAnalysisParams) -> Dict[str, Any]:
    logger.info(f"Received REST POST request with resume text length: {len(req.resumeText)}")
    try:
        analysis = await analyze_resume(req)
        return {"analysis": analysis}
    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}", exc_info=True)
        return {"error": f"Failed to analyze resume: {str(e)}"}

@analyzer_agent.on_rest_post("/analyze-resume-pdf", PdfUploadRequest, ResumeAnalysisResponse)
async def handle_pdf_analysis_request(ctx: Context, req: PdfUploadRequest) -> Dict[str, Any]:
    logger.info("Received REST POST request for PDF resume analysis")
    try:
        # Decode base64 PDF content
        pdf_content = base64.b64decode(req.pdfBase64)
        pdf_file = BytesIO(pdf_content)
        
        # Extract text from PDF
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        resume_text = ""
        for page in pdf_reader.pages:
            extracted_text = page.extract_text() or ""
            resume_text += extracted_text
        
        if not resume_text.strip():
            raise ValueError("No text could be extracted from the PDF")
        
        logger.info(f"Extracted resume text length: {len(resume_text)}")
        params = ResumeAnalysisParams(resumeText=resume_text)
        analysis = await analyze_resume(params)
        return {"analysis": analysis}
    except base64.binascii.Error:
        logger.error("Invalid base64 encoding in PDF upload request")
        return {"error": "Invalid base64 encoded PDF data"}
    except Exception as e:
        logger.error(f"Error processing PDF resume: {str(e)}", exc_info=True)
        return {"error": f"Failed to process PDF resume: {str(e)}"}

async def analyze_resume(params: ResumeAnalysisParams) -> Dict[str, Any]:
    """
    Analyzes a resume and returns structured analysis including ATS score and job recommendations.
    """
    logger.info(f"Analyzing resume with text length: {len(params.resumeText)}")
    
    # Check cache
    cache_key = json.dumps(params.to_dict())
    cached_result = analysis_cache.get(cache_key)
    if cached_result:
        logger.info("Returning cached analysis")
        return cached_result

    try:
        # Prepare prompt
        prompt = f"""
        You are an expert ATS and resume analyzer. Analyze the provided resume and return a JSON object 
        conforming to the following TypeScript interface:

        interface AnalysisResultType {{
          atsScore: number;
          formatScore: number;
          keywordCount: number;
          yearsOfExperience: number;
          educationLevel: string;
          jobMatchScore: number;
          skills: string[];
          scoreBreakdown: {{ category: string; score: number; description: string }}[];
          improvementSuggestions: {{ 
            title: string; 
            description: string; 
            section: string; 
            priority: "high" | "medium" | "low"; 
            examples?: string[] 
          }}[];
          jobRecommendations: {{ 
            id: number; 
            title: string; 
            company: string; 
            location: string; 
            description: string; 
            matchPercentage: number; 
            skills: string[]; 
            link?: string; 
            salary?: {{ min: number; median: number; max: number }};
            sourceLink?: string 
          }}[];
        }}

        Resume:
        {params.resumeText}

        Instructions:
        - Return response as JSON wrapped in markdown code block (```json\n{{...}}\n```)
        - Calculate ATS score (0-100) based on keyword usage, formatting, and clarity
        - Calculate format score (0-100) based on structure and readability
        - Count relevant keywords for software engineering roles
        - Estimate years of experience from work history
        - Identify highest education level
        - Calculate job match score (0-100) for software engineering roles
        - List all detected skills
        - Provide score breakdown for Content, Structure, and Keywords
        - Suggest at least 3 improvements with priorities and examples
        - Include placeholder job recommendations
        - Use reasonable defaults for undetermined fields
        """

        # Call ASI1 Mini API
        try:
            response_text = await send_asi1_request(prompt)
        except Exception as asi1_error:
            logger.warning(f"ASI1 Mini API call failed: {str(asi1_error)}. Returning mock response.")
            # Mock response to allow testing without ASI1 Mini API
            response_text = """```json
            {
                "atsScore": 50,
                "formatScore": 50,
                "keywordCount": 10,
                "yearsOfExperience": 2,
                "educationLevel": "Unknown",
                "jobMatchScore": 50,
                "skills": ["Unknown"],
                "scoreBreakdown": [
                    {"category": "Content", "score": 50, "description": "Mock content score"},
                    {"category": "Structure", "score": 50, "description": "Mock structure score"},
                    {"category": "Keywords", "score": 50, "description": "Mock keywords score"}
                ],
                "improvementSuggestions": [
                    {"title": "Mock Suggestion", "description": "Mock suggestion", "section": "General", "priority": "medium"}
                ],
                "jobRecommendations": []
            }
            ```"""
        
        # Parse JSON
        json_match = re.search(r'```json\n([\s\S]*?)\n```', response_text)
        if not json_match:
            raise ValueError("Failed to extract JSON from response")
        analysis_result = json.loads(json_match.group(1))

        # Fetch job recommendations
        job_title = analysis_result.get("skills", ["software developer"])[0]
        try:
            job_data = await get_job_recommendations(job_title)
            analysis_result["jobRecommendations"] = [
                {
                    "id": index + 1,
                    "title": job.get("job_title", "Software Developer"),
                    "company": job.get("employer_name", "Tech Company"),
                    "location": f"{job.get('job_city', 'Remote')}{', ' + job.get('job_state', '') if job.get('job_state') else ''}",
                    "description": job.get("job_description", "Software development position")[:200] + "...",
                    "matchPercentage": min(70 + (index * 5), 95),
                    "skills": analysis_result.get("skills", [])[:5],
                    "link": job.get("job_apply_link", ""),
                    "salary": {
                        "min": job.get("job_min_salary", 60000) or 60000,
                        "median": job.get("job_median_salary", 80000) or 80000,
                        "max": job.get("job_max_salary", 100000) or 100000
                    } if job.get("job_min_salary") or job.get("job_max_salary") else None,
                    "sourceLink": job.get("job_posting_url", "")
                } for index, job in enumerate(job_data.get("data", [])[:3])
            ]
        except Exception as job_error:
            logger.warning(f"Job recommendation fetch failed: {str(job_error)}")
            analysis_result["jobRecommendations"] = []

        # Cache result
        analysis_cache.set(cache_key, analysis_result)
        logger.info("Analysis generated and cached")
        return analysis_result

    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}", exc_info=True)
        raise

async def send_asi1_request(prompt: str, retries: int = Config.MAX_RETRIES) -> str:
    """
    Sends request to ASI1 Mini API with retry logic.
    """
    logger.info(f"Sending ASI1 Mini request (retries left: {retries})")
    async with aiohttp.ClientSession() as session:
        request = {
            "model": Config.ASI1_MINI_DEPLOYMENT,
            "messages": [
                {"role": "system", "content": "You are an expert ATS and resume analyzer."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.5,
            "max_tokens": 100000,
            "stream": False
        }
        
        try:
            async with session.post(
                Config.API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": f"Bearer {Config.ASI1_MINI_API_KEY}"
                },
                json=request
            ) as response:
                if not response.ok:
                    error_text = await response.text()
                    logger.error(f"ASI1 Mini API error: {response.status} - {error_text}")
                    if response.status in (429, 500, 503) and retries > 0:
                        await asyncio.sleep(Config.RETRY_DELAY * (Config.MAX_RETRIES - retries + 1) / 1000)
                        return await send_asi1_request(prompt, retries - 1)
                    raise Exception(f"ASI1 Mini API error: {response.status} - {error_text}")
                
                data = await response.json()
                if not data.get("choices") or not data["choices"][0].get("message"):
                    raise Exception("Invalid response format from ASI1 Mini API")
                return data["choices"][0]["message"]["content"]
                
        except Exception as e:
            if retries > 0:
                await asyncio.sleep(Config.RETRY_DELAY * (Config.MAX_RETRIES - retries + 1) / 1000)
                return await send_asi1_request(prompt, retries - 1)
            raise

async def get_job_recommendations(job_title: str, location: str = "united states") -> Dict[str, Any]:
    """
    Fetches job recommendations from RapidAPI.
    """
    logger.info(f"Fetching job recommendations for job title: {job_title}")
    try:
        async with aiohttp.ClientSession() as session:
            url = f"{Config.RAPIDAPI_URL}?query={urllib.parse.quote(job_title)}%20in%20{urllib.parse.quote(location)}&page=1&num_pages=1"
            async with session.get(
                url,
                headers={
                    "x-rapidapi-key": Config.RAPIDAPI_KEY,
                    "x-rapidapi-host": Config.RAPIDAPI_HOST
                }
            ) as response:
                if not response.ok:
                    error_text = await response.text()
                    logger.error(f"RapidAPI error: {response.status} - {error_text}")
                    raise Exception(f"RapidAPI error: {response.status} - {error_text}")
                return await response.json() or {"data": []}
    except Exception as e:
        logger.error(f"Error fetching job recommendations: {str(e)}")
        raise

async def process_analysis_request(ctx: Context, sender: str, params: ResumeAnalysisParams):
    """
    Processes analysis request and sends response.
    """
    logger.info(f"Processing analysis request from {sender} with text length: {len(params.resumeText)}")
    try:
        analysis = await analyze_resume(params)
        await ctx.send(sender, ResumeAnalysisResponse(analysis=analysis))
        logger.info(f"Sent analysis response to {sender}")
    except Exception as e:
        logger.error(f"Error processing analysis request: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    try:
        try:
            fund_agent_if_low(analyzer_agent.wallet.address())
        except Exception as e:
            logger.warning(f"Funding skipped or failed: {str(e)}")
        logger.info("Starting resume analyzer agent")
        analyzer_agent.run()
    except KeyboardInterrupt:
        logger.info("Agent shutdown requested")
    except Exception as e:
        logger.error(f"Agent failed to start: {str(e)}", exc_info=True)