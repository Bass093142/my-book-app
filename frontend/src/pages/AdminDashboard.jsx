import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { 
  Users, DollarSign, BookOpen, Ban, Trash2, 
  PlusCircle, Search, BarChart3, CheckCircle, X, Image as ImageIcon
} from 'lucide-react';

const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, sales: 0, books: 0, chartSeries: [] });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '', price: '', category: 'General', description: '', image: '', stock: 10
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        Swal.fire({
            icon: 'error',
            title: 'เข้าถึงไม่ได้',
            text: 'หน้านี้สำหรับผู้ดูแลระบบเท่านั้น!',
            timer: 2000,
            showConfirmButton: false
        });
        navigate('/');
        return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
        setLoading(true);
        const [statsRes, usersRes, booksRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/admin/stats`),
            axios.get(`${API_BASE_URL}/api/admin/users`),
            axios.get(`${API_BASE_URL}/api/books`)
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setBooks(booksRes.data);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 2 * 1024 * 1024) return Swal.fire('ไฟล์ใหญ่ไป', 'รูปต้องไม่เกิน 2MB', 'warning');
      const reader = new FileReader();
      reader.onloadend = () => setNewBook({...newBook, image: reader.result});
      reader.readAsDataURL(file);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/books`, newBook);
        Swal.fire('สำเร็จ!', 'เพิ่มหนังสือเรียบร้อยแล้ว', 'success');
        setShowModal(false);
        setNewBook({ title: '', price: '', category: 'General', description: '', image: '', stock: 10 });
        fetchData();
    } catch (error) {
        Swal.fire('เกิดข้อผิดพลาด', 'เพิ่มหนังสือไม่สำเร็จ', 'error');
    }
  };

  const handleDeleteBook = async (id) => {
    Swal.fire({
        title: 'ยืนยันการลบ?',
        text: "คุณจะไม่สามารถกู้คืนหนังสือเล่มนี้ได้!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/api/books/${id}`);
                setBooks(books.filter(b => b.id !== id));
                Swal.fire('ลบแล้ว!', 'หนังสือถูกลบออกจากระบบ', 'success');
            } catch (error) {
                Swal.fire('ลบไม่สำเร็จ', 'เกิดข้อผิดพลาดที่ Server', 'error');
            }
        }
    });
  };

  const handleBanUser = async (user) => {
    const newStatus = !user.is_banned;
    
    if (newStatus) {
        // ✅ เปลี่ยนจาก select เป็น radio เพื่อให้โชว์ตัวเลือกตลอดเวลา
        const { value: reason } = await Swal.fire({
            title: 'เลือกเหตุผลการแบน',
            input: 'radio', 
            inputOptions: {
                'Spam': 'ส่งข้อความสแปม / โฆษณา',
                'Rude': 'ใช้คำหยาบคาย / พฤติกรรมไม่เหมาะสม',
                'Fake': 'ข้อมูลเท็จ / หลอกลวง',
                'Other': 'อื่นๆ (ผิดกฎระเบียบทั่วไป)'
            },
            inputValidator: (value) => {
                if (!value) {
                    return 'กรุณาเลือกเหตุผลก่อนครับ!';
                }
            },
            showCancelButton: true,
            confirmButtonText: 'ยืนยันการแบน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#d33'
        });

        if (reason) {
            try {
                await axios.post(`${API_BASE_URL}/api/admin/ban`, { id: user.id, is_banned: true, ban_reason: reason });
                setUsers(users.map(u => u.id === user.id ? { ...u, is_banned: true, ban_reason: reason } : u));
                Swal.fire('แบนสำเร็จ', `ผู้ใช้ถูกแบนด้วยเหตุผล: ${reason}`, 'success');
            } catch (error) {
                Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
            }
        }
    } else {
        Swal.fire({
            title: 'ยืนยันการปลดแบน?',
            text: "ผู้ใช้นี้จะกลับมาใช้งานได้ปกติ",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ปลดแบน',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(`${API_BASE_URL}/api/admin/ban`, { id: user.id, is_banned: false, ban_reason: null });
                    setUsers(users.map(u => u.id === user.id ? { ...u, is_banned: false, ban_reason: null } : u));
                    Swal.fire('ปลดแบนแล้ว', 'ผู้ใช้งานกลับมาใช้งานได้ปกติ', 'success');
                } catch (error) {
                    Swal.fire('Error', 'เกิดข้อผิดพลาด', 'error');
                }
            }
        });
    }
  };

  const filteredBooks = books.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'All' || b.category === filterCategory;
      return matchSearch && matchCategory;
  });

  const chartOptions = {
    labels: ['หนังสือ', 'สมาชิก', 'ขายแล้ว', 'อื่นๆ'],
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'],
    legend: { position: 'bottom' }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <BarChart3 className="text-blue-600" /> แดชบอร์ดผู้ดูแลระบบ
        </h1>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['overview', 'users', 'books'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-bold transition shadow-sm ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
              {tab === 'overview' ? 'ภาพรวม' : tab === 'users' ? 'สมาชิก' : 'คลังหนังสือ'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-8 border-blue-500 flex items-center gap-4">
               <Users size={40} className="text-blue-500" />
               <div><p className="text-gray-500">สมาชิกทั้งหมด</p><p className="text-3xl font-bold">{stats.users}</p></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-8 border-green-500 flex items-center gap-4">
               <DollarSign size={40} className="text-green-500" />
               <div><p className="text-gray-500">ยอดขายรวม</p><p className="text-3xl font-bold">฿{stats.sales.toLocaleString()}</p></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-l-8 border-purple-500 flex items-center gap-4">
               <BookOpen size={40} className="text-purple-500" />
               <div><p className="text-gray-500">หนังสือในคลัง</p><p className="text-3xl font-bold">{stats.books}</p></div>
            </div>
            <div className="md:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <Chart options={chartOptions} series={stats.chartSeries || [0,0,0,0]} type="donut" height={300} />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Action</th></tr>
                </thead>
                <tbody>
                    {users.map(u => (
                    <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4">{u.email}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${u.role==='admin'?'bg-purple-100 text-purple-800':'bg-blue-100 text-blue-800'}`}>{u.role}</span></td>
                        <td className="p-4">{u.is_banned ? <span className="text-red-500 flex items-center gap-1"><Ban size={14}/> Banned</span> : <span className="text-green-500 flex items-center gap-1"><CheckCircle size={14}/> Active</span>}</td>
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
          </div>
        )}

        {activeTab === 'books' && (
          <div className="animate-fade-in">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex gap-2 flex-1 min-w-[300px]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        <input type="text" placeholder="ค้นหาชื่อหนังสือ..." 
                            className="w-full pl-10 p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 outline-none"
                        onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="All">ทุกหมวดหมู่</option>
                        <option value="Technology">Technology</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Cartoon">Cartoon</option>
                        <option value="General">General</option>
                    </select>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition transform hover:scale-105">
                    <PlusCircle size={20} /> เพิ่มหนังสือ
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <table className="w-full text-left">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr><th className="p-4">รูปปก</th><th className="p-4">ชื่อหนังสือ</th><th className="p-4">หมวดหมู่</th><th className="p-4">ราคา</th><th className="p-4">จัดการ</th></tr>
                </thead>
                <tbody>
                    {filteredBooks.map(b => (
                    <tr key={b.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-4">
                            <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden">
                                {b.image ? <img src={b.image} alt={b.title} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={20}/></div>}
                            </div>
                        </td>
                        <td className="p-4 font-medium">{b.title}</td>
                        <td className="p-4"><span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">{b.category}</span></td>
                        <td className="p-4 text-green-600 font-bold">฿{b.price}</td>
                        <td className="p-4">
                            <button onClick={() => handleDeleteBook(b.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition"><Trash2 size={20}/></button>
                        </td>
                    </tr>
                    ))}
                    {filteredBooks.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">ไม่พบหนังสือที่ค้นหา</td></tr>}
                </tbody>
                </table>
            </div>
          </div>
        )}

        {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scale-up">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">เพิ่มหนังสือใหม่</h2>
                        <button onClick={() => setShowModal(false)}><X className="text-gray-500 hover:text-red-500" /></button>
                    </div>
                    <form onSubmit={handleAddBook} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1">ชื่อหนังสือ</label>
                            <input type="text" required className="w-full p-2 border rounded dark:bg-gray-700" 
                                onChange={e => setNewBook({...newBook, title: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1">ราคา</label>
                                <input type="number" required className="w-full p-2 border rounded dark:bg-gray-700" 
                                    onChange={e => setNewBook({...newBook, price: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">หมวดหมู่</label>
                                <select className="w-full p-2 border rounded dark:bg-gray-700"
                                    onChange={e => setNewBook({...newBook, category: e.target.value})}>
                                    <option value="General">General</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Fiction">Fiction</option>
                                    <option value="Cartoon">Cartoon</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">รูปปกหนังสือ</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                        {newBook.image && <img src={newBook.image} alt="Preview" className="h-24 rounded mx-auto border" />}
                        
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">บันทึกหนังสือ</button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;