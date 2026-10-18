// Serveur Yaplus (API Next.js + Postgres Neon). Sans NEXT_PUBLIC_CLOUD_SYNC=1, l'app tourne
// en mode « sur cet appareil » : comptes et cahier restent sur le téléphone.
export const isCloudConfigured = process.env.NEXT_PUBLIC_CLOUD_SYNC === "1";

export class ApiError extends Error {
  // status 0 : pas de réseau ou serveur injoignable.
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }

  get offline() {
    return this.status === 0;
  }
}

export async function api<T>(path: string, body: unknown = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "offline");
  }
  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `http_${res.status}`);
  return data as T;
}
