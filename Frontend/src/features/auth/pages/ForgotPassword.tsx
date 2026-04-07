import AuthLayout from "../../../layouts/AuthLayout";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

type Props = {
  setPage: (page: "login" | "signup" | "forgot" | "reset") => void;
};

const ForgotPassword = ({ setPage }: Props) => {
  return (
    <AuthLayout>
      <ForgotPasswordForm setPage={setPage} />
    </AuthLayout>
  );
};

export default ForgotPassword;
