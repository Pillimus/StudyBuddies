import { useState, useRef, useEffect } from 'react';
import { MOCK_CHATS, MockChat, MockMessage, AVATAR_COLORS } from '../../mock/mockData';
import './ChatsPage.css';

// Re-export so mockData can use the type without circular imports
export type { MockChat, MockMessage };

const ME = 'you';

function Avatar({ letter, color, size = 38, square = false }: { letter: string; color: string; size?: number; square?: boolean }) {
  return (
    <div
      className="chat-avatar"
      style={{
        width: size, height: size,
        borderRadius: square ? `${Math.round(size * 0.28)}px` : '50%',
        background: `linear-gradient(135deg, ${color}, ${color}88)`,
        fontSize: size > 38 ? '1.1rem' : '0.82rem',
      }}
    >
      {letter}
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="color-picker-row">
      {AVATAR_COLORS.map(c => (
        <button
          key={c} type="button"
          className={`color-swatch ${value === c ? 'active' : ''}`}
          style={{ background: c, boxShadow: value === c ? `0 0 8px ${c}` : 'none' }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
}

function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChatsPage() {
  const [chats,       setChats]       = useState<MockChat[]>(MOCK_CHATS);
  const [active,      setActive]      = useState<MockChat>(MOCK_CHATS[0]);
  const [input,       setInput]       = useState('');
  const [showNew,     setShowNew]     = useState(false);
  const [newUsers,    setNewUsers]    = useState('');
  const [chatName,    setChatName]    = useState('');
  const [newColor,    setNewColor]    = useState(AVATAR_COLORS[0]);
  const [showInfo,    setShowInfo]    = useState(false);
  const [showPicEdit, setShowPicEdit] = useState(false);
  const [editColor,   setEditColor]   = useState('');
  const [addInput,    setAddInput]    = useState('');
  const [showLeave,   setShowLeave]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [active.id, active.messages.length]);

  function syncActive(updated: MockChat) {
    setChats(prev => prev.map(c => c.id === active.id ? updated : c));
    setActive(updated);
  }

  function sendMessage() {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const msg: MockMessage = { id: Date.now(), sender: 'you', text: input.trim(), time: now, mine: true };
    syncActive({ ...active, messages: [...active.messages, msg], lastMsg: input.trim() });
    setInput('');
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function createChat() {
    const users = newUsers.split(',').map(s => s.trim()).filter(Boolean);
    if (!users.length) return;
    const isGroup = users.length > 1;
    const name = isGroup ? (chatName.trim() || users.join(', ')) : users[0];
    const newChat: MockChat = { id: Date.now(), name, isGroup, isStudyGroup: false, createdBy: ME, members: users, color: newColor, messages: [], lastMsg: '' };
    setChats(prev => [newChat, ...prev]);
    setActive(newChat);
    setShowNew(false); setNewUsers(''); setChatName(''); setNewColor(AVATAR_COLORS[0]);
  }

  function leaveOrClose() {
    setChats(prev => prev.filter(c => c.id !== active.id));
    const remaining = chats.filter(c => c.id !== active.id);
    if (remaining.length) setActive(remaining[0]);
    setShowLeave(false); setShowInfo(false);
  }

  function addMember(username: string) {
    if (!username.trim()) return;
    const u = username.trim();
    if (active.members.includes(u)) return;
    syncActive({ ...active, members: [...active.members, u] });
    setAddInput('');
  }

  function removeMember(username: string) {
    syncActive({ ...active, members: active.members.filter(m => m !== username) });
  }

  const canEditPic       = !active.isStudyGroup && active.isGroup;
  const canManageMembers = !active.isStudyGroup && active.createdBy === ME;
  const leaveLabel       = active.isGroup ? 'Leave Chat' : 'Close DM';
  const multipleUsers    = newUsers.split(',').filter(s => s.trim()).length > 1;

  return (
    <div className="chats-wrap">
      <div className="chats-list">
        <div className="chats-list-header">
          <div className="section-title chats-title">Messages</div>
          <button className="icon-btn" title="New chat" onClick={() => setShowNew(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`chat-row ${active.id === chat.id ? 'active' : ''}`}
            onClick={() => { setActive(chat); setShowInfo(false); }}
          >
            <Avatar letter={chat.name[0].toUpperCase()} color={chat.color} size={38} />
            <div className="chat-row-info">
              <div className="chat-row-name">{chat.name}</div>
              <div className="chat-row-last">{chat.lastMsg || 'No messages yet'}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-window">
        <div className="chat-window-header" onClick={() => setShowInfo(!showInfo)}>
          <Avatar letter={active.name[0].toUpperCase()} color={active.color} size={36} />
          <div className="chat-window-title-block">
            <div className="chat-window-name">{active.name}</div>
            <div className="chat-window-sub">
              {active.isStudyGroup ? 'Study group chat' : active.isGroup ? `${active.members.length + 1} members` : 'Direct message'}
              {' · '}
              <span className="expand-hint">expand for info</span>
            </div>
          </div>
          <button className="icon-btn leave-btn" onClick={e => { e.stopPropagation(); setShowLeave(true); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {showInfo && (
          <div className="chat-info-panel">
            <div className="chat-info-top">
              <div className="chat-info-avatar-wrap">
                <Avatar letter={active.name[0].toUpperCase()} color={active.color} size={52} />
                {canEditPic && (
                  <button className="avatar-edit-btn" onClick={() => { setEditColor(active.color); setShowPicEdit(true); }}>✎</button>
                )}
              </div>
              <div>
                <div className="chat-info-name">{active.name}</div>
                <div className="chat-info-sub">
                  {active.isGroup ? `${active.members.length + 1} members` : 'Direct message'}
                  {active.isStudyGroup && ' · Study group chat'}
                </div>
              </div>
            </div>

            {active.isGroup && (
              <>
                <div className="section-title">Members</div>
                <div className="info-members">
                  <div className="info-member-row">
                    <Avatar letter="Y" color="#5b8dee" size={26} />
                    <span className="info-member-name">You</span>
                  </div>
                  {active.members.map(m => (
                    <div key={m} className="info-member-row">
                      <Avatar letter={m[0].toUpperCase()} color={AVATAR_COLORS[m.charCodeAt(0) % AVATAR_COLORS.length]} size={26} />
                      <span className="info-member-name">@{m}</span>
                      {canManageMembers && (
                        <button className="icon-btn danger-btn info-remove-btn" onClick={() => removeMember(m)}>✕</button>
                      )}
                    </div>
                  ))}
                  {canManageMembers && (
                    <div className="add-member-row">
                      <input
                        placeholder="Add by username..." value={addInput}
                        onChange={e => setAddInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addMember(addInput)}
                        className="add-member-input"
                      />
                      <button className="btn-ghost add-btn" onClick={() => addMember(addInput)}>Add</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="chat-messages">
          {active.messages.length === 0 && <div className="chat-empty">No messages yet. Say hi!</div>}
          {active.messages.map((msg, i) => {
            const showSender = !msg.mine && active.isGroup && (i === 0 || active.messages[i - 1].sender !== msg.sender);
            return (
              <div key={msg.id} className={`msg-wrap ${msg.mine ? 'mine' : 'theirs'}`}>
                {showSender && <div className="msg-sender">@{msg.sender}</div>}
                <div className="msg-bubble">
                  {msg.text}
                  <span className="msg-time">{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area">
          <input
            className="chat-input" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Message ${active.name}...`}
          />
          <button className="btn-primary send-btn" onClick={sendMessage}>
            <SendIcon size={15} />
          </button>
        </div>
      </div>

      {/* NEW CHAT MODAL */}
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Message</h3>
              <button className="icon-btn" onClick={() => setShowNew(false)}>✕</button>
            </div>
            <div className="field">
              <label>Add people (usernames, comma separated)</label>
              <input value={newUsers} onChange={e => setNewUsers(e.target.value)} placeholder="e.g. alexr, jordank" autoFocus />
            </div>
            {multipleUsers && (
              <>
                <div className="field">
                  <label>Chat name (optional)</label>
                  <input value={chatName} onChange={e => setChatName(e.target.value)} placeholder="e.g. Study crew" />
                </div>
                <div className="field">
                  <label>Chat color</label>
                  <ColorPicker value={newColor} onChange={setNewColor} />
                </div>
              </>
            )}
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn-primary" onClick={createChat}>Start Chat</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CHAT COLOR */}
      {showPicEdit && (
        <div className="modal-overlay" onClick={() => setShowPicEdit(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Chat Color</h3>
              <button className="icon-btn" onClick={() => setShowPicEdit(false)}>✕</button>
            </div>
            <div className="pic-edit-preview">
              <Avatar letter={active.name[0].toUpperCase()} color={editColor} size={64} />
              <ColorPicker value={editColor} onChange={setEditColor} />
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowPicEdit(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => { syncActive({ ...active, color: editColor }); setShowPicEdit(false); }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE / CLOSE CONFIRM */}
      {showLeave && (
        <div className="modal-overlay" onClick={() => setShowLeave(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{leaveLabel}</h3>
              <button className="icon-btn" onClick={() => setShowLeave(false)}>✕</button>
            </div>
            <p className="leave-confirm-text">
              {active.isGroup
                ? `Are you sure you want to leave ${active.name}?`
                : `Close your conversation with @${active.name}?`}
            </p>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowLeave(false)}>Cancel</button>
              <button className="btn-ghost danger-ghost" onClick={leaveOrClose}>{leaveLabel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
