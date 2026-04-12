import React from "react";
import bgImage from "../assets/511517ad616f16850994c6968769fd96.jpg";
import logo from "../assets/logo.png";
import "./AuthLayout.css";

type Props = {
  children: React.ReactNode;
};

const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <img src={logo} alt="StudyBuddies" className="auth-logo-hero" />
      </div>

      <div className="auth-panel">
        <img src={logo} alt="StudyBuddies" className="auth-logo-mobile" />
        <div className="auth-form-wrap">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
