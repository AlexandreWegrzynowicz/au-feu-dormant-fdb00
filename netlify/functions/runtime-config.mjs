const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  },
  body: JSON.stringify(body)
});

export const handler = async () => {
  const url = process.env.SUPABASE_URL || "";
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";

  if (!url || !publishableKey) {
    return json(503, { configured: false });
  }

  return json(200, {
    configured: true,
    supabaseUrl: url,
    supabasePublishableKey: publishableKey
  });
};

