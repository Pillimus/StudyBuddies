import { createContext, useContext, useState, ReactNode } from 'react';

const COLORS = ['#3a7bd5','#7c5cfc','#2dd4d4','#e05c7a','#f0a050','#3ecf8e','#a78bfa','#5b8dee'];
function randomColor() { return COLORS[Math.floor(Math.random()*COLORS.length)]; }

export interface UserProfile {
  displayName: string;
  avatarUrl:   string | null;
  avatarColor: string;
}

interface UserCtx {
  profile: UserProfile;
  updateProfile: (p:Partial<UserProfile>) => void;
}

const UserContext = createContext<UserCtx>({
  profile:{displayName:'',avatarUrl:null,avatarColor:COLORS[0]},
  updateProfile:()=>{},
});

export function UserProvider({children}:{children:ReactNode}) {
  const ud = JSON.parse(localStorage.getItem('user')||'{}');
  const initName = ud.firstName || ud.email?.split('@')[0] || 'User';

  const [profile, setProfile] = useState<UserProfile>({
    displayName: initName,
    avatarUrl:   null,
    avatarColor: randomColor(),
  });

  function updateProfile(p:Partial<UserProfile>) {
    setProfile(prev => ({...prev,...p}));
  }

  return <UserContext.Provider value={{profile,updateProfile}}>{children}</UserContext.Provider>;
}

export function useUser() { return useContext(UserContext); }

export { COLORS as AVATAR_COLORS, randomColor };
