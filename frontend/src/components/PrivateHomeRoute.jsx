import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";

export default function PrivateHomeRoute({ children }) {
  const { user } = useContext(UserDataContext);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
