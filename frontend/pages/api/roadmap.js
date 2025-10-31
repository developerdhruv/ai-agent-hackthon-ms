import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { category, topic, currentLevel, goals, timeframe } = req.body;
    const uAgentUrl = `${process.env.UAGENT_BASE_URL}/roadmap`;

    try {
      const response = await fetch(uAgentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, topic, currentLevel, goals, timeframe }),
      });

      const data = await response.json();
      if (response.ok) {
        res.status(200).json(data.roadmap);
      } else {
        res.status(response.status).json({ error: data.error || 'Error communicating with uAgent' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}