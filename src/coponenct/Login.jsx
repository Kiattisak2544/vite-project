import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import Swal from "sweetalert2";
import "../index.css"




const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        userId: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5000/server/login", form);

            // เช็ค status ที่ส่งมาจาก Backend
            if (res.data.status === "ok") {
                // เก็บ session ลง localStorage
                localStorage.setItem("session_user", JSON.stringify(res.data.user));
                Swal.fire({
                    icon: 'success',
                    title: 'Login',
                    text: 'Login Success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate("/dashbord");
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login',
                    text: 'Login Failed',
                    confirmButtonText: 'OK'
                });
            }

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Login',
                text: 'Login Failed',
                confirmButtonText: 'OK'
            });
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500">

            <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md">

                {/* Title */}
                <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
                    Welcome Back
                </h2>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>

                    {/* Customer ID / Email */}
                    <div>
                        <label className="block text-blue-800 mb-1">Customer-ID</label>
                        <input
                            type="text"
                            name="userId"
                            value={form.userId}
                            onChange={handleChange}
                            placeholder="Enter your Customer-ID" id="cutomer-id"
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition "
                        />
                        <span id="customer-id-error" className="text-red-500"></span>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-blue-800 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {/* Remember + Forgot */}
                    <div className="flex justify-between items-center text-sm">
                        <label className="flex items-center gap-2 text-blue-700">
                            <input type="checkbox" className="accent-blue-600" />
                            Remember me
                        </label>
                        <a href="#" className="text-blue-600 hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg font-semibold transition duration-300 shadow-md login-btn"
                    >
                        Login
                    </button>

                </form>

                {/* Divider */}
                <div className="my-6 text-center text-gray-400">or</div>

                {/* Google */}
                <button className="w-full border border-blue-300 text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition ">
                    Continue with Google
                </button>

                {/* Register Link */}
                <div className="mt-6 text-center text-blue-700 text-sm">
                    Don't have an account? <Link to="/register" className="font-semibold hover:underline">Register</Link>
                </div>

            </div>

        </div>
    )
}

export default Login