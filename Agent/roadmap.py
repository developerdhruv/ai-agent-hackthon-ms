

from uagents import Agent, Context, Model, Protocol
import aiohttp
import json
import asyncio
from typing import Literal, List, Union, Dict, Any
import logging
from datetime import datetime, timezone
from uuid import uuid4
from uagents.setup import fund_agent_if_low
from hyperon import MeTTa
from metta import EducationRAG, initialize_education_knowledge
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    StartSessionContent,
    TextContent,
    chat_protocol_spec,
)

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ASI1 Mini configurations
ASI1_MINI_API_KEY = "sk_10be0258afc94d998426fffc24d36ee535297ec558da44d0bb04f6e6094af9d4"
API_URL = "https://api.asi1.ai/v1/chat/completions"

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 2000  # 2 seconds for server errors

# In-memory cache
roadmap_cache = {}

# Initialize MeTTa education RAG
metta = MeTTa()
initialize_education_knowledge(metta)
edu_rag = EducationRAG(metta)

# uAgents models
class Milestone(Model):
    title: str
    type: Literal["learning", "project", "concept", "assessment"]
    description: str
    duration: str
    tasks: List[str]

class Resource(Model):
    title: str
    type: Literal["book", "video", "course", "website", "repository", "tutorial", "youtube", "podcast"]
    description: str
    url: Union[str, None] = None
    level: Literal["beginner", "intermediate", "advanced"]
    tags: List[str]
    cost: Literal["free", "paid"]

class Roadmap(Model):
    title: str
    description: str
    milestones: List[Milestone]
    resources: List[Resource]

class RoadmapParams(Model):
    category: Literal["education"]
    topic: str
    currentLevel: Literal["beginner", "intermediate", "advanced"]
    goals: str
    timeframe: Literal["1month", "3months", "6months", "1year"]

    def to_dict(self):
        return {
            "category": self.category,
            "topic": self.topic,
            "currentLevel": self.currentLevel,
            "goals": self.goals,
            "timeframe": self.timeframe
        }

class RoadmapRequest(Model):
    params: RoadmapParams

class RoadmapResponse(Model):
    roadmap: dict

roadmap_agent = Agent(
    name="roadmap-agent",
    port=5051,
    mailbox=True,
    publish_agent_details=True,
    seed = "roadmap-agent-seed-0001"

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


def infer_level_and_timeframe(text: str) -> Dict[str, str]:
    t = text.lower()
    level = "beginner"
    if "advanced" in t:
        level = "advanced"
    elif "intermediate" in t:
        level = "intermediate"

    timeframe = "3months"
    # Look for patterns like 1 month, 3 months, 6-month, 6 months, 1 year
    if "1 year" in t or "one year" in t or "12 months" in t:
        timeframe = "1year"
    elif "6-month" in t or "6 month" in t or "6 months" in t:
        timeframe = "6months"
    elif "3-month" in t or "3 month" in t or "3 months" in t:
        timeframe = "3months"
    elif "1-month" in t or "1 month" in t or "4 weeks" in t:
        timeframe = "1month"
    return {"level": level, "timeframe": timeframe}


def format_roadmap_markdown(roadmap: Dict[str, Any]) -> str:
    """Format roadmap dict into readable Markdown for chat responses."""
    try:
        title = roadmap.get("title", "Learning Roadmap")
        description = roadmap.get("description", "")
        milestones = roadmap.get("milestones", []) or []
        resources = roadmap.get("resources", []) or []

        lines: List[str] = []
        lines.append(f"# {title}")
        if description:
            lines.append("")
            lines.append(description)

        if milestones:
            lines.append("")
            lines.append("## Milestones (Weekly)")
            for m in milestones:
                mt = m if isinstance(m, dict) else {}
                m_title = mt.get("title", "Milestone")
                m_type = mt.get("type", "learning")
                m_desc = mt.get("description", "")
                m_duration = mt.get("duration", "")
                m_tasks = mt.get("tasks", []) or []
                header = f"- **{m_title}**"
                if m_duration:
                    header += f" ({m_duration})"
                header += f" — {m_type}"
                lines.append(header)
                if m_desc:
                    lines.append(f"  - {m_desc}")
                for t in m_tasks:
                    lines.append(f"  - [ ] {t}")

        if resources:
            lines.append("")
            lines.append("## Resources")
            for r in resources:
                rd = r if isinstance(r, dict) else {}
                r_title = rd.get("title", "Resource")
                r_type = rd.get("type", "website")
                r_desc = rd.get("description", "")
                r_url = rd.get("url")
                r_level = rd.get("level", "beginner")
                badge = f"`{r_type}` · `{r_level}`"
                if r_url:
                    lines.append(f"- [{r_title}]({r_url}) {badge}")
                else:
                    lines.append(f"- {r_title} {badge}")
                if r_desc:
                    lines.append(f"  - {r_desc}")

        return "\n".join(lines).strip()
    except Exception:
        # Fallback to JSON
        return json.dumps(roadmap, indent=2)


# Handle incoming chat messages
@chat_proto.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    ctx.logger.info(f"Received message from {sender}")

    # Always send back an acknowledgement when a message is received
    await ctx.send(sender, ChatAcknowledgement(timestamp=datetime.now(timezone.utc), acknowledged_msg_id=msg.msg_id))

    # Aggregate any text into a topic and generate a roadmap
    topic_parts = []
    for item in msg.content:
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"Session started with {sender}")
        elif isinstance(item, TextContent):
            ctx.logger.info(f"Text message from {sender}: {item.text}")
            if item.text:
                topic_parts.append(item.text)
        elif isinstance(item, EndSessionContent):
            ctx.logger.info(f"Session ended with {sender}")
        else:
            ctx.logger.info(f"Received unexpected content type from {sender}")

    topic_text = "\n".join([p for p in topic_parts if p]).strip()
    if topic_text:
        try:
            inferred = infer_level_and_timeframe(topic_text)
            params = RoadmapParams(
                category="education",
                topic=topic_text,
                currentLevel=inferred["level"],
                goals="Learn fundamentals and build projects",
                timeframe=inferred["timeframe"],
            )
            roadmap = await generate_roadmap(params)
            md = format_roadmap_markdown(roadmap)
            response_message = create_text_chat(md, end_session=True)
            await ctx.send(sender, response_message)
        except Exception as e:
            ctx.logger.error(f"Failed to generate roadmap: {str(e)}", exc_info=True)
            await ctx.send(sender, create_text_chat(f"Error generating roadmap: {str(e)}", end_session=True))
    else:
        await ctx.send(sender, create_text_chat("Please provide an educational topic to generate a roadmap.", end_session=True))


# Handle acknowledgements for messages this agent has sent out
@chat_proto.on_message(ChatAcknowledgement)
async def handle_acknowledgement(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"Received acknowledgement from {sender} for message {msg.acknowledged_msg_id}")


# Include the chat protocol and publish the manifest to Agentverse
roadmap_agent.include(chat_proto, publish_manifest=True)

@roadmap_agent.on_event("startup")
async def startup_handler(ctx: Context):
    logger.info(f"Starting uAgent with address: {ctx.agent.address}")

@roadmap_agent.on_message(model=RoadmapRequest, replies=RoadmapResponse)
async def handle_roadmap_request(ctx: Context, sender: str, msg: RoadmapRequest):
    await process_roadmap_request(ctx, sender, msg.params)

@roadmap_agent.on_rest_post("/roadmap", RoadmapParams, RoadmapResponse)
async def handle_rest_roadmap_request(ctx: Context, req: RoadmapParams) -> RoadmapResponse:
    logger.info(f"Received REST POST request with params: {req}")
    try:
        roadmap = await generate_roadmap(req)
        return RoadmapResponse(roadmap=roadmap)
    except Exception as e:
        logger.error(f"Error generating roadmap: {str(e)}", exc_info=True)
        raise Exception(f"Failed to generate roadmap: {str(e)}")

async def generate_roadmap(params: RoadmapParams) -> dict:
    logger.info(f"Generating roadmap for params: {params}")
    try:
        # Check cache
        cache_key = json.dumps(params.to_dict())
        if cache_key in roadmap_cache:
            logger.info("Returning cached roadmap")
            return roadmap_cache[cache_key]

        # Validate category
        if params.category != "education":
            raise Exception("This agent only supports education-related roadmaps")  # pyright: ignore[reportUnreachable]

        # Prepare minimal prompt
        timeframe_map = {
            "1month": "1 month",
            "3months": "3 months",
            "6months": "6 months",
            "1year": "1 year",
        }
        # Use RAG to enrich topic with subtopics/resources
        subtopics = edu_rag.subtopics_for(params.topic, params.currentLevel)
        resources = edu_rag.resources_for(params.topic, params.currentLevel)
        rag_hints = {
            "subtopics": subtopics[:8],
            "recommendedResources": resources[:8],
        }

        weeks_map = {
            "1month": 4,
            "3months": 12,
            "6months": 24,
            "1year": 52,
        }
        total_weeks = weeks_map.get(params.timeframe, 12)

        prompt = f"""
Create a JSON roadmap for learning the educational topic {params.topic}.
Level: {params.currentLevel}. Timeframe: {timeframe_map[params.timeframe]}.
Focus exclusively on educational content, such as academic subjects, teaching methodologies, or educational technologies.
Incorporate where appropriate these RAG hints (subtopics/resources): {json.dumps(rag_hints)}
Requirements for depth and quality:
- Provide exactly {total_weeks} weekly milestones. Include a mix of types: learning, project, assessment. At least 3 project milestones and 2 assessment milestones.
- Use duration values like "Week 1", "Week 2", ... "Week 12".
- Each milestone must include 4-6 focused tasks (concise, < 18 words each).
- Projects must be practical and cumulative (e.g., build features, optimize performance, add tests).
- Assessments should include self-evaluation or timed practice with clear criteria.
- Resources should be high-quality and current. Prefer free where possible and include accurate URLs.

Output format (raw JSON only): {{"title":"string","description":"string","milestones":[{{"title":"string","type":"learning|project|assessment","description":"string","duration":"Week n","tasks":["string"]}}],"resources":[{{"title":"string","type":"website|course|video|repository","description":"string","url":"string","level":"beginner|intermediate|advanced","tags":["string"],"cost":"free|paid"}}]}}
Return ONLY raw JSON (no markdown, no code fences). Ensure valid JSON.
"""

        async def send_asi1_request(prompt: str, retries: int = MAX_RETRIES) -> str:
            logger.info(f"Sending ASI1 Mini request (retries left: {retries})")
            async with aiohttp.ClientSession() as session:
                request = {
                    "model": "asi1-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": "Be precise and concise. Return ONLY raw JSON."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.5,
                    "top_p": 0.9,
                    "presence_penalty": 0,
                    "frequency_penalty": 0,
                    "max_tokens": 8000,
                    "stream": False,
                    "extra_body": {"web_search": True}
                }
                try:
                    logger.debug(f"Sending request payload: {json.dumps(request, indent=2)}")
                    async with session.post(
                        API_URL,
                        headers={
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": f"Bearer {ASI1_MINI_API_KEY}"
                        },
                        json=request,
                    ) as response:
                        error_text = await response.text()
                        logger.debug(f"ASI1 API response status: {response.status}, headers: {response.headers}, body: {error_text}")
                        if not response.ok:
                            logger.error(f"ASI1 API error: {response.status} - {error_text}")
                            if response.status in (429, 500, 503) and retries > 0:
                                await asyncio.sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1) / 1000)
                                return await send_asi1_request(prompt, retries - 1)
                            raise Exception(f"ASI1 API error: {response.status} - {error_text}")
                        data = await response.json()
                        if not data.get("choices") or not data["choices"][0].get("message") or not data["choices"][0]["message"].get("content"):
                            raise Exception(f"Invalid response format from ASI1 API: {json.dumps(data)}")
                        raw_content = data["choices"][0]["message"]["content"]
                        content = raw_content
                        # Accept ```json fenced blocks or raw JSON. Try to extract fenced JSON first.
                        try:
                            import re as _re
                            m = _re.search(r"```json\n([\s\S]*?)\n```", content)
                            if m:
                                content = m.group(1)
                            else:
                                # Fallback: trim any stray backticks and extract braces range
                                s = content.find("{")
                                e = content.rfind("}")
                                if s != -1 and e != -1 and e > s:
                                    content = content[s:e+1]
                        except Exception:
                            pass
                        # Validate JSON
                        try:
                            json.loads(content)
                        except json.JSONDecodeError as e:
                            logger.error(f"Response content not valid JSON. Raw: {raw_content}")
                            raise Exception(f"Response is not valid JSON: {str(e)}")
                        return content
                except aiohttp.ClientError as e:
                    logger.error(f"Network error during ASI1 request: {str(e)}")
                    if retries > 0:
                        await asyncio.sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1) / 1000)
                        return await send_asi1_request(prompt, retries - 1)
                    raise Exception(f"Network error: {str(e)}")

        # Call ASI1 Mini API
        logger.info("Calling ASI1 Mini API")
        text = await send_asi1_request(prompt)

        try:
            roadmap_data = json.loads(text)
            # Validate roadmap structure
            required_keys = ["title", "description", "milestones", "resources"]
            if not all(key in roadmap_data for key in required_keys):
                raise Exception(f"Invalid roadmap structure: missing required keys {required_keys}")
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse ASI1 response as JSON: {text}, error: {str(e)}")

        # Cache the result
        roadmap_cache[cache_key] = roadmap_data
        logger.info("Roadmap generated and cached")
        return roadmap_data

    except Exception as e:
        logger.error(f"Error generating roadmap: {str(e)}", exc_info=True)
        raise

async def process_roadmap_request(ctx: Context, sender: str, params: RoadmapParams):
    logger.info(f"Processing roadmap request from {sender} with params: {params}")
    try:
        roadmap = await generate_roadmap(params)
        await ctx.send(sender, RoadmapResponse(roadmap=roadmap))
        logger.info(f"Sent roadmap response to {sender}")
    except Exception as e:
        logger.error(f"Error processing roadmap request: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    try:
        fund_agent_if_low(roadmap_agent.wallet.address())
    except Exception as e:
        logger.warning(f"Funding skipped or failed: {str(e)}")
    roadmap_agent.run()