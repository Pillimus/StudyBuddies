import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppEvent } from '../types';
import { INITIAL_EVENTS } from '../mockData';

export type { AppEvent };

export const EVENT_TYPES = [
  { value: 'group',    icon: '◈', color: '#a78bfa' },
  { value: 'study',    icon: '◎', color: '#2dd4d4' },
  { value: 'exam',     icon: '⚠', color: '#e05c7a' },
  { value: 'deadline', icon: '⏱', color: '#f0a050' },
];

export const TYPE_COLOR: Record<string, string> = Object.fromEntries(EVENT_TYPES.map(t => [t.value, t.color]));
export const TYPE_ICON:  Record<string, string> = Object.fromEntries(EVENT_TYPES.map(t => [t.value, t.icon]));

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
    return INITIAL_EVENTS.filter(e => e.date >= today);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const today = todayStr();
      setEvents(prev => prev.filter(e => e.date >= today));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  //TODO: API
  function addEvent(e: Omit<AppEvent, 'id'>) { setEvents(prev => [...prev, { ...e, id: Date.now() }]); }

  //TODO: API
  function editEvent(e: AppEvent) { setEvents(prev => prev.map(x => x.id === e.id ? e : x)); }

  //TODO: API
  function removeEvent(id: number) { setEvents(prev => prev.filter(x => x.id !== id)); }

  function markDone(id: number) { removeEvent(id); }

  return (
    <EventContext.Provider value={{ events, addEvent, editEvent, removeEvent, markDone }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() { return useContext(EventContext); }
