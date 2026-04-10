import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { AppEvent, Chat, FileItem, Group, Message } from '../types';
import { INITIAL_CHATS } from '../data/mockData';
import { useAuth } from './AuthContext';
import { createGroup, fetchGroups, leaveGroup } from '../api/groups';
import { createEvent, deleteEvent, fetchEvents, updateEvent } from '../api/events';
import { deleteFileNote, fetchFiles, uploadFileNote } from '../api/files';
import { updateProfile } from '../api/profile';

interface DataState {
  events: AppEvent[];
  chats: Chat[];
  groups: Group[];
  files: FileItem[];
  addEvent: (event: Omit<AppEvent, 'id'>) => void;
  editEvent: (event: AppEvent) => void;
  markEventDone: (eventId: string | number) => void;
  addChatMessage: (chatId: number, message: Omit<Message, 'id'>) => void;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  removeGroup: (groupId: number) => void;
  createChat: (chat: Omit<Chat, 'id'>) => Chat;
  updateChat: (chat: Chat) => void;
  removeChat: (chatId: number) => void;
  updateProfileName: (displayName: string) => void;
  addFile: (file: Omit<FileItem, 'id' | 'uploaded'>) => void;
  removeFile: (fileId: string | number) => void;
  reloadRemoteData: () => Promise<void>;
}

const DataContext = createContext<DataState>({
  events: [],
  chats: [],
  groups: [],
  files: [],
  addEvent: () => {},
  editEvent: () => {},
  markEventDone: () => {},
  addChatMessage: () => {},
  addGroup: () => {},
  updateGroup: () => {},
  removeGroup: () => {},
  createChat: () => ({
    id: 0,
    name: '',
    isGroup: false,
    isStudyGroup: false,
    createdBy: '',
    members: [],
    color: '#7c5cfc',
    messages: [],
    lastMsg: '',
  }),
  updateChat: () => {},
  removeChat: () => {},
  updateProfileName: () => {},
  addFile: () => {},
  removeFile: () => {},
  reloadRemoteData: async () => {},
});

function formatDate(dateLike: string) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function formatTime(dateLike: string) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function mapEventFromApi(event: any): AppEvent {
  return {
    id: String(event._id),
    title: event.title || '',
    date: formatDate(event.startTime),
    startTime: formatTime(event.startTime),
    endTime: formatTime(event.endTime),
    type: event.eventType || 'study',
    for: event.subject || 'Me',
    description: event.description || '',
    location: event.location || '',
  };
}

function mapGroupFromApi(group: any): Group {
  return {
    id: group.GroupID,
    name: group.Name,
    createdBy: String(group.CreatedByUserId || ''),
    color: group.Color || '#7c5cfc',
    avatarUrl: group.AvatarUrl,
    members: (group.Members || []).map((member: any) => ({
      username: member.username || member.displayName || member.email || 'member',
      displayName: member.displayName || member.username,
      email: member.email,
      isCreator: Boolean(member.isCreator),
      color: member.color || '#5b8dee',
      avatarUrl: member.avatarUrl,
    })),
    events: (group.Events || []).map((event: any) => ({
      title: event.title || event.Title || '',
      date: event.date || event.Date || '',
      time: event.time || event.Time || '',
    })),
  };
}

function mapFileFromApi(note: any): FileItem {
  const uploadedAt = note.uploadedAt
    ? new Date(note.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Today';
  const extension = String(note.filename || note.title || 'txt').split('.').pop() || 'txt';
  return {
    id: String(note._id),
    name: note.filename || note.title || 'note.txt',
    type: extension.toLowerCase(),
    size: 'Stored',
    group: note.group || null,
    uploaded: uploadedAt,
    content: note.summary || '',
  };
}

function toEventPayload(event: Omit<AppEvent, 'id'> | AppEvent) {
  const start = new Date(`${event.date}T${event.startTime || '00:00'}:00`);
  const end = new Date(`${event.date}T${event.endTime || event.startTime || '00:00'}:00`);
  return {
    title: event.title,
    description: event.description,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    isAllDay: false,
    subject: event.for,
    location: event.location,
    eventType: event.type,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [groups, setGroups] = useState<Group[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const reloadRemoteData = async () => {
    if (!user || !token) {
      setEvents([]);
      setGroups([]);
      setFiles([]);
      setChats(INITIAL_CHATS);
      return;
    }

    const [groupResult, eventResult, fileResult] = await Promise.all([
      fetchGroups({ userId: user.id, email: user.email }),
      fetchEvents(token),
      fetchFiles(token),
    ]);

    setGroups((groupResult.groups || []).map(mapGroupFromApi));
    setEvents((eventResult || []).map(mapEventFromApi));
    setFiles((fileResult || []).map(mapFileFromApi));
    setChats(INITIAL_CHATS);
  };

  useEffect(() => {
    reloadRemoteData().catch(err => {
      console.warn('Failed to load remote mobile data:', err);
    });
  }, [user, token]);

  const addEvent = (event: Omit<AppEvent, 'id'>) => {
    const tempId = `temp-event-${Date.now()}`;
    const tempEvent = { ...event, id: tempId };
    setEvents(prev => [...prev, tempEvent]);

    if (!token) return;

    createEvent(token, toEventPayload(event))
      .then(response => {
        setEvents(prev => prev.map(item => (item.id === tempId ? mapEventFromApi(response.event) : item)));
      })
      .catch(err => {
        console.warn('Unable to create event:', err);
        setEvents(prev => prev.filter(item => item.id !== tempId));
      });
  };

  const editEvent = (updatedEvent: AppEvent) => {
    const previousEvents = events;
    setEvents(prev => prev.map(event => (event.id === updatedEvent.id ? updatedEvent : event)));

    if (!token) return;

    updateEvent(token, updatedEvent.id, toEventPayload(updatedEvent)).catch(err => {
      console.warn('Unable to update event:', err);
      setEvents(previousEvents);
    });
  };

  const markEventDone = (eventId: string | number) => {
    const previousEvents = events;
    setEvents(prev => prev.filter(event => event.id !== eventId));

    if (!token) return;

    deleteEvent(token, eventId).catch(err => {
      console.warn('Unable to delete event:', err);
      setEvents(previousEvents);
    });
  };

  const addChatMessage = (chatId: number, message: Omit<Message, 'id'>) => {
    setChats(prev =>
      prev.map(chat =>
        chat.id !== chatId
          ? chat
          : {
              ...chat,
              messages: [...chat.messages, { ...message, id: Date.now() }],
              lastMsg: message.text,
            },
      ),
    );
  };

  const addGroup = (group: Group) => {
    setGroups(prev => [group, ...prev]);

    if (!user) return;

    createGroup({
      userId: user.id,
      email: user.email,
      name: group.name,
      color: group.color,
      avatarUrl: group.avatarUrl,
      memberEmails: group.members.map(member => member.email).filter(Boolean) as string[],
    })
      .then(response => {
        const nextGroup = mapGroupFromApi(response.group);
        setGroups(prev => prev.map(item => (item.id === group.id ? nextGroup : item)));
      })
      .catch(err => {
        console.warn('Unable to create group:', err);
      });
  };

  const updateGroup = (updatedGroup: Group) => {
    setGroups(prev => prev.map(group => (group.id === updatedGroup.id ? updatedGroup : group)));
  };

  const removeGroup = (groupId: number) => {
    const previousGroups = groups;
    setGroups(prev => prev.filter(group => group.id !== groupId));

    if (!user) return;

    leaveGroup(groupId, { userId: user.id, email: user.email }).catch(err => {
      console.warn('Unable to leave group:', err);
      setGroups(previousGroups);
    });
  };

  const createChat = (chat: Omit<Chat, 'id'>) => {
    const nextChat = { ...chat, id: Date.now() };
    setChats(prev => [nextChat, ...prev]);
    return nextChat;
  };

  const updateChat = (updatedChat: Chat) => {
    setChats(prev => prev.map(chat => (chat.id === updatedChat.id ? updatedChat : chat)));
  };

  const removeChat = (chatId: number) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const updateProfileName = (displayName: string) => {
    setGroups(prev =>
      prev.map(group => ({
        ...group,
        members: group.members.map(member =>
          member.email === user?.email || member.username === 'me' || member.username === 'you'
            ? { ...member, displayName, username: displayName }
            : member,
        ),
      })),
    );

    setChats(prev =>
      prev.map(chat => ({
        ...chat,
        members: chat.members.map(member => (member === 'me' || member === 'you' ? displayName : member)),
        messages: chat.messages.map(message =>
          message.sender === 'me' || message.sender === 'you'
            ? { ...message, sender: displayName }
            : message,
        ),
      })),
    );

    if (!user) return;

    updateProfile({
      userId: user.id,
      email: user.email,
      displayName,
      avatarUrl: user.avatarUrl || '',
      avatarColor: user.avatarColor,
    }).catch(err => {
      console.warn('Unable to update profile:', err);
    });
  };

  const addFile = (file: Omit<FileItem, 'id' | 'uploaded'>) => {
    const tempId = `temp-file-${Date.now()}`;
    const tempFile = { ...file, id: tempId, uploaded: 'Today' };
    setFiles(prev => [tempFile, ...prev]);

    if (!token) return;

    uploadFileNote(token, {
      title: file.name,
      filename: file.name,
      group: file.group,
      content: file.content,
    })
      .then(response => {
        setFiles(prev => prev.map(item => (item.id === tempId ? mapFileFromApi(response.note) : item)));
      })
      .catch(err => {
        console.warn('Unable to upload file:', err);
        setFiles(prev => prev.filter(item => item.id !== tempId));
      });
  };

  const removeFile = (fileId: string | number) => {
    const previousFiles = files;
    setFiles(prev => prev.filter(file => file.id !== fileId));

    if (!token) return;

    deleteFileNote(token, fileId).catch(err => {
      console.warn('Unable to delete file:', err);
      setFiles(previousFiles);
    });
  };

  const value = useMemo(
    () => ({
      events,
      chats,
      groups,
      files,
      addEvent,
      editEvent,
      markEventDone,
      addChatMessage,
      addGroup,
      updateGroup,
      removeGroup,
      createChat,
      updateChat,
      removeChat,
      updateProfileName,
      addFile,
      removeFile,
      reloadRemoteData,
    }),
    [events, chats, groups, files, user, token],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
