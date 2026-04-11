import { useEffect, useMemo, useRef, useState } from 'react';
import { createDirectChat, createGroupChat, fetchChats, markChatRead, searchChatUsers, sendChatMessage, type ChatSearchUser } from '../../api/chats';
import { apiBaseUrl } from '../../api/config';
import { leaveGroup } from '../../api/groups';
import { useGroups } from '../../context/GroupsContext';
import { io, type Socket } from 'socket.io-client';
import type { Chat, Group, Member } from '../../types';
import './ChatsPage.css';

type ChatTab = 'direct' | 'group';

function Avatar({ label, color, size = 38 }: { label: string; color: string; size?: number }) {
  return (
    <div
      className="chat-avatar"
      style={{
        width: size,
        height: size,
        borderRadius: size > 38 ? '12px' : '50%',
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
        fontSize: size > 38 ? '1rem' : '0.82rem',
        boxShadow: `0 0 10px ${color}33`,
      }}
    >
      {label.slice(0, 1).toUpperCase()}
    </div>
  );
}

function SendIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('user') || '{}') as {
    id?: number | string;
  };
}

function getMemberDisplayName(member: Member) {
  return member.displayName || member.username;
}

function getChatSubtitle(chat: Chat, currentUserId?: number | string) {
  if (chat.isGroup) {
    return `${chat.members.length} members`;
  }

  const otherMember = chat.members.find(member => String(member.userId) !== String(currentUserId)) || chat.members[0];
  return otherMember ? `@${otherMember.username}` : 'Direct message';
}

export default function ChatsPage() {
  const currentUser = getCurrentUser();
  const { groups, loadingGroups, groupsError, removeGroupById } = useGroups();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeTab, setActiveTab] = useState<ChatTab>('direct');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [showCompose, setShowCompose] = useState(false);
  const [composeQuery, setComposeQuery] = useState('');
  const [composeResults, setComposeResults] = useState<ChatSearchUser[]>([]);
  const [composeSelected, setComposeSelected] = useState<ChatSearchUser[]>([]);
  const [composeGroupId, setComposeGroupId] = useState<number | null>(null);
  const [composeError, setComposeError] = useState('');
  const [isSavingCompose, setIsSavingCompose] = useState(false);

  const [showInfo, setShowInfo] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentUserIdRef = useRef<number | string | undefined>(currentUser.id);
  const directChatsRef = useRef<Chat[]>([]);
  const groupsRef = useRef<Group[]>([]);

  const directChats = useMemo(() => chats.filter(chat => chat.type === 'direct'), [chats]);
  const groupChats = useMemo(() => chats.filter(chat => chat.type === 'group'), [chats]);
  const visibleChats = activeTab === 'direct' ? directChats : groupChats;
  const activeChat = useMemo(
    () => visibleChats.find(chat => chat.id === activeChatId) || visibleChats[0] || null,
    [activeChatId, visibleChats],
  );

  async function refreshChatsSilently() {
    if (!currentUser.id) {
      return;
    }

    try {
      const nextChats = await fetchChats();
      setChats(nextChats);
      setPageError('');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to load chats.');
    }
  }

  useEffect(() => {
    currentUserIdRef.current = currentUser.id;
  }, [currentUser.id]);

  useEffect(() => {
    directChatsRef.current = directChats;
  }, [directChats]);

  useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);

  useEffect(() => {
    let mounted = true;

    async function loadChats() {
      if (!currentUser.id) {
        setChats([]);
        setPageError('');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setPageError('');
        const nextChats = await fetchChats();
        if (!mounted) return;
        setChats(nextChats);
      } catch (error) {
        if (!mounted) return;
        setPageError(error instanceof Error ? error.message : 'Unable to load chats.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadChats();
    return () => {
      mounted = false;
    };
  }, [currentUser.id, groups.length]);

  useEffect(() => {
    if (!currentUser.id) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.hidden) {
        return;
      }

      void refreshChatsSilently();
    }, 3000);

    const handleFocus = () => {
      void refreshChatsSilently();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [currentUser.id, groups.length]);

  useEffect(() => {
    if (!currentUser.id) {
      return;
    }

    function joinSocketRooms(socket: Socket) {
      const connectedUserId = currentUserIdRef.current;
      if (!connectedUserId) {
        return;
      }

      socket.emit('chat:identify', { userId: connectedUserId });

      for (const chat of directChatsRef.current) {
        socket.emit('chat:join', { chatId: chat.id, type: 'direct' });
      }

      for (const group of groupsRef.current) {
        socket.emit('chat:join', { chatId: group.id, type: 'group' });
      }
    }

    const socket = io(apiBaseUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      joinSocketRooms(socket);
    });

    socket.on('chat:updated', ({ chat }: { chat: Chat }) => {
      setChats(prev => {
        const others = prev.filter(existing => !(existing.id === chat.id && existing.type === chat.type));
        return [chat, ...others];
      });
      setActiveChatId(current => current ?? chat.id);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUser.id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) {
      return;
    }

    if (!socket.connected) {
      return;
    }

    for (const chat of directChats) {
      socket.emit('chat:join', { chatId: chat.id, type: 'direct' });
    }

    for (const group of groups) {
      socket.emit('chat:join', { chatId: group.id, type: 'group' });
    }
  }, [directChats, groups]);

  useEffect(() => {
    if (!activeChat) {
      setActiveChatId(visibleChats[0]?.id ?? null);
      return;
    }

    if (!visibleChats.some(chat => chat.id === activeChat.id)) {
      setActiveChatId(visibleChats[0]?.id ?? null);
    } else if (activeChatId !== activeChat.id) {
      setActiveChatId(activeChat.id);
    }
  }, [activeChat, activeChatId, visibleChats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.id, activeChat?.messages.length]);

  useEffect(() => {
    if (!activeChat) {
      return;
    }

    void markChatRead(activeChat.id, activeChat.type).catch(() => {});
  }, [activeChat?.id, activeChat?.messages.length, activeChat?.type]);

  useEffect(() => {
    if (!showCompose || activeTab !== 'direct' || !composeQuery.trim()) {
      setComposeResults([]);
      return;
    }

    const handle = window.setTimeout(async () => {
      try {
        const results = await searchChatUsers(composeQuery.trim());
        setComposeResults(results);
      } catch (error) {
        setComposeError(error instanceof Error ? error.message : 'Unable to search users.');
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [activeTab, composeQuery, showCompose]);

  function upsertChat(updatedChat: Chat) {
    setChats(prev => {
      const others = prev.filter(chat => !(chat.id === updatedChat.id && chat.type === updatedChat.type));
      return [updatedChat, ...others];
    });
    setActiveChatId(updatedChat.id);
  }

  function openCompose() {
    setComposeQuery('');
    setComposeResults([]);
    setComposeSelected([]);
    setComposeGroupId(activeTab === 'group' ? groups[0]?.id ?? null : null);
    setComposeError('');
    setShowCompose(true);
  }

  function addSelectedUser(user: ChatSearchUser) {
    setComposeSelected(prev => (prev.some(member => member.id === user.id) ? prev : [user]));
    setComposeQuery('');
    setComposeResults([]);
  }

  async function handleCreateChat() {
    try {
      setIsSavingCompose(true);
      setComposeError('');

      if (activeTab === 'direct') {
        if (composeSelected.length !== 1) {
          setComposeError('Choose exactly one email for a direct message.');
          return;
        }

        const chat = await createDirectChat(composeSelected[0].email);
        upsertChat(chat);
      } else {
        if (!composeGroupId) {
          setComposeError('Choose one of your groups.');
          return;
        }

        const chat = await createGroupChat({ groupId: composeGroupId });
        upsertChat(chat);
      }

      setShowCompose(false);
    } catch (error) {
      setComposeError(error instanceof Error ? error.message : 'Unable to open conversation.');
    } finally {
      setIsSavingCompose(false);
    }
  }

  async function handleSendMessage() {
    if (!activeChat || !input.trim()) return;

    try {
      setPageError('');
      const updatedChat = await sendChatMessage(activeChat.id, input.trim(), activeChat.type);
      upsertChat(updatedChat);
      setInput('');
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to send message.');
    }
  }

  async function handleLeaveGroup() {
    if (!activeChat || activeTab !== 'group') return;

    try {
      await leaveGroup(activeChat.id);
      removeGroupById(activeChat.id);
      setChats(prev => prev.filter(chat => !(chat.type === 'group' && chat.id === activeChat.id)));
      setShowLeave(false);
      setShowInfo(false);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : 'Unable to leave group.');
    }
  }

  function handleMessageKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleSendMessage();
    }
  }

  function getGroupForCompose(groupId: number | null) {
    return groups.find(group => group.id === groupId) || null;
  }

  const composeGroup = getGroupForCompose(composeGroupId);
  const groupListState = loadingGroups ? 'Loading groups...' : groupsError || (groups.length === 0 ? 'No groups yet.' : '');

  return (
    <div className="chats-wrap">
      <div className="chats-list">
        <div className="chats-list-header">
          <div className="section-title" style={{ margin: 0 }}>Messages</div>
          <button className="icon-btn" title="New message" onClick={openCompose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="chat-tabs">
          <button type="button" className={`chat-tab ${activeTab === 'direct' ? 'active' : ''}`} onClick={() => setActiveTab('direct')}>
            Direct
          </button>
          <button type="button" className={`chat-tab ${activeTab === 'group' ? 'active' : ''}`} onClick={() => setActiveTab('group')}>
            Group
          </button>
        </div>

        {isLoading && <div className="chat-list-state">Loading messages...</div>}
        {!isLoading && activeTab === 'group' && groupListState && <div className="chat-list-state">{groupListState}</div>}
        {!isLoading && !groupListState && visibleChats.length === 0 && (
          <div className="chat-list-state">
            No {activeTab === 'direct' ? 'direct messages' : 'group messages'} yet.
          </div>
        )}

        {!isLoading && visibleChats.map(chat => (
          <div
            key={`${chat.type}-${chat.id}`}
            className={`chat-row ${activeChat?.id === chat.id && activeChat?.type === chat.type ? 'active' : ''}`}
            onClick={() => {
              setActiveChatId(chat.id);
              setShowInfo(false);
            }}
          >
            <Avatar label={chat.name} color={chat.color} size={38}/>
            <div className="chat-row-info">
              <div className="chat-row-name">{chat.name}</div>
              <div className="chat-row-last">{chat.lastMsg || getChatSubtitle(chat, currentUser.id)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-window">
        {pageError && <div className="chat-banner-error">{pageError}</div>}

        {!activeChat ? (
          <div className="chat-empty-panel">Choose a conversation or tap the + button to start one.</div>
        ) : (
          <>
            <div className="chat-window-header" onClick={() => setShowInfo(prev => !prev)} style={{ cursor: 'pointer' }}>
              <Avatar label={activeChat.name} color={activeChat.color} size={36}/>
              <div className="chat-window-title-wrap">
                <div className="chat-window-name">{activeChat.name}</div>
                <div className="chat-window-sub">
                  {getChatSubtitle(activeChat, currentUser.id)}
                  {activeChat.isGroup && ' · from your groups'}
                </div>
              </div>
              {activeChat.isGroup && (
                <button className="icon-btn" onClick={(event) => { event.stopPropagation(); setShowLeave(true); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            {showInfo && (
              <div className="chat-info-panel">
                <div className="info-header">
                  <Avatar label={activeChat.name} color={activeChat.color} size={52}/>
                  <div>
                    <div className="info-name">{activeChat.name}</div>
                    <div className="info-subtext">{getChatSubtitle(activeChat, currentUser.id)}</div>
                  </div>
                </div>

                <div className="section-title">Members</div>
                <div className="info-members">
                  {activeChat.members.map(member => (
                    <div key={`${activeChat.id}-${member.userId}`} className="info-member-row">
                      <Avatar label={getMemberDisplayName(member)} color={member.color} size={26}/>
                      <span className="info-member-name">
                        {String(member.userId) === String(currentUser.id) ? `You (@${member.username})` : `${getMemberDisplayName(member)} (@${member.username})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="chat-messages">
              {activeChat.messages.length === 0 && <div className="chat-empty">No messages yet. Start the conversation.</div>}
              {activeChat.messages.map((msg, index) => {
                const prevMessage = activeChat.messages[index - 1];
                const showSender = !msg.mine && activeChat.isGroup && prevMessage?.sender !== msg.sender;
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
              <div ref={bottomRef}/>
            </div>

            <div className="chat-input-area">
              <input
                className="chat-input"
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={handleMessageKeyDown}
                placeholder={`Message ${activeChat.name}...`}
              />
              <button className="btn-primary send-btn" onClick={() => void handleSendMessage()}>
                <SendIcon size={15}/>
              </button>
            </div>
          </>
        )}
      </div>

      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal-box" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h3>New Message</h3>
              <button className="icon-btn" onClick={() => setShowCompose(false)}>x</button>
            </div>

            <div className="chat-tabs modal-tabs">
              <button type="button" className={`chat-tab ${activeTab === 'direct' ? 'active' : ''}`} onClick={() => setActiveTab('direct')}>
                Direct
              </button>
              <button type="button" className={`chat-tab ${activeTab === 'group' ? 'active' : ''}`} onClick={() => setActiveTab('group')}>
                Group
              </button>
            </div>

            {activeTab === 'direct' ? (
              <>
                <div className="field">
                  <label>Add by email</label>
                  <input
                    value={composeQuery}
                    onChange={event => {
                      setComposeQuery(event.target.value);
                      setComposeError('');
                    }}
                    placeholder="Search by email..."
                    autoFocus
                  />
                </div>

                {composeSelected.length > 0 && (
                  <div className="selected-users">
                    {composeSelected.map(user => (
                      <button key={`picked-${user.id}`} type="button" className="selected-user-pill" onClick={() => setComposeSelected([])}>
                        {user.email} x
                      </button>
                    ))}
                  </div>
                )}

                {composeResults.length > 0 && (
                  <div className="search-results">
                    {composeResults.map(user => (
                      <button key={`compose-${user.id}`} type="button" className="search-result" onClick={() => addSelectedUser(user)}>
                        <span>{user.displayName}</span>
                        <span>{user.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="field">
                <label>Choose one of your groups</label>
                <select
                  className="chat-select"
                  value={composeGroupId ?? ''}
                  onChange={event => {
                    const nextValue = Number(event.target.value);
                    setComposeGroupId(Number.isFinite(nextValue) ? nextValue : null);
                    setComposeError('');
                  }}
                >
                  <option value="">Select a group</option>
                  {groups.map((group: Group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
                {composeGroup && <div className="compose-helper">{composeGroup.members.length} members will share this conversation.</div>}
              </div>
            )}

            {composeError && <div className="chat-inline-error">{composeError}</div>}

            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowCompose(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => void handleCreateChat()} disabled={isSavingCompose}>
                {activeTab === 'direct' ? 'Start DM' : 'Open Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeave && activeChat && (
        <div className="modal-overlay" onClick={() => setShowLeave(false)}>
          <div className="modal-box" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Leave Group</h3>
              <button className="icon-btn" onClick={() => setShowLeave(false)}>x</button>
            </div>
            <p className="leave-modal-text">Leave {activeChat.name}? This also removes you from the study group.</p>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowLeave(false)}>Cancel</button>
              <button className="btn-ghost danger-ghost" onClick={() => void handleLeaveGroup()}>
                Leave Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
