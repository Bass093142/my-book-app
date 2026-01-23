import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext'; // ✅ ต้องมีไฟล์นี้ (ตามที่เคยทำไป)
import { CartProvider } from './context/CartContext';         // ✅ ต้องมีไฟล์นี้

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
      <LanguageProvider>
        <CartProvider>
          <div className="font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center">404 Not Found</div>} />
            </Routes>
            {userId && <ChatSupport userId={userId} isAdmin={isAdmin} />}
          </div>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;