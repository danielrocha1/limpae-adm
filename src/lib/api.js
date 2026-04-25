export const apiUrl = (import.meta.env.VITE_API_URL || "https://limpae-adm.onrender.com").replace(/\/$/, "");
export const apiBaseUrl = apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;

function buildUrl(path, useApiBase = true) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${useApiBase ? apiBaseUrl : apiUrl}${normalizedPath}`;
}

export async function requestJson(path, options = {}) {
  const { token, headers = {}, method = "GET", body, useApiBase = true } = options;

  const response = await fetch(buildUrl(path, useApiBase), {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && (payload.error || payload.message)) ||
      `Erro HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}
