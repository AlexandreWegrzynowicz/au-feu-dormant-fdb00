import { handler } from "../netlify/functions/close-auctions.mjs";
import { adaptNetlifyHandler } from "./_adapter.mjs";

export default function closeAuctions(request, response) {
  return adaptNetlifyHandler(handler, request, response);
}
