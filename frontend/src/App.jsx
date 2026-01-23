import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext'; // ✅ Import Context ตะกร้า

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Cart from './pages/Cart'; // ✅ Import หน้า Cart
import ChatSupport from './components/ChatSupport';

function App() {
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) user = JSON.parse(savedUser);
  } catch (error) { localStorage.removeItem('user'); }

  const userId = user?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <ThemeProvider>
      <CartProvider> {/* ✅ ครอบ CartProvider ไว้ตรงนี้เพื่อให้ทุกหน้าใช้ตะกร้าได้ */}
        <div className="font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} /> {/* ✅ Route หน้าตะกร้า */}
            <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-red-500 font-bold">404 - ไม่พบหน้านี้</div>} />
          </Routes>

          {userId && <ChatSupport userId={userId} isAdmin={isAdmin} />}
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;