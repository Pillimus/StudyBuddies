import { requestJson } from './config';

export async function fetchGroups(params: { userId: string; email: string }) {
  const query = new URLSearchParams({
    userId: params.userId,
    email: params.email,
  });
  return requestJson<{ groups: any[] }>(`/api/groups?${query.toString()}`);
}

export async function createGroup(payload: {
  userId: string;
  email: string;
  name: string;
  color?: string;
  avatarUrl?: string;
  memberEmails: string[];
}) {
  return requestJson<{ group: any }>('/api/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function leaveGroup(groupId: number, payload: { userId: string; email: string }) {
  return requestJson<{ success: boolean }>(`/api/groups/${groupId}/leave`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
