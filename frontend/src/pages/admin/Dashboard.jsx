import { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { UserDataContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  Bell, 
  LogOut, 
  User,
  BookOpen,
  Clock,
  AlertCircle
} from "lucide-react";
import Button from "../../components/ui/Button";

export default function AdminDashboard() {
  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to access admin panel");
        navigate("/");
        return;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/admin/dashboard/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setStats(response.data.data.stats);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load dashboard stats";
      toast.error(errorMessage);
      console.error("Dashboard stats error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => navigate("/home"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const logoutHandler = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/logout`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        localStorage.clear();
        setUser(null);
        toast.success("Logout successfully");
        navigate('/');
      }
    } catch (err) {
      toast.error("Something went wrong, try again");
      console.log(err);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "blue",
      link: "/admin/users"
    },
    {
      title: "Students",
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: "green",
      link: "/admin/users?role=student"
    },
    {
      title: "Teachers",
      value: stats?.totalTeachers || 0,
      icon: User,
      color: "purple",
      link: "/admin/users?role=teacher"
    },
    {
      title: "Original Periods",
      value: stats?.totalOriginalPeriods || 0,
      icon: BookOpen,
      color: "orange",
      link: "/admin/periods"
    },
    {
      title: "Today Periods",
      value: stats?.totalTodayPeriods || 0,
      icon: Clock,
      color: "cyan",
      link: "/admin/periods?type=today"
    },
    {
      title: "Special Events",
      value: stats?.totalSpecialEvents || 0,
      icon: Calendar,
      color: "pink",
      link: "/admin/events"
    },
    {
      title: "Notifications",
      value: stats?.totalNotifications || 0,
      icon: Bell,
      color: "yellow",
      link: "/admin/notifications"
    },
    {
      title: "Active Notifications",
      value: stats?.activeNotifications || 0,
      icon: AlertCircle,
      color: "red",
      link: "/admin/notifications?active=true"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="w-full bg-[#111] border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold">Admin Panel</h1>
              <span className="text-xs sm:text-sm text-gray-400 px-2 sm:px-3 py-1 bg-red-900/30 rounded-full">
                ADMIN
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/home')} 
                  className="text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
                >
                  Home
                </Button>
                <Button 
                  variant="outline" 
                  onClick={logoutHandler} 
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: "bg-blue-900/20 border-blue-500/50",
              green: "bg-green-900/20 border-green-500/50",
              purple: "bg-purple-900/20 border-purple-500/50",
              orange: "bg-orange-900/20 border-orange-500/50",
              cyan: "bg-cyan-900/20 border-cyan-500/50",
              pink: "bg-pink-900/20 border-pink-500/50",
              yellow: "bg-yellow-900/20 border-yellow-500/50",
              red: "bg-red-900/20 border-red-500/50"
            };
            return (
              <div
                key={index}
                onClick={() => navigate(stat.link)}
                className={`${colorClasses[stat.color]} rounded-xl p-4 border cursor-pointer hover:scale-105 transition-transform`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-50" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#111] rounded-2xl border border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/admin/periods')}
            >
              Manage Periods
            </Button>
            <Button
              variant="default"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate('/admin/events')}
            >
              Manage Events
            </Button>
            <Button
              variant="default"
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => navigate('/admin/notifications')}
            >
              Manage Notifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

