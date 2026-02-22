export type ApiRequestOptions = RequestInit & {
  autoLogoutOn401?: boolean;
  includeAuthHeader?: boolean;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

const resolveUrl = (url: string) => {
  if (isAbsoluteUrl(url)) return url;
  if (!API_BASE_URL) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const clearSession = () => {
  localStorage.removeItem("goalstack_user");
  localStorage.removeItem("token");
  localStorage.removeItem("goalstack_token");
  localStorage.removeItem("sadi_current_user");
};

const redirectToLogin = () => {
  clearSession();
  window.location.href = "/?message=session_expired";
};

export const apiRequest = async (url: string, options: ApiRequestOptions = {}) => {
  const { autoLogoutOn401 = true, includeAuthHeader = true, headers, body, ...rest } = options;
  const token = localStorage.getItem("token") || localStorage.getItem("goalstack_token");

  const requestHeaders = new Headers(headers || {});

  if (body && !(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (includeAuthHeader && token && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveUrl(url), {
    ...rest,
    body,
    headers: requestHeaders,
  });

  if (response.status === 401 && autoLogoutOn401) {
    localStorage.removeItem("token");
    localStorage.removeItem("goalstack_token");
    redirectToLogin();
    throw new Error("Session expired");
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "string" ? data : (data as { message?: string })?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
};
