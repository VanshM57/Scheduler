import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { toast } from "react-toastify";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Validate email domain
    if(!email.endsWith('@rtu.ac.in')){
      toast.error("Email must be from @rtu.ac.in domain");
      return;
    }
    
    const userData = {
      name: name,
      email: email,
      password: password
    }
    try{
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/register`,userData);
      if(response.status === 201){
        const data = response.data.data;
        setUser(data.user);
        localStorage.setItem("token",data.token);
        navigate('/home');
      }
    }catch(err){
      console.log(err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Invalid Credentials";
      toast.error(errorMessage);
      setName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] relative overflow-hidden px-4 py-8">
      <div 
        className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700 backdrop-blur-md bg-[#111] transition-all duration-500 hover:border-blue-500 hover:shadow-blue-500/50"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">SCHEDULER</h1>
        <p className="text-center text-gray-400 text-xs sm:text-sm mt-2">RTU College Class Scheduler</p>
        <form className="mt-6" onSubmit={submitHandler}>
          <label className="block text-white font-medium text-sm sm:text-base">Full Name</label>
          <input className="w-full mt-2 p-2.5 sm:p-3 rounded-lg bg-white/20 text-white text-sm sm:text-base border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
          
          <label className="block text-white font-medium mt-4 text-sm sm:text-base">Email</label>
          <input className="w-full mt-2 p-2.5 sm:p-3 rounded-lg bg-white/20 text-white text-sm sm:text-base border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="email" placeholder="yourname@rtu.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <p className="text-xs text-gray-400 mt-1">Only @rtu.ac.in emails are allowed</p>
          
          <label className="block text-white font-medium mt-4 text-sm sm:text-base">Password</label>
          <input className="w-full mt-2 p-2.5 sm:p-3 rounded-lg bg-white/20 text-white text-sm sm:text-base border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="password" placeholder="Enter your password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          
          <button className="w-full mt-6 py-2.5 sm:py-3 bg-blue-600 text-white text-base sm:text-lg font-semibold rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg">
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4 text-sm">
          Already have an account? <Link to="/" className="text-blue-400 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
