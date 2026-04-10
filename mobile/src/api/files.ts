import { requestJson } from './config';

export async function fetchFiles(token: string) {
  return requestJson<any[]>('/api/notes', { token });
}

export async function uploadFileNote(
  token: string,
  payload: { title: string; filename: string; group?: string | null; content?: string },
) {
  return requestJson<{ note: any }>('/api/notes/upload', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteFileNote(token: string, noteId: string | number) {
  return requestJson<{ message: string }>(`/api/notes/${noteId}`, {
    method: 'DELETE',
    token,
  });
}
