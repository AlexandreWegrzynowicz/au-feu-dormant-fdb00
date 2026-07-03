const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "https://au-feu-dormant.netlify.app",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: jsonHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return response(405, { error: "Methode refusee." });
  }

  const webhookUrl = process.env.DISCORD_RESERVATION_WEBHOOK;
  if (!webhookUrl) {
    return response(500, { error: "Webhook Discord non configure sur Netlify." });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return response(400, { error: "Demande illisible." });
  }

  const characterName = clean(payload.characterName, 64);
  const signature = clean(payload.signature, 64);
  const room = clean(payload.room, 120);

  if (!characterName || !signature || !room) {
    return response(400, { error: "Nom, chambre et signature sont obligatoires." });
  }

  const message = [
    "## Nouvelle reservation RP",
    "",
    `**Nom du personnage :** ${characterName}`,
    `**Signature RP :** ${signature}`,
    `**Chambre reservee :** ${room}`,
    `**Date d'arrivee :** ${clean(payload.arrivalDate, 120) || "Non precisee"}`,
    `**Duree du sejour :** ${clean(payload.duration, 80) || "Non precisee"}`,
    `**Nombre d'occupants :** ${clean(payload.occupants, 20) || "1"}`,
    `**Supplements :** ${formatList(payload.supplements)}`,
    `**Liste blanche :** ${cleanMultiline(payload.allowedGuests, 700) || "Non renseignee"}`,
    `**Garde du corps :** ${clean(payload.bodyguard, 120) || "Aucun"}`,
    `**Renseignement escorte :** ${cleanMultiline(payload.bodyguardDetails, 600) || "Aucun"}`,
    `**Demandes particulieres :** ${clean(payload.requests, 700) || "Aucune"}`,
    `**Commentaire :** ${clean(payload.comment, 900) || "Aucun"}`,
    "",
    "## Cout total RP",
    clean(payload.total, 80) || "Non calcule"
  ].join("\n");

  const discordResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      content: message,
      allowed_mentions: { parse: [] }
    })
  });

  if (!discordResponse.ok) {
    return response(502, { error: "Discord a refuse la reservation." });
  }

  return response(200, { ok: true });
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(body)
  };
}

function clean(value, maxLength) {
  return plainText(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMultiline(value, maxLength) {
  return plainText(value)
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

function formatList(value) {
  if (!Array.isArray(value) || value.length === 0) return "Aucun supplement";
  return value.map((item) => clean(item, 120)).filter(Boolean).join(", ") || "Aucun supplement";
}

function plainText(value) {
  return String(value || "")
    .replace(/\uFFFD/g, "e")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
