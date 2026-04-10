import { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppBackground from '../components/AppBackground';
import MobileHeader from '../components/MobileHeader';
import { useData } from '../contexts/DataContext';
import type { AppEvent } from '../types';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const EVENT_TYPES = ['study', 'group', 'exam', 'assignment'] as const;
const TYPE_COLOR: Record<string, string> = {
  study: '#2dd4d4',
  group: '#a78bfa',
  exam: '#e05c7a',
  assignment: '#f0a050',
};
const TYPE_ICON: Record<string, string> = {
  study: '◎',
  group: '◈',
  exam: '⚠',
  assignment: '⏱',
};

function formatTime(time: string) {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function emptyForm() {
  return {
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'study',
    for: 'Me',
    description: '',
    location: '',
  };
}

export default function CalendarScreen() {
  const { events, groups, addEvent, editEvent, markEventDone } = useData();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<AppEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const current = useMemo(() => {
    const date = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return {
      month: date.getMonth(),
      year: date.getFullYear(),
      firstDay: date.getDay(),
      daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    };
  }, [monthOffset, today]);

  const cells = Array.from({ length: 35 }, (_, index) => {
    const dateNumber = index - current.firstDay + 1;
    return dateNumber > 0 && dateNumber <= current.daysInMonth ? dateNumber : null;
  });

  const dayStr = (day: number) =>
    `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const eventMap = new Map<number, AppEvent[]>();
  events.forEach(event => {
    const eventDate = new Date(`${event.date}T00:00:00`);
    if (eventDate.getMonth() === current.month && eventDate.getFullYear() === current.year) {
      const day = eventDate.getDate();
      eventMap.set(day, [...(eventMap.get(day) || []), event]);
    }
  });

  const openCreate = (day?: number) => {
    const nextDate = day ? dayStr(day) : '';
    if (nextDate && nextDate < todayStr) return;
    setForm({
      ...emptyForm(),
      date: nextDate,
      for: groups[0]?.name || 'Me',
    });
    setEditMode(false);
    setSelected(null);
    setShowCreate(true);
  };

  const openEdit = (event: AppEvent) => {
    setForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      for: event.for,
      description: event.description,
      location: event.location,
    });
    setEditMode(true);
    setSelected(event);
    setShowCreate(true);
  };

  const handleSave = () => {
    if (!form.title || !form.date || !form.startTime) return;

    if (editMode && selected) {
      editEvent({ ...form, id: selected.id });
    } else {
      addEvent(form);
    }

    setShowCreate(false);
    setSelected(null);
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <MobileHeader title="Calendar" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.monthBar}>
            <TouchableOpacity style={styles.arrowButton} onPress={() => setMonthOffset(value => value - 1)}>
              <Text style={styles.arrowText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{MONTHS[current.month]} {current.year}</Text>
            <TouchableOpacity style={styles.arrowButton} onPress={() => setMonthOffset(value => value + 1)}>
              <Text style={styles.arrowText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.daysRow}>
              {DAYS.map(day => (
                <Text key={day} style={styles.dayHeader}>{day}</Text>
              ))}
            </View>
            <View style={styles.grid}>
              {cells.map((cell, index) => {
                const cellEvents = cell ? eventMap.get(cell) || [] : [];
                const currentDayStr = cell ? dayStr(cell) : '';
                const isPast = cell ? currentDayStr < todayStr : false;
                const isToday =
                  cell === today.getDate() &&
                  current.month === today.getMonth() &&
                  current.year === today.getFullYear();

                return (
                  <TouchableOpacity
                    key={`${cell}-${index}`}
                    style={[styles.cell, cell === null && styles.emptyCell, isPast && styles.pastCell]}
                    activeOpacity={0.85}
                    disabled={cell === null}
                    onPress={() => (cell ? openCreate(cell) : undefined)}
                  >
                    {cell ? (
                      <>
                        <View style={[styles.dayChip, isToday && styles.todayChip]}>
                          <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>{cell}</Text>
                        </View>
                        {cellEvents.slice(0, 3).map(event => (
                          <TouchableOpacity
                            key={event.id}
                            style={styles.eventChip}
                            activeOpacity={0.85}
                            onPress={evt => {
                              evt.stopPropagation?.();
                              setSelected(event);
                            }}
                          >
                            <Text style={[styles.eventTypeTiny, { color: TYPE_COLOR[event.type] || '#78dce4' }]}>
                              {TYPE_ICON[event.type] || '◉'}
                            </Text>
                            <Text style={styles.eventChipText} numberOfLines={1}>
                              {formatTime(event.startTime)} {event.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {cellEvents.length > 3 ? (
                          <Text style={styles.moreEventsText}>+{cellEvents.length - 3} more</Text>
                        ) : null}
                      </>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={styles.floatingButton} activeOpacity={0.85} onPress={() => openCreate()}>
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal visible={showCreate} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCreate(false)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{editMode ? 'Edit Event' : 'Create Event'}</Text>

              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor="#6d7397"
                value={form.title}
                onChangeText={value => setForm(prev => ({ ...prev, title: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Date (YYYY-MM-DD)"
                placeholderTextColor="#6d7397"
                value={form.date}
                onChangeText={value => setForm(prev => ({ ...prev, date: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="Start Time (HH:MM)"
                placeholderTextColor="#6d7397"
                value={form.startTime}
                onChangeText={value => setForm(prev => ({ ...prev, startTime: value }))}
              />
              <TextInput
                style={styles.input}
                placeholder="End Time (HH:MM)"
                placeholderTextColor="#6d7397"
                value={form.endTime}
                onChangeText={value => setForm(prev => ({ ...prev, endTime: value }))}
              />
              <Text style={styles.fieldLabel}>For</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeRow}
              >
                {['Me', ...groups.map(group => group.name)].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.typeChip, form.for === option && styles.typeChipActive]}
                    onPress={() => setForm(prev => ({ ...prev, for: option }))}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.typeChipText, form.for === option && styles.typeChipTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.typeRow}>
                {EVENT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, form.type === type && styles.typeChipActive]}
                    onPress={() => setForm(prev => ({ ...prev, type }))}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.typeChipText, form.type === type && styles.typeChipTextActive]}>
                      {(TYPE_ICON[type] || '◉') + ' ' + type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Location"
                placeholderTextColor="#6d7397"
                value={form.location}
                onChangeText={value => setForm(prev => ({ ...prev, location: value }))}
              />
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Notes"
                placeholderTextColor="#6d7397"
                multiline
                value={form.description}
                onChangeText={value => setForm(prev => ({ ...prev, description: value }))}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalButton} onPress={handleSave} activeOpacity={0.85}>
                  <Text style={styles.modalButtonText}>{editMode ? 'Save Changes' : 'Create Event'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalGhostButton}
                  onPress={() => setShowCreate(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalGhostText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={Boolean(selected) && !showCreate} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelected(null)}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{selected?.title}</Text>
              {selected ? (
                <>
                  <Text style={[styles.modalLine, styles.modalTypeLine, { color: TYPE_COLOR[selected.type] || '#fff' }]}>
                    {TYPE_ICON[selected.type] || '◉'} {selected.type}
                  </Text>
                  <Text style={styles.modalLine}>Date: {selected.date}</Text>
                  <Text style={styles.modalLine}>
                    Time: {formatTime(selected.startTime)}
                    {selected.endTime ? ` - ${formatTime(selected.endTime)}` : ''}
                  </Text>
                  <Text style={styles.modalLine}>For: {selected.for}</Text>
                  {selected.location ? <Text style={styles.modalLine}>Location: {selected.location}</Text> : null}
                  {selected.description ? <Text style={styles.modalLine}>Notes: {selected.description}</Text> : null}
                </>
              ) : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    if (selected) markEventDone(selected.id);
                    setSelected(null);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalButtonText}>Mark Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalGhostButton}
                  onPress={() => {
                    if (selected) openEdit(selected);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalGhostText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 4, paddingBottom: 18 },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    gap: 10,
  },
  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#23254d',
    backgroundColor: 'rgba(16, 18, 41, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#796cff',
    fontSize: 18,
    fontWeight: '700',
  },
  monthLabel: {
    color: '#c5c8df',
    fontSize: 16,
    fontWeight: '700',
  },
  calendarCard: {
    backgroundColor: 'rgba(18, 17, 38, 0.9)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1d2144',
  },
  daysRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 19, 41, 0.9)',
  },
  dayHeader: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: '#4f5678',
    fontSize: 10,
    fontWeight: '800',
    paddingVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 80,
    padding: 5,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: '#151933',
  },
  emptyCell: {
    opacity: 0.35,
  },
  pastCell: {
    opacity: 0.5,
  },
  dayChip: {
    alignSelf: 'flex-start',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  todayChip: {
    backgroundColor: '#6f68f8',
  },
  dayNumber: {
    color: '#5e6488',
    fontSize: 10,
    fontWeight: '700',
  },
  todayNumber: {
    color: '#fff',
  },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d3356',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 3,
    gap: 3,
  },
  eventTypeTiny: {
    fontSize: 8,
    fontWeight: '800',
  },
  eventChipText: {
    color: '#9ea8d1',
    fontSize: 7,
    flex: 1,
  },
  moreEventsText: {
    color: '#7e86bc',
    fontSize: 8,
    fontWeight: '700',
  },
  floatingButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 16,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#6f68f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 32,
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
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2f3564',
    borderRadius: 12,
    backgroundColor: '#181833',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    color: '#c7cbe4',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  typeChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#303661',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  typeChipActive: {
    backgroundColor: '#2b2958',
    borderColor: '#7a74f7',
  },
  typeChipText: {
    color: '#aab1d5',
    textTransform: 'capitalize',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  modalLine: {
    color: '#c7cbe4',
    marginBottom: 8,
    lineHeight: 20,
  },
  modalTypeLine: {
    fontWeight: '800',
    textTransform: 'capitalize',
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
