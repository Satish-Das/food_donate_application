import { Routes, Route, useLocation } from "react-router-dom"
import Home from "../pages/Home"
import About from "../pages/About"
import Contact from "../pages/Contact"
import Gallery from "../pages/Gallery"
import Navbar from '../components/Navbar'
import Footer from "../components/Footer"
import Service from "../pages/service"
import Donate from "../pages/Donate"
import LoginPage from "../pages/Login"
import RegisterPage from "../pages/Register"
import Dashboard from '../pages/Dashboard'
import AdminDashboard from '../pages/AdminDashboard'
import AdminLogin from '../pages/AdminLogin'
import AdminRegister from '../pages/AdminRegister'
import ProtectedRoute from './ProtectedRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const AppRoutes = () => {
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';
    const isAdminDashboard = location.pathname === '/admin/dashboard';
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen">
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            {!isAdminPage && <Navbar/>}
            <main className={`flex-grow ${isDashboard || isAdminDashboard ? 'pt-0' : 'pt-20'}`}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/service" element={<Service />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/donate" element={<Donate />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* User Protected Routes */}
                    <Route 
                        path='/dashboard' 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route 
                        path="/admin/dashboard" 
                        element={
                            <ProtectedRoute adminRequired={true}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
            {!isDashboard && !isAdminPage && <Footer/>}
        </div>
    )
}

export default AppRoutes;