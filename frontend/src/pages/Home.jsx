import { useEffect, useState } from "react";
import axios from "axios";
import Button from "../components/ui/Button";
import Calendar from "../components/ui/Calender";
import EditModal from "../components/EditModel";
import PeriodGrid from "../components/PeriodGrid";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserDataContext } from "../context/UserContext";
import Periodcontext from "../context/Periodcontext.js";
import AddModal from "../components/AddModel";
import { toast } from "react-toastify";
import { User, LogOut, Calendar as CalendarIcon, Edit, XCircle, Bell, AlertCircle, UserCircle } from "lucide-react";
import NotificationBar from "../components/NotificationBar";

export default function Home() {
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user, setUser } = useContext(UserDataContext);
  const [editPeriod, setEditPeriod] = useState(null);
  const [editForm, setEditForm] = useState({ periodName: "", startTime: "", endTime: "", teacherName: "", roomNo: "", batch: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [addForm, setAddForm] = useState({
    periodName: "",
    teacherName: user?.name || "",
    roomNo: "",
    startTime: "",
    endTime: "",
    branch: user?.branch || "",
    batch: "",
    sem: user?.sem || ""
  });
  const [eventForm, setEventForm] = useState({
    eventName: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    roomNo: "",
    branch: [],
    sem: [],
    isForAll: false
  });
  const [selectedBranch, setSelectedBranch] = useState(user?.branch || "");
  const [selectedSem, setSelectedSem] = useState(user?.sem || "");
  const [specialEvents, setSpecialEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const { periods, setPeriods } = useContext(Periodcontext);
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    if(user){
      if(isStudent && (!selectedBranch || !selectedSem)){
        setSelectedBranch(user.branch || "");
        setSelectedSem(user.sem || "");
      }
    }
  }, [user, isStudent]);

  useEffect(() => {
    if(user){
      fetchPeriods();
      fetchSpecialEvents();
      fetchNotifications();
    }
  }, [selectedDate, selectedBranch, selectedSem]);

  useEffect(() => {
    if(user){
      fetchNotifications();
    }
  }, [user]);

  const fetchPeriods = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const params = new URLSearchParams();
      if(selectedBranch) params.append('branch', selectedBranch);
      if(selectedSem) params.append('sem', selectedSem);
      params.append('date', dateStr);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/todayPeriod/getPeriods?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.status === 200) {
        setPeriods(response.data.data.periods || []);
      }
    } catch (err) {
      toast.error("Something went wrong, Refresh to try again");
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/notification/active`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.status === 200) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const fetchSpecialEvents = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const params = new URLSearchParams();
      if(selectedBranch) params.append('branch', selectedBranch);
      if(selectedSem) params.append('sem', selectedSem);
      params.append('date', dateStr);

      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/specialEvent/getEvents?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.status === 200) {
        setSpecialEvents(response.data.data.events || []);
      }
    } catch (err) {
      console.error("Error fetching special events:", err);
    }
  };

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/todayPeriod/cancelPeriod`,
        {
          id,
          updatedBy: `Class cancelled by: ${user.name}`
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success("Class cancelled successfully");
        setPeriods((prev) => prev.map((p) => (p._id === id ? { ...p, isClassCancelled: true, updatedBy: `Cancelled by ${user.name}` } : p)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong, try again");
      console.log(err);
    }
  };

  const handleEdit = (period) => {
    setEditPeriod(period._id);
    setEditForm({
      periodName: period.periodName,
      startTime: period.startTime,
      endTime: period.endTime,
      teacherName: period.teacherName,
      roomNo: period.roomNo,
      batch: period.batch || ""
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const period = periods.find(p => p._id === editPeriod);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/todayPeriod/updatePeriod`,
        {
          id: editPeriod,
          ...editForm,
          updatedBy: `Updated by: ${user.name}`,
          sem: period?.sem || selectedSem,
          branch: period?.branch || selectedBranch,
          isClassCancelled: false
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success("Class updated successfully");
        setPeriods((prev) =>
          prev.map((p) =>
            p._id === editPeriod
              ? { ...p, ...editForm, isClassCancelled: false, updatedBy: `Updated by: ${user.name}` }
              : p
          )
        );
      }
    } catch (err) {
      if(err.response?.status === 400){
        toast.error(err.response?.data?.message || "Periods are overlapping, So please change time of period.");
      } else if(err.response?.status === 403){
        toast.error("You can only edit your own periods");
      } else {
        toast.error("Something went wrong, try again");
      }
    } 
    setEditPeriod(null);
  };

  const logoutHandler = async () => {
      try{
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/logout`,{
            headers: {
              'Authorization': `Bearer ${token}`
            }});
        if(response.status===200){
          localStorage.clear();
          setUser(null);
          toast.success("Logout successfully");
          navigate('/');
        }
      }catch(err){
        toast.error("Something went wrong, try again");
        console.log(err);
      }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/todayPeriod/addTodayPeriod`,
        {
          ...addForm,
          updatedBy: `Added by: ${user.name}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        toast.success("Class added successfully");
        const id = response.data.data.period._id;
        setPeriods((prev) => [...prev, { ...addForm,_id: id, updatedBy: `Added by: ${user.name}`, isClassCancelled: false }]);
      }
    } catch (err) {
      toast.error("Something went wrong, try again");
      console.log(err);
    } 
    setShowAddModal(false);
    setAddForm({
      periodName: "",
      teacherName: user?.name || "",
      roomNo: "",
      startTime: "",
      endTime: "",
      branch: user?.branch || "",
      batch: "",
      sem: user?.sem || ""
    });
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!eventForm.isForAll && eventForm.branch.length === 0) {
      toast.error("Please select at least one branch or check 'For All Students'");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      if (editingEvent) {
        // Update existing event
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/specialEvent/update`,
          {
            id: editingEvent._id,
            ...eventForm,
            branch: eventForm.isForAll ? ["all"] : eventForm.branch,
            sem: eventForm.isForAll ? [] : eventForm.sem
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 200) {
          toast.success("Special event updated successfully");
          fetchSpecialEvents();
          setShowEventModal(false);
          setEditingEvent(null);
          setEventForm({
            eventName: "",
            description: "",
            date: new Date().toISOString().split('T')[0],
            startTime: "",
            endTime: "",
            roomNo: "",
            branch: [],
            sem: [],
            isForAll: false
          });
        }
      } else {
        // Create new event
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/specialEvent/create`,
          {
            ...eventForm,
            branch: eventForm.isForAll ? ["all"] : eventForm.branch,
            sem: eventForm.isForAll ? [] : eventForm.sem
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 201) {
          toast.success("Special event created successfully");
          fetchSpecialEvents();
          setShowEventModal(false);
          setEventForm({
            eventName: "",
            description: "",
            date: new Date().toISOString().split('T')[0],
            startTime: "",
            endTime: "",
            roomNo: "",
            branch: [],
            sem: [],
            isForAll: false
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong, try again");
      console.log(err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/specialEvent/delete`,
        { id: eventId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success("Event deleted successfully");
        fetchSpecialEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong, try again");
      console.log(err);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="w-full bg-[#111] border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold">Class Scheduler</h1>
              <span className="text-xs sm:text-sm text-gray-400 px-2 sm:px-3 py-1 bg-blue-900/30 rounded-full capitalize">
                {user?.role || 'Student'}
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold capitalize truncate">{user?.name}</p>
                  <p className="text-gray-400 text-xs truncate hidden sm:block">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Notification Bar */}
                <NotificationBar notifications={notifications} />
                
                {/* Profile Button */}
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 transition-colors"
                  aria-label="Profile"
                  title="My Profile"
                >
                  <UserCircle className="w-5 h-5 text-gray-300 hover:text-white transition-colors" />
                </button>
                
                {/* Admin Button */}
                {user?.isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin')} 
                    className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 bg-red-600/20 hover:bg-red-600/30 border-red-500/50"
                  >
                    <span className="hidden sm:inline">Admin</span>
                    <span className="sm:hidden">⚙️</span>
                  </Button>
                )}
                
                {/* Logout Button */}
                <Button variant="outline" onClick={logoutHandler} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2">
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Date Picker and Filters */}
        <div className="bg-[#111] rounded-2xl border border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Select Date
              </label>
              <input
                type="date"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
              <p className="text-xs sm:text-sm text-gray-400 mt-2">{formatDate(selectedDate)}</p>
            </div>

            {isStudent && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Branch</label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                  >
                    <option value="">All Branches</option>
                    <option value="cse">CSE</option>
                    <option value="ece">ECE</option>
                    <option value="me">ME</option>
                    <option value="ee">EE</option>
                    <option value="ce">CE</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Semester</label>
                  <select
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-[#1a1a1a] text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    value={selectedSem}
                    onChange={(e) => setSelectedSem(e.target.value)}
                  >
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Sem {sem}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for Teachers */}
        {isTeacher && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button 
              variant="default" 
              className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-2.5"
              onClick={() => setShowAddModal(true)}
            >
              + Add New Period
            </Button>
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-2.5"
              onClick={() => {
                setEditingEvent(null);
                setEventForm({
                  eventName: "",
                  description: "",
                  date: new Date().toISOString().split('T')[0],
                  startTime: "",
                  endTime: "",
                  roomNo: "",
                  branch: [],
                  sem: [],
                  isForAll: false
                });
                setShowEventModal(true);
              }}
            >
              + Create Special Event
            </Button>
          </div>
        )}


        {/* Special Events Section */}
        {specialEvents.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Special Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {specialEvents.map((event) => {
                const eventTeacherId = event.teacher?._id || event.teacher;
                const canEditEvent = isTeacher && eventTeacherId && user?._id && String(eventTeacherId) === String(user._id);
                return (
                  <div key={event._id} className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/50 relative">
                    {canEditEvent && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setEventForm({
                              eventName: event.eventName,
                              description: event.description || "",
                              date: new Date(event.date).toISOString().split('T')[0],
                              startTime: event.startTime,
                              endTime: event.endTime,
                              roomNo: event.roomNo || "",
                              branch: event.isForAll ? [] : (event.branch || []).filter(b => b !== 'all'),
                              sem: event.isForAll ? [] : (event.sem || []),
                              isForAll: event.isForAll || false
                            });
                            setShowEventModal(true);
                          }}
                          className="p-1.5 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <XCircle className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-white mb-2 pr-16">{event.eventName}</h3>
                    {event.description && <p className="text-sm text-gray-300 mb-2">{event.description}</p>}
                    <p className="text-white text-sm">⏰ {event.startTime} - {event.endTime}</p>
                    {event.roomNo && <p className="text-white text-sm">🏫 Room: {event.roomNo}</p>}
                    <p className="text-white text-sm">👨‍🏫 {event.teacherName}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {event.isForAll ? "For All Students" : `Branch: ${(event.branch || []).filter(b => b !== 'all').join(', ').toUpperCase() || 'All'} | Sem: ${event.sem && event.sem.length > 0 ? event.sem.join(', ') : 'All'}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Periods Section */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            {isTeacher ? "Your Classes" : "Today's Schedule"}
          </h2>
          {periods.length === 0 ? (
            <div className="text-center py-12 bg-[#111] rounded-2xl border border-gray-700">
              <p className="text-gray-400">No periods scheduled for this date</p>
            </div>
          ) : (
            <PeriodGrid schedule={periods} handleEdit={handleEdit} handleCancel={handleCancel} />
          )}
        </div>

        {/* Edit Modal */}
        {editPeriod && (
          <EditModal
            editForm={editForm}
            setEditForm={setEditForm}
            handleSave={handleSave}
            handleCancel={() => setEditPeriod(null)}
          />
        )}

        {/* Add Period Modal */}
        {showAddModal && (
          <AddModal
            addForm={addForm}
            setAddForm={setAddForm}
            handleSubmit={handleAddSubmit}
            handleCancel={() => setShowAddModal(false)}
          />
        )}

        {/* Special Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111] w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col max-h-[90vh]">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 text-center flex-shrink-0">
                {editingEvent ? "Edit Special Event" : "Create Special Event"}
              </h2>
              <form className="space-y-3 sm:space-y-4 flex-1 overflow-y-auto hide-scrollbar" onSubmit={handleEventSubmit}>
                <div>
                  <label className="block text-gray-300 mb-1">Event Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
                    value={eventForm.eventName}
                    onChange={(e) => setEventForm({...eventForm, eventName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Room No (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
                      value={eventForm.roomNo}
                      onChange={(e) => setEventForm({...eventForm, roomNo: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">Start Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1 text-sm">End Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 text-sm rounded-xl bg-[#1a1a1a] border border-gray-600 text-white"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={eventForm.isForAll}
                      onChange={(e) => setEventForm({...eventForm, isForAll: e.target.checked})}
                      className="rounded"
                    />
                    For All Students
                  </label>
                </div>
                {!eventForm.isForAll && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Select Branches</label>
                      <div className="flex flex-wrap gap-2">
                        {['cse', 'ece', 'me', 'ee', 'ce'].map((branch) => (
                          <label key={branch} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={eventForm.branch.includes(branch)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEventForm({
                                    ...eventForm,
                                    branch: [...eventForm.branch, branch]
                                  });
                                } else {
                                  setEventForm({
                                    ...eventForm,
                                    branch: eventForm.branch.filter(b => b !== branch)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300 uppercase">{branch}</span>
                          </label>
                        ))}
                      </div>
                      {eventForm.branch.length > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          Selected: {eventForm.branch.map(b => b.toUpperCase()).join(', ')}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2 text-sm">Select Semesters</label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <label key={sem} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={eventForm.sem.includes(sem)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEventForm({
                                    ...eventForm,
                                    sem: [...eventForm.sem, sem]
                                  });
                                } else {
                                  setEventForm({
                                    ...eventForm,
                                    sem: eventForm.sem.filter(s => s !== sem)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">Sem {sem}</span>
                          </label>
                        ))}
                      </div>
                      {eventForm.sem.length > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          Selected: {eventForm.sem.join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Leave empty to include all semesters
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-[#111] pb-2 -mb-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                      setEventForm({
                        eventName: "",
                        description: "",
                        date: new Date().toISOString().split('T')[0],
                        startTime: "",
                        endTime: "",
                        roomNo: "",
                        branch: [],
                        sem: [],
                        isForAll: false
                      });
                    }} 
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingEvent ? "Update Event" : "Create Event"}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
