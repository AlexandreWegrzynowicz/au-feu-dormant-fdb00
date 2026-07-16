const response = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify(body)
});

export const handler = async () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return response(503, { ok: false, error: "SERVER_NOT_CONFIGURED" });
  }

  const result = await fetch(`${url}/rest/v1/rpc/api_close_due_auctions`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json"
    },
    body: "{}"
  });

  if (!result.ok) {
    return response(502, { ok: false, error: "AUCTION_CLOSE_FAILED" });
  }

  return response(200, { ok: true, closed: await result.json() });
};

