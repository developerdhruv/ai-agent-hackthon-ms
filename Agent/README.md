# Resume Generator Agent

This agent generates tailored resumes from job descriptions and supports the uAgents Chat protocol for interactive communication.

Capabilities:
- REST: POST /resume (generate resume from job description)
- Chat: Responds to chat messages and acknowledgements via the standard chat protocol

Runtime:
- Name: resume-agent---
- Port: 5052
- Endpoint: http://localhost:5052/submit

Notes:
- Ensure the agent is reachable at the endpoint above
- The agent acknowledges incoming chat messages and can send simple text responses
