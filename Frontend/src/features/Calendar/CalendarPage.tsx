import { useMemo, useState } from "react";
import { useGroups } from "../../context/GroupsContext";
import { useEvents, EVENT_TYPES, TYPE_COLOR, TYPE_ICON, type AppEvent } from "../../context/EventContext";
import "./CalendarPage.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type EventFormState = Omit<AppEvent, "id">;

function fmt12(time: string) {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function createEmptyForm(date = ""): EventFormState {
  return {
    title: "",
    date,
    startTime: "",
    endTime: "",
    type: "study",
    for: "Me",
    description: "",
    location: "",
    groupId: null,
    groupName: null,
  };
}

export default function CalendarPage() {
  const { events, addEvent, editEvent, markDone, eventsError, loadingEvents } = useEvents();
  const { groups } = useGroups();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<AppEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | number | null>(null);
  const [form, setForm] = useState<EventFormState>(createEmptyForm());
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const groupOptions = useMemo(() => groups.map((group) => ({ id: String(group.id), name: group.name })), [groups]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((value) => value - 1);
      return;
    }

    setMonth((value) => value - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((value) => value + 1);
      return;
    }

    setMonth((value) => value + 1);
  }

  function dayStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function getEventsForDay(day: number) {
    return events
      .filter((event) => event.date === dayStr(day))
      .sort((left, right) => left.startTime.localeCompare(right.startTime));
  }

  function closeCreateModal() {
    setShowCreate(false);
    setEditMode(false);
    setEditingEventId(null);
    setFormError("");
  }

  function openCreate(day?: number) {
    setForm(createEmptyForm(day ? dayStr(day) : ""));
    setEditMode(false);
    setEditingEventId(null);
    setFormError("");
    setShowCreate(true);
  }

  function openEdit(event: AppEvent) {
    setForm({
      title: event.title,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      for: event.for,
      description: event.description,
      location: event.location,
      groupId: event.groupId ?? null,
      groupName: event.groupName ?? null,
    });
    setEditMode(true);
    setEditingEventId(event.id);
    setSelected(null);
    setFormError("");
    setShowCreate(true);
  }

  function getForSelectValue() {
    return form.groupId ? String(form.groupId) : "Me";
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date || !form.startTime) {
      setFormError("Title, date, and start time are required.");
      return;
    }

    try {
      setIsSaving(true);
      setFormError("");

      if (editMode && editingEventId !== null) {
        await editEvent({ ...form, id: editingEventId });
      } else {
        await addEvent(form);
      }

      closeCreateModal();
      setSelected(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save event.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMarkDone(eventId: string | number) {
    try {
      await markDone(eventId);
      if (selected?.id === eventId) {
        setSelected(null);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to update event.");
    }
  }

  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div className="cal-wrap">
      <div className="topbar">
        <div className="topbar-left"><h2>Calendar</h2></div>
        <div className="topbar-right">
          <button className="btn-primary" onClick={() => openCreate()}>+ Create Event</button>
        </div>
      </div>

      {eventsError && <div className="member-input-error">{eventsError}</div>}

      <div className="page-scroll">
        <div className="cal-nav">
          <button className="icon-btn" onClick={prevMonth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="url(#sg)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="cal-month-label">
            <span>{MONTHS[month]}</span>
            <span className="cal-year">{year}</span>
          </div>
          <button className="icon-btn" onClick={nextMonth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="url(#sg)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {loadingEvents && events.length === 0 ? (
          <div className="files-empty">Loading events...</div>
        ) : (
          <div className="cal-grid">
            {DAYS.map((day) => <div key={day} className="cal-day-header">{day}</div>)}
            {cells.map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isPast = day ? dayStr(day) < todayStr : false;

              return (
                <div
                  key={index}
                  className={`cal-cell ${!day ? "empty" : ""} ${day && isToday(day) ? "today" : ""} ${isPast ? "past" : ""}`}
                  onClick={() => day && !isPast && openCreate(day)}
                >
                  {day && (
                    <>
                      <span className="cal-date">{day}</span>
                      <div className="cal-events">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className="cal-event-chip"
                            style={{ borderLeftColor: TYPE_COLOR[event.type] }}
                            onClick={(clickEvent) => {
                              clickEvent.stopPropagation();
                              setSelected(event);
                            }}
                          >
                            <span style={{ color: TYPE_COLOR[event.type], fontSize: "10px" }}>{TYPE_ICON[event.type]}</span>
                            {fmt12(event.startTime)} {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && <div className="cal-more">+{dayEvents.length - 3}</div>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-box" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{editMode ? "Edit Event" : "Create Event"}</h3>
              <button className="icon-btn" onClick={closeCreateModal}>X</button>
            </div>

            <div className="field">
              <label>Title *</label>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Event title"
                autoFocus
              />
            </div>

            <div className="field">
              <label>Type</label>
              <div className="icon-picker">
                {EVENT_TYPES.map((typeOption) => (
                  <button
                    key={typeOption.value}
                    type="button"
                    className={`icon-chip ${form.type === typeOption.value ? "selected" : ""}`}
                    style={form.type === typeOption.value ? { borderColor: typeOption.color, background: `${typeOption.color}22`, color: typeOption.color, transform: "scale(1.15)" } : {}}
                    onClick={() => setForm({ ...form, type: typeOption.value })}
                    title={typeOption.value}
                  >
                    {typeOption.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Date *</label>
                <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
              </div>
              <div className="field">
                <label>For</label>
                <select
                  value={getForSelectValue()}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    if (nextValue === "Me") {
                      setForm({ ...form, for: "Me", groupId: null, groupName: null });
                      return;
                    }

                    const selectedGroup = groups.find((group) => String(group.id) === nextValue);
                    if (!selectedGroup) {
                      setForm({ ...form, for: "Me", groupId: null, groupName: null });
                      return;
                    }

                    setForm({
                      ...form,
                      for: selectedGroup.name,
                      groupId: String(selectedGroup.id),
                      groupName: selectedGroup.name,
                    });
                  }}
                >
                  <option value="Me">Just me</option>
                  {groupOptions.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Start Time *</label>
                <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
              </div>
              <div className="field">
                <label>End Time</label>
                <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} />
              </div>
            </div>

            <div className="field">
              <label>Location</label>
              <input
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                placeholder="Room, Discord, Zoom..."
              />
            </div>

            <div className="field">
              <label>Notes</label>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Optional..."
              />
            </div>

            {formError && <div className="member-input-error">{formError}</div>}

            <div className="modal-footer">
              <button className="btn-ghost" onClick={closeCreateModal}>Cancel</button>
              <button className="btn-primary" onClick={() => void handleSave()} disabled={isSaving}>
                {isSaving ? "Saving..." : editMode ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-event-header">
                <span className="modal-event-icon" style={{ color: TYPE_COLOR[selected.type] }}>{TYPE_ICON[selected.type]}</span>
                <h3>{selected.title}</h3>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}>X</button>
            </div>
            <div className="event-detail-list">
              {[
                { label: "Date", value: selected.date },
                { label: "Time", value: fmt12(selected.startTime) + (selected.endTime ? ` - ${fmt12(selected.endTime)}` : "") },
                { label: "For", value: selected.for },
                ...(selected.location ? [{ label: "Location", value: selected.location }] : []),
                ...(selected.description ? [{ label: "Notes", value: selected.description }] : []),
              ].map((row, index) => (
                <div key={index} className="event-detail-row">
                  <span className="event-detail-label">{row.label}</span>
                  <span className="event-detail-value">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-ghost btn-mark-done" onClick={() => void handleMarkDone(selected.id)}>Mark Done</button>
              <button className="btn-ghost" onClick={() => openEdit(selected)}>Edit</button>
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
