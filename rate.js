export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=JPY');
    const data = await r.json();
    const rate = data.rates?.JPY || 150;
    res.status(200).json({ rate });
  } catch(e) {
    res.status(200).json({ rate: 150 }); // fallback
  }
}