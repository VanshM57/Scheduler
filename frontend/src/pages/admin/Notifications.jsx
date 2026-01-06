import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [activeOnly, setActiveOnly] = useState(searchParams.get('active') === 'true');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isImportant: false
  });

  useEffect(() => {
    fetchNotifications();
  }, [activeOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if(activeOnly) params.append('active', 'true');
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/notifications?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.status === 200) {
        setNotifications(response.data.data.notifications);
      }
    } catch (err) {
      toast.error("Failed to load notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      if (editingNotification) {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/notifications/update`,
          {
            id: editingNotification._id,
            ...formData
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 200) {
          toast.success("Notification updated successfully");
          fetchNotifications();
          setShowModal(false);
          resetForm();
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/notifications/create`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 201) {
          toast.success("Notification created successfully");
          fetchNotifications();
          setShowModal(false);
          resetForm();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/notifications/delete`,
        { id: notificationId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success("Notification deleted successfully");
        fetchNotifications();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      description: notification.description,
      startDate: new Date(notification.startDate).toISOString().split('T')[0],
      endDate: new Date(notification.endDate).toISOString().split('T')[0],
      isImportant: notification.isImportant || false
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingNotification(null);
    setFormData({
      title: "",
      description: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isImportant: false
    });
  };

  const isActive = (notification) => {
    const now = new Date();
    const start = new Date(notification.startDate);
    const end = new Date(notification.endDate);
    return now >= start && now <= end;
  };

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
            <h1 className="text-2xl font-bold">Notifications Management</h1>
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
            Add Notification
          </Button>
        </div>

        {/* Filter */}
        <div className="bg-[#111] rounded-2xl border border-gray-700 p-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Show only active notifications</span>
          </label>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No notifications found</div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const active = isActive(notification);
              return (
                <div
                  key={notification._id}
                  className={`bg-[#111] rounded-xl border p-4 ${
                    notification.isImportant
                      ? 'border-yellow-500/50 bg-yellow-900/10'
                      : active
                      ? 'border-green-500/50 bg-green-900/10'
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{notification.title}</h3>
                        {notification.isImportant && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                            IMPORTANT
                          </span>
                        )}
                        {active && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{notification.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        <span>Start: {new Date(notification.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(notification.endDate).toLocaleDateString()}</span>
                        <span>Created by: {notification.createdByName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(notification)}
                        className="p-1.5 bg-blue-600/80 hover:bg-blue-600 rounded"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(notification._id)}
                        className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
              <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">
                {editingNotification ? "Edit Notification" : "Create Notification"}
              </h2>
              <form className="space-y-4 flex-1 overflow-y-auto hide-scrollbar" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isImportant}
                      onChange={(e) => setFormData({...formData, isImportant: e.target.checked})}
                      className="rounded"
                    />
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    Mark as Important
                  </label>
                </div>
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
                    {editingNotification ? "Update" : "Create"}
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

