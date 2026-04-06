import React, { useState } from "react";
import { googleLogin } from "../../../api/googleLogin";
type Props = {
  setPage: (page: "login" | "signup") => void;
  setIsAuthenticated: (val: boolean) => void;
};

const LoginForm = ({ setPage, setIsAuthenticated }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

 
const handleLogin = async () => {
  try {
    setMessage("");
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Login failed.");
      return;
    }

    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);

  } catch (err) {
    console.error(err);
    setMessage("Server error. Make sure backend is running.");
  }
};

  return (
    <div
      style={{
        width: "380px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h2 style={{ fontSize: "30px", marginBottom: "10px" }}>Sign in</h2>

      <p style={{ fontSize: "15px", lineHeight: "1.6" }}>
        If you don’t have an account register <br />
        You can{" "}
        <span
          style={{ color: "#7c7cff", cursor: "pointer" }}
          onClick={() => setPage("signup")}
        >
          Register here!
        </span>
      </p>

      {/* EMAIL */}
      <div>
        <label style={{ fontSize: "12px", opacity: 0.8 }}>Email</label>
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #aaa", paddingBottom: "6px", marginTop: "5px" }}>
          <span style={{ marginRight: "8px" }}>📧</span>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage("");
            }}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              width: "100%",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/* PASSWORD */}
      <div>
        <label style={{ fontSize: "12px", opacity: 0.8 }}>Password</label>
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #aaa", paddingBottom: "6px", marginTop: "5px" }}>
          <span style={{ marginRight: "8px" }}>🔒</span>
          <input
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setMessage("");
            }}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              width: "100%",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      {/*LOGIN BUTTON */}
      <button
        type="button"
        onClick={handleLogin}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "30px",
          border: "none",
          background: "linear-gradient(to right, #7c7cff, #a855f7)",
          color: "white",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
      {message ? (
        <div style={{ color: "#ff4d4f", fontSize: "13px", marginTop: "-8px" }}>
          {message}
        </div>
      ) : null}

      <div style={{ textAlign: "center", fontSize: "13px", color: "#7c7cff" }}>
        or continue with
      </div>

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          style={{ width: "28px", cursor: "pointer" }}
          onClick={googleLogin}
        />
      </div>
    </div>
  );
};

export default LoginForm;
