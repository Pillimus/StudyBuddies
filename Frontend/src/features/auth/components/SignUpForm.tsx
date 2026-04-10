import React, { useState } from "react";
import { FiLock, FiMail, FiUser } from "react-icons/fi";
import { signup } from "../../../api/signup";
import { googleLogin } from "../../../api/googleLogin";
import PasswordToggleIcon from "./PasswordToggleIcon";
type Props = {
  setPage: (page: "login" | "signup" | "forgot" | "reset") => void;
};

const SignupForm = ({ setPage }: Props) => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage("");

  if (!name || !lastName || !email || !password || !confirmPassword) {
    setMessage("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    setMessage("Passwords do not match");
    return;
  }

  const data = await signup(name, lastName, email, password);

  if (data.error && data.error.length > 0) {
    setMessage(data.error);
    return;
  }

  setMessage("Signup successful. Please verify your email before logging in.");
  setTimeout(() => setPage("login"), 1500);
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
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px", display: "flex", alignItems: "center" }}>
            <FiUser size={16} aria-hidden="true" style={{ marginRight: "10px", color: "#7c7cff" }} />
            <input
              type="text"
              placeholder="Enter your first name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setMessage("");
              }}
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
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px", display: "flex", alignItems: "center" }}>
            <FiUser size={16} aria-hidden="true" style={{ marginRight: "10px", color: "#7c7cff" }} />
            <input
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setMessage("");
              }}
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
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px", display: "flex", alignItems: "center" }}>
            <FiMail size={16} aria-hidden="true" style={{ marginRight: "10px", color: "#7c7cff" }} />
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
              }}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "12px" }}>Password</label>
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px", display: "flex", alignItems: "center" }}>
            <FiLock size={16} aria-hidden="true" style={{ marginRight: "10px", color: "#7c7cff" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                background: "transparent",
                border: "none",
                color: "#cfcfff",
                cursor: "pointer",
                marginLeft: "8px",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              } as React.CSSProperties}
            >
              <PasswordToggleIcon visible={showPassword} />
            </button>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px" }}>Confirm Password</label>
          <div style={{ borderBottom: "1px solid #aaa", paddingBottom: "6px", display: "flex", alignItems: "center" }}>
            <FiLock size={16} aria-hidden="true" style={{ marginRight: "10px", color: "#7c7cff" }} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setMessage("");
              }}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                width: "100%",
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              style={{
                background: "transparent",
                border: "none",
                color: "#cfcfff",
                cursor: "pointer",
                marginLeft: "8px",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              } as React.CSSProperties}
            >
              <PasswordToggleIcon visible={showConfirmPassword} />
            </button>
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
        {message ? (
          <div style={{ color: "#ff4d4f", fontSize: "13px", marginTop: "12px" }}>
            {message}
          </div>
        ) : null}
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
