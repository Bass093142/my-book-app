import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Sun, Moon, BookOpen } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext'; // เรียกใช้ Context ธีมที่เราทำไว้

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // เช็คว่าล็อกอินยัง

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
          <BookOpen size={32} />
          <span>BookStore</span>
        </Link>

        {/* Menu Items */}
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-blue-500">
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>

          {token ? (
            <>
              <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-blue-500">
                <ShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">0</span>
              </Link>
              <div className="flex items-center gap-4 border-l pl-4 dark:border-gray-600">
                <Link to="/profile" className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
                  <User size={20} /> โปรไฟล์
                </Link>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition">
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;