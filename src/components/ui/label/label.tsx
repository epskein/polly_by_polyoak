import { ReactNode } from "react";

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
}

const Label: React.FC<LabelProps> = ({ children, htmlFor }) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
};

export default Label;
