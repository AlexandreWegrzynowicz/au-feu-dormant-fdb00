function readRequestBody(request) {
  if (request.body === undefined || request.body === null) return null;
  return typeof request.body === "string"
    ? request.body
    : JSON.stringify(request.body);
}

export async function adaptNetlifyHandler(handler, request, response) {
  const event = {
    httpMethod: request.method || "GET",
    headers: request.headers || {},
    body: readRequestBody(request),
    queryStringParameters: request.query || {},
  };

  const result = await handler(event);
  const statusCode = Number(result?.statusCode) || 200;

  Object.entries(result?.headers || {}).forEach(([name, value]) => {
    response.setHeader(name, value);
  });

  response.statusCode = statusCode;
  return response.end(result?.body ?? "");
}
