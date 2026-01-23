import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { 
  Users, DollarSign, BookOpen, Trash2, ShoppingBag,
  PlusCircle, Search, BarChart3, List, Image as ImageIcon,
  CheckCircle, X, Edit // ✅ เพิ่มไอคอน Edit
} from 'lucide-react';

const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const AdminDashboard = () => {
  const navigate = useNavigate();
  // State ควบคุม Tab
  const [activeTab, setActiveTab] = useState('overview'); 
  
  // State ข้อมูลทั้งหมด
  const [stats, setStats] = useState({ 
      users: 0, sales: 0, books: 0, orders: 0, 
      genderData: [], salesData: [] 
  });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal States
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false); 

  // Form States
  const [newBook, setNewBook] = useState({ 
      title: '', price: '', category: 'General', description: '', image: '', stock: 10 
  });
  const [newCategory, setNewCategory] = useState('');

  // 1. เช็คสิทธิ์ Admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        Swal.fire('Access Denied', 'สำหรับผู้ดูแลระบบเท่านั้น', 'error');
        navigate('/');
        return;
    }
    fetchData();
  }, [navigate]);

  // 2. ดึงข้อมูล (Fetch Data)
  const fetchData = async () => {
    try {
        setLoading(true);
        const [statsRes, usersRes, booksRes, ordersRes, catRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/admin/stats`),
            axios.get(`${API_BASE_URL}/api/admin/users`),
            axios.get(`${API_BASE_URL}/api/books`),
            axios.get(`${API_BASE_URL}/api/admin/orders`), 
            axios.get(`${API_BASE_URL}/api/categories`)
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setBooks(booksRes.data);
        setOrders(ordersRes.data);
        setCategories(catRes.data);

    } catch (error) {
        console.error("Error fetching data:", error);
        // Swal.fire('Error', 'โหลดข้อมูลไม่สำเร็จ', 'error'); // ปิดไว้ก่อนกันรำคาญถ้าเน็ตช้า
    } finally {
        setLoading(false);
    }
  };

  // ==============================
  // 📚 ส่วนจัดการหนังสือ (Books)
  // ==============================
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/books`, newBook);
        Swal.fire('สำเร็จ', 'เพิ่มหนังสือเรียบร้อย', 'success');
        setShowBookModal(false);
        setNewBook({ title: '', price: '', category: 'General', description: '', image: '', stock: 10 });
        fetchData();
    } catch (error) { 
        Swal.fire('Error', 'เพิ่มหนังสือไม่สำเร็จ', 'error'); 
    }
  };

  const handleDeleteBook = async (id) => {
    Swal.fire({
        title: 'ยืนยันการลบ?',
        text: "ข้อมูลหนังสือจะหายไปถาวร!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'ลบเลย'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/api/books/${id}`);
                fetchData();
                Swal.fire('Deleted!', 'ลบเรียบร้อย', 'success');
            } catch (err) {
                Swal.fire('Error', 'ลบไม่สำเร็จ', 'error');
            }
        }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 2 * 1024 * 1024) return Swal.fire('รูปใหญ่ไป', 'ขนาดต้องไม่เกิน 2MB', 'warning');
      const reader = new FileReader();
      reader.onloadend = () => setNewBook({...newBook, image: reader.result});
      reader.readAsDataURL(file);
    }
  };

  // ==============================
  // 🏷️ ส่วนจัดการหมวดหมู่ (Categories CRUD)
  // ==============================
  
  // 1. เพิ่มหมวดหมู่ (Create)
  const handleAddCategory = async () => {
    if(!newCategory) return Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อหมวดหมู่', 'warning');
    try {
        await axios.post(`${API_BASE_URL}/api/categories`, { name: newCategory });
        Swal.fire({ icon: 'success', title: 'สำเร็จ', text: 'เพิ่มหมวดหมู่แล้ว', timer: 1500, showConfirmButton: false });
        setNewCategory('');
        fetchData(); 
    } catch (error) { 
        Swal.fire('Error', 'ชื่อหมวดหมู่ซ้ำหรือระบบขัดข้อง', 'error'); 
    }
  };

  // 2. แก้ไขหมวดหมู่ (Update) - ✅ เพิ่มให้ใหม่
  const handleEditCategory = async (cat) => {
      const { value: newName } = await Swal.fire({
          title: 'แก้ไขชื่อหมวดหมู่',
          input: 'text',
          inputValue: cat.name,
          showCancelButton: true,
          inputValidator: (value) => {
              if (!value) return 'กรุณากรอกชื่อใหม่!';
          }
      });

      if (newName && newName !== cat.name) {
          try {
              // ต้องแน่ใจว่า Backend มี Route PUT /api/categories/:id
              await axios.put(`${API_BASE_URL}/api/categories/${cat.id}`, { name: newName });
              Swal.fire('สำเร็จ', 'แก้ไขชื่อเรียบร้อย', 'success');
              fetchData();
          } catch (error) {
              Swal.fire('Error', 'แก้ไขไม่สำเร็จ', 'error');
          }
      }
  };

  // 3. ลบหมวดหมู่ (Delete)
  const handleDeleteCategory = async (id) => {
      Swal.fire({
          title: 'ลบหมวดหมู่นี้?',
          text: "หากมีหนังสืออยู่ในหมวดหมู่นี้ จะลบไม่ได้นะครับ",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          confirmButtonText: 'ลบเลย'
      }).then(async (result) => {
          if (result.isConfirmed) {
              try {
                  await axios.delete(`${API_BASE_URL}/api/categories/${id}`);
                  fetchData();
                  Swal.fire('Deleted!', 'ลบหมวดหมู่แล้ว', 'success');
              } catch (err) { 
                  // แสดง Error จาก Backend (เช่น ติด Foreign Key)
                  const msg = err.response?.data?.message || 'Server Error';
                  Swal.fire('ลบไม่ได้!', msg, 'error'); 
              }
          }
      });
  }

  // ==============================
  // 👥 ส่วนจัดการสมาชิก (Users)
  // ==============================
  const handleBanUser = async (user) => {
    const newStatus = !user.is_banned;
    if (newStatus) {
        const { value: reason } = await Swal.fire({
            title: 'เลือกเหตุผลการแบน',
            input: 'radio', 
            inputOptions: {
                'Spam': 'สแปม / โฆษณา',
                'Rude': 'พฤติกรรมไม่เหมาะสม',
                'Fake': 'ข้อมูลเท็จ',
                'Other': 'อื่นๆ'
            },
            inputValidator: (v) => !v && 'กรุณาเลือกเหตุผล!',
            showCancelButton: true,
            confirmButtonColor: '#d33'
        });
        if (reason) {
            try {
                await axios.post(`${API_BASE_URL}/api/admin/ban`, { id: user.id, is_banned: true, ban_reason: reason });
                fetchData();
                Swal.fire('แบนสำเร็จ', '', 'success');
            } catch (error) { Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error'); }
        }
    } else {
        Swal.fire({
            title: 'ปลดแบน?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ปลดแบน'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(`${API_BASE_URL}/api/admin/ban`, { id: user.id, is_banned: false, ban_reason: null });
                    fetchData();
                    Swal.fire('ปลดแบนแล้ว', '', 'success');
                } catch (error) { Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error'); }
            }
        });
    }
  };

  // ==============================
  // 📦 ส่วนจัดการออเดอร์ (Orders)
  // ==============================
  const handleUpdateStatus = async (id, status) => {
      try {
        await axios.put(`${API_BASE_URL}/api/admin/orders/${id}`, { status });
        fetchData();
        Swal.fire({ icon: 'success', title: 'อัปเดตแล้ว', text: `สถานะเป็น ${status}`, timer: 1000, showConfirmButton: false });
      } catch (err) {
        Swal.fire('Error', 'อัปเดตสถานะไม่สำเร็จ', 'error');
      }
  }

  // กราฟ Settings
  const genderChartOptions = {
    labels: stats.genderData?.map(g => g.gender || 'ไม่ระบุ') || [],
    colors: ['#3B82F6', '#EC4899', '#A855F7'],
    title: { text: 'สัดส่วนเพศผู้ใช้งาน', align: 'center' }
  };
  const genderChartSeries = stats.genderData?.map(g => g.count) || [];

  const salesChartOptions = {
    chart: { id: 'sales-chart' },
    xaxis: { categories: stats.salesData?.map(s => s.date) || [] },
    title: { text: 'ยอดขายรายวัน (7 วันล่าสุด)', align: 'left' }
  };
  const salesChartSeries = [{ name: 'ยอดขาย (บาท)', data: stats.salesData?.map(s => parseInt(s.total)) || [] }];

  // กรองหนังสือ
  const filteredBooks = books.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'All' || b.category === filterCategory;
      return matchSearch && matchCategory;
  });

  if (loading) return <div className="text-center mt-20 text-xl font-bold">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <BarChart3 className="text-blue-600" /> แดชบอร์ดผู้ดูแลระบบ
        </h1>

        {/* --- ปุ่ม Tab เมนู --- */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['overview', 'users', 'books', 'orders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-bold transition shadow-sm capitalize ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-200'
              }`}>
              {tab === 'overview' ? 'ภาพรวม' : tab === 'users' ? 'สมาชิก' : tab === 'books' ? 'คลังหนังสือ' : 'รายการสั่งซื้อ'}
            </button>
          ))}
        </div>

        {/* --- TAB 1: OVERVIEW --- */}
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
             
             {/* กราฟ */}
             <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                 <Chart options={salesChartOptions} series={salesChartSeries} type="bar" height={300} />
             </div>
             <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex justify-center">
                 <Chart options={genderChartOptions} series={genderChartSeries} type="donut" width={380} />
             </div>
          </div>
        )}

        {/* --- TAB 2: USERS --- */}
        {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr><th className="p-4">Email</th><th className="p-4">ชื่อ-สกุล</th><th className="p-4">สถานะ</th><th className="p-4">จัดการ</th></tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-4">{u.email}</td>
                                <td className="p-4">{u.first_name} {u.last_name}</td>
                                <td className="p-4">{u.is_banned ? <span className="text-red-500 font-bold">ถูกแบน</span> : <span className="text-green-500">ปกติ</span>}</td>
                                <td className="p-4">
                                    <button onClick={() => handleBanUser(u)} disabled={u.role==='admin'} 
                                        className={`px-3 py-1 rounded text-sm ${u.is_banned ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} ${u.role==='admin' && 'opacity-50 cursor-not-allowed'}`}>
                                        {u.is_banned ? 'ปลดแบน' : 'แบน'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* --- TAB 3: BOOKS --- */}
        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between mb-4 flex-wrap gap-4">
                <div className="flex gap-2">
                    <button onClick={() => setShowBookModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex gap-2 items-center shadow-md">
                        <PlusCircle size={20} /> เพิ่มหนังสือ
                    </button>
                    <button onClick={() => setShowCatModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex gap-2 items-center shadow-md">
                        <List size={20} /> จัดการหมวดหมู่
                    </button>
                </div>
                <div className="flex gap-2">
                    <select className="p-2 border rounded dark:bg-gray-700" onChange={e => setFilterCategory(e.target.value)}>
                        <option value="All">ทุกหมวดหมู่</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <input type="text" placeholder="ค้นหาชื่อหนังสือ..." className="p-2 border rounded dark:bg-gray-700 w-60" onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr><th className="p-4">รูป</th><th className="p-4">ชื่อ</th><th className="p-4">หมวดหมู่</th><th className="p-4">ราคา</th><th className="p-4">จัดการ</th></tr>
                    </thead>
                    <tbody>
                        {filteredBooks.length === 0 ? <tr><td colSpan="5" className="p-4 text-center">ไม่พบหนังสือ</td></tr> : 
                        filteredBooks.map(b => (
                            <tr key={b.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-4">
                                    {b.image ? <img src={b.image} className="h-16 w-12 object-cover rounded shadow-sm" /> : <div className="h-16 w-12 bg-gray-200 flex items-center justify-center rounded"><ImageIcon size={20}/></div>}
                                </td>
                                <td className="p-4 font-medium">{b.title}</td>
                                <td className="p-4"><span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-xs">{b.category}</span></td>
                                <td className="p-4 text-green-600 font-bold">฿{b.price}</td>
                                <td className="p-4">
                                    <button onClick={() => handleDeleteBook(b.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition"><Trash2 size={20}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- TAB 4: ORDERS --- */}
        {activeTab === 'orders' && (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr><th className="p-4">Order ID</th><th className="p-4">ลูกค้า</th><th className="p-4">ยอดรวม</th><th className="p-4">สถานะ</th><th className="p-4">จัดการ</th></tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? <tr><td colSpan="5" className="p-4 text-center">ไม่มีคำสั่งซื้อ</td></tr> :
                        orders.map(o => (
                            <tr key={o.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-4 font-bold">#{o.id}</td>
                                <td className="p-4">
                                    <div className="font-medium">{o.first_name}</div>
                                    <div className="text-xs text-gray-500">{o.email}</div>
                                </td>
                                <td className="p-4 font-bold text-green-600">฿{o.total_price.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        o.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                        o.status === 'shipped' ? 'bg-blue-100 text-blue-700' : 
                                        o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {o.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handleUpdateStatus(o.id, 'paid')} className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white p-1.5 rounded border border-green-200 transition text-xs">
                                        ✔ รับเงิน
                                    </button>
                                    <button onClick={() => handleUpdateStatus(o.id, 'shipped')} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-1.5 rounded border border-blue-200 transition text-xs">
                                        🚚 ส่งของ
                                    </button>
                                    <button onClick={() => handleUpdateStatus(o.id, 'cancelled')} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-1.5 rounded border border-red-200 transition text-xs">
                                        ❌ ยกเลิก
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        )}
        
        {/* =================================
            MODALS (หน้าต่างเด้ง)
           ================================= */}

        {/* --- Modal: จัดการหมวดหมู่ (มี CRUD ครบ) --- */}
        {showCatModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-2xl border dark:border-gray-700">
                    <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-bold">จัดการหมวดหมู่</h3>
                        <button onClick={() => setShowCatModal(false)}><X size={20}/></button>
                    </div>
                    
                    {/* ฟอร์มเพิ่ม */}
                    <div className="flex gap-2 mb-4">
                        <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่" className="border p-2 rounded w-full dark:bg-gray-700" />
                        <button onClick={handleAddCategory} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 shadow"><PlusCircle/></button>
                    </div>
                    
                    {/* รายการหมวดหมู่ (มีปุ่ม Edit/Delete) */}
                    <ul className="max-h-60 overflow-y-auto pr-2 space-y-2">
                        {categories.map(c => (
                            <li key={c.id} className="flex justify-between items-center p-2 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                <span>{c.name}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEditCategory(c)} className="text-blue-500 hover:bg-blue-100 p-1.5 rounded"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded"><Trash2 size={16}/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

        {/* --- Modal: เพิ่มหนังสือใหม่ (เหมือนเดิม) --- */}
        {showBookModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-2xl border dark:border-gray-700">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-2xl font-bold">เพิ่มหนังสือใหม่</h2>
                        <button onClick={() => setShowBookModal(false)}><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleAddBook} className="space-y-4">
                        <div>
                            <label className="text-sm font-bold">ชื่อหนังสือ</label>
                            <input type="text" required className="w-full p-2 border rounded dark:bg-gray-700 mt-1" 
                                onChange={e => setNewBook({...newBook, title: e.target.value})} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold">ราคา (บาท)</label>
                                <input type="number" required className="w-full p-2 border rounded dark:bg-gray-700 mt-1" 
                                    onChange={e => setNewBook({...newBook, price: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-sm font-bold">หมวดหมู่</label>
                                <select className="w-full p-2 border rounded dark:bg-gray-700 mt-1" 
                                    onChange={e => setNewBook({...newBook, category: e.target.value})}>
                                    <option value="General">-- เลือกหมวดหมู่ --</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold">รูปภาพปก</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                        {newBook.image && <img src={newBook.image} alt="Preview" className="h-32 rounded mx-auto border shadow-sm" />}
                        
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg">
                            บันทึกหนังสือ
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;