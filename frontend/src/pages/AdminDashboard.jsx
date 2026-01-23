import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { 
  Users, BookOpen, Trash2, Edit, // เพิ่ม Edit icon
  PlusCircle, BarChart3, List, CheckCircle, X, Image as ImageIcon
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
  const [categories, setCategories] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const [showBookModal, setShowBookModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false); 
  const [newBook, setNewBook] = useState({ title: '', price: '', category: 'General', description: '', image: '', stock: 10 });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        Swal.fire('Access Denied', 'Admin only', 'error');
        navigate('/');
        return;
    }
    fetchData();
  }, [navigate]);

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
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- CRUD: Books ---
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE_URL}/api/books`, newBook);
        Swal.fire('สำเร็จ', 'เพิ่มหนังสือแล้ว', 'success');
        setShowBookModal(false);
        setNewBook({ title: '', price: '', category: 'General', description: '', image: '', stock: 10 });
        fetchData();
    } catch (error) { Swal.fire('Error', 'เพิ่มไม่สำเร็จ', 'error'); }
  };

  const handleDeleteBook = async (id) => {
    Swal.fire({
        title: 'ยืนยันการลบ?',
        text: "ลบแล้วกู้คืนไม่ได้!",
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
            } catch (err) { Swal.fire('Error', 'ลบไม่สำเร็จ', 'error'); }
        }
    });
  };

  // --- CRUD: Categories (Full System) ---
  
  // 1. Add Category
  const handleAddCategory = async () => {
    if(!newCategory) return Swal.fire('แจ้งเตือน', 'กรุณาใส่ชื่อหมวดหมู่', 'warning');
    try {
        await axios.post(`${API_BASE_URL}/api/categories`, { name: newCategory });
        Swal.fire('สำเร็จ', 'เพิ่มหมวดหมู่แล้ว', 'success');
        setNewCategory('');
        fetchData(); 
    } catch (error) { Swal.fire('Error', 'ชื่อซ้ำหรือระบบขัดข้อง', 'error'); }
  };

  // 2. Edit Category (Update)
  const handleEditCategory = async (cat) => {
      const { value: newName } = await Swal.fire({
          title: 'แก้ไขชื่อหมวดหมู่',
          input: 'text',
          inputValue: cat.name,
          showCancelButton: true,
          inputValidator: (value) => {
              if (!value) return 'กรุณาใส่ชื่อ!';
          }
      });

      if (newName && newName !== cat.name) {
          try {
              await axios.put(`${API_BASE_URL}/api/categories/${cat.id}`, { name: newName });
              Swal.fire('สำเร็จ', 'แก้ไขเรียบร้อย', 'success');
              fetchData();
          } catch (error) {
              Swal.fire('Error', 'แก้ไขไม่สำเร็จ', 'error');
          }
      }
  };

  // 3. Delete Category
  const handleDeleteCategory = async (id) => {
      Swal.fire({
          title: 'ยืนยันลบหมวดหมู่?',
          text: "หากมีหนังสืออยู่ในหมวดหมู่นี้ อาจลบไม่ได้",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          confirmButtonText: 'ลบเลย'
      }).then(async (result) => {
          if (result.isConfirmed) {
              try {
                  await axios.delete(`${API_BASE_URL}/api/categories/${id}`);
                  fetchData();
                  Swal.fire('Deleted!', 'ลบเรียบร้อย', 'success');
              } catch (err) { 
                  // แสดงข้อความ Error จาก Backend ชัดเจน
                  const msg = err.response?.data?.message || 'Server Error';
                  Swal.fire('ลบไม่ได้!', msg, 'error'); 
              }
          }
      });
  }

  // --- Other Handlers ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 2*1024*1024) return Swal.fire('Warning','File too large (>2MB)','warning');
      const reader = new FileReader();
      reader.onloadend = () => setNewBook({...newBook, image: reader.result});
      reader.readAsDataURL(file);
    }
  };

  // ... (Ban user, Update Order logic same as before) ...
  const handleBanUser = async (user) => { /* Code เดิม */ };
  const handleUpdateStatus = async (id, status) => { 
      try { await axios.put(`${API_BASE_URL}/api/admin/orders/${id}`, { status }); fetchData(); Swal.fire('Updated', '', 'success'); } 
      catch (e) { Swal.fire('Error', '', 'error'); }
  };

  // Graph Data
  const genderChartOptions = { labels: stats.genderData?.map(g => g.gender||'N/A')||[], colors: ['#3B82F6','#EC4899','#A855F7'] };
  const genderChartSeries = stats.genderData?.map(g => g.count)||[];
  const salesChartOptions = { xaxis: { categories: stats.salesData?.map(s => s.date)||[] } };
  const salesChartSeries = [{ name: 'ยอดขาย', data: stats.salesData?.map(s => parseInt(s.total))||[] }];
  
  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) && (filterCategory === 'All' || b.category === filterCategory));

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3"><BarChart3 className="text-blue-600"/> แดชบอร์ดผู้ดูแลระบบ</h1>
        
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {['overview', 'users', 'books', 'orders'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full font-bold capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800'}`}>{tab}</button>
            ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-blue-500"><p>ยอดขาย</p><p className="text-3xl font-bold">฿{stats.sales.toLocaleString()}</p></div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-green-500"><p>ออเดอร์</p><p className="text-3xl font-bold">{stats.orders}</p></div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-purple-500"><p>หนังสือ</p><p className="text-3xl font-bold">{stats.books}</p></div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-yellow-500"><p>สมาชิก</p><p className="text-3xl font-bold">{stats.users}</p></div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow"><Chart options={salesChartOptions} series={salesChartSeries} type="bar" height={300}/></div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow flex justify-center"><Chart options={genderChartOptions} series={genderChartSeries} type="donut" width={380}/></div>
             </div>
        )}

        {activeTab === 'users' && (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-4">Email</th><th className="p-4">ชื่อ</th><th className="p-4">สถานะ</th></tr></thead>
                    <tbody>{users.map(u=>(<tr key={u.id} className="border-b dark:border-gray-700"><td className="p-4">{u.email}</td><td className="p-4">{u.first_name}</td><td className="p-4">{u.is_banned?'แบน':'ปกติ'}</td></tr>))}</tbody>
                </table>
             </div>
        )}

        {activeTab === 'books' && (
          <div>
             <div className="flex justify-between mb-4 flex-wrap gap-4">
                <div className="flex gap-2">
                    <button onClick={() => setShowBookModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><PlusCircle size={20}/> เพิ่มหนังสือ</button>
                    <button onClick={() => setShowCatModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><List size={20}/> จัดการหมวดหมู่</button>
                </div>
                <div className="flex gap-2">
                    <select className="p-2 border rounded dark:bg-gray-700" onChange={e => setFilterCategory(e.target.value)}>
                        <option value="All">ทุกหมวดหมู่</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <input type="text" placeholder="ค้นหา..." className="p-2 border rounded dark:bg-gray-700" onChange={e => setSearchTerm(e.target.value)} />
                </div>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-4">รูป</th><th className="p-4">ชื่อ</th><th className="p-4">หมวด</th><th className="p-4">ราคา</th><th className="p-4">จัดการ</th></tr></thead>
                    <tbody>
                        {filteredBooks.map(b => (
                            <tr key={b.id} className="border-b dark:border-gray-700">
                                <td className="p-4"><img src={b.image} className="h-16 w-12 object-cover bg-gray-200"/></td>
                                <td className="p-4">{b.title}</td>
                                <td className="p-4"><span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-xs">{b.category}</span></td>
                                <td className="p-4 text-green-600">฿{b.price}</td>
                                <td className="p-4"><button onClick={() => handleDeleteBook(b.id)} className="text-red-500"><Trash2/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'orders' && (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left"><thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-4">ID</th><th className="p-4">ลูกค้า</th><th className="p-4">ยอด</th><th className="p-4">สถานะ</th><th className="p-4">จัดการ</th></tr></thead><tbody>{orders.map(o=>(<tr key={o.id} className="border-b dark:border-gray-700"><td className="p-4">#{o.id}</td><td className="p-4">{o.first_name}</td><td className="p-4">฿{o.total_price}</td><td className="p-4">{o.status}</td><td className="p-4 flex gap-2"><button onClick={()=>handleUpdateStatus(o.id,'paid')} className="text-green-500">✔</button><button onClick={()=>handleUpdateStatus(o.id,'shipped')} className="text-blue-500">🚚</button></td></tr>))}</tbody></table>
             </div>
        )}

        {/* Modal: Categories CRUD */}
        {showCatModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-2xl border dark:border-gray-700">
                    <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">จัดการหมวดหมู่</h3><button onClick={() => setShowCatModal(false)}><X/></button></div>
                    
                    <div className="flex gap-2 mb-4">
                        <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="เพิ่มหมวดหมู่..." className="border p-2 rounded w-full dark:bg-gray-700" />
                        <button onClick={handleAddCategory} className="bg-green-600 text-white p-2 rounded hover:bg-green-700"><PlusCircle/></button>
                    </div>
                    
                    <ul className="max-h-60 overflow-y-auto pr-2">
                        {categories.map(c => (
                            <li key={c.id} className="flex justify-between items-center p-2 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition">
                                <span>{c.name}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditCategory(c)} className="text-blue-500 hover:bg-blue-100 p-1 rounded"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16}/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

        {/* Modal: Books (คงเดิม) */}
        {showBookModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-2xl">
                    <div className="flex justify-between mb-4"><h2 className="text-2xl font-bold">เพิ่มหนังสือใหม่</h2><button onClick={() => setShowBookModal(false)}><X/></button></div>
                    <form onSubmit={handleAddBook} className="space-y-4">
                        <input type="text" placeholder="ชื่อ" required className="w-full p-2 border rounded dark:bg-gray-700" onChange={e => setNewBook({...newBook, title: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="ราคา" required className="p-2 border rounded dark:bg-gray-700" onChange={e => setNewBook({...newBook, price: e.target.value})} />
                            <select className="p-2 border rounded dark:bg-gray-700" onChange={e => setNewBook({...newBook, category: e.target.value})}>
                                <option value="General">-- หมวดหมู่ --</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">บันทึก</button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;