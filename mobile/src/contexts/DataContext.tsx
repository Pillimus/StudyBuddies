import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import type { AppEvent, Chat, FileItem, Group, Message } from '../types';
import { INITIAL_CHATS, INITIAL_EVENTS, INITIAL_GROUPS, MOCK_FILES } from '../data/mockData';
import { useAuth } from './AuthContext';

interface DataState {
  events: AppEvent[];
  chats: Chat[];
  groups: Group[];
  files: FileItem[];
  addEvent: (event: Omit<AppEvent, 'id'>) => void;
  editEvent: (event: AppEvent) => void;
  markEventDone: (eventId: number) => void;
  addChatMessage: (chatId: number, message: Omit<Message, 'id'>) => void;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  removeGroup: (groupId: number) => void;
  createChat: (chat: Omit<Chat, 'id'>) => Chat;
  updateChat: (chat: Chat) => void;
  removeChat: (chatId: number) => void;
  updateProfileName: (displayName: string) => void;
  addFile: (file: Omit<FileItem, 'id' | 'uploaded'>) => void;
  removeFile: (fileId: number) => void;
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
});

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<AppEvent[]>(INITIAL_EVENTS);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.id ?? null;

    if (currentUserId !== previousUserId.current) {
      setEvents(INITIAL_EVENTS);
      setChats(INITIAL_CHATS);
      setGroups(INITIAL_GROUPS);
      setFiles(MOCK_FILES);
    }

    previousUserId.current = currentUserId;
  }, [user]);

  const addEvent = (event: Omit<AppEvent, 'id'>) => {
    setEvents(prev => [...prev, { ...event, id: Date.now() }]);
  };

  const editEvent = (updatedEvent: AppEvent) => {
    setEvents(prev => prev.map(event => (event.id === updatedEvent.id ? updatedEvent : event)));
  };

  const markEventDone = (eventId: number) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
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
    setGroups(prev => [...prev, group]);
  };

  const updateGroup = (updatedGroup: Group) => {
    setGroups(prev => prev.map(group => (group.id === updatedGroup.id ? updatedGroup : group)));
  };

  const removeGroup = (groupId: number) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
    setChats(prev => prev.filter(chat => !(chat.isStudyGroup && chat.name === groups.find(group => group.id === groupId)?.name)));
    setFiles(prev => prev.filter(file => file.group !== groups.find(group => group.id === groupId)?.name));
    setEvents(prev => prev.filter(event => event.for !== groups.find(group => group.id === groupId)?.name));
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
          member.username === 'me' || member.username === 'you'
            ? {
                ...member,
                displayName,
                username: member.username,
              }
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
  };

  const addFile = (file: Omit<FileItem, 'id' | 'uploaded'>) => {
    setFiles(prev => [
      { ...file, id: Date.now(), uploaded: 'Today' },
      ...prev,
    ]);
  };

  const removeFile = (fileId: number) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
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
    }),
    [events, chats, groups, files],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
