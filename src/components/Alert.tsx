import { FC } from "react";

interface AlertProps {
  message: string;
  type: "success" | "error" | "info";
}

const Alert: FC<AlertProps> = ({ message, type }) => {
  const typeStyles = {
    success: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <div className={`rounded-md p-3 ${typeStyles[type]} mb-4`}>{message}</div>
  );
};

export default Alert;
