const crypto = require("crypto");

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "https://au-feu-dormant.netlify.app",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "GET") return json(405, { error: "Methode refusee." });
  if (!process.env.BACKROOM_SESSION_SECRET) return json(500, { error: "Secret de session non configure." });

  const token = String(event.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!verifyToken(token)) return json(401, { error: "Acces refuse." });

  const rows = await supabaseFetch("/rest/v1/backroom_state?id=eq.main&select=data");
  if (!rows) return json(500, { error: "Registre de l'Arriere-salle indisponible." });

  const data = rows[0]?.data || { characters: [] };
  const characters = Array.isArray(data.characters) ? data.characters.map(publicCharacter) : [];
  return json(200, { characters });
};

function publicCharacter(character) {
  const {
    privateNote,
    privateNotes,
    mjNote,
    mjNotes,
    ...publicFields
  } = character || {};
  return publicFields;
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

function verifyToken(token) {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (sign(payload) !== signature) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.scope === "backroom:read" && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
}

function sign(payload) {
  return crypto.createHmac("sha256", process.env.BACKROOM_SESSION_SECRET).update(payload).digest("base64url");
}

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}
