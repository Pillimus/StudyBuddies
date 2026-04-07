import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  setPage: (page: "login" | "signup") => void;
  setIsAuthenticated: (val: boolean) => void;
};

const LoginForm = ({ setPage, setIsAuthenticated }: Props) => {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }

    // Mock login — replace with real fetch when backend is ready
    if (email.length > 0 && password.length > 0) {
      localStorage.setItem("user", JSON.stringify({
        id: 1,
        firstName: email.split("@")[0],
        lastName: "",
        email: email,
      }));
      setIsAuthenticated(true);
      navigate("/dashboard");
      return;
    }
    setError("Invalid credentials.");
  };

  return (
    <div style={{ width: "380px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <h2 style={{ fontSize: "30px", marginBottom: "10px" }}>Sign in</h2>

      <p style={{ fontSize: "15px", lineHeight: "1.6" }}>
        Don't have an account?{" "}
        <span style={{ color: "#7c7cff", cursor: "pointer" }} onClick={() => setPage("signup")}>
          Register here!
        </span>
      </p>

      <div>
        <label style={{ fontSize: "12px", opacity: 0.8 }}>Email</label>
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #aaa", paddingBottom: "6px", marginTop: "5px" }}>
          <span style={{ marginRight: "8px" }}>📧</span>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ background: "transparent", border: "none", outline: "none", color: "white", width: "100%", fontSize: "14px" }}
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: "12px", opacity: 0.8 }}>Password</label>
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #aaa", paddingBottom: "6px", marginTop: "5px" }}>
          <span style={{ marginRight: "8px" }}>🔒</span>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ background: "transparent", border: "none", outline: "none", color: "white", width: "100%", fontSize: "14px" }}
          />
        </div>
      </div>

      {error && <div style={{ color: "#e05c7a", fontSize: "0.85rem" }}>{error}</div>}

      <button
        type="button"
        onClick={handleLogin}
        style={{ width: "100%", padding: "14px", borderRadius: "30px", border: "none", background: "linear-gradient(to right, #7c7cff, #a855f7)", color: "white", fontSize: "16px", cursor: "pointer" }}
      >
        Login
      </button>
    </div>
  );
};

export default LoginForm;
