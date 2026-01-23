import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { 
  Users, DollarSign, BookOpen, Trash2, ShoppingBag,
  PlusCircle, Search, BarChart3, List, Image as ImageIcon,
  CheckCircle, X, Edit
} from 'lucide-react';

const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
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

  const [showBookModal, setShowBookModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false); 

  // ✅ แก้ State เริ่มต้นให้ใช้ category_id
  const [newBook, setNewBook] = useState({ 
      title: '', price: '', category_id: '', description: '', image: '', stock: 10 
  });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        Swal.fire('Access Denied', 'สำหรับผู้ดูแลระบบเท่านั้น', 'error');
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
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
        // ส่ง newBook ไป (ซึ่งตอนนี้เก็บ category_id แล้ว)
        await axios.post(`${API_BASE_URL}/api/books`, newBook);
        Swal.fire('สำเร็จ', 'เพิ่มหนังสือเรียบร้อย', 'success');
        setShowBookModal(false);
        setNewBook({ title: '', price: '', category_id: '', description: '', image: '', stock: 10 });
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
            } catch (err) { Swal.fire('Error', 'ลบไม่สำเร็จ', 'error'); }
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

  // --- Category CRUD ---
  const handleAddCategory = async () => {
    if(!newCategory) return Swal.fire('แจ้งเตือน', 'กรุณากรอกชื่อหมวดหมู่', 'warning');
    try {
        await axios.post(`${API_BASE_URL}/api/categories`, { name: newCategory });
        Swal.fire({ icon: 'success', title: 'สำเร็จ', text: 'เพิ่มหมวดหมู่แล้ว', timer: 1500, showConfirmButton: false });
        setNewCategory('');
        fetchData(); 
    } catch (error) { Swal.fire('Error', 'ชื่อหมวดหมู่ซ้ำ', 'error'); }
  };

  const handleEditCategory = async (cat) => {
      const { value: newName } = await Swal.fire({
          title: 'แก้ไขชื่อหมวดหมู่',
          input: 'text',
          inputValue: cat.name,
          showCancelButton: true,
          inputValidator: (v) => !v && 'กรุณากรอกชื่อใหม่!'
      });

      if (newName && newName !== cat.name) {
          try {
              await axios.put(`${API_BASE_URL}/api/categories/${cat.id}`, { name: newName });
              Swal.fire('สำเร็จ', 'แก้ไขชื่อเรียบร้อย', 'success');
              fetchData();
          } catch (error) { Swal.fire('Error', 'แก้ไขไม่สำเร็จ', 'error'); }
      }
  };

  const handleDeleteCategory = async (id) => {
      Swal.fire({
          title: 'ลบหมวดหมู่นี้?',
          text: "หนังสือในหมวดหมู่นี้จะกลายเป็น 'ไม่มีหมวดหมู่'",
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
                  const msg = err.response?.data?.message || 'Server Error';
                  Swal.fire('ลบไม่ได้!', msg, 'error'); 
              }
          }
      });
  }

  const handleBanUser = async (user) => {
      // (คงเดิม ไม่เปลี่ยน)
      const newStatus = !user.is_banned;
      if (newStatus) {
        const { value: reason } = await Swal.fire({
            title: 'เลือกเหตุผลการแบน',
            input: 'radio', 
            inputOptions: { 'Spam': 'สแปม', 'Rude': 'หยาบคาย', 'Fake': 'หลอกลวง', 'Other': 'อื่นๆ' },
            inputValidator: (v) => !v && 'เลือกเหตุผล!',
            showCancelButton: true, confirmButtonColor: '#d33'
        });
        if (reason) {
            await axios.post(`${API_BASE_URL}/api/admin/ban`, { id: user.id, is_banned: true, ban_reason: reason });
            fetchData(); Swal.fire('แบนสำเร็จ', '', 'success');
        }
      } else {
        Swal.fire({ title: 'ปลดแบน?', icon: 'question', showCancelButton: true, confirmButtonText: 'ปลดแบน' }).then(async (r) => {
            if(r.isConfirmed) { await axios.post(`${API_BASE_URL}/api/admin/ban`, { id: user.id, is_banned: false }); fetchData(); Swal.fire('ปลดแบนแล้ว', '', 'success'); }
        });
      }
  };

  const handleUpdateStatus = async (id, status) => {
      try { await axios.put(`${API_BASE_URL}/api/admin/orders/${id}`, { status }); fetchData(); Swal.fire({ icon:'success', title:'อัปเดตแล้ว', timer:1000, showConfirmButton:false }); }
      catch (e) { Swal.fire('Error', 'อัปเดตไม่สำเร็จ', 'error'); }
  };

  // Render Charts & Tables
  const genderChartOptions = { labels: stats.genderData?.map(g => g.gender||'N/A')||[], colors: ['#3B82F6','#EC4899','#A855F7'] };
  const genderChartSeries = stats.genderData?.map(g => g.count)||[];
  const salesChartOptions = { xaxis: { categories: stats.salesData?.map(s => s.date)||[] } };
  const salesChartSeries = [{ name: 'ยอดขาย', data: stats.salesData?.map(s => parseInt(s.total))||[] }];
  
  const filteredBooks = books.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
      // ✅ กรองด้วยชื่อหมวดหมู่ที่ Join มา (category_name)
      const catName = b.category_name || 'Uncategorized';
      const matchCategory = filterCategory === 'All' || catName === filterCategory;
      return matchSearch && matchCategory;
  });

  if (loading) return <div className="text-center mt-20 text-xl font-bold">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-3"><BarChart3 className="text-blue-600"/> แดชบอร์ดผู้ดูแลระบบ</h1>
        
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {['overview', 'users', 'books', 'orders'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full font-bold capitalize ${activeTab===tab ? 'bg-blue-600 text-white':'bg-white dark:bg-gray-800'}`}>{tab}</button>
            ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-blue-500"><p>ยอดขาย</p><p className="text-3xl font-bold">฿{stats.sales.toLocaleString()}</p></div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-green-500"><p>ออเดอร์</p><p className="text-3xl font-bold">{stats.orders}</p></div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-purple-500"><p>หนังสือ</p><p className="text-3xl font-bold">{stats.books}</p></div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-yellow-500"><p>สมาชิก</p><p className="text-3xl font-bold">{stats.users}</p></div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow"><Chart options={salesChartOptions} series={salesChartSeries} type="bar" height={300}/></div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow flex justify-center"><Chart options={genderChartOptions} series={genderChartSeries} type="donut" width={380}/></div>
             </div>
        )}

        {/* Tab 2: Users */}
        {activeTab === 'users' && (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-4">Email</th><th className="p-4">ชื่อ</th><th className="p-4">สถานะ</th><th className="p-4">จัดการ</th></tr></thead>
                    <tbody>{users.map(u=>(<tr key={u.id} className="border-b dark:border-gray-700"><td className="p-4">{u.email}</td><td className="p-4">{u.first_name} {u.last_name}</td><td className="p-4 text-green-500">ปกติ</td><td className="p-4"><button onClick={()=>handleBanUser(u)} className="px-3 py-1 bg-red-100 text-red-600 rounded">แบน</button></td></tr>))}</tbody>
                </table>
             </div>
        )}

        {/* Tab 3: Books */}
        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between mb-4 flex-wrap gap-4">
                <div className="flex gap-2">
                    <button onClick={() => setShowBookModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><PlusCircle/> เพิ่มหนังสือ</button>
                    <button onClick={() => setShowCatModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><List/> หมวดหมู่</button>
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
                    <thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-4">รูป</th><th className="p-4">ชื่อ</th><th className="p-4">หมวดหมู่</th><th className="p-4">ราคา</th><th className="p-4">จัดการ</th></tr></thead>
                    <tbody>
                        {filteredBooks.map(b => (
                            <tr key={b.id} className="border-b dark:border-gray-700">
                                <td className="p-4"><img src={b.image} className="h-16 w-12 object-cover bg-gray-200"/></td>
                                <td className="p-4">{b.title}</td>
                                <td className="p-4">
                                    {/* ✅ แสดงชื่อหมวดหมู่ที่ JOIN มา */}
                                    <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-xs">
                                        {b.category_name || 'ไม่มีหมวดหมู่'}
                                    </span>
                                </td>
                                <td className="p-4 text-green-600">฿{b.price}</td>
                                <td className="p-4"><button onClick={() => handleDeleteBook(b.id)} className="text-red-500"><Trash2/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* Tab 4: Orders */}
        {activeTab === 'orders' && (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left"><thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-4">ID</th><th className="p-4">ลูกค้า</th><th className="p-4">ยอด</th><th className="p-4">สถานะ</th><th className="p-4">จัดการ</th></tr></thead><tbody>{orders.map(o=>(<tr key={o.id} className="border-b dark:border-gray-700"><td className="p-4">#{o.id}</td><td className="p-4">{o.first_name}</td><td className="p-4">฿{o.total_price}</td><td className="p-4">{o.status}</td><td className="p-4 flex gap-2"><button onClick={()=>handleUpdateStatus(o.id,'paid')} className="text-green-500">✔</button><button onClick={()=>handleUpdateStatus(o.id,'shipped')} className="text-blue-500">🚚</button></td></tr>))}</tbody></table>
             </div>
        )}

        {/* Modal: Categories */}
        {showCatModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-2xl">
                    <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">จัดการหมวดหมู่</h3><button onClick={() => setShowCatModal(false)}><X/></button></div>
                    <div className="flex gap-2 mb-4">
                        <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="ชื่อหมวดหมู่ใหม่" className="border p-2 rounded w-full dark:bg-gray-700" />
                        <button onClick={handleAddCategory} className="bg-green-600 text-white p-2 rounded"><PlusCircle/></button>
                    </div>
                    <ul className="max-h-60 overflow-y-auto pr-2 space-y-2">
                        {categories.map(c => (
                            <li key={c.id} className="flex justify-between p-2 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                                {c.name}
                                <div className="flex gap-1">
                                    <button onClick={() => handleEditCategory(c)} className="text-blue-500 p-1"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 p-1"><Trash2 size={16}/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}

        {/* Modal: Add Book */}
        {showBookModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-2xl">
                    <div className="flex justify-between mb-4"><h2 className="text-2xl font-bold">เพิ่มหนังสือใหม่</h2><button onClick={() => setShowBookModal(false)}><X/></button></div>
                    <form onSubmit={handleAddBook} className="space-y-4">
                        <input type="text" placeholder="ชื่อหนังสือ" required className="w-full p-2 border rounded dark:bg-gray-700" onChange={e => setNewBook({...newBook, title: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="ราคา" required className="p-2 border rounded dark:bg-gray-700" onChange={e => setNewBook({...newBook, price: e.target.value})} />
                            
                            {/* ✅ แก้ Select ให้เก็บ ID แทน Name */}
                            <select className="p-2 border rounded dark:bg-gray-700" 
                                onChange={e => setNewBook({...newBook, category_id: e.target.value})}
                                value={newBook.category_id}
                            >
                                <option value="">-- เลือกหมวดหมู่ --</option>
                                {/* value เป็น ID แต่โชว์ Name */}
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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