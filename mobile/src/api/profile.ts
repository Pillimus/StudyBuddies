import type { UserProfile } from '../types';
import { requestJson } from './config';

export async function updateProfile(payload: {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  avatarColor?: string;
}) {
  return requestJson<UserProfile>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
