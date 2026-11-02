import { Redis } from "@upstash/redis";
import crypto from "node:crypto";

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

// Everything lives under "ft:" so it never touches other apps sharing this database.
const K = { meta: "ft:meta", days: "ft:days" };
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

const parse = (v) => {
  if (v == null) return null;
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return null; }
  }
  return v;
};
const hash = (s) => crypto.createHash("sha256").update(String(s)).digest();

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!redis) {
    return res.status(500).json({ error: "Database not connected. Connect Upstash Redis under Storage, then redeploy." });
  }
  const PIN = process.env.APP_PIN;
  if (!PIN) {
    return res.status(500).json({ error: "Add an APP_PIN environment variable in Vercel, then redeploy." });
  }

  try {
    // Lock out an address after 20 wrong PINs for 15 minutes.
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
    const failKey = `ft:fail:${ip}`;
    const fails = Number((await redis.get(failKey)) || 0);
    if (fails >= 20) {
      return res.status(429).json({ error: "Too many wrong PIN attempts. Try again in 15 minutes." });
    }

    const given = String(req.headers["x-app-pin"] || "");
    if (!crypto.timingSafeEqual(hash(given), hash(PIN))) {
      if (given) {
        await redis.incr(failKey);
        await redis.expire(failKey, 900);
      }
      return res.status(401).json({ error: given ? "That PIN didn’t match." : "PIN required." });
    }

    if (req.method === "GET") {
      const [meta, days] = await Promise.all([redis.get(K.meta), redis.hgetall(K.days)]);
      const out = {};
      for (const [k, v] of Object.entries(days || {})) out[k] = parse(v);
      return res.status(200).json({ meta: parse(meta), days: out });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

      if (body.reset === true) {
        await redis.del(K.meta, K.days);
        return res.status(200).json({ ok: true });
      }
      if (body.meta && typeof body.meta === "object") {
        await redis.set(K.meta, JSON.stringify(body.meta));
      }
      if (body.days && typeof body.days === "object") {
        const entries = {};
        for (const [k, v] of Object.entries(body.days)) {
          if (DAY_KEY.test(k) && v && typeof v === "object") entries[k] = JSON.stringify(v);
        }
        if (Object.keys(entries).length) await redis.hset(K.days, entries);
      }
      return res.status(200).json({ ok: true, at: Date.now() });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error. Check that the database is connected." });
  }
}
