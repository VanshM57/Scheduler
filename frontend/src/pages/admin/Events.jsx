import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    roomNo: "",
    branch: [],
    sem: [],
    isForAll: false,
    teacherId: ""
  });

  useEffect(() => {
    fetchEvents();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/users?role=teacher`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      if (response.status === 200) {
        setTeachers(response.data.data.users);
      }
    } catch (err) {
      console.error("Failed to load teachers");
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/events`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.status === 200) {
        setEvents(response.data.data.events);
      }
    } catch (err) {
      toast.error("Failed to load events");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.isForAll && formData.branch.length === 0) {
      toast.error("Please select at least one branch or check 'For All Students'");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      if (editingEvent) {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/events/update`,
          {
            id: editingEvent._id,
            ...formData,
            branch: formData.isForAll ? ["all"] : formData.branch,
            sem: formData.isForAll ? [] : formData.sem
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 200) {
          toast.success("Event updated successfully");
          fetchEvents();
          setShowModal(false);
          resetForm();
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/events/create`,
          {
            ...formData,
            branch: formData.isForAll ? ["all"] : formData.branch,
            sem: formData.isForAll ? [] : formData.sem
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 201) {
          toast.success("Event created successfully");
          fetchEvents();
          setShowModal(false);
          resetForm();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/events/delete`,
        { id: eventId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success("Event deleted successfully");
        fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      eventName: event.eventName,
      description: event.description || "",
      date: new Date(event.date).toISOString().split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      roomNo: event.roomNo || "",
      branch: event.isForAll ? [] : (event.branch || []).filter(b => b !== 'all'),
      sem: event.isForAll ? [] : (event.sem || []),
      isForAll: event.isForAll || false,
      teacherId: event.teacher?._id || ""
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      eventName: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      startTime: "",
      endTime: "",
      roomNo: "",
      branch: [],
      sem: [],
      isForAll: false,
      teacherId: ""
    });
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
            <h1 className="text-2xl font-bold">Special Events Management</h1>
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
            Add Event
          </Button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No events found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div key={event._id} className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/50 relative">
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-1.5 bg-blue-600/80 hover:bg-blue-600 rounded"
                  >
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                <h3 className="text-lg font-bold mb-2 pr-16">{event.eventName}</h3>
                {event.description && <p className="text-sm text-gray-300 mb-2">{event.description}</p>}
                <p className="text-white text-sm">⏰ {event.startTime} - {event.endTime}</p>
                {event.roomNo && <p className="text-white text-sm">🏫 Room: {event.roomNo}</p>}
                <p className="text-white text-sm">👨‍🏫 {event.teacherName}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {event.isForAll ? "For All Students" : 
                   `Branch: ${(event.branch || []).filter(b => b !== 'all').join(', ').toUpperCase() || 'All'} | Sem: ${event.sem && event.sem.length > 0 ? event.sem.join(', ') : 'All'}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Date: {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
              <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">
                {editingEvent ? "Edit Event" : "Create Event"}
              </h2>
              <form className="space-y-4 flex-1 overflow-y-auto hide-scrollbar" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Event Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.eventName}
                    onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Select Teacher</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  >
                    <option value="">Select Teacher (Optional)</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Room No</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                      value={formData.roomNo}
                      onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Start Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">End Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.isForAll}
                      onChange={(e) => setFormData({...formData, isForAll: e.target.checked})}
                      className="rounded"
                    />
                    For All Students
                  </label>
                </div>
                {!formData.isForAll && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Select Branches</label>
                      <div className="flex flex-wrap gap-2">
                        {['cse', 'ece', 'me', 'ee', 'ce'].map((branch) => (
                          <label key={branch} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.branch.includes(branch)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({...formData, branch: [...formData.branch, branch]});
                                } else {
                                  setFormData({...formData, branch: formData.branch.filter(b => b !== branch)});
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300 uppercase">{branch}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Select Semesters</label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <label key={sem} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.sem.includes(sem)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({...formData, sem: [...formData.sem, sem]});
                                } else {
                                  setFormData({...formData, sem: formData.sem.filter(s => s !== sem)});
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">Sem {sem}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
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
                    {editingEvent ? "Update" : "Create"}
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

