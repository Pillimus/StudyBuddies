import { authFetch } from './authFetch';

export const uploadNote = async (file: File, title: string) => {
  try {
    const formData = new FormData();
    formData.append('note', file);
    formData.append('title', title);

    const res = await authFetch('http://study-buddies.me/api/notes/upload', {
      method: 'POST',
      body: formData
    });

    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error(err);
    return { error: 'Server error' };
  }
};

export const getNotes = async () => {
  try {
    const res = await authFetch('http://study-buddies.me/api/notes');
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error(err);
    return { error: 'Server error' };
  }
};

export const downloadNote = async (id: string) => {
  try {
    const res = await authFetch(`http://study-buddies.me/api/notes/${id}/download`);
    return res.blob();
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteNote = async (id: string) => {
  try {
    const res = await authFetch(`http://study-buddies.me/api/notes/${id}`, {
      method: 'DELETE'
    });
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    console.error(err);
    return { error: 'Server error' };
  }
};