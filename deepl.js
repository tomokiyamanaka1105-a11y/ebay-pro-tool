export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });

    const DEEPL_KEY = process.env.DEEPL_API_KEY;
    if (!DEEPL_KEY) return res.status(500).json({ error: 'DEEPL_API_KEY not set' });

    const host = DEEPL_KEY.endsWith(':fx')
      ? 'api-free.deepl.com'
      : 'api.deepl.com';

    const params = new URLSearchParams();
    params.append('text', text);
    params.append('source_lang', 'JA');
    params.append('target_lang', 'EN-US');

    const response = await fetch(`https://${host}/v2/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    res.status(200).json({ translated: data.translations?.[0]?.text || '' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
