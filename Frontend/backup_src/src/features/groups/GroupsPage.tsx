import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarUploadZone } from '../../components/Avatar';
import { useUser, AVATAR_COLORS, randomColor } from '../../context/UserContext';
import './GroupsPage.css';

const ME = 'you';

interface Member { username:string; isCreator?:boolean; color:string; avatarUrl?:string; }
interface Group  { id:number; name:string; createdBy:string; color:string; avatarUrl?:string; members:Member[]; events:{title:string;date:string;time:string}[]; }

function displayName(username:string, myDisplayName:string) {
  return username===ME ? 'You' : `@${username}`;
}

/*MOCK DATA*//*MOCK DATA*//*MOCK DATA*//*MOCK DATA*//*MOCK DATA*//*MOCK DATA*/
const INITIAL_GROUPS:Group[] = [
  { id:1,name:'COP 4331',createdBy:ME,color:'#7c5cfc',members:[{username:ME,isCreator:true,color:'#5b8dee'},{username:'guy3',color:'#3a7bd5'},{username:'guy1',color:'#2dd4d4'},{username:'guy2',color:'#e05c7a'}],events:[{title:'Group Meeting',date:'Today',time:'2:00 PM'},{title:'Event Title',date:'Apr 10',time:'1:00 PM'}] },
];

//SVGS MADE IN CANVA AND IMPORTED HERE
function ChatWhite({size=14}:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="2" strokeLinejoin="round"/></svg>;
}
function ChatGrad({size=16}:{size?:number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="url(#sg)" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
}

export default function GroupsPage() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();

  const [groups,       setGroups]       = useState<Group[]>(INITIAL_GROUPS);
  const [selected,     setSelected]     = useState<Group|null>(null);
  const [expanded,     setExpanded]     = useState({members:true,events:true});
  const [addInput,     setAddInput]     = useState('');

  //modals
  const [showCreate,   setShowCreate]   = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [showGroupPic, setShowGroupPic] = useState(false);
  const [showLeave,    setShowLeave]    = useState(false);
  const [showSearch,   setShowSearch]   = useState(false);

  //create form
  const [newName,    setNewName]    = useState('');
  const [newMembers, setNewMembers] = useState('');
  const [newColor]   = useState(() => randomColor());
  const [newAvatarUrl, setNewAvatarUrl] = useState<string|undefined>();

  //profile edit
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editAvatarUrl,   setEditAvatarUrl]   = useState<string|undefined>();

  //group pic edit
  const [editGroupUrl, setEditGroupUrl] = useState<string|undefined>();

  //search
  const [searchQ, setSearchQ] = useState('');

  function toggle(key:'members'|'events') { setExpanded(e=>({...e,[key]:!e[key]})); }

  function openProfile() {
    setEditDisplayName(profile.displayName);
    setEditAvatarUrl(profile.avatarUrl||undefined);
    setShowProfile(true);
  }

  function saveProfile() {
    updateProfile({ displayName: editDisplayName||profile.displayName, avatarUrl: editAvatarUrl||null });
    setShowProfile(false);
  }

  function openGroupPic() {
    setEditGroupUrl(selected?.avatarUrl);
    setShowGroupPic(true);
  }

  function saveGroupPic() {
    if(!selected) return;
    const updated = {...selected, avatarUrl: editGroupUrl};
    setGroups(prev=>prev.map(g=>g.id===selected.id?updated:g));
    setSelected(updated);
    setShowGroupPic(false);
  }

  function handleCreate() {
    if(!newName.trim()) return;
    const extras = newMembers.split(',').map(s=>s.trim()).filter(Boolean);
    const members:Member[] = [
      {username:ME,isCreator:true,color:profile.avatarColor},
      ...extras.map((u,i)=>({username:u,color:AVATAR_COLORS[(i+1)%AVATAR_COLORS.length]})),
    ];
    setGroups(prev=>[...prev,{id:Date.now(),name:newName.trim(),createdBy:ME,color:newColor,avatarUrl:newAvatarUrl,members,events:[]}]);
    setShowCreate(false); setNewName(''); setNewMembers('');
  }

  function addMember(username:string) {
    if(!selected||!username.trim()) return;
    const u=username.trim();
    if(selected.members.find(m=>m.username===u)) return;
    const updated={...selected,members:[...selected.members,{username:u,color:AVATAR_COLORS[selected.members.length%AVATAR_COLORS.length]}]};
    setGroups(prev=>prev.map(g=>g.id===selected.id?updated:g));
    setSelected(updated); setAddInput('');
  }

  function removeMember(username:string) {
    if(!selected) return;
    const updated={...selected,members:selected.members.filter(m=>m.username!==username)};
    setGroups(prev=>prev.map(g=>g.id===selected.id?updated:g));
    setSelected(updated);
  }

  function leaveGroup() {
    if(!selected) return;
    setGroups(prev=>prev.filter(g=>g.id!==selected.id));
    setSelected(null); setShowLeave(false);
    //API PEOPLE ALSO MAKE SURE THAT WHEN SOMEONE LEAVES A GROUP THEY ALSO GET REMOVED FROM THE CHAT ASSOCIATED WITH IT
  }

  const isCreator = selected?.createdBy===ME;
  const avatarLetter = (profile.displayName||'U')[0].toUpperCase();

  // Filtered groups for search
  const filteredGroups = searchQ
    ? groups.filter(g=>g.name.toLowerCase().includes(searchQ.toLowerCase())||g.members.some(m=>m.username.toLowerCase().includes(searchQ.toLowerCase())))
    : groups;

  return (
    <div className="groups-wrap">
      <div className="topbar">
        <div className="topbar-left"><h2>My Groups</h2></div>
        <div className="topbar-right">
          <button className="icon-btn" title="Search" onClick={()=>setShowSearch(!showSearch)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="url(#sg)" strokeWidth="1.8"/><path d="M21 21l-4.35-4.35" stroke="url(#sg)" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
          <button className="btn-ghost" style={{gap:'8px',padding:'7px 14px'}} onClick={openProfile}>
            <Avatar letter={avatarLetter} color={profile.avatarColor} url={profile.avatarUrl} size={22}/> Profile
          </button>
          <button className="btn-primary" onClick={()=>setShowCreate(true)}>＋ New Group</button>
        </div>
      </div>

      {showSearch&&(
        <div className="search-bar-row">
          <input className="search-input-field" autoFocus placeholder="Search groups or members..."
            value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
          <button className="icon-btn" onClick={()=>{setShowSearch(false);setSearchQ('');}}>✕</button>
        </div>
      )}

      <div className="groups-body">
        {/* LIST */}
        <div className="groups-list">
          <div className="section-title">All Groups</div>
          {filteredGroups.map(g=>(
            <div key={g.id} className={`group-row ${selected?.id===g.id?'active':''}`}
              onClick={()=>{setSelected(g);setExpanded({members:true,events:true});setAddInput('');}}>
              <Avatar letter={g.name[0]} color={g.color} url={g.avatarUrl} size={36} square/>
              <div className="group-row-info">
                <div className="group-row-name">{g.name}</div>
                <div className="group-row-sub">{g.members.length} members · {g.events.length} events</div>
              </div>
            </div>
          ))}
          {filteredGroups.length===0&&<div style={{fontSize:'0.82rem',color:'var(--text-muted)',padding:'12px 4px'}}>No results</div>}
        </div>

        {/* DETAIL */}
        <div className={`group-detail ${selected?'visible':''}`}>
          {selected?(
            <>
              <div className="group-detail-header">
                <Avatar letter={selected.name[0]} color={selected.color} url={selected.avatarUrl}
                  size={50} square editable={isCreator} onEdit={openGroupPic}/>
                <div style={{flex:1}}>
                  <div className="group-detail-name">{selected.name}</div>
                  <div className="group-detail-sub">{selected.members.length} members</div>
                </div>
                <div style={{display:'flex',gap:'8px',flexShrink:0,flexWrap:'wrap'}}>
                  <button className="btn-primary" onClick={()=>navigate('/chats')}><ChatWhite size={13}/> Message</button>
                  <button className="btn-ghost danger-ghost" onClick={()=>setShowLeave(true)}>Leave</button>
                </div>
              </div>

              {/* MEMBERS */}
              <div className="collapsible">
                <button className="collapsible-header" onClick={()=>toggle('members')}>
                  <span>Members</span><span className="collapse-arrow">{expanded.members?'▲':'▼'}</span>
                </button>
                {expanded.members&&(
                  <div className="collapsible-body scrollable">
                    {selected.members.map(m=>(
                      <div key={m.username} className="member-row">
                        <Avatar letter={m.username===ME?avatarLetter:m.username[0].toUpperCase()}
                          color={m.username===ME?profile.avatarColor:m.color}
                          url={m.username===ME?profile.avatarUrl:undefined}
                          size={28}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div className="member-name">{displayName(m.username,profile.displayName)}</div>
                          {m.isCreator&&<div className="member-badge">creator</div>}
                        </div>
                        <div style={{display:'flex',gap:'5px',flexShrink:0}}>
                          {m.username!==ME&&<button className="icon-btn" title="Message" onClick={()=>navigate('/chats')}><ChatGrad/></button>}
                          {isCreator&&m.username!==ME&&<button className="icon-btn danger-btn" title="Remove" onClick={()=>removeMember(m.username)}>✕</button>}
                        </div>
                      </div>
                    ))}
                    {isCreator&&(
                      <div className="add-member-row">
                        <input placeholder="Add by username..." value={addInput}
                          onChange={e=>setAddInput(e.target.value)}
                          onKeyDown={e=>e.key==='Enter'&&addMember(addInput)}
                          className="add-member-input"/>
                        <button className="btn-ghost" style={{padding:'7px 12px',flexShrink:0}} onClick={()=>addMember(addInput)}>Add</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* EVENTS */}
              <div className="collapsible">
                <button className="collapsible-header" onClick={()=>toggle('events')}>
                  <span>Upcoming Events</span><span className="collapse-arrow">{expanded.events?'▲':'▼'}</span>
                </button>
                {expanded.events&&(
                  <div className="collapsible-body scrollable">
                    {selected.events.length===0&&<div style={{padding:'10px',fontSize:'0.82rem',color:'var(--text-muted)'}}>No events yet</div>}
                    {selected.events.map((ev,i)=>(
                      <div key={i} className="group-event-row" onClick={()=>navigate('/calendar')}>
                        <div className="group-event-title">{ev.title}</div>
                        <div className="group-event-meta">{ev.date} · {ev.time}</div>
                      </div>
                    ))}
                    <button className="btn-ghost" style={{width:'100%',marginTop:'6px',justifyContent:'center'}} onClick={()=>navigate('/calendar')}>＋ Create Event</button>
                  </div>
                )}
              </div>
            </>
          ):(
            <div className="detail-empty">Select a group to view details</div>
          )}
        </div>
      </div>

      {/* PROFILE EDITOR */}
      {showProfile&&(
        <div className="modal-overlay" onClick={()=>setShowProfile(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Profile</h3><button className="icon-btn" onClick={()=>setShowProfile(false)}>✕</button></div>
            <AvatarUploadZone currentUrl={editAvatarUrl} currentColor={profile.avatarColor}
              letter={avatarLetter} size={88}
              onFile={setEditAvatarUrl} label="Visible to all group members"/>
            <div className="field" style={{marginTop:'20px'}}>
              <label>Display Name</label>
              <input value={editDisplayName} onChange={e=>setEditDisplayName(e.target.value)} placeholder="Your display name"/>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={()=>setShowProfile(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveProfile}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* GROUP PIC EDITOR */}
      {showGroupPic&&selected&&(
        <div className="modal-overlay" onClick={()=>setShowGroupPic(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Group Photo</h3><button className="icon-btn" onClick={()=>setShowGroupPic(false)}>✕</button></div>
            <AvatarUploadZone currentUrl={editGroupUrl} currentColor={selected.color}
              letter={selected.name[0]} size={88}
              onFile={setEditGroupUrl}/>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={()=>setShowGroupPic(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveGroupPic}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE CONFIRM */}
      {showLeave&&selected&&(
        <div className="modal-overlay" onClick={()=>setShowLeave(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Leave Group</h3><button className="icon-btn" onClick={()=>setShowLeave(false)}>✕</button></div>
            <p style={{color:'var(--text-dim)',fontSize:'0.9rem',lineHeight:1.6}}>
              Are you sure you want to leave <strong style={{color:'var(--text)'}}>{selected.name}</strong>?
              You will also be removed from the affiliated group chat.
            </p>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={()=>setShowLeave(false)}>Cancel</button>
              <button className="btn-ghost danger-ghost" onClick={leaveGroup}>Leave Group</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GROUP */}
      {showCreate&&(
        <div className="modal-overlay" onClick={()=>setShowCreate(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Create Group</h3><button className="icon-btn" onClick={()=>setShowCreate(false)}>✕</button></div>
            <AvatarUploadZone currentUrl={newAvatarUrl} currentColor={newColor}
              letter={newName?newName[0]:'?'} size={72} onFile={setNewAvatarUrl}/>
            <div className="field" style={{marginTop:'16px'}}>
              <label>Group Name *</label>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="" autoFocus/>
            </div>
            <div className="field">
              <label>Add Members (usernames, comma separated)</label>
              <input value={newMembers} onChange={e=>setNewMembers(e.target.value)} placeholder=""/>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate}>Create Group</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
