import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./supabase";

import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/SignUp";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";
import Files from "./features/File/File"; 
import Dashboard from "./features/dashboard/pages/Dashboard";
import Events from "./features/Calendar/event";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const getInitialPage = (): "login" | "signup" | "forgot" | "reset" => {
    const params = new URLSearchParams(window.location.search);
    return params.get("resetToken") ? "reset" : "login";
  };

  const [page, setPage] = useState<"login" | "signup" | "forgot" | "reset">(getInitialPage);

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
    if (page === "login") {
      return (
        <Login
          setPage={setPage}
          setIsAuthenticated={setIsAuthenticated}
        />
      );
    }

    if (page === "signup") {
      return <Signup setPage={setPage} />;
    }

    if (page === "forgot") {
      return <ForgotPassword setPage={setPage} />;
    }

    return <ResetPassword setPage={setPage} />;
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
