import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    // ✅ ใช้ SweetAlert2 ถามยืนยันก่อนออก
    Swal.fire({
      title: 'ยืนยันการออกจากระบบ?',
      text: "คุณต้องการออกจากระบบใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // แจ้งเตือนสวยๆ แล้วเด้งไปหน้า Login
        Swal.fire({
          icon: 'success',
          title: 'ออกจากระบบเรียบร้อย',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          navigate('/login');
          window.location.reload();
        });
      }
    });
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            📚 BookStore
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium">
              {t.home} 
            </Link>
            <Link to="/cart" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium flex items-center gap-1">
              <ShoppingCart size={20} /> {t.cart}
            </Link>

            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-blue-600 transition p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                <Globe size={20} /> <span className="uppercase font-bold text-sm">{language}</span>
            </button>

            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-yellow-400 transition transform hover:scale-110"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4 ml-4">
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-sm transition shadow-md"
                  >
                    <LayoutDashboard size={16} /> {t.admin}
                  </Link>
                )}

                <Link to="/profile" className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-lg transition">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                    {user.profile_image ? (
                      <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-white max-w-[100px] truncate">
                    {user.first_name || user.email}
                  </span>
                </Link>

                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition" title={t.logout}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow">
                {t.login}
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleLanguage} className="text-gray-700 dark:text-white font-bold uppercase">
              {language}
            </button>
            <button onClick={toggleTheme} className="text-gray-700 dark:text-yellow-400 p-1">
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-4 space-y-4 shadow-lg">
          <Link to="/" className="block text-gray-700 dark:text-gray-200 font-medium">{t.home}</Link>
          <Link to="/cart" className="block text-gray-700 dark:text-gray-200 font-medium">{t.cart}</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="block text-red-500 font-bold">{t.admin}</Link>
              )}
              <Link to="/profile" className="block text-blue-600">แก้ไขโปรไฟล์</Link>
              <button onClick={handleLogout} className="block text-gray-500 w-full text-left">{t.logout}</button>
            </>
          ) : (
            <Link to="/login" className="block text-blue-600 font-bold">{t.login}</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;