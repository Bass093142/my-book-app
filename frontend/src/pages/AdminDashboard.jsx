import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, BookOpen, Ban, Trash2, 
  PlusCircle, Search, BarChart3, CheckCircle 
} from 'lucide-react';

// 👇 ใช้ Link ของ Render
const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: 0, sales: 0, books: 0, chartSeries: [44, 55, 13, 33]
  });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🛡️ 1. ระบบป้องกัน: เช็คว่าเป็น Admin หรือไม่?
    const checkAuth = () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || storedUser.role !== 'admin') {
            alert("⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้!");
            navigate('/'); // ดีดกลับหน้าแรกทันที
            return;
        }
        fetchDashboardData(); // ถ้าผ่านด่าน ให้ดึงข้อมูล
    };
    checkAuth();
  }, [navigate]);

  // 📥 2. ฟังก์ชันดึงข้อมูล (เตรียมรองรับ API จริง)
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // --- ส่วนดึงข้อมูลหนังสือจริง ---
      try {
          const booksRes = await axios.get(`${API_BASE_URL}/api/books`);
          setBooks(booksRes.data);
      } catch (err) {
          console.log("ใช้ข้อมูลจำลองสำหรับหนังสือแทน");
          setBooks([
            { id: 1, title: 'React ขั้นเทพ', category: 'Technology', price: 350 },
            { id: 2, title: 'Basic Node.js', category: 'Technology', price: 290 },
          ]);
      }

      // --- ส่วนข้อมูลจำลอง (Mock Data) สำหรับสถิติและ User ---
      // (รอคุณทำ API ฝั่ง Backend เสร็จค่อยมาปลดคอมเมนต์)
      setStats({
        users: 150, // จำนวนสมาชิกสมมติ
        sales: 54000, // ยอดขายสมมติ
        books: 45, 
        chartSeries: [25, 15, 40, 20] 
      });

      setUsers([
        { id: 1, email: 'user1@test.com', role: 'user', is_banned: false },
        { id: 2, email: 'badguy@test.com', role: 'user', is_banned: true, ban_reason: 'สแปมข้อความ' },
        { id: 3, email: 'admin@test.com', role: 'admin', is_banned: false },
      ]);

    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🚫 ฟังก์ชันแบนผู้ใช้
  const handleBanUser = async (id, currentStatus) => {
    if (currentStatus) return alert("User นี้ถูกแบนไปแล้ว");
    const reason = prompt("กรุณาระบุเหตุผลการแบน:");
    if (!reason) return;

    try {
        // จำลองการแบน (ถ้ามี API จริงให้ใช้ axios.post)
        setUsers(users.map(u => u.id === id ? { ...u, is_banned: true, ban_reason: reason } : u));
        alert(`🚫 แบน User ID ${id} เรียบร้อย!`);
    } catch (error) {
        alert("เกิดข้อผิดพลาดในการแบน");
    }
  };

  // 🗑️ ฟังก์ชันลบหนังสือ
  const handleDeleteBook = async (id) => {
    if (confirm("⚠️ ยืนยันที่จะลบหนังสือเล่มนี้?")) {
      try {
          // ถ้ามี API ลบหนังสือจริง ให้ใช้บรรทัดนี้:
          // await axios.delete(`${API_BASE_URL}/api/books/${id}`);
          
          setBooks(books.filter(b => b.id !== id)); // ลบออกจากหน้าจอ
          alert("ลบหนังสือเรียบร้อย");
      } catch (error) {
          alert("ลบไม่สำเร็จ");
      }
    }
  };

  const chartOptions = {
    labels: ['Technology', 'History', 'Comics', 'General'],
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'],
    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
    plotOptions: { pie: { donut: { labels: { show: true } } } },
    dataLabels: { enabled: true },
    theme: { mode: 'light' }
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center">กำลังโหลดข้อมูลผู้ดูแลระบบ...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <BarChart3 className="text-blue-600" /> แดชบอร์ดผู้ดูแลระบบ
        </h1>

        {/* เมนูแท็บ (Tabs) */}
        <div className="flex gap-4 mb-8 border-b dark:border-gray-700 pb-2 overflow-x-auto">
          {['overview', 'users', 'books'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab === 'overview' && 'ภาพรวมระบบ'}
              {tab === 'users' && 'จัดการผู้ใช้'}
              {tab === 'books' && 'คลังหนังสือ'}
            </button>
          ))}
        </div>

        {/* --- ส่วนที่ 1: ภาพรวม (Overview) --- */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 border-blue-500 transform hover:scale-105 transition">
                <Users className="w-12 h-12 text-blue-500 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full" />
                <div><p className="text-sm text-gray-500">สมาชิกทั้งหมด</p><p className="text-3xl font-bold">{stats.users}</p></div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 border-green-500 transform hover:scale-105 transition">
                <DollarSign className="w-12 h-12 text-green-500 bg-green-100 dark:bg-green-900/30 p-2 rounded-full" />
                <div><p className="text-sm text-gray-500">ยอดขายรวม</p><p className="text-3xl font-bold">฿{stats.sales.toLocaleString()}</p></div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 border-purple-500 transform hover:scale-105 transition">
                <BookOpen className="w-12 h-12 text-purple-500 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full" />
                <div><p className="text-sm text-gray-500">หนังสือในคลัง</p><p className="text-3xl font-bold">{stats.books}</p></div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md max-w-2xl">
                <h3 className="text-xl font-bold mb-4">สัดส่วนหมวดหมู่หนังสือ</h3>
                <Chart options={chartOptions} series={stats.chartSeries} type="donut" height={350} />
            </div>
          </div>
        )}

        {/* --- ส่วนที่ 2: จัดการผู้ใช้ (Users) --- */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-fade-in overflow-x-auto">
            <h3 className="text-xl font-bold mb-6">จัดการผู้ใช้งาน ({users.length})</h3>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                    <th className="p-3 rounded-tl-lg">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {u.role.toUpperCase()}
                        </span>
                    </td>
                    <td className="p-3">
                        {u.is_banned ? (
                            <span className="text-red-500 flex items-center gap-1 text-sm font-semibold"><Ban size={14}/> Banned</span>
                        ) : (
                            <span className="text-green-500 flex items-center gap-1 text-sm font-semibold"><CheckCircle size={14}/> Active</span>
                        )}
                    </td>
                    <td className="p-3">
                      <button 
                        onClick={() => handleBanUser(u.id, u.is_banned)} 
                        disabled={u.is_banned || u.role === 'admin'} 
                        className={`px-3 py-1 rounded flex items-center gap-1 transition ${
                            u.is_banned || u.role === 'admin' 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <Ban size={16} /> {u.is_banned ? 'แบนแล้ว' : 'แบนผู้ใช้'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- ส่วนที่ 3: คลังหนังสือ (Books) --- */}
        {activeTab === 'books' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h3 className="text-xl font-bold">คลังหนังสือ ({books.length})</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow transition">
                  <PlusCircle size={20} /> เพิ่มหนังสือใหม่
              </button>
            </div>
            
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="ค้นหาหนังสือ..." 
                className="w-full pl-10 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                <thead>
                    <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                        <th className="p-3 rounded-tl-lg">ชื่อหนังสือ</th>
                        <th className="p-3">หมวดหมู่</th>
                        <th className="p-3">ราคา</th>
                        <th className="p-3 rounded-tr-lg">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
                    <tr key={b.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="p-3 font-medium">{b.title}</td>
                        <td className="p-3"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{b.category || 'General'}</span></td>
                        <td className="p-3 text-green-600 font-bold">฿{b.price}</td>
                        <td className="p-3">
                            <button onClick={() => handleDeleteBook(b.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition" title="ลบหนังสือ">
                                <Trash2 size={18} />
                            </button>
                        </td>
                    </tr>
                    ))}
                    {books.length === 0 && (
                        <tr><td colSpan="4" className="text-center p-4 text-gray-500">ไม่พบข้อมูลหนังสือ</td></tr>
                    )}
                </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;