import { useRef } from 'react';

interface AvatarProps {
  letter:    string;
  color:     string;
  url?:      string | null;
  size?:     number;
  square?:   boolean;
  onClick?:  () => void;
  editable?: boolean;
  onEdit?:   () => void;
}

export function Avatar({ letter, color, url, size=38, square=false, onClick, editable=false, onEdit }: AvatarProps) {
  const radius = square ? `${Math.round(size*0.28)}px` : '50%';
  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: radius,
        background: url ? 'transparent' : `linear-gradient(135deg, ${color}, ${color}88)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
        fontSize: size > 44 ? '1.2rem' : size > 30 ? '0.9rem' : '0.7rem',
        color: 'white', flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      {url
        ? <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        : letter
      }
      {editable && (
        <button
          onClick={e=>{e.stopPropagation();onEdit?.();}}
          style={{
            position:'absolute',bottom:0,right:0,
            width:Math.max(18,size*0.35),height:Math.max(18,size*0.35),
            borderRadius:'50%',border:'1px solid rgba(120,160,255,0.3)',
            background:'rgba(7,5,15,0.85)',color:'var(--text-dim)',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'10px',cursor:'pointer',
          }}
        >✎</button>
      )}
    </div>
  );
}

export function useImageUpload(onFile:(url:string)=>void) {
  const ref = useRef<HTMLInputElement>(null);
  function trigger() { ref.current?.click(); }
  function Input() {
    return (
      <input ref={ref} type="file" accept="image/png,image/jpeg"
        style={{display:'none'}}
        onChange={e=>{
          const f=e.target.files?.[0];
          if(f) onFile(URL.createObjectURL(f));
          e.target.value='';
        }}
      />
    );
  }
  return {trigger, Input};
}

//upload drop zone
interface UploadZoneProps {
  currentUrl?: string | null;
  currentColor?: string;
  letter?: string;
  size?: number;
  onFile: (url:string) => void;
  label?: string;
}

export function AvatarUploadZone({currentUrl,currentColor='#5b8dee',letter='?',size=80,onFile,label}:UploadZoneProps) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'14px'}}>
      <div
        style={{
          width:size,height:size,borderRadius:`${Math.round(size*0.22)}px`,
          background:currentUrl?'transparent':`linear-gradient(135deg,${currentColor},${currentColor}88)`,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,
          fontSize:size>60?'1.8rem':'1.1rem',color:'white',
          boxShadow:`0 0 24px ${currentColor}44`,
          overflow:'hidden',cursor:'pointer',
          border:'2px dashed rgba(120,160,255,0.25)',
          transition:'all 0.2s',
        }}
        onClick={()=>ref.current?.click()}
        title="Click to upload"
      >
        {currentUrl
          ? <img src={currentUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : letter
        }
      </div>

      <div style={{textAlign:'center'}}>
        <button
          className="btn-ghost"
          style={{fontSize:'0.8rem',padding:'8px 16px'}}
          onClick={()=>ref.current?.click()}
          type="button"
        >
          {currentUrl ? 'Change photo' : 'Upload photo'}
        </button>
        <div style={{fontSize:'0.9rem',color:'var(--text-muted)',marginTop:'6px'}}>
          Upload a PNG or JPG
        </div>
        {label && <div style={{fontSize:'0.7rem',color:'var(--text-muted)',marginTop:'2px'}}>{label}</div>}
      </div>

      <input ref={ref} type="file" accept="image/png,image/jpeg" style={{display:'none'}}
        onChange={e=>{const f=e.target.files?.[0];if(f){onFile(URL.createObjectURL(f));}e.target.value='';}}
      />
    </div>
  );
}
