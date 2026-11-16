const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1"
).replace(/\/+$/, "");

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const storedAuth = localStorage.getItem("anagu.auth");
  let accessToken: string | undefined;
  try {
    accessToken = storedAuth ? (JSON.parse(storedAuth) as { accessToken?: string }).accessToken : undefined;
  } catch {
    localStorage.removeItem("anagu.auth");
  }
  if (!accessToken) {
    throw new Error("Please sign in before using this feature.");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Cannot reach the Anagu API at ${API_BASE_URL}: ${error.message}`
        : `Cannot reach the Anagu API at ${API_BASE_URL}.`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body
      ? (body as { message: unknown }).message
      : body;
    throw new Error(
      Array.isArray(message) ? message.join(", ") : String(message || `Request failed (${response.status}).`),
    );
  }

  return body as T;
}

export async function publicApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  return request<T>(path, options);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Cannot reach the Anagu API at ${API_BASE_URL}: ${error.message}`
        : `Cannot reach the Anagu API at ${API_BASE_URL}.`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body
      ? (body as { message: unknown }).message
      : body;
    throw new Error(
      Array.isArray(message) ? message.join(", ") : String(message || `Request failed (${response.status}).`),
    );
  }

  return body as T;
}
