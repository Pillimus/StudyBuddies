import AuthLayout from "../../../layouts/AuthLayout";
import SignupForm from "../components/SignUpForm";

type Props = {
  setPage: (page: "login" | "signup") => void;
};

const Signup = ({ setPage }: Props) => {
  return (
    <AuthLayout>
      <SignupForm setPage={setPage} />
    </AuthLayout>
  );
};

export default Signup;
