import type { Chat, Group, FileItem, Notification, AppEvent } from '../types';

const todayStr = () => new Date().toISOString().slice(0, 10);

export const INITIAL_EVENTS: AppEvent[] = [
  {
    id: 1,
    title: 'COP 4331 Meeting',
    date: todayStr(),
    startTime: '14:00',
    endTime: '15:00',
    type: 'group',
    for: 'COP 4331',
    description: 'Discussion of the weekly project tasks.',
    location: 'Discord',
  },
  {
    id: 2,
    title: 'Study Time',
    date: todayStr(),
    startTime: '17:30',
    endTime: '19:00',
    type: 'study',
    for: 'COP 4331',
    description: 'Review chapters and practice problems.',
    location: 'Library',
  },
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 1,
    name: 'COP 4331',
    isGroup: true,
    isStudyGroup: true,
    createdBy: 'me',
    color: '#7c5cfc',
    members: ['me', 'Alex', 'Jordan'],
    lastMsg: 'See you there!',
    messages: [
      { id: 1, sender: 'Alex', text: 'Can you send the notes?', time: '2:10 PM', mine: false },
      { id: 2, sender: 'me', text: 'Yes, uploading now.', time: '2:12 PM', mine: true },
      { id: 3, sender: 'Jordan', text: 'Thanks!', time: '2:15 PM', mine: false },
    ],
  },
  {
    id: 2,
    name: 'Study Partner',
    isGroup: false,
    isStudyGroup: false,
    createdBy: 'me',
    color: '#3a7bd5',
    members: ['me', 'Taylor'],
    lastMsg: 'I really liked the walkthrough.',
    messages: [
      { id: 1, sender: 'Taylor', text: 'Ready for the quiz?', time: '1:30 PM', mine: false },
      { id: 2, sender: 'me', text: 'Almost, give me 5 mins.', time: '1:32 PM', mine: true },
      { id: 3, sender: 'Taylor', text: 'Cool.', time: '1:33 PM', mine: false },
    ],
  },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 1,
    name: 'COP 4331',
    createdBy: 'me',
    color: '#7c5cfc',
    avatarUrl: undefined,
    members: [
      { username: 'me', isCreator: true, color: '#5b8dee' },
      { username: 'Alex', color: '#3a7bd5' },
      { username: 'Jordan', color: '#2dd4d4' },
    ],
    events: [
      { title: 'Weekly meeting', date: 'Today', time: '4:00 PM' },
      { title: 'Problem set review', date: 'Apr 10', time: '1:00 PM' },
    ],
  },
];

export const MOCK_FILES: FileItem[] = [
  { id: 1, name: 'lecture-notes.pdf', type: 'pdf', size: '5.1 MB', group: 'COP 4331', uploaded: 'Today', content: 'Lecture notes for week 5.' },
  { id: 2, name: 'project-outline.docx', type: 'docx', size: '2.8 MB', group: null, uploaded: 'Apr 1', content: 'Project outline and milestones.' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, text: 'Alex sent you a message in COP 4331.', time: 'Just now', type: 'message' },
  { id: 2, text: 'You were added to COP 4331.', time: '2 hours ago', type: 'group' },
  { id: 3, text: 'Taylor started a chat.', time: '5 hours ago', type: 'chat' },
];
