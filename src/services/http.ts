import { env } from "../config/env";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function http<T = any>(
  path: string,
  {
    method = "GET",
    body,
    mock,
  }: {
    method?: string;
    body?: any;
    mock?: (b?: any) => any;
  } = {}
): Promise<T> {
  if (env.useMock) {
    if (!mock) throw new Error("No demo data is defined for this request.");
    await wait(280 + Math.random() * 220);
    return structuredClone(await mock(body)) as T;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = cleanPath.startsWith('/api')
    ? cleanPath
    : `${env.apiBaseUrl || '/api'}${cleanPath}`;

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    credentials: "include", // lets a cookie based session work later
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`The server responded with status ${res.status}.`);
  const data = res.status === 204 ? null : await res.json();
  if (data && typeof data === 'object' && 'success' in data && 'data' in data && !Array.isArray(data)) {
    return data.data as T;
  }
  return data as T;
}
