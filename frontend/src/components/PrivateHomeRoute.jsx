import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import { toast } from "react-toastify";

export default function PrivateHomeRoute({ children }) {
  const { user, loading } = useContext(UserDataContext);

  if (loading) {
    // ✅ show spinner or skeleton while fetching user
    return <div>Loading...</div>;
  }

  if (!user) {
    toast.info("Please Login.")
    return <Navigate to="/" replace />;
  }

  return children;
}
