import { useState, useRef } from 'react';
import { MOCK_FILES } from '../../mockData';
import type { FileItem } from '../../types';
import './FilesPage.css';

const GROUPS    = ['All Files', 'COP 4331', 'Personal'];
const READABLE  = ['pdf', 'docx', 'doc', 'txt'];
const FILE_ICONS: Record<string, string> = { pdf: '📄', docx: '📝', doc: '📝', txt: '📋' };

interface AiMsg { role: 'user' | 'ai'; text: string; }

export default function FilesPage() {
  const [files,       setFiles]       = useState<FileItem[]>(MOCK_FILES);
  const [filter,      setFilter]      = useState('All Files');
  const [showUpload,  setShowUpload]  = useState(false);
  const [shareTarget, setShareTarget] = useState<FileItem | null>(null);
  const [readFile,    setReadFile]    = useState<FileItem | null>(null);
  const [shareInput,  setShareInput]  = useState('');
  const [uploadForm,  setUploadForm]  = useState({ name: '', group: 'Personal' });
  const [aiOpen,      setAiOpen]      = useState(true);
  const [aiMsgs,      setAiMsgs]      = useState<AiMsg[]>([{ role: 'ai', text: 'Click ✦ on any file to add it to context, then type a prompt to the AI' }]);
  const [aiInput,     setAiInput]     = useState('');
  const [aiFiles,     setAiFiles]     = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = filter === 'All Files' ? files : files.filter(f => filter === 'Personal' ? f.group === null : f.group === filter);

  //TODO: API
  function handleUpload() {
    if (!uploadForm.name.trim()) return;
    const ext = uploadForm.name.split('.').pop() || 'txt';
    setFiles(prev => [...prev, { id: Date.now(), name: uploadForm.name, type: ext, size: '—', group: uploadForm.group === 'Personal' ? null : uploadForm.group, uploaded: 'Today' }]);
    setShowUpload(false); setUploadForm({ name: '', group: 'Personal' });
  }

  //TODO: API
  function sendAi() {
    if (!aiInput.trim()) return;
    const msg = aiInput.trim();
    setAiMsgs(prev => [...prev, { role: 'user', text: msg }]);
    setAiInput('');
    setTimeout(() => {
      let reply = 'Backend needs to be connected';
      if (aiFiles.length === 0) reply = 'Add some files to context first using the ✦ button, then I can help analyze them!';
      setAiMsgs(prev => [...prev, { role: 'ai', text: reply }]);
    }, 500);
  }

  return (
    <div className="files-wrap">
      <div className="topbar">
        <div className="topbar-left"><h2>Files</h2></div>
        <div className="topbar-right">
          <button className="btn-primary" onClick={() => setShowUpload(true)}>＋ Upload File</button>
        </div>
      </div>

      <div className="files-body">
        <div className="files-main page-scroll">
          <div className="files-filters">
            {GROUPS.map(g => (
              <button key={g} className={`filter-tab ${filter === g ? 'active' : ''}`} onClick={() => setFilter(g)}>{g}</button>
            ))}
          </div>

          <div className="file-list">
            {filtered.length === 0 && <div className="files-empty">No files here yet</div>}
            {filtered.map(file => (
              <div key={file.id} className="file-row">
                <span className="file-icon">{FILE_ICONS[file.type] || '📁'}</span>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    {file.size} · {file.uploaded}
                    {file.group && <span className="file-group-tag">{file.group}</span>}
                  </div>
                </div>
                <div className="file-actions">
                  {READABLE.includes(file.type) && (
                    <button className="icon-btn" title="Read file" onClick={() => setReadFile(file)}>👁</button>
                  )}
                  <button className="icon-btn" title="Add to AI" onClick={() => setAiFiles(prev => prev.includes(file.name) ? prev : [...prev, file.name])}>✦</button>
                  <button className="icon-btn" title="Share" onClick={() => setShareTarget(file)}>⤴</button>
                  <button className="icon-btn danger-btn" title="Remove" onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`ai-panel ${aiOpen ? 'open' : 'closed'}`}>
          <button className="ai-toggle" onClick={() => setAiOpen(!aiOpen)}>
            <span className="ai-toggle-icon">✦</span>
            <span className="ai-toggle-label">AI Assistant</span>
            <span className="ai-toggle-arrow">{aiOpen ? '›' : '‹'}</span>
          </button>
          {aiOpen && (
            <div className="ai-body">
              <div className="ai-files-section">
                <div className="ai-section-label">Files in context</div>
                {aiFiles.length === 0
                  ? <div className="ai-no-files">Click ✦ on a file to add it</div>
                  : (
                    <div className="ai-file-chips">
                      {aiFiles.map(f => (
                        <div key={f} className="ai-file-chip">
                          <span>📄 {f}</span>
                          <button onClick={() => setAiFiles(prev => prev.filter(x => x !== f))}>✕</button>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
              <div className="ai-messages">
                {aiMsgs.map((m, i) => (
                  <div key={i} className={`ai-msg ${m.role}`}>
                    {m.role === 'ai' && <div className="ai-badge">✦ AI</div>}
                    <div className="ai-msg-text">{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="ai-input-row">
                <input className="ai-input" value={aiInput} onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendAi()} placeholder="Ask about your files..."/>
                <button className="btn-primary ai-send-btn" onClick={sendAi}>➤</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {readFile && (
        <div className="modal-overlay" onClick={() => setReadFile(null)}>
          <div className="modal-box file-read-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-file-header-inner">
                <span className="modal-file-type-icon">{FILE_ICONS[readFile.type] || '📁'}</span>
                <h3>{readFile.name}</h3>
              </div>
              <button className="icon-btn" onClick={() => setReadFile(null)}>✕</button>
            </div>
            <div className="file-content-area">
              {readFile.content
                ? <pre className="file-content-text">{readFile.content}</pre>
                : <div className="file-content-placeholder">File preview not available — connect the backend to read real files.</div>
              }
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => { setAiFiles(prev => prev.includes(readFile.name) ? prev : [...prev, readFile.name]); setReadFile(null); }}>✦ Add to AI</button>
              <button className="btn-ghost" onClick={() => setReadFile(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload File</h3>
              <button className="icon-btn" onClick={() => setShowUpload(false)}>✕</button>
            </div>
            <div className="upload-drop-zone" onClick={() => fileInputRef.current?.click()}>
              <div className="upload-icon">⬆</div>
              <div className="upload-text">Click to select a file</div>
              <div className="upload-sub">PDF, DOC, DOCX, TXT supported</div>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) setUploadForm(prev => ({ ...prev, name: f.name })); }}/>
            </div>
            {uploadForm.name && <div className="selected-file">📄 {uploadForm.name}</div>}
            <div className="field field-mt">
              <label>Associate with Group</label>
              <select value={uploadForm.group} onChange={e => setUploadForm(prev => ({ ...prev, group: e.target.value }))}>
                <option value="Personal">Personal (just me)</option>
                {GROUPS.slice(1, -1).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpload}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {shareTarget && (
        <div className="modal-overlay" onClick={() => setShareTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share File</h3>
              <button className="icon-btn" onClick={() => setShareTarget(null)}>✕</button>
            </div>
            <p className="share-modal-text">Sharing: <strong>{shareTarget.name}</strong></p>
            <div className="field">
              <label>Share with (username or group)</label>
              <input value={shareInput} onChange={e => setShareInput(e.target.value)} placeholder="e.g. alexr or COP 4331"/>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShareTarget(null)}>Cancel</button>
              {/*TODO: API*/}
              <button className="btn-primary" onClick={() => { setShareTarget(null); setShareInput(''); }}>Share</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
