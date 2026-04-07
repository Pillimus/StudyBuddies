import React from "react";
import AuthLayout from "../../../layouts/AuthLayout";
import LoginForm from "../components/LoginForm";

type Props = {
  setPage: (page: "login" | "signup" | "forgot" | "reset") => void;
  setIsAuthenticated: (val: boolean) => void;
};

const Login = ({ setPage, setIsAuthenticated }: Props) => {
  return (
    <AuthLayout>
      <LoginForm
  setPage={setPage}
  setIsAuthenticated={setIsAuthenticated}
/>
    </AuthLayout>
  );
};

export default Login;
