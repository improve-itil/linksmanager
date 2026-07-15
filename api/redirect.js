export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("Missing link ID");
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  try {
    // שליפת הנתון מ-Supabase בצורה ישירה ומהירה דרך REST API ללא צורך בספריות כבדות
    const response = await fetch(
      `${supabaseUrl}/rest/v1/links?id=eq.${id.toLowerCase().trim()}&select=destination_url`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok && data && data.length > 0) {
      const targetUrl = data[0].destination_url;
      // ביצוע ההפניה (302)
      res.writeHead(302, { Location: targetUrl });
      return res.end();
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(
      `<h2 style="font-family:sans-serif; text-align:center; padding-top:50px; direction:rtl;">שגיאה: לומדה עם מזהה "${id}" לא נמצאה במערכת Supabase.</h2>`
    );
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}
