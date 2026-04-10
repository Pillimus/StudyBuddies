import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import MobileHeader from '../components/MobileHeader';
import { useData } from '../contexts/DataContext';

const AVATAR_COLORS = ['#3a7bd5', '#7c5cfc', '#2dd4d4', '#e05c7a', '#f0a050', '#3ecf8e', '#a78bfa', '#5b8dee'];

export default function ChatsScreen() {
  const { chats, addChatMessage, createChat, updateChat, removeChat } = useData();
  const [activeChatId, setActiveChatId] = useState<number | null>(chats[0]?.id ?? null);
  const [messageInput, setMessageInput] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newUsers, setNewUsers] = useState('');
  const [chatName, setChatName] = useState('');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[0]);
  const [showInfo, setShowInfo] = useState(false);
  const [showEditColor, setShowEditColor] = useState(false);
  const [editColor, setEditColor] = useState(AVATAR_COLORS[0]);
  const [addInput, setAddInput] = useState('');
  const [showLeave, setShowLeave] = useState(false);

  const activeChat = useMemo(
    () => chats.find(chat => chat.id === activeChatId) ?? chats[0] ?? null,
    [activeChatId, chats],
  );

  useEffect(() => {
    if (!chats.some(chat => chat.id === activeChatId)) {
      setActiveChatId(chats[0]?.id ?? null);
    }
  }, [chats, activeChatId]);

  const sendMessage = () => {
    if (!activeChat || !messageInput.trim()) return;

    const now = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    addChatMessage(activeChat.id, {
      sender: 'you',
      text: messageInput.trim(),
      time: now,
      mine: true,
    });
    setMessageInput('');
  };

  const createNewChat = () => {
    const users = newUsers
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    if (!users.length) return;

    const isGroup = users.length > 1;
    const nextChat = createChat({
      name: isGroup ? (chatName.trim() || users.join(', ')) : users[0],
      isGroup,
      isStudyGroup: false,
      createdBy: 'you',
      members: users,
      color: newColor,
      messages: [],
      lastMsg: '',
    });

    setActiveChatId(nextChat.id);
    setShowNew(false);
    setNewUsers('');
    setChatName('');
    setNewColor(AVATAR_COLORS[0]);
  };

  const addMember = () => {
    if (!activeChat || !addInput.trim()) return;
    if (activeChat.members.includes(addInput.trim())) return;

    updateChat({
      ...activeChat,
      members: [...activeChat.members, addInput.trim()],
    });
    setAddInput('');
  };

  const removeMember = (member: string) => {
    if (!activeChat) return;

    updateChat({
      ...activeChat,
      members: activeChat.members.filter(item => item !== member),
    });
  };

  const leaveChat = () => {
    if (!activeChat) return;
    removeChat(activeChat.id);
    setShowLeave(false);
    setShowInfo(false);
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <MobileHeader
          title="Messages"
          rightContent={
            <TouchableOpacity style={styles.plusButton} activeOpacity={0.85} onPress={() => setShowNew(true)}>
              <Text style={styles.plusText}>+</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.content}>
          {chats.map(chat => (
            <TouchableOpacity
              key={chat.id}
              style={[styles.chatRow, activeChat?.id === chat.id && styles.chatRowActive]}
              onPress={() => setActiveChatId(chat.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.avatar, { backgroundColor: chat.color }]}>
                <Text style={styles.avatarText}>{chat.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.chatMain}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatPreview} numberOfLines={1}>
                  {chat.lastMsg || 'No messages yet'}
                </Text>
              </View>
              {activeChat?.id === chat.id && chat.isGroup ? (
                <TouchableOpacity style={styles.leaveButton} activeOpacity={0.85} onPress={() => setShowLeave(true)}>
                  <Text style={styles.leaveButtonText}>↪</Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          ))}

          {activeChat ? (
            <View style={styles.chatPanel}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => setShowInfo(value => !value)}>
                <Text style={styles.activeTitle}>{activeChat.name}</Text>
                <Text style={styles.activeSubtitle}>
                  {activeChat.isStudyGroup
                    ? 'Study group chat · expand for info'
                    : activeChat.isGroup
                      ? `${activeChat.members.length + 1} members · expand for info`
                      : 'Direct message'}
                </Text>
              </TouchableOpacity>

              {showInfo ? (
                <View style={styles.infoPanel}>
                  <View style={styles.infoHeader}>
                    <View style={[styles.infoAvatar, { backgroundColor: activeChat.color }]}>
                      <Text style={styles.infoAvatarText}>{activeChat.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoTextWrap}>
                      <Text style={styles.infoTitle}>{activeChat.name}</Text>
                      <Text style={styles.infoSubtitle}>
                        {activeChat.isGroup ? `${activeChat.members.length + 1} members` : 'Direct message'}
                      </Text>
                    </View>
                    {activeChat.isGroup && !activeChat.isStudyGroup ? (
                      <TouchableOpacity
                        style={styles.iconButton}
                        activeOpacity={0.85}
                        onPress={() => {
                          setEditColor(activeChat.color);
                          setShowEditColor(true);
                        }}
                      >
                        <Text style={styles.iconButtonText}>✎</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {activeChat.isGroup ? (
                    <>
                      <Text style={styles.infoSection}>MEMBERS</Text>
                      <View style={styles.memberRow}>
                        <View style={[styles.memberAvatar, { backgroundColor: '#5b8dee' }]}>
                          <Text style={styles.memberAvatarText}>Y</Text>
                        </View>
                        <Text style={styles.memberName}>You</Text>
                      </View>
                      {activeChat.members.map(member => (
                        <View key={member} style={styles.memberRow}>
                          <View
                            style={[
                              styles.memberAvatar,
                              { backgroundColor: AVATAR_COLORS[Math.abs(member.charCodeAt(0)) % AVATAR_COLORS.length] },
                            ]}
                          >
                            <Text style={styles.memberAvatarText}>{member[0].toUpperCase()}</Text>
                          </View>
                          <Text style={styles.memberName}>@{member}</Text>
                          {!activeChat.isStudyGroup ? (
                            <TouchableOpacity style={styles.removeMemberButton} activeOpacity={0.85} onPress={() => removeMember(member)}>
                              <Text style={styles.removeMemberText}>✕</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      ))}
                      {!activeChat.isStudyGroup ? (
                        <View style={styles.addMemberRow}>
                          <TextInput
                            style={styles.addMemberInput}
                            placeholder="Add by username..."
                            placeholderTextColor="#66709a"
                            value={addInput}
                            onChangeText={setAddInput}
                          />
                          <TouchableOpacity style={styles.addMemberButton} activeOpacity={0.85} onPress={addMember}>
                            <Text style={styles.addMemberButtonText}>Add</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </>
                  ) : null}
                </View>
              ) : null}

              {activeChat.messages.map(message => (
                <View key={message.id} style={[styles.bubbleWrap, message.mine && styles.bubbleWrapMine]}>
                  {!message.mine && <Text style={styles.senderLabel}>@{message.sender}</Text>}
                  <View style={[styles.bubble, message.mine ? styles.myBubble : styles.otherBubble]}>
                    <Text style={styles.bubbleText}>{message.text}</Text>
                    <Text style={styles.bubbleTime}>{message.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyState}>No chats yet. Start one with the + button.</Text>
          )}
        </ScrollView>

        {activeChat ? (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder={`Message ${activeChat.name}...`}
              placeholderTextColor="#53597e"
              value={messageInput}
              onChangeText={setMessageInput}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.85}>
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Modal visible={showNew} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNew(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
              <Text style={styles.modalTitle}>New Message</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Add people (usernames, comma separated)"
                placeholderTextColor="#66709a"
                value={newUsers}
                onChangeText={setNewUsers}
                autoFocus
              />
              {newUsers.split(',').filter(item => item.trim()).length > 1 ? (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Chat name (optional)"
                    placeholderTextColor="#66709a"
                    value={chatName}
                    onChangeText={setChatName}
                  />
                  <View style={styles.colorRow}>
                    {AVATAR_COLORS.map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[styles.colorSwatch, { backgroundColor: color }, newColor === color && styles.colorSwatchActive]}
                        activeOpacity={0.85}
                        onPress={() => setNewColor(color)}
                      />
                    ))}
                  </View>
                </>
              ) : null}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalGhostButton} activeOpacity={0.85} onPress={() => setShowNew(false)}>
                  <Text style={styles.modalGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} activeOpacity={0.85} onPress={createNewChat}>
                  <Text style={styles.modalButtonText}>Start Chat</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showEditColor} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowEditColor(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Chat Color</Text>
              <View style={[styles.infoAvatar, styles.previewAvatar, { backgroundColor: editColor }]}>
                <Text style={styles.infoAvatarText}>{activeChat?.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.colorRow}>
                {AVATAR_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorSwatch, { backgroundColor: color }, editColor === color && styles.colorSwatchActive]}
                    activeOpacity={0.85}
                    onPress={() => setEditColor(color)}
                  />
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalGhostButton} activeOpacity={0.85} onPress={() => setShowEditColor(false)}>
                  <Text style={styles.modalGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (activeChat) {
                      updateChat({ ...activeChat, color: editColor });
                    }
                    setShowEditColor(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showLeave} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLeave(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
              <Text style={styles.modalTitle}>{activeChat?.isStudyGroup ? 'Leave Group Chat' : 'Close Chat'}</Text>
              <Text style={styles.modalCopy}>
                {activeChat?.isStudyGroup
                  ? `Are you sure you want to leave ${activeChat?.name}?`
                  : `Are you sure you want to remove ${activeChat?.name}?`}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalGhostButton} activeOpacity={0.85} onPress={() => setShowLeave(false)}>
                  <Text style={styles.modalGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.leaveConfirmButton} activeOpacity={0.85} onPress={leaveChat}>
                  <Text style={styles.leaveConfirmText}>{activeChat?.isStudyGroup ? 'Leave' : 'Remove'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 120 },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252956',
    backgroundColor: 'rgba(18, 20, 44, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  plusText: { color: '#8f94ff', fontSize: 22, fontWeight: '700' },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171a36',
  },
  chatRowActive: { backgroundColor: 'rgba(24, 28, 63, 0.72)' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '800' },
  chatMain: { flex: 1 },
  chatName: { color: '#d9daf0', fontSize: 15, fontWeight: '700' },
  chatPreview: { color: '#5f668c', marginTop: 2 },
  leaveButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#252956',
    backgroundColor: 'rgba(21, 22, 48, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButtonText: { color: '#ea7e98', fontSize: 16, fontWeight: '800' },
  chatPanel: { padding: 14 },
  activeTitle: { color: '#f7f7ff', fontSize: 24, fontWeight: '800' },
  activeSubtitle: { color: '#687099', marginTop: 4, marginBottom: 10 },
  infoPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1d2148',
    backgroundColor: 'rgba(17, 19, 43, 0.9)',
    padding: 14,
    marginBottom: 16,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center' },
  infoAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoAvatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  infoTextWrap: { flex: 1 },
  infoTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  infoSubtitle: { color: '#6d7397', marginTop: 2 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262956',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: { color: '#aab0ff', fontWeight: '800' },
  infoSection: {
    color: '#8e97d6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  memberAvatarText: { color: '#fff', fontWeight: '800' },
  memberName: { color: '#eceeff', flex: 1, fontWeight: '600' },
  removeMemberButton: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#3b2130',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMemberText: { color: '#ff8da1', fontWeight: '800' },
  addMemberRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  addMemberInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2d57',
    backgroundColor: '#161a39',
    color: '#fff',
    paddingHorizontal: 12,
  },
  addMemberButton: {
    minWidth: 64,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#7a74f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberButtonText: { color: '#fff', fontWeight: '800' },
  bubbleWrap: { marginBottom: 12, alignItems: 'flex-start' },
  bubbleWrapMine: { alignItems: 'flex-end' },
  senderLabel: { color: '#6480ff', fontWeight: '700', marginBottom: 4, marginLeft: 4 },
  bubble: { maxWidth: '78%', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  otherBubble: { backgroundColor: '#242350' },
  myBubble: { backgroundColor: '#7280ff' },
  bubbleText: { color: '#fff', fontSize: 15, lineHeight: 20 },
  bubbleTime: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 6 },
  inputBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 12,
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2d57',
    backgroundColor: 'rgba(16, 18, 41, 0.92)',
    color: '#fff',
    paddingHorizontal: 14,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#7a74f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 6, 18, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#25295b',
    backgroundColor: '#121530',
    padding: 18,
  },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 14 },
  modalInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2d57',
    backgroundColor: '#161a39',
    color: '#fff',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  previewAvatar: {
    alignSelf: 'center',
    marginRight: 0,
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalGhostButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2c305b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGhostText: { color: '#b8bcde', fontWeight: '700' },
  modalButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#7a74f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: { color: '#fff', fontWeight: '800' },
  modalCopy: { color: '#cdd1ef', lineHeight: 22, marginBottom: 12 },
  leaveConfirmButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#5b2031',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveConfirmText: { color: '#ff98ac', fontWeight: '800' },
  emptyState: { color: '#69709a', paddingHorizontal: 14, paddingTop: 8 },
});
