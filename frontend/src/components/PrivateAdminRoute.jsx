import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import { toast } from "react-toastify";

const PrivateAdminRoute = ({ children }) => {
  const { user, loading } = useContext(UserDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("Please login to access admin panel");
        navigate("/");
      } else if (!user.isAdmin) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/home");
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return <>{children}</>;
};

export default PrivateAdminRoute;

