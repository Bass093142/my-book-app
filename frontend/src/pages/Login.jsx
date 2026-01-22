import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';

// 👇 ใช้ Link ของ Render
const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ ยิงไปที่ Render Backend
      const res = await axios.post(`${API_BASE_URL}/api/login`, formData);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      alert('เข้าสู่ระบบสำเร็จ!');
      
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      window.location.reload(); 
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">BookStore</h1>
          <p className="text-gray-500 dark:text-gray-400">ยินดีต้อนรับกลับมาอีกครั้ง!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input type="email" name="email" required
                className="w-full pl-10 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                onChange={handleChange} />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">รหัสผ่าน</label>
              <a href="#" className="text-sm text-blue-600 hover:underline">ลืมรหัสผ่าน?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input type="password" name="password" required
                className="w-full pl-10 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-500/40 flex justify-center items-center gap-2">
            <LogIn size={20} /> เข้าสู่ระบบ
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 hover:underline">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;