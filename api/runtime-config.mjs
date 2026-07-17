import { handler } from "../netlify/functions/runtime-config.mjs";
import { adaptNetlifyHandler } from "./_adapter.mjs";

export default function runtimeConfig(request, response) {
  return adaptNetlifyHandler(handler, request, response);
}
