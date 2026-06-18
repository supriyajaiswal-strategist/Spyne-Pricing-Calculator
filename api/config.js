import { kv } from "@vercel/kv";

const KEY = "pricing_config";

/* Shared pricing config API (Vercel serverless + KV).
 * GET  -> { config }            read the saved shared config (or null)
 * POST { passcode, verify }     check passcode only
 * POST { passcode, config }     save the shared config (passcode must match env ADMIN_PASSCODE)
 */
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const config = await kv.get(KEY);
      return res.status(200).json({ config: config || null });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const { passcode, config, verify } = body;

      if (!process.env.ADMIN_PASSCODE) return res.status(500).json({ error: "Server passcode not configured" });
      if (passcode !== process.env.ADMIN_PASSCODE) return res.status(401).json({ error: "Invalid passcode" });

      if (verify) return res.status(200).json({ ok: true });

      if (!config || !config.vini || !config.studio) return res.status(400).json({ error: "Invalid config" });
      await kv.set(KEY, config);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}
