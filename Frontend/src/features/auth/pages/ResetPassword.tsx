import AuthLayout from "../../../layouts/AuthLayout";
import ResetPasswordForm from "../components/ResetPasswordForm";

type Props = {
  setPage: (page: "login" | "signup" | "forgot" | "reset") => void;
};

const ResetPassword = ({ setPage }: Props) => {
  return (
    <AuthLayout>
      <ResetPasswordForm setPage={setPage} />
    </AuthLayout>
  );
};

export default ResetPassword;
