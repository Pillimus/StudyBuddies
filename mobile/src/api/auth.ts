import type { UserProfile } from '../types';
import { requestJson } from './config';

export interface AuthResponse extends UserProfile {
  firstName?: string;
  lastName?: string;
  token: string;
}

export async function login(email: string, password: string) {
  return requestJson<AuthResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(email: string, password: string, firstName: string, lastName: string) {
  return requestJson<{ error: string }>('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: firstName, lastName }),
  });
}

export async function sendForgotPassword(email: string) {
  return requestJson<{ message: string }>('/api/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
