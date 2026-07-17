import { handler } from "../netlify/functions/staff-quests.mjs";
import { adaptNetlifyHandler } from "./_adapter.mjs";

export default function staffQuests(request, response) {
  return adaptNetlifyHandler(handler, request, response);
}
