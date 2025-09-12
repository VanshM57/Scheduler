import React, { createContext, useState, useEffect } from "react";
import axios from 'axios'
import { toast } from "react-toastify";

const UserDataContext = createContext();

function UserContext({children}){
     // Retrieve user data from localStorage when the app loads
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Save user data to localStorage whenever it changes
    const fetchUser = async () => {
        try {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/user/getUser`,
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        if (response.status === 200) {
            setUser(response.data.data);
            console.log(user) // ✅ updated user
        }
        } catch (error) {
            toast.info('Login Please')
            console.error("Error fetching user:", error.response?.data || error.message);
            setUser(null); // fallback
        } finally{
            setLoading(false);
        }
    };

  // Run on mount
  useEffect(() => {
    fetchUser();
  }, []);
    
    return (
            <UserDataContext.Provider value={{ user, setUser, loading }}>
                            {children}
            </UserDataContext.Provider>
    )
}
export { UserContext as default, UserDataContext };