/**
 * Resolve a public asset against the build's base URL.
 *
 * Local dev and a normal deploy serve from "/", but a statically hosted build
 * (the shareable Artifact) is served from a nested path, so every asset
 * reference has to be relative rather than root-absolute.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const clean = path.replace(/^\//, "");
  return base.endsWith("/") ? `${base}${clean}` : `${base}/${clean}`;
}
