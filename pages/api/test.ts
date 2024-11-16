import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch("https://api.red-pill.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer sk-xYBWXr1ep667uXgJElBSv8NTA3jUD8QspAo411woAbE328VG",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "gpt-4o",
        "messages": [
          {
            "role": "user",
            "content": "What is 2+2?"
          }
        ]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'API call failed' });
  }
}