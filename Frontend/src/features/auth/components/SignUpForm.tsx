import React, { useState } from "react";
import { signup } from "../../../api/signup";
import { googleLogin } from "../../../api/googleLogin";
type Props = {
  setPage: (page: "login" | "signup") => void;
  setIsAuthenticated: (val: boolean) => void;
};

const SignupForm = ({ setPage, setIsAuthenticated }: Props) => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

const data = await signup(name, lastName, email, password);

  if (data.error && data.error.length > 0) {
    alert(data.error);
    return;
  }

  localStorage.setItem("token", data.token);
  setIsAuthenticated(true);
};

  return (
    <div style={{ width: "380px", display: "flex", flexDirection: "column", gap: "18px" }}>
      
      {/* TITLE */}
      <h2 style={{ fontSize: "28px" }}>Sign up</h2>

      {/* TEXT */}
      <p style={{ fontSize: "14px" }}>
            Already have an account?{" "}
            <span
                style={{ color: "#7c7cff", cursor: "pointer" }}
                onClick={() => setPage("login")}
            >
                Sign in here!
            </span>
        </p>

      <form onSubmit={handleSubmit}>

        {/* NAME */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "12px" }}>First Name</label>
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px" }}>
            <input
              type="text"
              placeholder="Enter your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* LAST NAME */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "12px" }}>Last Name</label>
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px" }}>
            <input
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* EMAIL */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "12px" }}>Email</label>
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px" }}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "12px" }}>Password</label>
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px" }}>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px" }}>Confirm Password</label>
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px" }}>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
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
          Sign up
        </button>
      </form>

      {/* GOOGLE */}
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

export default SignupForm;