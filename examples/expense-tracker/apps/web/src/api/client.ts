const BASE = "/api";

async function request<T>(
  path: string,
  opts: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, ...init } = opts;
  const headers: HeadersInit = {
    ...(init.headers as Record<string, string>),
  };
  if (json !== undefined) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("token");
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  const text = await res.text();
  if (!res.ok) {
    const err = text ? JSON.parse(text) : { error: "Request failed" };
    throw new Error(err.error || "Request failed");
  }
  return text ? JSON.parse(text) : ({} as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", json: body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", json: body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
