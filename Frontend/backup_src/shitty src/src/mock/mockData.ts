/* ============================================================
ALL placeholder data is here for now
When the API is ready, replace each export with a fetch call
============================================================*/

import type { AppEvent } from '../context/EventContext';

//HELPERS
const todayStr = () => new Date().toISOString().slice(0, 10);
const addDays  = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

//EVENTS
export const MOCK_EVENTS: Omit<AppEvent, 'id'>[] = [
  { title: 'Group Thing',     date: todayStr(), startTime: '14:00', endTime: '15:00', type: 'group',    for: 'COP 4331',  description: 'Sprint planning', location: 'Discord'  },
  { title: 'Study Thing',              date: todayStr(), startTime: '17:30', endTime: '19:00', type: 'study',    for: 'COP 4331',  description: '',               location: 'Library'  },
  { title: 'Exam Thing',       date: addDays(1), startTime: '10:00', endTime: '12:00', type: 'exam',     for: 'Me',        description: '',               location: 'Home'     },
  { title: 'Deadline Thing',        date: addDays(3), startTime: '23:59', endTime: '',      type: 'deadline', for: 'Chem Group', description: '',              location: ''         },
];

//NOTIFICATIONS
export interface MockNotification {
  id:   number;
  text: string;
  time: string;
  type: 'message' | 'group' | 'chat';
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 1, text: 'alexr sent you a message',                    time: 'Just now',    type: 'message' },
  { id: 2, text: 'morganl added you to ML Study',               time: '2 hours ago', type: 'group'   },
  { id: 3, text: 'jordank added you to "Weekend grind" chat',   time: '5 hours ago', type: 'chat'    },
];

//GROUPS
export interface MockMember {
  username:   string;
  isCreator?: boolean;
  color:      string;
  avatarUrl?: string;
}

export interface MockGroup {
  id:        number;
  name:      string;
  createdBy: string;
  color:     string;
  avatarUrl?: string;
  members:   MockMember[];
  events:    { title: string; date: string; time: string }[];
}

export const MOCK_GROUPS: MockGroup[] = [
  {
    id: 1, name: 'COP 4331', createdBy: 'you', color: '#7c5cfc',
    members: [
      { username: 'you',     isCreator: true, color: '#5b8dee' },
      { username: 'alexr',                    color: '#3a7bd5' },
      { username: 'jordank',                  color: '#2dd4d4' },
      { username: 'samt',                     color: '#e05c7a' },
    ],
    events: [
      { title: 'Group Meeting',      date: 'Today',  time: '2:00 PM' },
      { title: 'Final Presentation', date: 'Apr 10', time: '1:00 PM' },
    ],
  },
  {
    id: 2, name: 'ML Study', createdBy: 'morganl', color: '#2dd4d4',
    members: [
      { username: 'you',     color: '#5b8dee' },
      { username: 'morganl', isCreator: true, color: '#a78bfa' },
    ],
    events: [{ title: 'ML Final Review', date: 'Today', time: '5:30 PM' }],
  },
  {
    id: 3, name: 'Calculus 3', createdBy: 'chrisp', color: '#3ecf8e',
    members: [
      { username: 'you',    color: '#5b8dee' },
      { username: 'chrisp', isCreator: true, color: '#3ecf8e' },
      { username: 'danaw',  color: '#f0a050' },
    ],
    events: [{ title: 'Exam Prep', date: 'Tomorrow', time: '10:00 AM' }],
  },
];

//CHATS
export interface MockMessage {
  id:     number;
  sender: string;
  text:   string;
  time:   string;
  mine:   boolean;
}

export interface MockChat {
  id:           number;
  name:         string;
  isGroup:      boolean;
  isStudyGroup: boolean;
  createdBy:    string;
  members:      string[];
  color:        string;
  messages:     MockMessage[];
  lastMsg:      string;
}

export const MOCK_CHATS: MockChat[] = [
  {
    id: 1, name: 'COP 4331', isGroup: true, isStudyGroup: true,
    createdBy: 'alexr', color: '#7c5cfc',
    members: ['alexr', 'jordank', 'samt'],
    lastMsg: 'Are you joining the meeting?',
    messages: [
      { id: 1, sender: 'alexr',   text: 'Hey everyone ready for tomorrow?',       time: '2:10 PM', mine: false },
      { id: 2, sender: 'you',     text: 'Yeah I finished my part',                time: '2:12 PM', mine: true  },
      { id: 3, sender: 'jordank', text: 'Same. Are you joining the meeting?',     time: '2:15 PM', mine: false },
    ],
  },
  {
    id: 2, name: 'alexr', isGroup: false, isStudyGroup: false,
    createdBy: 'you', color: '#3a7bd5',
    members: ['alexr'],
    lastMsg: 'Sure give me a sec',
    messages: [
      { id: 1, sender: 'alexr', text: 'Hey can you send the notes from today?', time: '1:30 PM', mine: false },
      { id: 2, sender: 'you',   text: 'Sure give me a sec',                      time: '1:32 PM', mine: true  },
    ],
  },
];

//FILES
export interface MockFile {
  id:       number;
  name:     string;
  type:     string;
  size:     string;
  group:    string | null;
  uploaded: string;
  content?: string;
}

export const MOCK_FILES: MockFile[] = [
  {
    id: 1, name: 'sprint-planning.pdf', type: 'pdf', size: '1.2 MB',
    group: 'COP 4331', uploaded: 'Today',
    content: 'Sprint planning notes.\n\nGoals:\n• Complete login flow\n• Set up MongoDB\n• Deploy to droplet',
  },
  {
    id: 2, name: 'ml-notes-ch8.docx', type: 'docx', size: '340 KB',
    group: 'ML Study', uploaded: 'Yesterday',
    content: 'Chapter 8 Notes: Neural Networks\n\nKey concepts:\n- Backpropagation\n- Activation functions',
  },
  {
    id: 3, name: 'calc3-practice.pdf', type: 'pdf', size: '2.8 MB',
    group: null, uploaded: 'Apr 1',
    content: 'Practice problems for Calculus 3 final.\n\nTopics: Surface integrals, Stokes theorem.',
  },
  {
    id: 4, name: 'lecture-notes.txt', type: 'txt', size: '12 KB',
    group: 'COP 4331', uploaded: 'Mar 30',
    content: 'Lecture Notes - March 30\n\nTopics: React state management, Context API, useEffect cleanup.',
  },
];

//GROUP FILTER TABS
export const FILE_GROUP_FILTERS = ['All Files', 'COP 4331', 'ML Study', 'Calculus 3', 'Chem Group', 'Personal'];
export const CALENDAR_GROUPS    = ['COP 4331', 'ML Study', 'Calculus 3', 'Chem Group'];
