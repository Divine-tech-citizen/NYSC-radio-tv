import type { Channel, ScheduleItem } from "./types";

type TokenGetter = () => Promise<string | null>;

export function createApiClient(baseUrl: string, getToken: TokenGetter) {
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getToken();
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  }

  return {
    getChannels: () => request<Channel[]>("/api/channels"),
    getChannel: (id: string) => request<Channel>(`/api/channels/${id}`),
    getSchedule: (id: string, date?: string) =>
      request<ScheduleItem[]>(`/api/channels/${id}/schedule${date ? `?date=${date}` : ""}`),
    updateChannelMedia: (id: string, body: {
      logoUrl: string | null;
      hlsUrl: string | null;
      audioUrl: string | null;
      videoUrl: string | null;
      thumbnailUrl: string | null;
    }) => request<Channel>(`/api/channels/${id}/media`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
    registerProfile: (body: { displayName: string; stateCode?: string }) =>
      request("/api/users/me", { method: "PUT", body: JSON.stringify(body) }),
  };
}
export type ApiClient = ReturnType<typeof createApiClient>;
