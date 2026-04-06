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
    let mounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token && token !== "undefined" && token !== "null") {
        if (mounted) setIsAuthenticated(true);
        return;
      }

      localStorage.removeItem("token");

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session) {
        localStorage.setItem("token", data.session.access_token);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          localStorage.setItem("token", session.access_token);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!isAuthenticated) {
    return page === "login" ? (
      <Login
        setPage={setPage}
        setIsAuthenticated={setIsAuthenticated}
      />
    ) : (
      <Signup setPage={setPage} />
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
