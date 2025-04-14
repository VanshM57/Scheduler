import React, { createContext, useState, useEffect } from "react";

export const UserDataContext = createContext();

function UserContext({children}){
     // Retrieve user data from localStorage when the app loads
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Save user data to localStorage whenever it changes
    useEffect(() => {
        if (user && Object.keys(user).length !== 0) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user"); // Remove if user logs out
        }
    }, [user]);
    
    return (
            <UserDataContext.Provider value={{ user, setUser }}>
                            {children}
            </UserDataContext.Provider>
    )
}
export default UserContext