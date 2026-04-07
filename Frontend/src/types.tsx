export interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  mine: boolean;
}

export interface Chat {
  id: number;
  name: string;
  isGroup: boolean;
  isStudyGroup: boolean;
  createdBy: string;
  members: string[];
  color: string;
  messages: Message[];
  lastMsg: string;
}

export interface Member {
  username: string;
  isCreator?: boolean;
  color: string;
  avatarUrl?: string;
}

export interface Group {
  id: number;
  name: string;
  createdBy: string;
  color: string;
  avatarUrl?: string;
  members: Member[];
  events: { title: string; date: string; time: string }[];
}

export interface FileItem {
  id: number;
  name: string;
  type: string;
  size: string;
  group: string | null;
  uploaded: string;
  content?: string;
}

export interface Notification {
  id: number;
  text: string;
  time: string;
  type: string;
}

export interface AppEvent {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  for: string;
  description: string;
  location: string;
}
