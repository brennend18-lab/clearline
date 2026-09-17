/**
 * Post-build arrangement for the deployed site.
 *
 * The Manus-approved single-file landing page (public/home.html) is promoted
 * to dist/index.html so the host's filesystem serves it at "/". The React app
 * entry is renamed to app.html, and vercel.json's catch-all rewrite sends every
 * non-file path (/demo, /trust, /deck, ...) to it.
 *
 * Static files always win over the rewrite on Vercel, so "/" = landing page,
 * assets serve normally, and everything else falls through to the React app.
 */
import { copyFileSync, renameSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

const reactEntry = join(dist, "index.html");
const appEntry = join(dist, "app.html");
const landing = join(dist, "home.html");

if (!existsSync(landing)) {
  throw new Error("dist/home.html missing: expected public/home.html to be copied by the build");
}

renameSync(reactEntry, appEntry);
copyFileSync(landing, reactEntry);
rmSync(landing);

console.log("postbuild: dist/index.html = landing page, dist/app.html = React app");
