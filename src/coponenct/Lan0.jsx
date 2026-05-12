import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Lan0 = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [sessionUser, setSessionUser] = useState(null);
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    const [isNetworkOpen, setIsNetworkOpen] = useState(false);
    const [routers, setRouters] = useState([
        { name: 'ตัวส่ง router nt', ip: '192.168.0.254', status: 'checking' },

    ]);
    // เช็คสถานะคอมพิวเตอร์
    const [computer, setComputer] = useState([
        { name: 'Champ_tng62', ip: '192.168.0.10', status: 'checking' },
        { name: 'Champ_NPT57', ip: '192.168.0.9', status: 'checking' },
        { name: 'Champ_p01', ip: '192.168.0.2', status: 'checking' },

    ]);

    const checkComputer = async (isSilent = false) => {
        if (!isSilent) setIsChecking(true);
        try {
            const res = await axios.post("http://localhost:5000/server/check-computer", { computer });
            if (res.data.status === 'ok') {
                setComputer(res.data.data);
            }
        } catch (error) {
            console.error("Failed to check computer", error);
        } finally {
            if (!isSilent) setIsChecking(false);
        }
    };


    const [isChecking, setIsChecking] = useState(false);

    const checkRouters = async (isSilent = false) => {
        if (!isSilent) setIsChecking(true);
        try {
            const res = await axios.post("http://localhost:5000/server/check-routers", { routers });
            if (res.data.status === 'ok') {
                setRouters(res.data.data);
            }
        } catch (error) {
            console.error("Failed to check routers", error);
        } finally {
            if (!isSilent) setIsChecking(false);
        }
    };

    useEffect(() => {
        // ดึง session จาก localStorage
        const storedUser = localStorage.getItem("session_user");
        if (!storedUser || storedUser === "undefined") {
            // ถ้าไม่พบ session โยนกลับไปหน้า login
            localStorage.removeItem("session_user");
            navigate("/");
            return;
        }

        try {
            setSessionUser(JSON.parse(storedUser));
        } catch (e) {
            localStorage.removeItem("session_user");
            navigate("/");
            return;
        }

        checkRouters();
        checkComputer();

        // Real-time polling every 10 seconds
        const intervalId = setInterval(() => {
            checkRouters(true); // true = isSilent (ไม่ให้ปุ่ม Refresh หมุนติ้วๆ)
            checkComputer(true);
        }, 10000);

        // Listen for theme changes from other tabs
        const handleStorageChange = (e) => {
            if (e.key === 'theme') {
                setTheme(e.newValue || 'light');
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        // เคลียร์ session ออกจาเครื่อง
        localStorage.removeItem("session_user");
        navigate("/");
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // คำนวณค่าเฉลี่ย Ping จากเร้าเตอร์ที่ออนไลน์และมีค่า Ping
    const validPings = routers
        .filter(r => r.status === 'online' && r.pingTime && !isNaN(Number(r.pingTime)))
        .map(r => Number(r.pingTime));

    const averagePing = validPings.length > 0
        ? Math.round(validPings.reduce((a, b) => a + b, 0) / validPings.length)
        : 0;

    return (
        <div className={`min-h-screen flex font-sans overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out bg-white dark:bg-slate-800 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between z-20`}>
                <div>
                    <div className="h-20 flex items-center justify-center border-b border-slate-100 dark:border-slate-700">
                        <h1 className={`text-blue-700 dark:text-blue-400 font-extrabold text-xl transition-opacity duration-300 whitespace-nowrap tracking-wide ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            AZURE PORTAL
                        </h1>
                        {!isSidebarOpen && <span className="text-blue-700 dark:text-blue-400 font-extrabold text-xl">AZ</span>}
                    </div>
                    <nav className="mt-8 px-4 space-y-2">
                        {[
                            { name: 'Dashboard', icon: 'fa-solid fa-chart-pie', path: '/dashbord' },
                            { name: 'Network map', icon: 'fa-solid fa-network-wired' },
                            { name: 'Analytics', icon: 'fa-solid fa-chart-line', path: '/analytics' },
                            { name: 'Settings', icon: 'fa-solid fa-gear', path: '/settings' }
                        ].map((item, index) => {
                            const isNetworkMap = item.name === 'Network map';
                            const isActiveMain = item.path === location.pathname || (isNetworkMap && location.pathname.startsWith('/Lan'));

                            return (
                                <div key={index}>
                                    {/* ตัวเมนูหลัก */}
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (isNetworkMap) {
                                                setIsNetworkOpen(!isNetworkOpen); // ถ้าเป็น Network map ให้กาง Dropdown
                                            } else {
                                                navigate(item.path); // ถ้าเป็นเมนูอื่นให้ไปตาม Path
                                            }
                                        }}
                                        className={`flex items-center gap-4 md:px-2 px-1 py-3 rounded-xl transition overflow-hidden group ${isActiveMain ? 'bg-blue-50 dark:bg-slate-700/50 text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition ${isActiveMain ? 'bg-blue-100 text-blue-600 dark:bg-slate-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-100 dark:group-hover:text-blue-400 dark:group-hover:bg-slate-600'}`}>
                                            <i className={`${item.icon} text-[1.1rem]`}></i>
                                        </div>
                                        <span className={`${isSidebarOpen ? 'block' : 'hidden'} font-semibold tracking-wide flex-1 text-left`}>
                                            {item.name}
                                        </span>
                                        {isNetworkMap && isSidebarOpen && (
                                            <i className={`fa-solid fa-chevron-down text-[0.7rem] transition-transform duration-300 ${isNetworkOpen ? 'rotate-180' : ''} mr-2`}></i>
                                        )}
                                    </a>

                                    {/* Dropdown Content (เมนูย่อย LAN 1, 2, 3) */}
                                    {isNetworkMap && isNetworkOpen && isSidebarOpen && (
                                        <div className="mt-1 ml-12 space-y-1 transition-all">
                                            {/* สมมติว่าเปลี่ยน subMenus เป็นแบบที่มี path แล้ว */}
                                            {[
                                                { name: 'LAN 0', path: '/Lan0' },
                                                { name: 'LAN 1', path: '/Lan1' },
                                                { name: 'LAN 2', path: '/Lan2' }
                                            ].map((sub, i) => {
                                                const isActiveSub = sub.path === location.pathname;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => navigate(sub.path)} // กดแล้วเปลี่ยนหน้าไป /lan1
                                                        className={`w-full text-left block py-2 px-3 text-sm rounded-lg transition ${isActiveSub ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-slate-700/30' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}
                                                    >
                                                        {sub.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 w-full text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition overflow-hidden group">
                        <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition">
                            <i className="fa-solid fa-right-from-bracket text-[1.1rem]"></i>
                        </div>
                        <span className={`${isSidebarOpen ? 'block' : 'hidden'} font-semibold`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
                {/* Header */}
                <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2.5 rounded-lg transition"
                    >
                        <i className="fa-solid fa-bars text-xl"></i>
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Theme Switch Button */}
                        <button
                            onClick={toggleTheme}
                            className="text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2.5 rounded-lg transition"
                            title="Toggle Theme"
                        >
                            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
                        </button>

                        <div className="text-right hidden sm:block">
                            <p className="text-slate-800 dark:text-white font-bold text-sm tracking-wide">Welcome back</p>
                            <p className="text-slate-400 dark:text-slate-500 text-xs text-right font-medium">{sessionUser ? sessionUser.name : 'User'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-md flex items-center justify-center text-white font-bold border-2 border-white dark:border-slate-800 uppercase">
                            {sessionUser && sessionUser.name ? sessionUser.name.charAt(0) : 'U'}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 space-y-8 pb-20 relative z-0">
                    {/* Welcome Banner */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden transition-colors">
                        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-100 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-60 animate-pulse"></div>
                        <div className="absolute bottom-[-50px] right-[100px] w-64 h-64 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>

                        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 relative z-10 transition-colors">Network Overview</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium relative z-10 transition-colors">Monitor your system routers, network events, and overall status in real-time.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[
                            { title: "Total Devices", value: `${routers.length} Nodes`, icon: "fa-solid fa-server" },
                            { title: "System Uptime", value: "15 Days", icon: "fa-solid fa-clock" },
                            { title: "Average Ping", value: `${isChecking ? '--' : averagePing} ms`, icon: "fa-solid fa-wifi" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-lg dark:hover:shadow-slate-900/50 transition transform duration-300">
                                <h3 className="text-slate-400 dark:text-slate-500 font-bold mb-2 text-xs uppercase tracking-widest">{stat.title}</h3>
                                <div className="text-3xl font-black text-slate-800 dark:text-white mb-4 transition-colors">{stat.value}</div>
                                <span className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors">
                                    <i className={`${stat.icon} mr-1.5`}></i> Status Normal
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8" id='font-label'>
                        {/* Router Status List */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-col transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white transition-colors">Network Routers</h3>
                                <button onClick={checkRouters} disabled={isChecking} className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md shadow-blue-500/20 transition disabled:opacity-50">
                                    {isChecking ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Checking</> : <><i className="fa-solid fa-rotate-right mr-2"></i> Refresh</>}
                                </button>
                            </div>
                            <div className="space-y-4 flex-1">
                                {routers.map((router, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 px-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <i className="fa-solid fa-server text-slate-400 dark:text-slate-500 text-xl"></i>
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 dark:text-slate-300 font-medium transition-colors">{router.name}</span>
                                                <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">{router.ip}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pr-2" title={`Status: ${router.status}`}>
                                            {router.status === 'online' && router.pingTime && router.pingTime !== 'unknown' && (
                                                <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">{router.pingTime} ms</span>
                                            )}
                                            <div className="relative flex h-3 w-3 items-center justify-center">
                                                {router.status === 'online' && (
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 shadow-[0_0_10px_rgba(7ade80,1)]"></span>
                                                )}
                                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${router.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,1)]' : router.status === 'offline' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'bg-slate-300 dark:bg-slate-600 animate-pulse'}`}></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Network Events */}
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-col transition-colors">
                            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-6 transition-colors">ห้อง it</h3>
                            <div className="space-y-4 flex-1">
                                {computer.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 px-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex items-center justify-center ${item.status === 'Warning' ? 'text-orange-400 dark:text-orange-500' : item.status === 'Notice' ? 'text-blue-400 dark:text-blue-500' : 'text-green-400 dark:text-green-500'}`}>
                                                <i className={`fa-solid fa-computer text-xl`}></i>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 dark:text-slate-300 font-medium transition-colors">{item.name}</span>
                                                <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">{item.ip}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pr-2" title={`Status: ${item.status}`}>
                                            {item.status === 'online' && item.pingTime && item.pingTime !== 'unknown' && (
                                                <span className="text-slate-400 dark:text-slate-500 text-xs font-mono">{item.pingTime} ms</span>
                                            )}
                                            <div className="relative flex h-3 w-3 items-center justify-center">
                                                {item.status === 'online' && (
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 shadow-[0_0_10px_rgba(7ade80,1)]"></span>
                                                )}
                                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${item.status === 'online' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,1)]' : item.status === 'offline' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]' : 'bg-slate-300 dark:bg-slate-600 animate-pulse'}`}></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Lan0;
