import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./supabase";

import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/SignUp";
import Files from "./features/File/File"; 
import Dashboard from "./features/dashboard/pages/Dashboard";
import Events from "./features/Calendar/event";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState<"login" | "signup">("login");

  
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        localStorage.setItem("token", data.session.access_token);
        setIsAuthenticated(true);
      }
    };

    checkUser();
  }, []);


  if (!isAuthenticated) {
    return page === "login" ? (
      <Login
        setPage={setPage}
        setIsAuthenticated={setIsAuthenticated}
      />
    ) : (
      <Signup
        setPage={setPage}
        setIsAuthenticated={setIsAuthenticated}
      />
    );
  }

  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/files" element={<Files />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;