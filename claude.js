export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { title, condition, detailText, appealText, hasDeepL } = req.body;

    const prompt = `You are an eBay listing expert. Create an optimized eBay title (max 80 chars) and item description based on the following information.

Item name (Japanese): ${title}
Condition: ${condition}
Condition details${hasDeepL ? ' (DeepL translated)' : ''}: ${detailText || 'Not specified'}
Seller notes${hasDeepL ? ' (DeepL translated)' : ''}: ${appealText || 'None'}

Rules:
- Title: max 80 characters, front-load main keywords, include condition and "Japan"
- Description: use section separators (━), include Condition / Seller Notes / Shipping sections
- Insert natural SEO keywords: "Japan domestic model", "vintage", "tested", "authentic" where appropriate
- Be honest and accurate, no exaggeration

Output format:
TITLE: [title here]
---
DESC:
[description here]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const tm = text.match(/TITLE:\s*(.+)/);
    const dm = text.match(/DESC:\n([\s\S]+)/);

    res.status(200).json({
      title: (tm?.[1] || title).slice(0, 80).trim(),
      desc: dm?.[1]?.trim() || text
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}