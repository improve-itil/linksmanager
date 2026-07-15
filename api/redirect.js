import { get } from '@vercel/edge-config';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("Missing link ID");
  }

  try {
    // שליפת הקישור האמיתי מה-Edge Config
    const destinationUrl = await get(id.toLowerCase().trim());

    if (destinationUrl) {
      // הפניה מהירה וחמה (302 Redirect)
      res.writeHead(302, { Location: destinationUrl });
      return res.end();
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(
      `<h2 style="font-family:sans-serif; text-align:center; padding-top:50px; direction:rtl;">שגיאה: לומדה עם מזהה "${id}" לא נמצאה במערכת.</h2>`
    );
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}
