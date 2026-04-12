import { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppBackground from '../components/AppBackground';
import MobileHeader from '../components/MobileHeader';
import { useData } from '../contexts/DataContext';
import type { FileItem } from '../types';
import { launchImageLibrary } from 'react-native-image-picker';

const READABLE = ['pdf', 'docx', 'doc', 'txt'];
const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  docx: '📝',
  doc: '📝',
  txt: '📋',
};

interface AiMsg {
  role: 'user' | 'ai';
  text: string;
}

export default function FilesScreen() {
  const { files, groups, addFile, removeFile } = useData();
  const [activeFilter, setActiveFilter] = useState('All Files');
  const [contextFiles, setContextFiles] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [shareTarget, setShareTarget] = useState<FileItem | null>(null);
  const [readFile, setReadFile] = useState<FileItem | null>(null);
  const [shareInput, setShareInput] = useState('');
  const [uploadForm, setUploadForm] = useState({ name: '', group: 'Personal' });
  const [selectedUploadName, setSelectedUploadName] = useState('');
  const [aiOpen, setAiOpen] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [aiMsgs, setAiMsgs] = useState<AiMsg[]>([
    { role: 'ai', text: 'Click ✦ on any file to add it to context, then type a prompt to the AI' },
  ]);

  const availableFilters = useMemo(() => ['All Files', ...groups.map(group => group.name), 'Personal'], [groups]);

  const filteredFiles = useMemo(() => {
    if (activeFilter === 'All Files') return files;
    if (activeFilter === 'Personal') return files.filter(file => file.group === null);
    return files.filter(file => file.group === activeFilter);
  }, [activeFilter, files]);

  const handleUpload = () => {
    if (!selectedUploadName.trim()) return;

    const ext = selectedUploadName.split('.').pop() || 'txt';
    addFile({
      name: selectedUploadName.trim(),
      type: ext,
      size: '—',
      group: uploadForm.group === 'Personal' ? null : uploadForm.group,
      content: `Preview for ${selectedUploadName.trim()} will appear here.`,
    });

    setUploadForm({ name: '', group: 'Personal' });
    setSelectedUploadName('');
    setShowUpload(false);
  };

  const sendAi = () => {
    if (!aiInput.trim()) return;

    const nextPrompt = aiInput.trim();
    setAiMsgs(prev => [...prev, { role: 'user', text: nextPrompt }]);
    setAiInput('');

    const reply =
      contextFiles.length === 0
        ? 'Add some files to context first using the ✦ button, then I can help analyze them.'
        : `I can help summarize ${contextFiles.join(', ')} once the backend AI service is connected.`;

    setAiMsgs(prev => [...prev, { role: 'ai', text: reply }]);
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <MobileHeader
          title="Files"
          rightContent={
            <TouchableOpacity style={styles.uploadButton} activeOpacity={0.85} onPress={() => setShowUpload(true)}>
              <Text style={styles.uploadButtonText}>+ Upload File</Text>
            </TouchableOpacity>
          }
        />

        <ScrollView contentContainerStyle={styles.content}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {availableFilters.map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredFiles.length === 0 ? <Text style={styles.emptyState}>No files here yet.</Text> : null}

          {filteredFiles.map(file => (
            <View key={file.id} style={styles.fileCard}>
              <View style={styles.fileTopRow}>
                <Text style={styles.fileIcon}>{FILE_ICONS[file.type] || '📁'}</Text>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.fileMeta}>{file.size} · {file.uploaded}</Text>
                    {file.group ? (
                      <View style={styles.groupPill}>
                        <Text style={styles.groupPillText}>{file.group}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>

              <View style={styles.actionsRow}>
                {READABLE.includes(file.type) ? (
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.85} onPress={() => setReadFile(file)}>
                    <Text style={styles.actionText}>👁</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setContextFiles(prev => (prev.includes(file.name) ? prev : [...prev, file.name]))}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionText}>✦</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.85} onPress={() => setShareTarget(file)}>
                  <Text style={styles.actionText}>⤴</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.85} onPress={() => removeFile(file.id)}>
                  <Text style={styles.actionText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.aiHeader} activeOpacity={0.85} onPress={() => setAiOpen(value => !value)}>
            <Text style={styles.aiHeaderSide}>✦</Text>
            <Text style={styles.aiHeaderTitle}>AI Assistant</Text>
            <Text style={styles.aiHeaderSide}>{aiOpen ? '›' : '‹'}</Text>
          </TouchableOpacity>

          {aiOpen ? (
            <>
              <View style={styles.aiSection}>
                <Text style={styles.aiSectionTitle}>FILES IN CONTEXT</Text>
                {contextFiles.length === 0 ? (
                  <Text style={styles.aiPlaceholder}>Click ✦ on a file to add it</Text>
                ) : (
                  <View style={styles.contextChipWrap}>
                    {contextFiles.map(file => (
                      <View key={file} style={styles.contextChip}>
                        <Text style={styles.contextChipText}>{file}</Text>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => setContextFiles(prev => prev.filter(item => item !== file))}
                        >
                          <Text style={styles.contextChipClose}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.aiSection}>
                <Text style={styles.aiSectionTitle}>✦ AI</Text>
                {aiMsgs.map((message, index) => (
                  <View
                    key={`${message.role}-${index}`}
                    style={[styles.aiMessageCard, message.role === 'user' && styles.aiMessageCardUser]}
                  >
                    <Text style={styles.aiMessageText}>{message.text}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your files..."
            placeholderTextColor="#53597e"
            value={aiInput}
            onChangeText={setAiInput}
            onSubmitEditing={sendAi}
          />
          <TouchableOpacity style={styles.sendButton} activeOpacity={0.85} onPress={sendAi}>
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showUpload} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowUpload(false)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
              <Text style={styles.modalTitle}>Upload File</Text>
              <TouchableOpacity
                style={styles.uploadDropZone}
                activeOpacity={0.85}
                onPress={() => {
                  launchImageLibrary(
                    { mediaType: 'photo', selectionLimit: 1, quality: 0.8 },
                    response => {
                      const picked = response.assets?.[0];
                      if (picked?.fileName) {
                        setSelectedUploadName(picked.fileName);
                      } else if (picked?.uri) {
                        setSelectedUploadName(`upload-${Date.now()}.jpg`);
                      }
                    },
                  );
                }}
              >
                <Text style={styles.uploadDropTitle}>Upload</Text>
                <Text style={styles.uploadDropText}>Click to select a file</Text>
                <Text style={styles.uploadDropSub}>PDF, DOC, DOCX, TXT supported</Text>
              </TouchableOpacity>
              {selectedUploadName ? <Text style={styles.selectedFileName}>{selectedUploadName}</Text> : null}
              <Text style={styles.modalLabel}>Associate with Group</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupSelectRow}>
                {['Personal', ...groups.map(group => group.name)].map(group => (
                  <TouchableOpacity
                    key={group}
                    style={[styles.groupSelectChip, uploadForm.group === group && styles.groupSelectChipActive]}
                    activeOpacity={0.85}
                    onPress={() => setUploadForm(prev => ({ ...prev, group }))}
                  >
                    <Text style={[styles.groupSelectText, uploadForm.group === group && styles.groupSelectTextActive]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalGhostButton} activeOpacity={0.85} onPress={() => setShowUpload(false)}>
                  <Text style={styles.modalGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} activeOpacity={0.85} onPress={handleUpload}>
                  <Text style={styles.modalButtonText}>Upload</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal visible={Boolean(readFile)} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setReadFile(null)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
              <Text style={styles.modalTitle}>{readFile?.name}</Text>
              <View style={styles.filePreview}>
                <Text style={styles.filePreviewText}>
                  {readFile?.content || 'File preview not available yet.'}
                </Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalGhostButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (readFile && !contextFiles.includes(readFile.name)) {
                      setContextFiles(prev => [...prev, readFile.name]);
                    }
                    setReadFile(null);
                  }}
                >
                  <Text style={styles.modalGhostText}>✦ Add to AI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} activeOpacity={0.85} onPress={() => setReadFile(null)}>
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <Modal visible={Boolean(shareTarget)} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShareTarget(null)}>
            <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
              <Text style={styles.modalTitle}>Share File</Text>
              <Text style={styles.shareText}>Sharing: {shareTarget?.name}</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Share with username or group"
                placeholderTextColor="#66709a"
                value={shareInput}
                onChangeText={setShareInput}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalGhostButton} activeOpacity={0.85} onPress={() => setShareTarget(null)}>
                  <Text style={styles.modalGhostText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  activeOpacity={0.85}
                  onPress={() => {
                    setShareTarget(null);
                    setShareInput('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Share</Text>
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
  content: { paddingHorizontal: 12, paddingBottom: 130 },
  uploadButton: {
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: '#7a74f7',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  uploadButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filterRow: { gap: 10, marginTop: 10, marginBottom: 12 },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2b2f59',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: 'rgba(19, 20, 45, 0.82)',
  },
  filterChipActive: { backgroundColor: '#27295a' },
  filterText: { color: '#8f94be', fontWeight: '700', fontSize: 13 },
  filterTextActive: { color: '#cfcfff' },
  fileCard: {
    backgroundColor: 'rgba(19, 19, 43, 0.92)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2348',
    padding: 14,
    marginBottom: 8,
  },
  fileTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  fileIcon: { fontSize: 20, width: 28 },
  fileInfo: { flex: 1, marginLeft: 6 },
  fileName: { color: '#dadcf0', fontWeight: '700', fontSize: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  fileMeta: { color: '#5e6487', fontSize: 12 },
  groupPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#373765',
  },
  groupPillText: { color: '#b8beff', fontSize: 11, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: {
    minWidth: 36,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#252956',
    backgroundColor: 'rgba(18, 20, 44, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actionText: { color: '#999fe8', fontSize: 14, fontWeight: '700' },
  aiHeader: {
    marginTop: 12,
    minHeight: 38,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#171a36',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  aiHeaderSide: { color: '#8f94be', fontWeight: '700' },
  aiHeaderTitle: { color: '#8f94be', fontWeight: '700' },
  aiSection: {
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#171a36',
  },
  aiSectionTitle: {
    color: '#565f8c',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  aiPlaceholder: { color: '#444b72', marginTop: 10, fontStyle: 'italic' },
  contextChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: '#2b2958',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  contextChipText: { color: '#e7e2ff', fontWeight: '600' },
  contextChipClose: { color: '#a8aff2', fontWeight: '800' },
  aiMessageCard: {
    marginTop: 10,
    backgroundColor: '#2b2958',
    borderRadius: 12,
    padding: 14,
  },
  aiMessageCardUser: { backgroundColor: '#22244c' },
  aiMessageText: { color: '#e6e2fb', lineHeight: 22 },
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
  uploadDropZone: {
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#6f68f8',
    backgroundColor: 'rgba(111,104,248,0.13)',
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  uploadDropTitle: { color: '#c9cff3', fontSize: 54, lineHeight: 58, fontWeight: '300' },
  uploadDropText: { color: '#c0c7ef', fontSize: 16, marginTop: 6 },
  uploadDropSub: { color: '#7079a8', fontSize: 12, marginTop: 8 },
  selectedFileName: { color: '#b3bcf0', marginBottom: 8 },
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
  modalLabel: { color: '#cfd3f4', fontWeight: '700', marginBottom: 10 },
  groupSelectRow: { gap: 8, marginBottom: 14 },
  groupSelectChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2b2f59',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#1b1f43',
  },
  groupSelectChipActive: { backgroundColor: '#2b2d62' },
  groupSelectText: { color: '#8f94be', fontWeight: '700' },
  groupSelectTextActive: { color: '#e3e5ff' },
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
  filePreview: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242955',
    backgroundColor: '#161a39',
    padding: 14,
    marginBottom: 14,
  },
  filePreviewText: { color: '#e6e2fb', lineHeight: 22 },
  shareText: { color: '#d7daf5', marginBottom: 12 },
  emptyState: { color: '#69709a', marginBottom: 8 },
});
