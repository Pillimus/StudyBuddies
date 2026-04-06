import AuthLayout from "../../../layouts/AuthLayout";
import SignupForm from "../components/SignUpForm";

type Props = {
  setPage: (page: "login" | "signup") => void;
  setIsAuthenticated: (val: boolean) => void;
};

const Signup = ({ setPage, setIsAuthenticated }: Props) => {
  return (
    <AuthLayout>
      <SignupForm 
        setPage={setPage} 
        setIsAuthenticated={setIsAuthenticated} 
      />
    </AuthLayout>
  );
};

export default Signup;