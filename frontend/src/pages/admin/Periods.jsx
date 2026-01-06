import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, Edit, Trash2, Search } from "lucide-react";
import Button from "../../components/ui/Button";

export default function AdminPeriods() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [periods, setPeriods] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [filterDay, setFilterDay] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [periodType, setPeriodType] = useState(searchParams.get('type') || 'original');
  const [formData, setFormData] = useState({
    periodName: "",
    teacherId: "",
    teacherName: "",
    roomNo: "",
    startTime: "",
    endTime: "",
    branch: "",
    batch: "",
    sem: "",
    day: "Monday"
  });

  useEffect(() => {
    fetchPeriods();
    if(periodType === 'original') {
      fetchTeachers();
    }
  }, [periodType, filterDay, filterBranch]);

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

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if(filterDay) params.append('day', filterDay);
      if(filterBranch) params.append('branch', filterBranch);
      
      const endpoint = periodType === 'today' 
        ? '/admin/periods/today' 
        : '/admin/periods/original';
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}${endpoint}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.status === 200) {
        setPeriods(response.data.data.periods);
      }
    } catch (err) {
      toast.error("Failed to load periods");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(periodType !== 'original') {
      toast.error("Can only edit original periods");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      if (editingPeriod) {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/periods/update`,
          {
            id: editingPeriod._id,
            ...formData,
            sem: parseInt(formData.sem),
            teacherId: formData.teacherId || undefined
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 200) {
          toast.success("Period updated successfully");
          fetchPeriods();
          setShowModal(false);
          resetForm();
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/admin/periods/create`,
          {
            ...formData,
            sem: parseInt(formData.sem),
            teacherId: formData.teacherId || undefined
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 201) {
          toast.success("Period created successfully");
          fetchPeriods();
          setShowModal(false);
          resetForm();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  const handleDelete = async (periodId) => {
    if (!window.confirm("Are you sure you want to delete this period?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/periods/delete`,
        { id: periodId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success("Period deleted successfully");
        fetchPeriods();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  const handleEdit = (period) => {
    if(periodType !== 'original') {
      toast.error("Can only edit original periods");
      return;
    }
    setEditingPeriod(period);
    setFormData({
      periodName: period.periodName || "",
      teacherId: period.teacher?._id || "",
      teacherName: period.teacherName || "",
      roomNo: period.roomNo || "",
      startTime: period.startTime || "",
      endTime: period.endTime || "",
      branch: period.branch || "",
      batch: period.batch || "",
      sem: period.sem || "",
      day: period.day || "Monday"
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingPeriod(null);
    setFormData({
      periodName: "",
      teacherId: "",
      teacherName: "",
      roomNo: "",
      startTime: "",
      endTime: "",
      branch: "",
      batch: "",
      sem: "",
      day: "Monday"
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
            <h1 className="text-2xl font-bold">Period Management</h1>
          </div>
          {periodType === 'original' && (
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Period
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-[#111] rounded-2xl border border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodType('original')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  periodType === 'original' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
                }`}
              >
                Original Periods
              </button>
              <button
                onClick={() => setPeriodType('today')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  periodType === 'today' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]'
                }`}
              >
                Today Periods
              </button>
            </div>
            {periodType === 'original' && (
              <select
                className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-600"
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
              >
                <option value="">All Days</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            )}
            <select
              className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white border border-gray-600"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
            >
              <option value="">All Branches</option>
              <option value="cse">CSE</option>
              <option value="ece">ECE</option>
              <option value="me">ME</option>
              <option value="ee">EE</option>
              <option value="ce">CE</option>
            </select>
          </div>
        </div>

        {/* Periods Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : periods.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No periods found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {periods.map((period) => (
              <div key={period._id} className="bg-[#111] rounded-xl border border-gray-700 p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold capitalize">{period.periodName}</h3>
                  {periodType === 'original' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(period)}
                        className="p-1.5 bg-blue-600/80 hover:bg-blue-600 rounded"
                      >
                        <Edit className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(period._id)}
                        className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-300">⏰ {period.startTime} - {period.endTime}</p>
                <p className="text-sm text-gray-300">👨‍🏫 {period.teacherName}</p>
                <p className="text-sm text-gray-300">🏫 Room: {period.roomNo}</p>
                <p className="text-sm text-gray-300">🎓 {period.branch?.toUpperCase()} - Sem {period.sem}</p>
                {period.batch && <p className="text-sm text-gray-300">Batch: {period.batch}</p>}
                {period.day && <p className="text-sm text-gray-300">Day: {period.day}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && periodType === 'original' && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
              <h2 className="text-xl font-bold text-white mb-4 flex-shrink-0">
                {editingPeriod ? "Edit Period" : "Create Period"}
              </h2>
              <form className="space-y-4 flex-1 overflow-y-auto hide-scrollbar" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Period Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.periodName}
                    onChange={(e) => setFormData({...formData, periodName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Select Teacher</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.teacherId}
                    onChange={(e) => {
                      const teacher = teachers.find(t => t._id === e.target.value);
                      setFormData({
                        ...formData,
                        teacherId: e.target.value,
                        teacherName: teacher ? teacher.name : formData.teacherName
                      });
                    }}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1 text-sm">Or Enter Teacher Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                    required
                  />
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
                  <label className="block text-gray-300 mb-1 text-sm">Room No</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({...formData, roomNo: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Branch</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      required
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
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Batch</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                      value={formData.batch}
                      onChange={(e) => setFormData({...formData, batch: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Day</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white text-sm"
                      value={formData.day}
                      onChange={(e) => setFormData({...formData, day: e.target.value})}
                      required
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                  </div>
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
                    {editingPeriod ? "Update" : "Create"}
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

