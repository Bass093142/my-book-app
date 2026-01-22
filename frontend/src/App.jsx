import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// Import หน้าเพจต่าง ๆ
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile'; // 👈 เพิ่มบรรทัดนี้ (นำเข้าหน้า Profile)
import ChatSupport from './components/ChatSupport';

function App() {
  // ดึงข้อมูล User เพื่อเช็คสถานะล็อกอินและ Role
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <ThemeProvider>
      <div className="font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen">
        
        {/* ส่วนกำหนดเส้นทาง (Routes) */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* 👇 เพิ่ม Route สำหรับหน้าแก้ไขโปรไฟล์ */}
          <Route path="/profile" element={<Profile />} />
        </Routes>

        {/* ปุ่มแชท (แสดงเฉพาะตอนล็อกอินแล้ว) */}
        {userId && <ChatSupport userId={userId} isAdmin={isAdmin} />}
      </div>
    </ThemeProvider>
  );
}

export default App;