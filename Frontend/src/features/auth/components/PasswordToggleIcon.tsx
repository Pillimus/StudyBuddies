import { FiEye, FiEyeOff } from "react-icons/fi";

type Props = {
  visible: boolean;
};

const PasswordToggleIcon = ({ visible }: Props) => {
  return visible ? <FiEyeOff size={18} aria-hidden="true" /> : <FiEye size={18} aria-hidden="true" />;
};

export default PasswordToggleIcon;
