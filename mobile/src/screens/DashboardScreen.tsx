import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import { BellIcon, CalendarSmallIcon, MessageCircleIcon } from '../components/AppSvgIcons';
import MobileHeader from '../components/MobileHeader';
import { useData } from '../contexts/DataContext';
import { MOCK_NOTIFICATIONS } from '../data/mockData';
import type { AppEvent } from '../types';

function eventTypeSymbol(type: string) {
  switch (type) {
    case 'group':
      return '◈';
    case 'study':
      return '◎';
    case 'exam':
      return '⚠';
    case 'assignment':
    case 'deadline':
      return '⏱';
    default:
      return '◉';
  }
}

function eventTypeColor(type: string) {
  switch (type) {
    case 'group':
      return '#a78bfa';
    case 'study':
      return '#2dd4d4';
    case 'exam':
      return '#e05c7a';
    case 'assignment':
    case 'deadline':
      return '#f0a050';
    default:
      return '#8e6fff';
  }
}

function notificationSymbol(type: string) {
  if (type === 'message') return <MessageCircleIcon size={15} color="#a78bfa" />;
  if (type === 'group') return eventTypeSymbol('group');
  return <BellIcon size={15} color="#a78bfa" />;
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function dayLabel(date: string) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().slice(0, 10);

  if (date === today) return 'Today';
  if (date === tomorrow) return 'Tomorrow';

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

function HeaderBadge({
  kind,
  count,
  onPress,
}: {
  kind: 'bell' | 'calendar';
  count: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.headerBadge} onPress={onPress} activeOpacity={0.85}>
      {kind === 'bell' ? <BellIcon size={18} gradient /> : <CalendarSmallIcon size={18} gradient />}
      {count > 0 ? (
        <View style={styles.headerBadgeDot}>
          <Text style={styles.headerBadgeCount}>{count}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

function EventDetailModal({
  event,
  onClose,
  onMarkDone,
}: {
  event: AppEvent | null;
  onClose: () => void;
  onMarkDone: (eventId: string | number) => void;
}) {
  if (!event) return null;

  return (
    <Modal visible transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          <View style={styles.modalTitleRow}>
            <Text style={[styles.modalEventIcon, { color: eventTypeColor(event.type) }]}>
              {eventTypeSymbol(event.type)}
            </Text>
            <Text style={styles.modalTitle}>{event.title}</Text>
          </View>
          <Text style={styles.modalLine}>Date: {dayLabel(event.date)}</Text>
          <Text style={styles.modalLine}>
            Time: {formatTime(event.startTime)}
            {event.endTime ? ` - ${formatTime(event.endTime)}` : ''}
          </Text>
          <Text style={styles.modalLine}>For: {event.for}</Text>
          {event.location ? <Text style={styles.modalLine}>Location: {event.location}</Text> : null}
          {event.description ? <Text style={styles.modalLine}>Notes: {event.description}</Text> : null}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                onMarkDone(event.id);
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>Mark Done</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalGhostButton} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.modalGhostText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function DashboardScreen() {
  const { events, groups, chats, markEventDone } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTodos, setShowTodos] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
      ),
    [events],
  );

  const today = new Date().toISOString().slice(0, 10);
  const in7 = new Date();
  in7.setDate(in7.getDate() + 7);
  const in7Str = in7.toISOString().slice(0, 10);

  const todoEvents = sortedEvents.filter(event => event.date >= today && event.date <= in7Str);

  const stats = [
    { value: sortedEvents.length, label: 'Upcoming Events' },
    { value: groups.length + 3, label: 'Study Groups' },
    { value: chats.length - 1 || 1, label: 'Unread Messages' },
    { value: todoEvents.length, label: 'Due This Week' },
  ];

  return (
    <AppBackground>
      <View style={styles.container}>
        <MobileHeader
          title="Dashboard"
          rightContent={
            <>
              <HeaderBadge
                kind="bell"
                count={MOCK_NOTIFICATIONS.length}
                onPress={() => {
                  setShowNotifications(value => !value);
                  setShowTodos(false);
                }}
              />
              <HeaderBadge
                kind="calendar"
                count={todoEvents.length}
                onPress={() => {
                  setShowTodos(value => !value);
                  setShowNotifications(false);
                }}
              />
            </>
          }
        />

        <ScrollView contentContainerStyle={styles.content}>
          {showNotifications ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Notifications</Text>
              {MOCK_NOTIFICATIONS.map(notification => (
                <View key={notification.id} style={styles.panelItem}>
                  <View style={styles.panelItemRow}>
                    <View style={styles.panelItemIcon}>
                      {typeof notificationSymbol(notification.type) === 'string' ? (
                        <Text style={styles.panelItemIconText}>{notificationSymbol(notification.type)}</Text>
                      ) : (
                        notificationSymbol(notification.type)
                      )}
                    </View>
                    <View style={styles.panelItemContent}>
                      <Text style={styles.panelItemText}>{notification.text}</Text>
                      <Text style={styles.panelItemTime}>{notification.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {showTodos ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>This Week</Text>
              {todoEvents.length === 0 ? (
                <Text style={styles.panelEmpty}>Nothing due this week</Text>
              ) : (
                todoEvents.map(event => (
                  <View key={event.id} style={styles.todoRow}>
                    <Text style={[styles.todoIcon, { color: eventTypeColor(event.type) }]}>
                      {eventTypeSymbol(event.type)}
                    </Text>
                    <View style={styles.todoTextWrap}>
                      <Text style={styles.todoTitle}>{event.title}</Text>
                      <Text style={styles.todoMeta}>
                        {dayLabel(event.date)} · {formatTime(event.startTime)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.todoDoneButton}
                      onPress={() => markEventDone(event.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.todoDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          ) : null}

          {stats.map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}

          <Text style={styles.sectionLabel}>UPCOMING EVENTS</Text>
          <Text style={styles.subSectionLabel}>TODAY</Text>

          {sortedEvents.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <Text style={[styles.eventTypeIcon, { color: eventTypeColor(event.type) }]}>
                  {eventTypeSymbol(event.type)}
                </Text>
                <TouchableOpacity style={styles.eventInfo} onPress={() => setSelectedEvent(event)} activeOpacity={0.85}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventCourse}>{event.for}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.eventTime}>{formatTime(event.startTime)}</Text>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => markEventDone(event.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.doneButtonText}>✓ Mark As Done</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onMarkDone={markEventDone}
        />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 10, paddingBottom: 32 },
  headerBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2d57',
    backgroundColor: 'rgba(18, 20, 44, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  headerBadgeDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 15,
    height: 15,
    borderRadius: 999,
    backgroundColor: '#6e68ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerBadgeCount: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  panel: {
    backgroundColor: 'rgba(19, 19, 43, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#22274b',
    padding: 14,
    marginBottom: 12,
  },
  panelTitle: {
    color: '#dcdcf3',
    fontWeight: '800',
    marginBottom: 10,
  },
  panelItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#171a36',
  },
  panelItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  panelItemIcon: {
    width: 18,
    height: 18,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelItemIconText: {
    color: '#a78bfa',
    fontSize: 16,
  },
  panelItemContent: {
    flex: 1,
  },
  panelItemText: {
    color: '#bec4e7',
    lineHeight: 20,
  },
  panelItemTime: {
    color: '#5f678d',
    marginTop: 4,
    fontSize: 12,
  },
  panelEmpty: {
    color: '#72799d',
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 10,
  },
  todoIcon: {
    fontSize: 15,
  },
  todoTextWrap: {
    flex: 1,
  },
  todoTitle: {
    color: '#dfe3f5',
    fontWeight: '700',
  },
  todoMeta: {
    color: '#70779c',
    marginTop: 4,
    fontSize: 12,
  },
  todoDoneButton: {
    borderWidth: 1,
    borderColor: '#375f75',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  todoDoneText: {
    color: '#73cfe2',
    fontSize: 12,
    fontWeight: '700',
  },
  statCard: {
    backgroundColor: 'rgba(18, 17, 38, 0.92)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1d2344',
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  statValue: {
    color: '#9ac0ff',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: '#495170',
    marginTop: 8,
    fontWeight: '700',
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 16,
    color: '#6f7dff',
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: '800',
  },
  subSectionLabel: {
    color: '#5f698c',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: 'rgba(19, 19, 43, 0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2348',
    padding: 14,
    marginBottom: 10,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventTypeIcon: {
    fontSize: 16,
    marginRight: 10,
    paddingTop: 2,
  },
  eventInfo: { flex: 1 },
  eventTitle: { color: '#d8d8ec', fontWeight: '700', fontSize: 16 },
  eventCourse: { color: '#4c5276', marginTop: 4, fontWeight: '700', fontSize: 12 },
  eventTime: { color: '#bcc0d9', marginTop: 14, marginBottom: 10, fontSize: 13 },
  doneButton: {
    borderWidth: 1,
    borderColor: '#375f75',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#73cfe2',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2,4,14,0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#121126',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2b2e5f',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  modalEventIcon: {
    fontSize: 20,
  },
  modalLine: {
    color: '#c7cbe4',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#7a74f7',
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalGhostButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#313566',
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalGhostText: {
    color: '#c8cdee',
    fontWeight: '700',
  },
});
