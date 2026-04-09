import { authFetch } from './authFetch';

export const createEvent = async (eventData: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  subject: string;
  eventType: string;
}) => {
  try {
    const res = await authFetch('http://study-buddies.me/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error(err);
    return { error: 'Server error' };
  }
};

export const getEvents = async (filters?: {
  start?: string;
  end?: string;
  eventType?: string;
  subject?: string;
}) => {
  try {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    const res = await authFetch(`http://study-buddies.me/api/events${params ? '?' + params : ''}`);
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error(err);
    return { error: 'Server error' };
  }
};

export const updateEvent = async (id: string, eventData: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  subject: string;
  eventType: string;
}) => {
  try {
    const res = await authFetch(`http://study-buddies.me/api/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error(err);
    return { error: 'Server error' };
  }
};

export const deleteEvent = async (id: string) => {
  try {
    const res = await authFetch(`http://study-buddies.me/api/events/${id}`, {
      method: 'DELETE'
    });
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error(err);
    return { error: 'Server error' };
  }
};