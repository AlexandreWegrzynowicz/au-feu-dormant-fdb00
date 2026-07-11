const crypto = require("crypto");

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "https://au-feu-dormant.netlify.app",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Methode refusee." });
  if (!process.env.BACKROOM_SESSION_SECRET) return json(500, { error: "Secret de session non configure." });

  let password = "";
  try {
    password = JSON.parse(event.body || "{}").password || "";
  } catch {
    return json(400, { error: "Demande illisible." });
  }
  const storedHash = await loadPasswordHash();
  if (!storedHash) return json(500, { error: "Mot de passe de l'Arriere-salle non configure." });

  const givenHash = sha256(password);
  if (!safeEqual(givenHash, storedHash)) return json(401, { error: "Mot de passe incorrect." });

  const expiresAt = Date.now() + 1000 * 60 * 60 * 8;
  const payload = base64url(JSON.stringify({ scope: "backroom:read", exp: expiresAt }));
  const signature = sign(payload);
  return json(200, { token: `${payload}.${signature}` });
};

async function loadPasswordHash() {
  const state = await supabaseFetch("/rest/v1/backroom_settings?id=eq.main&select=password_hash");
  return state?.[0]?.password_hash || process.env.BACKROOM_PASSWORD_SHA256 || "";
}

async function supabaseFetch(path) {
  const url = process.env.SUPABASE_URL || "https://zmcpdirllnwuabdfdnfk.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  const response = await fetch(`${url}${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });
  if (!response.ok) return null;
  return response.json();
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value), "utf8").digest("hex");
}

function sign(payload) {
  return crypto.createHmac("sha256", process.env.BACKROOM_SESSION_SECRET).update(payload).digest("base64url");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}
