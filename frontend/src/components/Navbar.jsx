import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // ดึงข้อมูล User จาก LocalStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('ออกจากระบบเรียบร้อย');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            📚 BookStore
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium">หน้าแรก</Link>
            <Link to="/cart" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium flex items-center gap-1">
              <ShoppingCart size={20} /> ตะกร้า
            </Link>

            {user ? (
              <div className="flex items-center gap-4 ml-4">
                {/* ✅ ปุ่มสำหรับ Admin เท่านั้น */}
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-sm transition shadow-md"
                  >
                    <LayoutDashboard size={16} /> จัดการระบบ
                  </Link>
                )}

                {/* ✅ ส่วนแสดงรูปโปรไฟล์ */}
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

                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 dark:text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-4 space-y-4">
          <Link to="/" className="block text-gray-700 dark:text-gray-200">หน้าแรก</Link>
          <Link to="/cart" className="block text-gray-700 dark:text-gray-200">ตะกร้าสินค้า</Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="block text-red-500 font-bold">จัดการระบบ</Link>
              )}
              <Link to="/profile" className="block text-blue-600">แก้ไขโปรไฟล์</Link>
              <button onClick={handleLogout} className="block text-gray-500 w-full text-left">ออกจากระบบ</button>
            </>
          ) : (
            <Link to="/login" className="block text-blue-600 font-bold">เข้าสู่ระบบ</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;