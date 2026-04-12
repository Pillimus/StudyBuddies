import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import MobileHeader from '../components/MobileHeader';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { launchImageLibrary } from 'react-native-image-picker';

const AVATAR_COLORS = ['#5b8dee', '#7c5cfc', '#2dd4d4', '#e05c7a', '#f0a050', '#3ecf8e'];

function parseMembers(value: string) {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export default function GroupsScreen() {
  const { groups, addGroup, updateGroup, removeGroup, updateProfileName } = useData();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(groups[0]?.id ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMembers, setNewMembers] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (!groups.some(group => group.id === selectedId)) {
      setSelectedId(groups[0]?.id ?? null);
    }
  }, [groups, selectedId]);

  const selected = useMemo(
    () => groups.find(group => group.id === selectedId) ?? groups[0] ?? null,
    [groups, selectedId],
  );

  const createGroup = () => {
    if (!newName.trim()) {
      setCreateError('Group name is required.');
      return;
    }

    const members = parseMembers(newMembers).map((member, index) => ({
      username: member.toLowerCase().replace(/\s+/g, '-'),
      displayName: member,
      email: member.includes('@') ? member.toLowerCase() : undefined,
      color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    }));

    const group = {
      id: Date.now(),
      name: newName.trim(),
      createdBy: 'you',
      color: '#7c5cfc',
      members: [
        {
          username: 'you',
          displayName: user?.displayName || 'You',
          email: user?.email,
          isCreator: true,
          color: '#5b8dee',
        },
        ...members,
      ],
      events: [],
    };

    addGroup(group);
    setSelectedId(group.id);
    setShowCreate(false);
    setNewName('');
    setNewMembers('');
    setCreateError('');
  };

  const saveProfile = () => {
    const nextName = displayName.trim() || 'User';
    updateProfileName(nextName, editAvatarUrl);
    const selectedMine = selected?.members.find(member => member.username === 'you' || member.username === 'me');
    if (selected && selectedMine) {
      updateGroup({
        ...selected,
        members: selected.members.map(member =>
          member.username === 'you' || member.username === 'me'
            ? { ...member, displayName: nextName, avatarUrl: editAvatarUrl || member.avatarUrl }
            : member,
        ),
      });
    }
    setShowProfile(false);
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <MobileHeader title="My Groups" />
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={styles.profileCard}
            activeOpacity={0.85}
            onPress={() => {
              setDisplayName(user?.displayName || '');
              setEditAvatarUrl(user?.avatarUrl || null);
              setShowProfile(true);
            }}
          >
            <View style={styles.profileAvatar}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.profileAvatarImage} />
              ) : (
                <Text style={styles.profileAvatarText}>{(user?.displayName || 'U').charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.profileText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createButton} activeOpacity={0.85} onPress={() => setShowCreate(true)}>
            <Text style={styles.createButtonText}>+ New Group</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>ALL GROUPS</Text>

          {groups.length === 0 ? <Text style={styles.emptyInline}>No groups yet. Create one to get started.</Text> : null}

          {groups.map(group => (
            <TouchableOpacity
              key={group.id}
              style={[styles.groupRow, selected?.id === group.id && styles.groupRowActive]}
              activeOpacity={0.85}
              onPress={() => setSelectedId(group.id)}
            >
              <View style={[styles.groupBadge, { backgroundColor: group.color }]}>
                <Text style={styles.groupBadgeText}>{group.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMeta}>{group.members.length} members · {group.events.length} events</Text>
              </View>
            </TouchableOpacity>
          ))}

          {selected ? (
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View>
                  <Text style={styles.detailTitle}>{selected.name}</Text>
                  <Text style={styles.detailSubtitle}>
                    {selected.createdBy === 'you' ? 'Created by you' : `Created by ${selected.createdBy}`}
                  </Text>
                </View>
                <TouchableOpacity style={styles.leaveButton} activeOpacity={0.85} onPress={() => setShowLeave(true)}>
                  <Text style={styles.leaveButtonText}>Leave</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.detailSection}>MEMBERS</Text>
              {selected.members.map(member => (
                <View key={`${member.username}-${member.email || 'member'}`} style={styles.memberRow}>
                  <View style={[styles.memberAvatar, { backgroundColor: member.color || '#7c5cfc' }]}>
                    <Text style={styles.memberAvatarText}>
                      {(member.displayName || member.username || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.displayName || member.username}</Text>
                    {member.email ? <Text style={styles.memberEmail}>{member.email}</Text> : null}
                  </View>
                  {member.isCreator ? <Text style={styles.creatorBadge}>creator</Text> : null}
                </View>
              ))}

              <Text style={styles.detailSection}>UPCOMING EVENTS</Text>
              {selected.events.length === 0 ? (
                <Text style={styles.emptyInline}>No events yet</Text>
              ) : (
                selected.events.map((event, index) => (
                  <View key={`${event.title}-${index}`} style={styles.eventRow}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventMeta}>{event.date} · {event.time}</Text>
                  </View>
                ))
              )}
            </View>
          ) : null}
        </ScrollView>

        <Modal visible={showProfile} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowProfile(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <View style={styles.profileModalAvatarWrap}>
                <View style={styles.profileModalAvatar}>
                  {editAvatarUrl ? (
                    <Image source={{ uri: editAvatarUrl }} style={styles.profileModalAvatarImage} />
                  ) : (
                    <Text style={styles.profileModalAvatarText}>{(displayName || user?.displayName || 'U').charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.uploadPhotoButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    launchImageLibrary(
                      { mediaType: 'photo', selectionLimit: 1, quality: 0.8 },
                      response => {
                        const uri = response.assets?.[0]?.uri;
                        if (uri) {
                          setEditAvatarUrl(uri);
                        }
                      },
                    );
                  }}
                >
                  <Text style={styles.uploadPhotoButtonText}>Upload photo</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                placeholderTextColor="#8f94be"
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalGhostButton} activeOpacity={0.85} onPress={() => setShowProfile(false)}>
                  <Text style={styles.modalGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} activeOpacity={0.85} onPress={saveProfile}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showCreate} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCreate(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Group</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={value => {
                  setNewName(value);
                  setCreateError('');
                }}
                placeholder="Group Name"
                placeholderTextColor="#8f94be"
                autoFocus
              />
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={newMembers}
                onChangeText={value => {
                  setNewMembers(value);
                  setCreateError('');
                }}
                placeholder="Add members (names or emails, comma separated)"
                placeholderTextColor="#8f94be"
                multiline
              />
              {createError ? <Text style={styles.errorText}>{createError}</Text> : null}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalGhostButton} activeOpacity={0.85} onPress={() => setShowCreate(false)}>
                  <Text style={styles.modalGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} activeOpacity={0.85} onPress={createGroup}>
                  <Text style={styles.modalButtonText}>Create Group</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showLeave} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLeave(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
              <Text style={styles.modalTitle}>Leave Group</Text>
              <Text style={styles.leaveText}>
                Are you sure you want to leave <Text style={styles.leaveStrong}>{selected?.name}</Text>?
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalGhostButton} activeOpacity={0.85} onPress={() => setShowLeave(false)}>
                  <Text style={styles.modalGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.leaveButtonModal}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (selected) {
                      removeGroup(selected.id);
                    }
                    setShowLeave(false);
                  }}
                >
                  <Text style={styles.leaveButtonText}>Leave Group</Text>
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
  content: { paddingHorizontal: 12, paddingBottom: 120 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#242955',
    backgroundColor: 'rgba(15, 17, 40, 0.92)',
    minHeight: 46,
    marginTop: 8,
    marginBottom: 14,
    gap: 10,
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#76d8dd',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: { width: '100%', height: '100%' },
  profileAvatarText: { color: '#fff', fontWeight: '800' },
  profileText: { color: '#d7d8ef', fontSize: 16, fontWeight: '700' },
  createButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#7a74f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sectionLabel: {
    color: '#6e7ef3',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 12,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#171a36',
  },
  groupRowActive: { backgroundColor: 'rgba(25, 28, 61, 0.55)' },
  groupBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupBadgeText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  groupInfo: { flex: 1 },
  groupName: { color: '#d7d8ef', fontSize: 15, fontWeight: '700' },
  groupMeta: { color: '#596084', marginTop: 4, fontSize: 13 },
  detailCard: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e234a',
    backgroundColor: 'rgba(18, 20, 44, 0.95)',
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailTitle: { color: '#f7f8ff', fontSize: 22, fontWeight: '800' },
  detailSubtitle: { color: '#69709a', marginTop: 4 },
  leaveButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b2a45',
    backgroundColor: 'rgba(83, 26, 47, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  leaveButtonText: { color: '#ff8da1', fontWeight: '700' },
  detailSection: {
    color: '#8e97d6',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  memberAvatarText: { color: '#fff', fontWeight: '800' },
  memberInfo: { flex: 1 },
  memberName: { color: '#eff1fb', fontWeight: '700' },
  memberEmail: { color: '#6a7197', fontSize: 12, marginTop: 2 },
  creatorBadge: {
    color: '#76d8dd',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  eventRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222753',
    backgroundColor: 'rgba(21, 23, 50, 0.92)',
    padding: 12,
    marginBottom: 8,
  },
  eventTitle: { color: '#f2f3ff', fontWeight: '700' },
  eventMeta: { color: '#6a7197', marginTop: 4 },
  emptyInline: { color: '#6f759a', marginBottom: 10 },
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
  profileModalAvatarWrap: { alignItems: 'center', marginBottom: 12 },
  profileModalAvatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2d3566',
    backgroundColor: '#6f86d7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileModalAvatarImage: { width: '100%', height: '100%' },
  profileModalAvatarText: { color: '#fff', fontSize: 48, fontWeight: '800' },
  uploadPhotoButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2d57',
    backgroundColor: '#161a39',
    minHeight: 40,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  uploadPhotoButtonText: { color: '#aeb6e8', fontWeight: '700' },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a2d57',
    backgroundColor: '#161a39',
    color: '#fff',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
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
  leaveText: { color: '#cdd1ef', lineHeight: 22, marginBottom: 12 },
  leaveStrong: { color: '#fff', fontWeight: '800' },
  leaveButtonModal: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#5b2031',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: '#ff8da1', marginBottom: 8 },
});
