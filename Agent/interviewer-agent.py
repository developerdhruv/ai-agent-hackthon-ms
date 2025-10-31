from uagents import Agent, Context, Model, Protocol
import aiohttp
import json
import asyncio
import re
from typing import Dict, Any, List
import logging
from datetime import datetime, timezone
from uuid import uuid4
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)
from hyperon import MeTTa
from metta import EducationRAG, initialize_education_knowledge


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class Config:
    ASI1_MINI_API_KEY = "sk_10be0258afc94d998426fffc24d36ee535297ec558da44d0bb04f6e6094af9d4"
    API_URL = "https://api.asi1.ai/v1/chat/completions"
    MAX_RETRIES = 3
    RETRY_DELAY = 1000


interviewer_agent = Agent(
    name="ai-interviewer-agent",
    port=5054,
    mailbox=True,
    publish_agent_details=True,
    seed = "interviewer-agent-seed-0001"
)


chat_proto = Protocol(spec=chat_protocol_spec)


def create_text_chat(text: str, end_session: bool = False) -> ChatMessage:
    content = [TextContent(type="text", text=text)]
    if end_session:
        content.append(EndSessionContent(type="end-session"))
    return ChatMessage(
        timestamp=datetime.now(timezone.utc),
        msg_id=uuid4(),
        content=content,
    )


# Initialize RAG for education topics
metta = MeTTa()
initialize_education_knowledge(metta)
edu_rag = EducationRAG(metta)


async def send_asi(prompt: str, temperature: float = 0.5, max_tokens: int = 1500, web_search: bool = False, retries: int = Config.MAX_RETRIES) -> str:
    async with aiohttp.ClientSession() as session:
        request = {
            "model": "asi1-mini",
            "messages": [
                {"role": "system", "content": "Be precise and concise."},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "top_p": 0.9,
            "max_tokens": max_tokens,
            "presence_penalty": 0,
            "frequency_penalty": 0,
            "stream": False,
            "extra_body": {"web_search": web_search},
        }
        try:
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
                        return await send_asi(prompt, temperature, max_tokens, web_search, retries - 1)
                    raise Exception(f"ASI error: {response.status} - {text}")
                data = json.loads(text)
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                return content
        except Exception as e:
            if retries > 0:
                await asyncio.sleep(Config.RETRY_DELAY * (Config.MAX_RETRIES - retries + 1) / 1000)
                return await send_asi(prompt, temperature, max_tokens, web_search, retries - 1)
            raise


def build_rag_hints(target_role: str, level: str) -> Dict[str, Any]:
    role = (target_role or "").lower()
    topic = "frontend development" if "front" in role else ("data structures and algorithms" if "dsa" in role or "algo" in role else ("backend development" if "back" in role else "system design"))
    subtopics = edu_rag.subtopics_for(topic, level)
    resources = edu_rag.resources_for(topic, level)
    return {"topic": topic, "subtopics": subtopics[:8], "resources": resources[:8]}


def extract_json_from_payload(payload: str) -> Dict[str, Any]:
    """Extract a single JSON object after a command. Handles fenced blocks and balanced braces."""
    # fenced block first
    m = re.search(r"```json\n([\s\S]*?)\n```", payload)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception as e:
            raise ValueError(f"Invalid JSON payload: {str(e)}")

    # Find first opening brace and balance until matching closing brace
    s = payload.find('{')
    if s == -1:
        # try whole payload
        try:
            return json.loads(payload.strip())
        except Exception as e:
            raise ValueError(f"Invalid JSON payload: {str(e)}")

    depth = 0
    in_string = False
    escape = False
    for i in range(s, len(payload)):
        ch = payload[i]
        if in_string:
            if escape:
                escape = False
            elif ch == '\\':
                escape = True
            elif ch == '"':
                in_string = False
            continue
        else:
            if ch == '"':
                in_string = True
                continue
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    json_text = payload[s:i+1]
                    try:
                        return json.loads(json_text)
                    except Exception as e:
                        raise ValueError(f"Invalid JSON payload: {str(e)}")

    # If we exit loop without closing
    raise ValueError("Invalid JSON payload: unmatched braces")


async def generate_questions(profile: Dict[str, Any], count: int = 5) -> str:
    level = profile.get("difficultyLevel", "intermediate")
    rag = build_rag_hints(profile.get("targetRole", ""), level)
    prompt = f"""
You are an expert interviewer for {profile.get('targetRole')} in {profile.get('industry')}.
Generate {count} challenging interview questions.
Profile:
- Job title: {profile.get('jobTitle')}
- Experience: {profile.get('yearsOfExperience')} years
- Skills: {', '.join(profile.get('skills', []))}
- Interview type: {profile.get('interviewType')}

Focus areas (RAG): {json.dumps(rag)}

Guidelines:
- Include at least one DSA or algorithmic question for technical roles
- Include system design when appropriate
- Questions only; no numbering; each on a new line; end with '?'
"""
    content = await send_asi(prompt, temperature=0.6, max_tokens=1200, web_search=False)
    # Extract questions lines
    lines = [l.strip() for l in content.split("\n") if l.strip().endswith("?")]
    return "\n".join(lines[:count]) if lines else content.strip()


async def analyze_response(question: str, response: str, profile: Dict[str, Any]) -> str:
    prompt = f"""
Analyze the following candidate response.
Question: "{question}"
Response: "{response}"
Profile:
- Role: {profile.get('targetRole')}
- Industry: {profile.get('industry')}
- Experience: {profile.get('yearsOfExperience')} years
- Skills: {', '.join(profile.get('skills', []))}
- Interview type: {profile.get('interviewType')}

Return JSON with keys: clarity, confidence, relevance, completeness{', technicalAccuracy' if str(profile.get('interviewType')).lower()=='technical' else ''}, strengths[], weaknesses[], suggestions
Only return raw JSON.
"""
    content = await send_asi(prompt, temperature=0.3, max_tokens=800, web_search=False)
    # Try to extract JSON block
    m = re.search(r"```json\n([\s\S]*?)\n```", content)
    json_text = m.group(1) if m else content
    try:
        json.loads(json_text)
    except Exception:
        pass
    return json_text.strip()


async def generate_feedback(profile: Dict[str, Any], questions: List[str], responses: List[str], analyses: List[Dict[str, Any]]) -> str:
    summary = []
    for i, q in enumerate(questions):
        summary.append(f"Q{i+1}: {q}\nA{i+1}: {responses[i] if i < len(responses) else ''}\nAnalysis: {json.dumps(analyses[i] if i < len(analyses) else {}, ensure_ascii=False)}")
    joined = "\n\n".join(summary)
    prompt = f"""
Generate overall interview feedback for role {profile.get('targetRole')}.
Candidate experience: {profile.get('yearsOfExperience')} years. Skills: {', '.join(profile.get('skills', []))}.
Data:\n{joined}

Return raw JSON with keys: overallScore, strengths[], areasForImprovement[], recommendations[], summary.
"""
    content = await send_asi(prompt, temperature=0.3, max_tokens=800, web_search=False)
    m = re.search(r"```json\n([\s\S]*?)\n```", content)
    json_text = m.group(1) if m else content
    try:
        json.loads(json_text)
    except Exception:
        pass
    return json_text.strip()


# REST models and endpoints for frontend integration
class QuestionsRequest(Model):
    profile: Dict[str, Any]
    count: int


class QuestionsResponse(Model):
    questions: List[str]


class AnalysisRequest(Model):
    profile: Dict[str, Any]
    question: str
    response: str


class AnalysisResponse(Model):
    analysis: Dict[str, Any]


class FeedbackRequest(Model):
    profile: Dict[str, Any]
    questions: List[str]
    responses: List[str]
    analyses: List[Dict[str, Any]]


class FeedbackResponse(Model):
    feedback: Dict[str, Any]


@interviewer_agent.on_rest_post("/questions", QuestionsRequest, QuestionsResponse)
async def rest_questions(ctx: Context, req: QuestionsRequest) -> Dict[str, Any]:
    qs_text = await generate_questions(req.profile, req.count)
    questions = [l.strip() for l in qs_text.split("\n") if l.strip()]
    return {"questions": questions}


@interviewer_agent.on_rest_post("/analyze", AnalysisRequest, AnalysisResponse)
async def rest_analyze(ctx: Context, req: AnalysisRequest) -> Dict[str, Any]:
    analysis_text = await analyze_response(req.question, req.response, req.profile)
    try:
        return {"analysis": json.loads(analysis_text)}
    except Exception:
        return {"analysis": {"raw": analysis_text}}


@interviewer_agent.on_rest_post("/feedback", FeedbackRequest, FeedbackResponse)
async def rest_feedback(ctx: Context, req: FeedbackRequest) -> Dict[str, Any]:
    feedback_text = await generate_feedback(req.profile, req.questions, req.responses, req.analyses)
    try:
        return {"feedback": json.loads(feedback_text)}
    except Exception:
        return {"feedback": {"raw": feedback_text}}


@chat_proto.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(sender, ChatAcknowledgement(timestamp=datetime.now(timezone.utc), acknowledged_msg_id=msg.msg_id))
    logger.info(f"Chat message from {sender}: {msg.content}")

    text_parts: List[str] = []
    for item in msg.content:
        if isinstance(item, TextContent) and item.text:
            text_parts.append(item.text)

    payload = "\n".join(text_parts).strip()
    # Commands: QUESTIONS:, ANALYZE:, FEEDBACK:
    try:
        if payload.startswith("QUESTIONS:"):
            data = extract_json_from_payload(payload[len("QUESTIONS:"):])
            questions = await generate_questions(data.get("profile", {}), int(data.get("count", 5)))
            await ctx.send(sender, create_text_chat(questions, end_session=False))
            return
        if payload.startswith("ANALYZE:"):
            data = extract_json_from_payload(payload[len("ANALYZE:"):])
            result = await analyze_response(data.get("question", ""), data.get("response", ""), data.get("profile", {}))
            await ctx.send(sender, create_text_chat(result, end_session=False))
            return
        if payload.startswith("FEEDBACK:"):
            data = extract_json_from_payload(payload[len("FEEDBACK:"):])
            result = await generate_feedback(data.get("profile", {}), data.get("questions", []), data.get("responses", []), data.get("analyses", []))
            await ctx.send(sender, create_text_chat(result, end_session=True))
            return
        # Fallback: instruct usage
        help_text = (
            "Send one of the following commands as JSON:\n"
            "QUESTIONS: {\"profile\": {...}, \"count\": 5}\n"
            "ANALYZE: {\"profile\": {...}, \"question\": \"...\", \"response\": \"...\"}\n"
            "FEEDBACK: {\"profile\": {...}, \"questions\": [...], \"responses\": [...], \"analyses\": [...]}"
        )
        await ctx.send(sender, create_text_chat(help_text, end_session=True))
    except Exception as e:
        logger.error(f"Interviewer error: {str(e)}", exc_info=True)
        await ctx.send(sender, create_text_chat(f"Error: {str(e)}", end_session=True))


@chat_proto.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    logger.info(f"Acknowledgement from {sender} for {msg.acknowledged_msg_id}")


interviewer_agent.include(chat_proto, publish_manifest=True)


if __name__ == "__main__":
    interviewer_agent.run()


