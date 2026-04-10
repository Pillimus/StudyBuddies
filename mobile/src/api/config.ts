import { Platform } from 'react-native';

export const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5001' : 'http://localhost:5001';

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error || data?.message || data?.errors?.[0]?.msg || 'Request failed.';
    throw new Error(message);
  }

  return data as T;
}
