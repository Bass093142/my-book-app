import React from 'react';
import { Routes, Route } from 'react-router-dom'; // ❌ ไม่ต้องใส่ BrowserRouter ตรงนี้ (น่าจะอยู่ที่ main.jsx แล้ว)
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext'; // ✅ เพิ่ม Context ภาษา

// Import หน้าเพจต่าง ๆ
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import ChatWidget from './components/ChatWidget'; // ✅ ใช้ ChatWidget ตัวใหม่ที่ผมเขียนให้

function App() {
  // ดึงข้อมูล User (คง Logic เดิมของคุณไว้)
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      user = JSON.parse(savedUser);
    }
  } catch (error) {
    console.error("User data error:", error);
    localStorage.removeItem('user');
  }

  return (
    <ThemeProvider>
      <LanguageProvider> {/* ✅ ครอบ LanguageProvider เพื่อให้เปลี่ยนภาษาได้ทั้งเว็บ */}
        <div className="font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
          
          {/* ส่วนกำหนดเส้นทาง (Routes) */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* ✅ คง Route Cart ของเดิมไว้ */}
            <Route path="/cart" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-400">🛒 ตะกร้าสินค้า</h1>
                      <p className="text-gray-500 mt-2">กำลังอยู่ในระหว่างการพัฒนา...</p>
                      <a href="/" className="text-blue-600 hover:underline mt-4 block">กลับไปเลือกหนังสือ</a>
                  </div>
              </div>
            } />

            {/* ✅ คง Route 404 ของเดิมไว้ */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                  <h1 className="text-2xl font-bold text-red-500">404 - ไม่พบหน้านี้</h1>
              </div>
            } />
          </Routes>

          {/* ✅ ใส่ ChatWidget (ปุ่มแชทลอย) จะแสดงทุกหน้า */}
          <ChatWidget /> 
          
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;