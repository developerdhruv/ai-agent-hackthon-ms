

from uagents import Agent, Context, Model, Protocol
import aiohttp
import json
import asyncio
from typing import Dict, Any, List
import logging
import os
import re
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

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)



# ASI1 Mini configurations
ASI1_MINI_API_KEY = "sk_10be0258afc94d998426fffc24d36ee535297ec558da44d0bb04f6e6094af9d4"
API_URL = "https://api.asi1.ai/v1/chat/completions"

MAX_RETRIES = 3
RETRY_DELAY = 1000
resume_cache = {}

# Initialize MeTTa RAG for resume tailoring
metta = MeTTa()
initialize_resume_knowledge(metta)
resume_rag = ResumeRAG(metta)


def infer_role_location_experience(job_text: str) -> Dict[str, Any]:
    text = (job_text or "").lower()
    # Primary skill detection (simple keyword scan)
    skill_keywords: List[str] = [
        "react", "javascript", "typescript", "node.js", "node", "python", "java", "aws", "sql", "rest api"
    ]
    primary_skill = None
    for kw in skill_keywords:
        if kw in text:
            primary_skill = kw
            break
    # Map skill to role via RAG
    mapped_roles = resume_rag.map_skill_to_role(primary_skill) if primary_skill else []
    role = mapped_roles[0] if mapped_roles else "software engineer"

    # Location via RAG country normalization
    location_hint = resume_rag.normalize_country(text) or ""

    # Years of experience extraction
    years = None
    m = re.search(r"(\d+)\s*\+?\s*(?:years?|yrs)", text)
    if m:
        try:
            years = int(m.group(1))
        except Exception:
            years = None
    # Fallback: junior/mid/senior hints
    if years is None:
        if any(w in text for w in ["junior", "entry", "fresher"]):
            years = 1
        elif any(w in text for w in ["mid", "intermediate"]):
            years = 3
        elif "senior" in text:
            years = 6
    return {"role": role, "location": location_hint, "years": years}

class ResumeParams(Model):
    jobDescription: str

    def to_dict(self):
        return {
            "jobDescription": self.jobDescription
        }

class ResumeRequest(Model):
    params: ResumeParams

class ResumeResponse(Model):
    resume: str

resume_agent = Agent(
    name="resume-agent---",
    port=5052,
    mailbox=True,
    publish_agent_details=True,
    readme_path="README.md",
    seed = "resume-agent-seed-0001"
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


# Handle incoming chat messages
@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info(f"Received message from {sender}")

    # Always send back an acknowledgement when a message is received
    await ctx.send(sender, ChatAcknowledgement(timestamp=datetime.now(timezone.utc), acknowledged_msg_id=msg.msg_id))

    # Process each content item inside the chat message
    job_description_parts = []
    for item in msg.content:
        # Marks the start of a chat session
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"Session started with {sender}")

        # Handles plain text messages (from another agent or ASI:One)
        elif isinstance(item, TextContent):
            ctx.logger.info(f"Text message from {sender}: {item.text}")
            if item.text:
                job_description_parts.append(item.text)

        # Marks the end of a chat session
        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"Session ended with {sender}")
        # Catches anything unexpected
        else:
            ctx.logger.info(f"Received unexpected content type from {sender}")

    # If we have a job description, generate and send the resume
    job_description = "\n".join([p for p in job_description_parts if p]).strip()
    if job_description:
        try:
            params = ResumeParams(jobDescription=job_description)
            resume_text = await generate_resume(params)
            response_message = create_text_chat(resume_text, end_session=True)
            await ctx.send(sender, response_message)
        except Exception as e:
            ctx.logger.error(f"Failed to generate resume: {str(e)}", exc_info=True)
            await ctx.send(sender, create_text_chat(f"Error generating resume: {str(e)}", end_session=True))
    else:
        await ctx.send(sender, create_text_chat("Please provide a job description text to generate a resume.", end_session=True))


# Handle acknowledgements for messages this agent has sent out
@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")


# Include the chat protocol and publish the manifest to Agentverse
resume_agent.include(chat_proto, publish_manifest=True)

@resume_agent.on_event("startup")
async def startup_handler(ctx: Context):
    logger.info(f"Starting uAgent with address: {ctx.agent.address}")

@resume_agent.on_message(model=ResumeRequest, replies=ResumeResponse)
async def handle_resume_request(ctx: Context, sender: str, msg: ResumeRequest):
    await process_resume_request(ctx, sender, msg.params)

@resume_agent.on_rest_post("/resume", ResumeParams, ResumeResponse)
async def handle_rest_resume_request(ctx: Context, req: ResumeParams) -> Dict[str, Any]:
    logger.info(f"Received REST POST request with params: {req}")
    try:
        resume = await generate_resume(req)
        return {"resume": resume}
    except Exception as e:
        logger.error(f"Error generating resume: {str(e)}", exc_info=True)
        return {"error": f"Failed to generate resume: {str(e)}"}

async def generate_resume(params: ResumeParams) -> str:
    logger.info(f"Generating resume for params: {params}")
    try:
        cache_key = json.dumps(params.to_dict())
        if cache_key in resume_cache:
            logger.info("Returning cached resume")
            return resume_cache[cache_key]

        hints = infer_role_location_experience(params.jobDescription)
        role_hint = hints.get("role")
        loc_hint = hints.get("location")
        years_hint = hints.get("years")

        prompt = f"""
        You are a professional resume writer who creates tailored resumes from job descriptions.
        Generate a customized resume optimized for ATS with these sections:
        - Professional Summary
        - Experience
        - Skills
        - Contact Information
        - Certifications

        Tailoring hints:
        - Target role: {role_hint}
        - Years of experience to emphasize: {years_hint if years_hint is not None else "match JD"}
        - Location context: {loc_hint if loc_hint else "general"}

        Formatting requirements:
        - Use clear headings and concise bullet points
        - Quantify impact with metrics where possible
        - Avoid tables; output plain text suitable for PDF export

        Job Description:
        {params.jobDescription}
        """

        async def send_asi1_request(prompt: str, retries: int = MAX_RETRIES) -> str:
            logger.info(f"Sending ASI1 Mini request (retries left: {retries})")
            async with aiohttp.ClientSession() as session:
                request = {
                    "model": "asi1-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a professional resume writer who creates tailored resumes in plain text format suitable for PDF export. Ensure clear headings and bullet points."
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 100000,
                    "stream": False
                }
                try:
                    logger.debug(f"ASI1 request payload: {json.dumps(request)[:1000]}")
                    async with session.post(
                        API_URL,
                        headers={
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": f"Bearer {ASI1_MINI_API_KEY}"
                        },
                        json=request,
                    ) as response:
                        body_text = await response.text()
                        logger.debug(f"ASI1 response status={response.status} body={body_text[:1000]}")
                        if not response.ok:
                            logger.error(f"ASI1 API error: {response.status} - {body_text}")
                            if response.status in (429, 500, 503) and retries > 0:
                                await asyncio.sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1) / 1000)
                                return await send_asi1_request(prompt, retries - 1)
                            raise Exception(f"ASI1 API error: {response.status} - {body_text}")
                        data = json.loads(body_text)
                        if not data.get("choices") or not data["choices"][0].get("message") or not data["choices"][0]["message"].get("content"):
                            raise Exception("Invalid response format from ASI1 API")
                        return data["choices"][0]["message"]["content"]
                except Exception as e:
                    logger.error(f"ASI1 request failed: {str(e)}")
                    if retries > 0:
                        await asyncio.sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1) / 1000)
                        return await send_asi1_request(prompt, retries - 1)
                    raise e

        # Call ASI1 Mini API
        logger.info("Calling ASI1 Mini API")
        resume_text = await send_asi1_request(prompt)

        # Cache the result
        resume_cache[cache_key] = resume_text
        logger.info("Resume generated and cached")
        return resume_text

    except Exception as e:
        logger.error(f"Error generating resume: {str(e)}", exc_info=True)
        raise

async def process_resume_request(ctx: Context, sender: str, params: ResumeParams):
    logger.info(f"Processing resume request from {sender} with params: {params}")
    try:
        resume = await generate_resume(params)
        await ctx.send(sender, ResumeResponse(resume=resume))
        logger.info(f"Sent resume response to {sender}")
    except Exception as e:
        logger.error(f"Error processing resume request: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    try:
        fund_agent_if_low(resume_agent.wallet.address())
    except Exception as e:
        logger.warning(f"Funding skipped or failed: {str(e)}")
    resume_agent.run()




