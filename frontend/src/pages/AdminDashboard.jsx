import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
  Users, DollarSign, BookOpen, Ban, Trash2, 
  PlusCircle, Search, BarChart3 
} from 'lucide-react';

// 👇 ใช้ Link ของ Render
const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    users: 0, sales: 0, books: 0, chartSeries: [44, 55, 13, 33]
  });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // ✅ ลองดึงข้อมูลจริงจาก API ก่อน
      // (ถ้าคุณทำ route /api/admin/stats ไว้แล้ว มันจะทำงานได้เลย)
      // const res = await axios.get(`${API_BASE_URL}/api/admin/stats`);
      // setStats(res.data);
      
      // *แต่ตอนนี้ใช้ Mock Data ไปก่อนเพื่อให้หน้าเว็บไม่พังขณะรอ Backend*
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
      ]);

    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  const handleBanUser = async (id, currentStatus) => {
    if (currentStatus) return alert("User นี้ถูกแบนไปแล้ว");
    const reason = prompt("กรุณาระบุเหตุผลการแบน:");
    if (!reason) return;

    try {
        // ✅ ตัวอย่างการยิง API แบน user
        // await axios.post(`${API_BASE_URL}/api/admin/ban`, { userId: id, reason });
        
        setUsers(users.map(u => u.id === id ? { ...u, is_banned: true, ban_reason: reason } : u));
        alert(`แบน User ID ${id} เรียบร้อย!`);
    } catch (error) {
        alert("เกิดข้อผิดพลาดในการแบน");
    }
  };

  const handleDeleteBook = async (id) => {
    if (confirm("ยืนยันที่จะลบหนังสือเล่มนี้?")) {
      try {
          // ✅ ตัวอย่างการยิง API ลบหนังสือ
          // await axios.delete(`${API_BASE_URL}/api/books/${id}`);
          setBooks(books.filter(b => b.id !== id));
      } catch (error) {
          // alert("ลบไม่สำเร็จ");
          setBooks(books.filter(b => b.id !== id)); // ลบหลอกๆ ไปก่อน
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <BarChart3 className="text-blue-600" /> แดชบอร์ดผู้ดูแลระบบ
        </h1>

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

        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 border-blue-500">
                <Users className="w-12 h-12 text-blue-500 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full" />
                <div><p className="text-sm text-gray-500">สมาชิกทั้งหมด</p><p className="text-3xl font-bold">{stats.users}</p></div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 border-green-500">
                <DollarSign className="w-12 h-12 text-green-500 bg-green-100 dark:bg-green-900/30 p-2 rounded-full" />
                <div><p className="text-sm text-gray-500">ยอดขายรวม</p><p className="text-3xl font-bold">฿{stats.sales.toLocaleString()}</p></div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center gap-4 border-l-4 border-purple-500">
                <BookOpen className="w-12 h-12 text-purple-500 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full" />
                <div><p className="text-sm text-gray-500">หนังสือในคลัง</p><p className="text-3xl font-bold">{stats.books}</p></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4">สัดส่วนหมวดหมู่หนังสือ</h3>
                <Chart options={chartOptions} series={stats.chartSeries} type="donut" height={350} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-fade-in">
            <h3 className="text-xl font-bold mb-6">จัดการผู้ใช้งาน</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700"><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Action</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b dark:border-gray-700">
                    <td className="p-3">{u.email}</td>
                    <td className="p-3"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{u.role}</span></td>
                    <td className="p-3">{u.is_banned ? <span className="text-red-500 flex gap-1"><Ban size={14}/> Banned</span> : <span className="text-green-500">Active</span>}</td>
                    <td className="p-3">
                      <button onClick={() => handleBanUser(u.id, u.is_banned)} disabled={u.is_banned || u.role === 'admin'} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded"><Ban size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'books' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">คลังหนังสือ ({books.length})</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><PlusCircle size={20} /> เพิ่มหนังสือใหม่</button>
            </div>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input type="text" placeholder="ค้นหาหนังสือ..." className="w-full pl-10 p-2 border rounded-lg dark:bg-gray-700 dark:text-white" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <table className="w-full text-left">
              <thead><tr className="border-b dark:border-gray-700"><th className="p-3">ชื่อหนังสือ</th><th className="p-3">ราคา</th><th className="p-3">จัดการ</th></tr></thead>
              <tbody>
                {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
                  <tr key={b.id} className="border-b dark:border-gray-700">
                    <td className="p-3">{b.title}</td>
                    <td className="p-3 text-green-600 font-bold">฿{b.price}</td>
                    <td className="p-3"><button onClick={() => handleDeleteBook(b.id)} className="text-red-500"><Trash2 size={18} /></button></td>
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