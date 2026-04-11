import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MOCK_EVENTS } from '../mock/mockData';

export const EVENT_TYPES = [
  { value: 'group',    icon: '◈', color: '#a78bfa' },
  { value: 'study',    icon: '◎', color: '#2dd4d4' },
  { value: 'exam',     icon: '⚠', color: '#e05c7a' },
  { value: 'deadline', icon: '⏱', color: '#f0a050' },
];

export const TYPE_COLOR: Record<string, string> = Object.fromEntries(EVENT_TYPES.map(t => [t.value, t.color]));
export const TYPE_ICON:  Record<string, string> = Object.fromEntries(EVENT_TYPES.map(t => [t.value, t.icon]));

export interface AppEvent {
  id:          number;
  title:       string;
  date:        string;
  startTime:   string;
  endTime:     string;
  type:        string;
  for:         string;
  description: string;
  location:    string;
}

const todayStr = () => new Date().toISOString().slice(0, 10);

interface EventCtx {
  events:      AppEvent[];
  addEvent:    (e: Omit<AppEvent, 'id'>) => void;
  editEvent:   (e: AppEvent)             => void;
  removeEvent: (id: number)              => void;
  markDone:    (id: number)              => void;
}

const EventContext = createContext<EventCtx>({
  events: [], addEvent: () => {}, editEvent: () => {}, removeEvent: () => {}, markDone: () => {},
});

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>(() => {
    const today = todayStr();
    // Give each mock event a unique id, filter out past events
    return MOCK_EVENTS
      .map((e, i) => ({ ...e, id: i + 1 }))
      .filter(e => e.date >= today);
  });

  // Auto-remove events whose date has passed (checked every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = todayStr();
      setEvents(prev => prev.filter(e => e.date >= today));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  function addEvent(e: Omit<AppEvent, 'id'>)  { setEvents(prev => [...prev, { ...e, id: Date.now() }]); }
  function editEvent(e: AppEvent)              { setEvents(prev => prev.map(x => x.id === e.id ? e : x)); }
  function removeEvent(id: number)             { setEvents(prev => prev.filter(x => x.id !== id)); }
  function markDone(id: number)                { removeEvent(id); }

  return (
    <EventContext.Provider value={{ events, addEvent, editEvent, removeEvent, markDone }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() { return useContext(EventContext); }
