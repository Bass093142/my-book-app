import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { 
  Users, DollarSign, BookOpen, Trash2, ShoppingBag,
  PlusCircle, Search, BarChart3, List, X, Image as ImageIcon
} from 'lucide-react';

const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState({ users: 0, sales: 0, books: 0, orders: 0, genderData: [], salesData: [] });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ เพิ่มหมวดหมู่
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false); // ✅ Modal จัดการหมวดหมู่

  const [newBook, setNewBook] = useState({ title: '', price: '', category: 'General', description: '', image: '', stock: 10 });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        navigate('/');
        return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
        setLoading(true);
        // ดึงข้อมูลทั้งหมดในครั้งเดียว
        const [statsRes, usersRes, booksRes, ordersRes, catRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/admin/stats`),
            axios.get(`${API_BASE_URL}/api/admin/users`),
            axios.get(`${API_BASE_URL}/api/books`),
            axios.get(`${API_BASE_URL}/api/admin/orders`), // ✅ ดึงออเดอร์
            axios.get(`${API_BASE_URL}/api/categories`)    // ✅ ดึงหมวดหมู่
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setBooks(booksRes.data);
        setOrders(ordersRes.data);
        setCategories(catRes.data);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
  };

  // --- 📊 กราฟ ---
  const genderChartOptions = {
    labels: stats.genderData?.map(g => g.gender || 'ไม่ระบุ') || [],
    colors: ['#3B82F6', '#EC4899', '#A855F7'], // ฟ้า, ชมพู, ม่วง
    title: { text: 'สัดส่วนเพศผู้ใช้งาน', align: 'center' }
  };
  const genderChartSeries = stats.genderData?.map(g => g.count) || [];

  const salesChartOptions = {
    chart: { id: 'sales-chart' },
    xaxis: { categories: stats.salesData?.map(s => s.date) || [] },
    title: { text: 'ยอดขายรายวัน (7 วันล่าสุด)', align: 'left' }
  };
  const salesChartSeries = [{ name: 'ยอดขาย (บาท)', data: stats.salesData?.map(s => parseInt(s.total)) || [] }];

  // --- 📚 จัดการหนังสือ & หมวดหมู่ ---
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/books`, newBook);
        Swal.fire('สำเร็จ', 'เพิ่มหนังสือแล้ว', 'success');
        setShowBookModal(false);
        fetchData();
    } catch (error) { Swal.fire('Error', 'เพิ่มไม่สำเร็จ', 'error'); }
  };

  const handleAddCategory = async () => {
    if(!newCategory) return;
    try {
        await axios.post(`${API_BASE_URL}/api/categories`, { name: newCategory });
        Swal.fire('สำเร็จ', 'เพิ่มหมวดหมู่แล้ว', 'success');
        setNewCategory('');
        fetchData(); 
    } catch (error) { Swal.fire('Error', 'เพิ่มหมวดหมู่ไม่สำเร็จ (ชื่ออาจซ้ำ)', 'error'); }
  };

  const handleDeleteCategory = async (id) => {
      if(!window.confirm("ยืนยันการลบหมวดหมู่นี้?")) return;
      try {
          await axios.delete(`${API_BASE_URL}/api/categories/${id}`);
          fetchData();
      } catch (err) { alert("ลบไม่ได้"); }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewBook({...newBook, image: reader.result});
      reader.readAsDataURL(file);
    }
  };

  // --- 📦 จัดการออเดอร์ ---
  const handleUpdateStatus = async (id, status) => {
      await axios.put(`${API_BASE_URL}/api/admin/orders/${id}`, { status });
      fetchData();
      Swal.fire('อัปเดตสถานะแล้ว', '', 'success');
  }

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <BarChart3 className="text-blue-600" /> แดชบอร์ดผู้ดูแลระบบ
        </h1>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['overview', 'users', 'books', 'orders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-bold transition shadow-sm capitalize ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'
              }`}>
              {tab === 'overview' ? 'ภาพรวม' : tab === 'users' ? 'สมาชิก' : tab === 'books' ? 'คลังหนังสือ' : 'รายการสั่งซื้อ'}
            </button>
          ))}
        </div>

        {/* --- 1. OVERVIEW (กราฟสถิติ) --- */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                 <p className="text-gray-500">ยอดขายรวม</p>
                 <p className="text-3xl font-bold">฿{stats.sales.toLocaleString()}</p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                 <p className="text-gray-500">ออเดอร์ทั้งหมด</p>
                 <p className="text-3xl font-bold">{stats.orders}</p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-purple-500">
                 <p className="text-gray-500">จำนวนหนังสือ</p>
                 <p className="text-3xl font-bold">{stats.books}</p>
             </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500">
                 <p className="text-gray-500">สมาชิกทั้งหมด</p>
                 <p className="text-3xl font-bold">{stats.users}</p>
             </div>
             
             {/* กราฟยอดขาย */}
             <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                 <Chart options={salesChartOptions} series={salesChartSeries} type="bar" height={300} />
             </div>
             {/* กราฟเพศ */}
             <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex justify-center">
                 <Chart options={genderChartOptions} series={genderChartSeries} type="donut" width={380} />
             </div>
          </div>
        )}

        {/* --- 2. USERS --- */}
        {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr><th className="p-4">Email</th><th className="p-4">ชื่อ-สกุล</th><th className="p-4">สถานะ</th></tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b dark:border-gray-700">
                                <td className="p-4">{u.email}</td>
                                <td className="p-4">{u.first_name} {u.last_name}</td>
                                <td className="p-4">{u.is_banned ? <span className="text-red-500">ถูกแบน</span> : <span className="text-green-500">ปกติ</span>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* --- 3. BOOKS (เพิ่มระบบจัดการหมวดหมู่) --- */}
        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                    <button onClick={() => setShowBookModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center">
                        <PlusCircle size={20} /> เพิ่มหนังสือ
                    </button>
                    <button onClick={() => setShowCatModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center">
                        <List size={20} /> จัดการหมวดหมู่
                    </button>
                </div>
                <input type="text" placeholder="ค้นหา..." className="p-2 border rounded dark:bg-gray-700" onChange={e => setSearchTerm(e.target.value)} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr><th className="p-4">รูป</th><th className="p-4">ชื่อ</th><th className="p-4">หมวดหมู่</th><th className="p-4">ราคา</th><th className="p-4">จัดการ</th></tr>
                    </thead>
                    <tbody>
                        {books.filter(b => b.title.toLowerCase().includes(searchTerm)).map(b => (
                            <tr key={b.id} className="border-b dark:border-gray-700">
                                <td className="p-4"><img src={b.image} className="h-12 w-8 object-cover bg-gray-200" /></td>
                                <td className="p-4">{b.title}</td>
                                <td className="p-4"><span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-xs">{b.category}</span></td>
                                <td className="p-4">฿{b.price}</td>
                                <td className="p-4"><button className="text-red-500"><Trash2 size={18}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- 4. ORDERS (ระบบจัดการออเดอร์) --- */}
        {activeTab === 'orders' && (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr><th className="p-4">Order ID</th><th className="p-4">ลูกค้า</th><th className="p-4">ยอดรวม</th><th className="p-4">สถานะ</th><th className="p-4">จัดการ</th></tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} className="border-b dark:border-gray-700">
                                <td className="p-4">#{o.id}</td>
                                <td className="p-4">{o.first_name} <br/><span className="text-xs text-gray-400">{o.email}</span></td>
                                <td className="p-4 font-bold text-green-600">฿{o.total_price}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        o.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                        o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                                        o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>{o.status.toUpperCase()}</span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handleUpdateStatus(o.id, 'paid')} className="text-green-500 hover:bg-green-50 p-1 rounded border border-green-200">✔ รับเงิน</button>
                                    <button onClick={() => handleUpdateStatus(o.id, 'shipped')} className="text-blue-500 hover:bg-blue-50 p-1 rounded border border-blue-200">🚚 ส่งของ</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        )}
        
        {/* --- Modal เพิ่มหมวดหมู่ --- */}
        {showCatModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-2xl">
                    <h3 className="text-xl font-bold mb-4">จัดการหมวดหมู่</h3>
                    <div className="flex gap-2 mb-4">
                        <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่" className="border p-2 rounded w-full dark:bg-gray-700" />
                        <button onClick={handleAddCategory} className="bg-green-600 text-white p-2 rounded"><PlusCircle/></button>
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                        {categories.map(c => (
                            <li key={c.id} className="flex justify-between p-2 border-b dark:border-gray-700">
                                {c.name}
                                <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16}/></button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setShowCatModal(false)} className="mt-4 text-gray-500 w-full text-center hover:underline">ปิด</button>
                </div>
            </div>
        )}

        {/* --- Modal เพิ่มหนังสือ (แก้ไขให้ดึงหมวดหมู่จาก DB) --- */}
        {showBookModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-2xl">
                    <h2 className="text-2xl font-bold mb-4">เพิ่มหนังสือใหม่</h2>
                    <form onSubmit={handleAddBook} className="space-y-4">
                        <input type="text" placeholder="ชื่อหนังสือ" required className="w-full p-2 border rounded dark:bg-gray-700" onChange={e => setNewBook({...newBook, title: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="ราคา" required className="p-2 border rounded dark:bg-gray-700" onChange={e => setNewBook({...newBook, price: e.target.value})} />
                            {/* ✅ Dropdown เลือกหมวดหมู่จาก Database */}
                            <select className="p-2 border rounded dark:bg-gray-700" onChange={e => setNewBook({...newBook, category: e.target.value})}>
                                <option value="General">-- เลือกหมวดหมู่ --</option>
                                {categories.length > 0 ? categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>) : <option value="General">General</option>}
                            </select>
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">บันทึก</button>
                    </form>
                    <button onClick={() => setShowBookModal(false)} className="mt-4 text-red-500 w-full hover:underline">ยกเลิก</button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;