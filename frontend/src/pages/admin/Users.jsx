import { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { UserDataContext } from "../../context/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Edit, Trash2, Search } from "lucide-react";
import Button from "../../components/ui/Button";

export default function AdminUsers() {
  const { user } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState(searchParams.get('role') || "");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    branch: "",
    sem: "",
    rollno: "",
    isAdmin: false
  });

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if(filterRole) params.append('role', filterRole);
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.status === 200) {
        setUsers(response.data.data.users);
      }
    } catch (err) {
      toast.error("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      if (editingUser) {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/users/update`,
          {
            id: editingUser._id,
            ...formData,
            sem: formData.sem ? parseInt(formData.sem) : undefined
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 200) {
          toast.success("User updated successfully");
          fetchUsers();
          setShowModal(false);
          resetForm();
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/users/create`,
          {
            ...formData,
            sem: formData.sem ? parseInt(formData.sem) : undefined
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 201) {
          toast.success("User created successfully");
          fetchUsers();
          setShowModal(false);
          resetForm();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/users/delete`,
        { id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success("User deleted successfully");
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "student",
      branch: user.branch || "",
      sem: user.sem || "",
      rollno: user.rollno || "",
      isAdmin: user.isAdmin || false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "student",
      branch: "",
      sem: "",
      rollno: "",
      isAdmin: false
    });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-[#111] rounded-2xl border border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#111] rounded-2xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1a] border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Branch</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Sem</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b border-gray-700 hover:bg-[#1a1a1a]">
                      <td className="px-4 py-3 capitalize">{u.name}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          u.role === 'teacher' ? 'bg-blue-900/30 text-blue-400' :
                          'bg-green-900/30 text-green-400'
                        }`}>
                          {u.role}
                        </span>
                          {u.isAdmin && (
                            <span className="px-2 py-1 rounded text-xs bg-yellow-900/30 text-yellow-400">
                              Admin Access
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 uppercase">{u.branch || '-'}</td>
                      <td className="px-4 py-3">{u.sem || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-1.5 bg-blue-600/80 hover:bg-blue-600 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-white" />
                          </button>
                          {u._id !== user?._id && (
                            <button
                              onClick={() => handleDelete(u._id)}
                              className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
              <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">
                {editingUser ? "Edit User" : "Create User"}
              </h2>
              <form className="space-y-4 flex-1 overflow-y-auto hide-scrollbar" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">
                    Password {editingUser && "(Leave empty to keep current)"}
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Role</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                {formData.role === 'teacher' && (
                  <div>
                    <label className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.isAdmin}
                        onChange={(e) => setFormData({...formData, isAdmin: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Grant Admin Access (can be both teacher and admin)</span>
                    </label>
                  </div>
                )}
                {(formData.role === 'student' || !formData.role) && (
                  <>
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">Branch</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                        value={formData.branch}
                        onChange={(e) => setFormData({...formData, branch: e.target.value})}
                        placeholder="cse, ece, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">Semester</label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                        value={formData.sem}
                        onChange={(e) => setFormData({...formData, sem: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">Roll No</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                        value={formData.rollno}
                        onChange={(e) => setFormData({...formData, rollno: e.target.value})}
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-[#111] pb-2 -mb-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUser ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

