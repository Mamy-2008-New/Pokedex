import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

type Props = { children: ReactNode };

function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default ProtectedRoute;
