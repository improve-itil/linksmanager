export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key, value } = req.body;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'שרת Vercel אינו מוגדר כראוי (משתני סביבה חסרים).' });
  }

  try {
    // ביצוע פעולת Upsert (עדכון אם קיים, יצירה אם לא קיים) ב-Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/links`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates', // גורם לזה להתנהג כ-Upsert
      },
      body: JSON.stringify({
        id: key.toLowerCase().trim(),
        destination_url: value.trim(),
        updated_at: new Date().toISOString(),
      }),
    });

    if (response.status === 201 || response.status === 200 || response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errText = await response.text();
      return res.status(400).json({ error: 'שגיאה בעדכון מול שרת Supabase' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
