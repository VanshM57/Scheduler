import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'
import { UserDataContext } from "../context/UserContext";
import { toast } from 'react-toastify'


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser} = useContext(UserDataContext)
  const navigate = useNavigate();
  const submitHandler = async (e) => {
    e.preventDefault();
    const userData = {
      email: email,
      password: password
    }
    try{
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/login`,userData);
      if(response.status === 200){
        const data = response.data.data;
        setUser(data.user);
        localStorage.setItem("token",data.token);
        toast.success("Login Successful");
        navigate('/home');
      }
    }catch(err){
      console.log(err);
      toast.error("Incorrect Credentials");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a] relative overflow-hidden">
      <div 
        className="relative w-96 p-8 rounded-2xl shadow-xl border border-gray-700 backdrop-blur-md bg-[#111] transition-all duration-500 hover:border-blue-500 hover:shadow-blue-500/50"
      >
        <h1 className="text-3xl font-bold text-white text-center">SCHEDULER</h1>
        <form className="mt-6" onSubmit={submitHandler}>
          <label className="block text-white font-medium">Email</label>
          <input
            className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />

          <label className="block text-white font-medium mt-4">Password</label>
          <input
            className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <button
            className="w-full mt-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          New here? <Link to="/signup" className="text-blue-400 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
