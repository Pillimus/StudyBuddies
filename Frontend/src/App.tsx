import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/SignUp";

import Dashboard from "./features/dashboard/pages/Dashboard";
import Messages from "./features/Messages/Message";
import Events from "./features/Calendar/event";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState<"login" | "signup">("login");

  // 🔐 Not logged in → show auth pages
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

  // ✅ Logged in → show app
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;