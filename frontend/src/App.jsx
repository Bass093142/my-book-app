import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

// ⚠️ เช็คบรรทัดนี้: ต้อง Import ให้ถูกไฟล์
import Home from './pages/Home';        // ต้องมาจากไฟล์ Home.jsx
import Login from './pages/Login';      // ต้องมาจากไฟล์ Login.jsx
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ChatSupport from './components/ChatSupport';

function App() {
  // ดึงข้อมูล User (ถ้ามี)
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <ThemeProvider>
      <div className="font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen">
        
        {/* ส่วนกำหนดเส้นทาง */}
        <Routes>
          {/* 👇 บรรทัดนี้สำคัญ! path="/" ต้องคู่กับ element={<Home />} */}
          <Route path="/" element={<Home />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        {/* ปุ่มแชท (แสดงเฉพาะตอนล็อกอินแล้ว) */}
        {userId && <ChatSupport userId={userId} isAdmin={isAdmin} />}
      </div>
    </ThemeProvider>
  );
}

export default App;