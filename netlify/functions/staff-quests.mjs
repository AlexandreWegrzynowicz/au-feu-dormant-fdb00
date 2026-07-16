const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  },
  body: JSON.stringify(body)
});

const allowedStatuses = new Set(["brouillon", "disponible", "fermee", "archivee"]);

function bearerToken(headers = {}) {
  const value = headers.authorization || headers.Authorization || "";
  const match = /^Bearer\s+(.+)$/i.exec(value);
  return match?.[1] || "";
}

async function supabaseRequest(url, serviceRoleKey, path, options = {}) {
  return fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
}

async function authenticatedStaff(url, publishableKey, serviceRoleKey, token) {
  const userResponse = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      authorization: `Bearer ${token}`
    }
  });

  if (!userResponse.ok) return null;
  const user = await userResponse.json();
  if (!user?.id) return null;

  const profileResponse = await supabaseRequest(
    url,
    serviceRoleKey,
    `profiles?id=eq.${encodeURIComponent(user.id)}&select=role`,
    { headers: { accept: "application/json" } }
  );
  if (!profileResponse.ok) return null;
  const [profile] = await profileResponse.json();
  return ["mj", "administrateur"].includes(profile?.role) ? user : null;
}

function cleanQuest(input = {}) {
  const title = String(input.title || "").trim().slice(0, 160);
  if (!title) throw new Error("TITLE_REQUIRED");

  const status = String(input.status || "disponible").toLowerCase();
  return {
    title,
    description: String(input.description || "").trim().slice(0, 5000),
    quest_type: String(input.quest_type || "Libre").trim().slice(0, 80) || "Libre",
    recommended_level: Math.max(1, Math.min(20, Number(input.recommended_level) || 1)),
    reward_text: String(input.reward_text || "").trim().slice(0, 500),
    status: allowedStatuses.has(status) ? status : "disponible"
  };
}

export const handler = async event => {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const url = process.env.SUPABASE_URL || "";
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !publishableKey || !serviceRoleKey) {
    return json(503, { ok: false, error: "SERVER_NOT_CONFIGURED" });
  }

  const token = bearerToken(event.headers);
  if (!token) return json(401, { ok: false, error: "AUTH_REQUIRED" });

  const user = await authenticatedStaff(url, publishableKey, serviceRoleKey, token);
  if (!user) return json(403, { ok: false, error: "STAFF_REQUIRED" });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (_error) {
    return json(400, { ok: false, error: "INVALID_JSON" });
  }

  const action = String(payload.action || "save");
  const id = String(payload.id || "").trim();

  if (action === "delete") {
    if (!id) return json(400, { ok: false, error: "ID_REQUIRED" });
    const response = await supabaseRequest(
      url,
      serviceRoleKey,
      `quests?id=eq.${encodeURIComponent(id)}`,
      { method: "DELETE", headers: { prefer: "return=minimal" } }
    );
    if (!response.ok) return json(502, { ok: false, error: "QUEST_DELETE_FAILED" });
    return json(200, { ok: true });
  }

  let quest;
  try {
    quest = cleanQuest(payload.quest);
  } catch (error) {
    return json(400, { ok: false, error: error.message });
  }

  const response = id
    ? await supabaseRequest(url, serviceRoleKey, `quests?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { prefer: "return=representation" },
        body: JSON.stringify(quest)
      })
    : await supabaseRequest(url, serviceRoleKey, "quests", {
        method: "POST",
        headers: { prefer: "return=representation" },
        body: JSON.stringify({ ...quest, created_by: user.id })
      });

  if (!response.ok) {
    return json(502, { ok: false, error: "QUEST_SAVE_FAILED" });
  }

  const [saved] = await response.json();
  return json(200, { ok: true, quest: saved });
};
