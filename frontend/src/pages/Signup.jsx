import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { toast } from "react-toastify";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");

  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    const userData = {
      name: name,
      email: email,
      password: password,
      rollno: rollNo,
      college: collegeName,
      branch: branch,
      sem: semester
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
      toast.error("Invalid Credentials");
      setName("");
      setEmail("");
      setPassword("");
      setRollNo("");
      setCollegeName("");
      setBranch("");
      setSemester("");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a] relative overflow-hidden">
      <div 
        className="relative w-96 p-8 rounded-2xl shadow-xl border border-gray-700 backdrop-blur-md bg-[#111] transition-all duration-500 hover:border-blue-500 hover:shadow-blue-500/50"
      >
        <h1 className="text-3xl font-bold text-white text-center">SCHEDULER</h1>
        <form className="mt-6" onSubmit={submitHandler}>
          <input className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="text" placeholder="University Roll No." value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
          <input className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="text" placeholder="College Name" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required />
          <input className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="text" placeholder="Branch (CSE, ECE, ME, etc.)" value={branch} onChange={(e) => setBranch(e.target.value)} required />
          <input className="w-full mt-2 p-3 rounded-lg bg-white/20 text-white border border-transparent focus:border-blue-500 transition-all duration-300 focus:ring-2 focus:ring-blue-500" type="number" placeholder="Semester (1-8)" min={1} max={8} value={semester} onChange={(e) => setSemester(e.target.value)} required />
          <button className="w-full mt-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg">
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4">
          Already have an account? <Link to="/" className="text-blue-400 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
