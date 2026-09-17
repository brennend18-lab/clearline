export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`/api/${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    let data;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        "Account services are not available on this preview. Please use the configured Vercel deployment.",
        503,
      );
    }
    if (!response.ok)
      throw new ApiError(data.error || "Please try again.", response.status);
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}
export interface Session {
  user: { id: string; email: string };
  membership: {
    active: boolean;
    status: string;
    cancelAtPeriodEnd: boolean;
    periodEnd: number | null;
  };
}
export function billingRedirect(url: string) {
  const parsed = new URL(url);
  if (
    parsed.protocol !== "https:" ||
    !["checkout.stripe.com", "billing.stripe.com"].includes(parsed.hostname)
  )
    throw Error("Unexpected billing destination.");
  location.assign(url);
}
