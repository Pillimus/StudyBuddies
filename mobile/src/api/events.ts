import { requestJson } from './config';

export async function fetchEvents(token: string) {
  return requestJson<any[]>('/api/events', { token });
}

export async function createEvent(token: string, payload: any) {
  return requestJson<{ event: any }>('/api/events', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateEvent(token: string, eventId: string | number, payload: any) {
  return requestJson<{ event: any }>(`/api/events/${eventId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteEvent(token: string, eventId: string | number) {
  return requestJson<{ message: string }>(`/api/events/${eventId}`, {
    method: 'DELETE',
    token,
  });
}
