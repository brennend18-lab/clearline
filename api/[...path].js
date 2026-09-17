import { Readable } from "node:stream";
import { createHandler } from "../server/app.mjs";
const handler = createHandler();
// Web Standard entrypoint preserves raw webhook bytes and separate Set-Cookie headers.
export default {
  async fetch(request) {
    const req = request.body
      ? Readable.fromWeb(request.body)
      : Readable.from([]);
    req.url = request.url;
    req.method = request.method;
    req.headers = Object.fromEntries(request.headers);
    const headers = new Headers();
    let payload = "";
    let status = 200;
    const res = {
      set statusCode(value) {
        status = value;
      },
      setHeader(key, value) {
        headers.delete(key);
        for (const item of Array.isArray(value) ? value : [value])
          headers.append(key, String(item));
      },
      end(body) {
        payload = body;
      },
    };
    await handler(req, res);
    return new Response(payload, { status, headers });
  },
};
