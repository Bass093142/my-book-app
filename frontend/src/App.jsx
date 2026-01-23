import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext'; // ✅ 1. เพิ่มตัวนี้
import { CartProvider } from './context/CartContext';         // ✅ 2. เพิ่มตัวนี้

// Import หน้าเพจต่าง ๆ
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Cart from './pages/Cart'; 
import ChatSupport from './components/ChatSupport';

function App() {
  // Logic ดึง User
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) user = JSON.parse(savedUser);
  } catch (error) { localStorage.removeItem('user'); }

  const userId = user?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <ThemeProvider>
      <LanguageProvider> {/* ✅ ครอบ LanguageProvider แก้ Error หน้าขาว */}
        <CartProvider>   {/* ✅ ครอบ CartProvider ให้ใช้ตะกร้าได้ */}
          
          <div className="font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
            
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-red-500 font-bold">404 - ไม่พบหน้านี้</div>} />
            </Routes>

            {userId && <ChatSupport userId={userId} isAdmin={isAdmin} />}
            
          </div>

        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;