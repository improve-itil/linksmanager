export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, value } = req.body;
  const token = process.env.VERCEL_API_TOKEN;
  const configId = process.env.EDGE_CONFIG_ID;

  if (!token || !configId) {
    return res.status(500).json({ error: 'שרת Vercel אינו מוגדר כראוי (משתני סביבה חסרים).' });
  }

  try {
    // קריאה מאובטחת ל-Vercel REST API לעדכון המפתח
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${configId}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'upsert',
              key: key.toLowerCase().trim(),
              value: value.trim(),
            },
          ],
        }),
      }
    );

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errData = await response.json();
      return res.status(response.status).json({ error: 'שגיאה בעדכון מול שרתי Vercel' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
