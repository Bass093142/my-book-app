import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Import หน้าเพจต่าง ๆ
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ChatSupport from './components/ChatSupport';

function App() {
  // ดึงข้อมูล User เพื่อเช็คสถานะล็อกอินและ Role
  // ใช้ try-catch เพื่อป้องกัน Error กรณี JSON ผิดพลาด
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      user = JSON.parse(savedUser);
    }
  } catch (error) {
    console.error("User data error:", error);
    localStorage.removeItem('user'); // ล้างข้อมูลที่เสียทิ้ง
  }

  const userId = user?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <ThemeProvider>
      <div className="font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
        
        {/* ส่วนกำหนดเส้นทาง (Routes) */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* ✅ เพิ่ม Route Cart เพื่อแก้ Error (ใส่หน้าว่างไว้ก่อน) */}
          <Route path="/cart" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-400">🛒 ตะกร้าสินค้า</h1>
                    <p className="text-gray-500 mt-2">กำลังอยู่ในระหว่างการพัฒนา...</p>
                    <a href="/" className="text-blue-600 hover:underline mt-4 block">กลับไปเลือกหนังสือ</a>
                </div>
            </div>
          } />

          {/* Route สำหรับดักหน้า 404 ที่ไม่มีจริง */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-2xl font-bold text-red-500">404 - ไม่พบหน้านี้</h1>
            </div>
          } />
        </Routes>

        {/* ปุ่มแชท (แสดงเฉพาะตอนล็อกอินแล้ว) */}
        {userId && <ChatSupport userId={userId} isAdmin={isAdmin} />}
      </div>
    </ThemeProvider>
  );
}

export default App;