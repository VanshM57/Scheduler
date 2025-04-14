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




export default function Home() {
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user, setUser } = useContext(UserDataContext);
  const [editPeriod, setEditPeriod] = useState(null);
  const [editForm, setEditForm] = useState({ periodName: "", startTime: "", endTime: "", teacherName: "", roomNo: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    periodName: "",
    teacherName: "",
    roomNo: "",
    startTime: "",
    endTime: "",
    branch: user?.branch || "",
    batch: "",
    sem: user?.sem || ""
  });
  const navigate = useNavigate();
  const { periods, setPeriods } = useContext(Periodcontext);
  

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/todayPeriod/getPeriods`,
          {
            branch: user.branch,
            sem: user.sem
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
  
        if (response.status === 200) {
          // console.log(response.data.data.periods);
          setPeriods(response.data.data.periods);

        }
      } catch (err) {
        toast.info("Somethig went wrong, Refresh to try again");
      }
    };
  
    fetchPeriods();
  }, []);

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
        // console.log(response);
        toast.success("Class cancelled successfully");
        setPeriods((prev) => prev.map((p) => (p._id === id ? { ...p, isClassCancelled: true, updatedBy: `Cancelled by ${user.name}` } : p)));
      }
    } catch (err) {
      toast.warning("Something went wrong, try again");
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
      batch: period.batch
    });
  };

  const handleSave = async () => {
    try {
      
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/todayPeriod/updatePeriod`,
        {
          id: editPeriod,
          ...editForm,
          updatedBy: `Updated by: ${user.name}`,
          sem: user.sem,
          branch: user.branch,
          isClassCancelled: false
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (response.status === 200) {
        // console.log(response);
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
      if(err.status === 400){
        toast.info("Periods are overlapping, So please change time of period.")
      }
      toast.warning("Something went wrong, try again");
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
          // console.log(response.data);
          setUser(null);
          toast.success("Logout successfully");
          navigate('/');
        }
      }catch(err){
        toast.warning("Something went wrong, try again");
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
        // console.log(response);
        toast.success("Class added successfully");
        const id = response.data.data.period._id;
        setPeriods((prev) => [...prev, { ...addForm,_id: id, updatedBy: `Added by: ${user.name}`, isClassCancelled: false }]);
      }
    } catch (err) {
      toast.warning("Something went wrong, try again");
      console.log(err);
    } 
    setShowAddModal(false);
    setAddForm({
      periodName: "",
      teacherName: "",
      roomNo: "",
      startTime: "",
      endTime: "",
      branch: user?.branch || "",
      batch: "",
      sem: user?.sem || ""
    });
  };
  


  return (
    <div className="p-6 min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-3xl p-6 rounded-2xl shadow-xl border border-gray-700 backdrop-blur-md bg-[#111] transition-all duration-500 hover:border-blue-500 hover:shadow-blue-500/50">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Scheduler</h1>
          <Button variant="outline" onClick={logoutHandler}>Logout</Button>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Today is {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </div>

      </div>
      
      {/* Welcome User */}
      <h2 className="mt-6 text-xl font-semibold capitalize">Welcome, {user.name}!</h2>

      {/* Calendar */}
      {/* <div className="mt-8 w-full max-w-3xl">
        <h2 className="text-xl font-semibold">Select Date for Schedule</h2>
        <Calendar selected={selectedDate} onChange={setSelectedDate} />
      </div> */}
    <div className="mt-6 w-full max-w-3xl flex justify-end">
      <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition duration-300"
        onClick={() => setShowAddModal(true)}>
        + Add New Period
      </Button>
    </div>


      {/* Period Grid Component */}
      <div className="mt-6 w-full max-w-3xl">
          <PeriodGrid schedule={periods} handleEdit={handleEdit} handleCancel={handleCancel} />
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
      {showAddModal && (
        <AddModal
          addForm={addForm}
          setAddForm={setAddForm}
          handleSubmit={handleAddSubmit}
          handleCancel={() => setShowAddModal(false)}
        />
      )}

    </div>
  );
}