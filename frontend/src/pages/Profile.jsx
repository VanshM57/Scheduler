import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { UserDataContext } from "../context/UserContext";
import { ArrowLeft, User, Mail, GraduationCap, BookOpen, Lock, Save } from "lucide-react";
import Button from "../components/ui/Button";

export default function Profile() {
  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    branch: "",
    sem: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        branch: user.branch || "",
        sem: user.sem || "",
        password: "",
        confirmPassword: ""
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // If student, validate branch and sem
    if (user?.role === 'student') {
      if (!formData.branch) {
        toast.error("Branch is required for students");
        return;
      }
      if (!formData.sem || formData.sem < 1 || formData.sem > 8) {
        toast.error("Please enter a valid semester (1-8)");
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const updateData = {};
      if (formData.branch) updateData.branch = formData.branch.toLowerCase();
      if (formData.sem) updateData.sem = parseInt(formData.sem);
      if (formData.password) updateData.password = formData.password;

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/updateProfile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        // Update user context
        setUser(response.data.data.user);
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          password: "",
          confirmPassword: ""
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="w-full bg-[#111] border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold">My Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Card */}
        <div className="bg-[#111] rounded-2xl border border-gray-700 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl sm:text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold capitalize mb-2">{user.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm sm:text-base text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'teacher' 
                      ? 'bg-blue-900/30 text-blue-400' 
                      : 'bg-green-900/30 text-green-400'
                  }`}>
                    {user.role}
                  </span>
                  {user.isAdmin && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-900/30 text-red-400">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-gray-700">
              <div>
                <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium">
                  <User className="w-4 h-4" />
                  Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] text-gray-400 border border-gray-700 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 rounded-lg bg-[#0a0a0a] text-gray-400 border border-gray-700 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Update Profile
              </h3>

              {/* Student-specific fields */}
              {user.role === 'student' && (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium">
                      <GraduationCap className="w-4 h-4" />
                      Branch
                    </label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="cse">CSE - Computer Science Engineering</option>
                      <option value="ece">ECE - Electronics & Communication Engineering</option>
                      <option value="me">ME - Mechanical Engineering</option>
                      <option value="ee">EE - Electrical Engineering</option>
                      <option value="ce">CE - Civil Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-gray-300 mb-2 text-sm font-medium">
                      <BookOpen className="w-4 h-4" />
                      Semester
                    </label>
                    <select
                      className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      value={formData.sem}
                      onChange={(e) => setFormData({...formData, sem: e.target.value})}
                      required
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Password Change */}
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-md font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </h4>
                <p className="text-xs text-gray-400 mb-4">Leave empty to keep current password</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/home')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Additional Info Card */}
        <div className="bg-[#111] rounded-2xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Account Created</p>
              <p className="text-white font-medium">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            {user.rollno && (
              <div>
                <p className="text-gray-400">Roll Number</p>
                <p className="text-white font-medium uppercase">{user.rollno}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

