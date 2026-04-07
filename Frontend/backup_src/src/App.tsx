import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EventProvider } from './context/EventContext';
import { UserProvider  } from './context/UserContext';
import Login    from './features/auth/pages/Login';
import Signup   from './features/auth/pages/SignUp';
import Sidebar  from './components/layout/Sidebar';
import Dashboard    from './features/dashboard/pages/Dashboard';
import CalendarPage from './features/Calendar/CalendarPage';
import GroupsPage   from './features/groups/GroupsPage';
import ChatsPage    from './features/chats/ChatsPage';
import FilesPage    from './features/files/FilesPage';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="page-area">{children}</div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('user'));

  return (
    <BrowserRouter>
      <UserProvider>
        <EventProvider>
          <Routes>
            <Route path="/"       element={<Login  setPage={()=>{}} setIsAuthenticated={setIsAuthenticated}/>}/>
            <Route path="/signup" element={<Signup setPage={()=>{}} setIsAuthenticated={setIsAuthenticated}/>}/>
            <Route path="/dashboard" element={isAuthenticated?<AppShell><Dashboard/></AppShell>    :<Navigate to="/"/>}/>
            <Route path="/groups"    element={isAuthenticated?<AppShell><GroupsPage/></AppShell>   :<Navigate to="/"/>}/>
            <Route path="/calendar"  element={isAuthenticated?<AppShell><CalendarPage/></AppShell> :<Navigate to="/"/>}/>
            <Route path="/chats"     element={isAuthenticated?<AppShell><ChatsPage/></AppShell>    :<Navigate to="/"/>}/>
            <Route path="/files"     element={isAuthenticated?<AppShell><FilesPage/></AppShell>    :<Navigate to="/"/>}/>
            <Route path="*"          element={<Navigate to="/"/>}/>
          </Routes>
        </EventProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
