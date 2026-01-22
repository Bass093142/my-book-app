import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
  Users, DollarSign, BookOpen, Ban, Trash2, 
  PlusCircle, Search, BarChart3 
} from 'lucide-react';

const AdminDashboard = () => {
  // --- States ---
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, books
  const [stats, setStats] = useState({
    users: 0,
    sales: 0,
    books: 0,
    chartSeries: [44, 55, 13, 33] // Mock Data กราฟ
  });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Initial Data Loading ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // ในการใช้งานจริง ให้ยิง API ไปหา Backend
      // const res = await axios.get('http://localhost:3000/api/admin/stats');
      // setStats(res.data);
      
      // *จำลองข้อมูล (Mock Data) เพื่อให้เห็นภาพก่อน*
      setStats({
        users: 150,
        sales: 54000,
        books: 45,
        chartSeries: [25, 15, 40, 20]
      });

      setUsers([
        { id: 1, email: 'user1@test.com', role: 'user', is_banned: false },
        { id: 2, email: 'badguy@test.com', role: 'user', is_banned: true, ban_reason: 'เกรียนคีย์บอร์ด' },
        { id: 3, email: 'admin@test.com', role: 'admin', is_banned: false },
      ]);

      setBooks([
        { id: 1, title: 'React ขั้นเทพ', category: 'Technology', price: 350 },
        { id: 2, title: 'Basic Node.js', category: 'Technology', price: 290 },
        { id: 3, title: 'นิทานอีสป', category: 'Kids', price: 120 },
      ]);

    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  // --- Handlers ---
  const handleBanUser = async (id, currentStatus) => {
    if (currentStatus) return alert("User นี้ถูกแบนไปแล้ว");
    const reason = prompt("กรุณาระบุเหตุผลการแบน:");
    if (!reason) return;

    // จำลองการแบนที่ Frontend
    setUsers(users.map(u => u.id === id ? { ...u, is_banned: true, ban_reason: reason } : u));
    
    // ของจริง: await axios.post('/api/admin/ban', { userId: id, reason });
    alert(`แบน User ID ${id} เรียบร้อย!`);
  };

  const handleDeleteBook = (id) => {
    if (confirm("ยืนยันที่จะลบหนังสือเล่มนี้?")) {
      setBooks(books.filter(b => b.id !== id));
      // ของจริง: await axios.delete(`/api/books/${id}`);
    }
  };

  // --- Chart Config ---
  const chartOptions = {
    labels: ['Technology', 'History', 'Comics', 'General'],
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'],
    legend: { position: 'bottom', labels: { colors: '#9ca3af' } },
    plotOptions: { pie: { donut: { labels: { show: true } } } },
    dataLabels: { enabled: true },
    theme: { mode: 'light' } // เดี๋ยวแก้ตาม ThemeContext ได้ถ้าต้องการ
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <BarChart3 className="text-blue-600" /> แดชบอร์ดผู้ดูแลระบบ
        </h1>

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8 border-b dark:border-gray-700 pb-2">
          {['overview', 'users', 'books'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
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

        {/* --- CONTENT: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 border-blue-500">
                <Users className="w-12 h-12 text-blue-500 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">สมาชิกทั้งหมด</p>
                  <p className="text-3xl font-bold">{stats.users}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 border-green-500">
                <DollarSign className="w-12 h-12 text-green-500 bg-green-100 dark:bg-green-900/30 p-2 rounded-full" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ยอดขายรวม</p>
                  <p className="text-3xl font-bold">฿{stats.sales.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 border-purple-500">
                <BookOpen className="w-12 h-12 text-purple-500 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">หนังสือในคลัง</p>
                  <p className="text-3xl font-bold">{stats.books}</p>
                </div>
              </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4">สัดส่วนหมวดหมู่หนังสือ</h3>
                <Chart options={chartOptions} series={stats.chartSeries} type="donut" height={350} />
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col justify-center items-center text-center">
                <BarChart3 size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">กราฟยอดขายรายเดือน</h3>
                <p className="text-gray-500">(Coming Soon: รอเชื่อมต่อ API ยอดขายรายวัน)</p>
              </div>
            </div>
          </div>
        )}

        {/* --- CONTENT: USERS --- */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-fade-in">
            <h3 className="text-xl font-bold mb-6">จัดการผู้ใช้งาน</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="p-3 rounded-l-lg">ID</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3 font-medium">{u.email}</td>
                    <td className="p-3"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{u.role}</span></td>
                    <td className="p-3">
                      {u.is_banned 
                        ? <span className="text-red-500 flex items-center gap-1"><Ban size={14}/> Banned</span> 
                        : <span className="text-green-500">Active</span>}
                    </td>
                    <td className="p-3">
                      <button 
                        onClick={() => handleBanUser(u.id, u.is_banned)}
                        disabled={u.is_banned || u.role === 'admin'}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm transition ${
                          u.is_banned || u.role === 'admin' 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <Ban size={16} /> แบน
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- CONTENT: BOOKS --- */}
        {activeTab === 'books' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">คลังหนังสือ ({books.length})</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
                <PlusCircle size={20} /> เพิ่มหนังสือใหม่
              </button>
            </div>

            <div className="mb-4 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="ค้นหาหนังสือ..." 
                className="w-full pl-10 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="p-3">ชื่อหนังสือ</th>
                  <th className="p-3">หมวดหมู่</th>
                  <th className="p-3">ราคา</th>
                  <th className="p-3">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
                  <tr key={b.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-3 font-medium">{b.title}</td>
                    <td className="p-3 text-gray-500">{b.category}</td>
                    <td className="p-3 text-green-600 font-bold">฿{b.price}</td>
                    <td className="p-3">
                      <button onClick={() => handleDeleteBook(b.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;