import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import "../index.css"

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        userId: "",
        password: "",
        confirmPassword: "",
        time: new Date().toISOString()
    });

    const isOnlyNumber = form.userId === "" || /^[0-9]+$/.test(form.userId);
    const [error, set_error] = useState({
        message: null,
        color: null
    });


    useEffect(() => {
        let message = "";
        let color = "";
        if (!isOnlyNumber) {
            // แสดงข้อความ error ผ่าน id user-id-error
            message = "UserId must be only numbers ❌";
            color = "text-red-500";
        } else if (form.userId.length === 0) {
            message = "";
            color = "";
        } else {
            message = "UserId is valid ✔ ";
            color = "text-green-700 ";


        }
        set_error({
            message,
            color
        });
    }, [form.userId, isOnlyNumber]);

    // เปลี่ยนค่าใน form
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });


    };


    // กดปุ่ม Register
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            return alert("Passwords do not match");
        }

        try {
            const res = await axios.post("http://localhost:5000/server/register", form);

            // เช็ค status ที่ส่งมาจาก Backend
            if (res.data.status === 201) {
                alert(res.data.message); // Register success
                navigate("/"); // กลับไปหน้า Login
            } else {
                alert(res.data.message || "Registration failed");
            }

        } catch (err) {
            alert(err.response?.data?.message || "Error connecting to server");
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-500">
            <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-8 w-full max-w-md">
                {/* Title */}
                <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
                    Create Account
                </h2>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Name */}
                    <div>
                        <label className="block text-blue-800 mb-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition "
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-blue-800 mb-1">UserId</label>
                        <input
                            type="text"
                            name="userId"
                            id='user-id'
                            value={form.userId}
                            onChange={handleChange}
                            placeholder="Enter your UserId"
                            maxLength={10}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${form.userId === "" ? "border-blue-200 focus:ring-blue-500" : error.message ? error.color : error.color}`}
                        />
                        <span className={`text-sm font-medium ${error.color}`}>{error.message}</span>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-blue-800 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-blue-800 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {/* Button */}
                    <button
                        type="submit"

                        className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg font-semibold transition duration-300 shadow-md mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Register
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center text-blue-700 text-sm">
                    Already have an account? <Link to="/" className="font-semibold hover:underline">Log in</Link>
                </div>
            </div>
        </div>
    )
}





export default Register
