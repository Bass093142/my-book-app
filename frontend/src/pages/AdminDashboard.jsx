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

  // ✅ [เพิ่มใหม่] State เช็คว่ากำลัง "แก้ไข" หรือ "เพิ่มใหม่"
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);

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
    } catch (error) { console.error("Error fetching data:", error); } 
    finally { setLoading(false); }
  };

  // --- Handlers Books ---
  
  // 1. กดปุ่ม "เพิ่มหนังสือ" (Reset Form)
  const openAddBookModal = () => {
      setIsEditingBook(false);
      setNewBook({ title: '', price: '', category_id: '', description: '', image: '', stock: 10 });
      setShowBookModal(true);
  };

  // 2. กดปุ่ม "แก้ไข" (Load Data to Form)
  const openEditBookModal = (book) => {
      setIsEditingBook(true);
      setCurrentBookId(book.id);
      setNewBook({
          title: book.title,
          price: book.price,
          category_id: book.category_id || '',
          description: book.description || '',
          image: book.image, // รูปเดิม
          stock: book.stock
      });
      setShowBookModal(true);
  };

  // 3. บันทึก (แยกเคส เพิ่ม vs แก้ไข)
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
        if (!newBook.category_id) return Swal.fire('แจ้งเตือน', 'กรุณาเลือกหมวดหมู่', 'warning');

        if (isEditingBook) {
            // โหมดแก้ไข
            await axios.put(`${API_BASE_URL}/api/books/${currentBookId}`, newBook);
            Swal.fire('สำเร็จ', 'แก้ไขข้อมูล/เติมสต๊อก เรียบร้อย', 'success');
        } else {
            // โหมดเพิ่มใหม่
            await axios.post(`${API_BASE_URL}/api/books`, newBook);
            Swal.fire('สำเร็จ', 'เพิ่มหนังสือเรียบร้อย', 'success');
        }

        setShowBookModal(false);
        fetchData();
    } catch (error) { Swal.fire('Error', 'บันทึกไม่สำเร็จ', 'error'); }
  };

  const handleDeleteBook = async (id) => {
    Swal.fire({
        title: 'ยืนยันการลบ?', text: "ข้อมูลหนังสือจะหายไปถาวร!", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'ลบเลย'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try { await axios.delete(`${API_BASE_URL}/api/books/${id}`); fetchData(); Swal.fire('Deleted!', 'ลบเรียบร้อย', 'success'); } 
            catch (err) { Swal.fire('Error', 'ลบไม่สำเร็จ', 'error'); }
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

  // --- Categories & Users & Orders (เหมือนเดิม) ---
  const handleAddCategory = async () => { /* ... */ if(!newCategory) return; try{ await axios.post(`${API_BASE_URL}/api/categories`, {name:newCategory}); Swal.fire('Success','','success'); setNewCategory(''); fetchData(); }catch(e){Swal.fire('Error','','error');} };
  const handleEditCategory = async (cat) => { const {value:n}=await Swal.fire({title:'แก้ไขหมวด',input:'text',inputValue:cat.name,showCancelButton:true}); if(n){ try{await axios.put(`${API_BASE_URL}/api/categories/${cat.id}`,{name:n}); fetchData(); Swal.fire('Success','','success');}catch(e){} } };
  const handleDeleteCategory = async (id) => { Swal.fire({title:'ยืนยันลบ?',showCancelButton:true,confirmButtonColor:'#d33'}).then(async r=>{if(r.isConfirmed){try{await axios.delete(`${API_BASE_URL}/api/categories/${id}`);fetchData();Swal.fire('Deleted','','success');}catch(e){Swal.fire('Error',e.response?.data?.message,'error');}}}); };
  const handleBanUser = async (user) => { /* ... */ const newStatus=!user.is_banned; if(newStatus){const {value:r}=await Swal.fire({title:'เหตุผล',input:'text',showCancelButton:true}); if(r) await axios.post(`${API_BASE_URL}/api/admin/ban`,{id:user.id,is_banned:true,ban_reason:r});}else{await axios.post(`${API_BASE_URL}/api/admin/ban`,{id:user.id,is_banned:false});} fetchData(); };
  const handleUpdateStatus = async (id, status) => { try{await axios.put(`${API_BASE_URL}/api/admin/orders/${id}`,{status});fetchData();Swal.fire({icon:'success',title:'Updated',timer:1000,showConfirmButton:false});}catch(e){} };
  const handleDeleteOrder = async (id) => { const {value:r}=await Swal.fire({title:'ลบออเดอร์?',text:'ระบุเหตุผล',input:'text',showCancelButton:true,confirmButtonColor:'#d33'}); if(r){ try{await axios.delete(`${API_BASE_URL}/api/orders/${id}`,{data:{reason:r}});fetchData();Swal.fire('ลบแล้ว','','success');}catch(e){Swal.fire('Error','','error');} } };

  // Filter Logic
  const filteredBooks = books.filter(b => {
      const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
      const catName = b.category_name || 'Uncategorized';
      return matchSearch && (filterCategory === 'All' || catName === filterCategory);
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

        {activeTab === 'overview' && (
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-blue-500"><p>ยอดขาย</p><p className="text-3xl font-bold">฿{stats.sales.toLocaleString()}</p></div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-green-500"><p>ออเดอร์</p><p className="text-3xl font-bold">{stats.orders}</p></div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-purple-500"><p>หนังสือ</p><p className="text-3xl font-bold">{stats.books}</p></div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-l-4 border-yellow-500"><p>สมาชิก</p><p className="text-3xl font-bold">{stats.users}</p></div>
             </div>
        )}

        {activeTab === 'users' && (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-4">Email</th><th className="p-4">ชื่อ</th><th className="p-4">สถานะ</th><th className="p-4">จัดการ</th></tr></thead>
                    <tbody>{users.map(u=>(<tr key={u.id} className="border-b dark:border-gray-700"><td className="p-4">{u.email}</td><td className="p-4">{u.first_name}</td><td className="p-4">{u.is_banned?'ถูกแบน':'ปกติ'}</td><td className="p-4"><button onClick={()=>handleBanUser(u)} className="text-red-500">จัดการ</button></td></tr>))}</tbody>
                </table>
             </div>
        )}

        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between mb-4 flex-wrap gap-4">
                <div className="flex gap-2">
                    {/* ✅ เปลี่ยนปุ่มเป็นเรียก openAddBookModal */}
                    <button onClick={openAddBookModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><PlusCircle/> เพิ่มหนังสือ</button>
                    <button onClick={() => setShowCatModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><List/> หมวดหมู่</button>
                </div>
                <div className="flex gap-2">
                    <select className="p-2 border rounded dark:bg-gray-700" onChange={e => setFilterCategory(e.target.value)}><option value="All">ทุกหมวดหมู่</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
                    <input type="text" placeholder="ค้นหา..." className="p-2 border rounded dark:bg-gray-700" onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="p-4">รูป</th>
                            <th className="p-4">ชื่อ</th>
                            <th className="p-4">หมวดหมู่</th>
                            <th className="p-4">ราคา</th>
                            <th className="p-4">คงเหลือ</th> {/* ✅ เพิ่มคอลัมน์ Stock */}
                            <th className="p-4">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.map(b => (
                            <tr key={b.id} className="border-b dark:border-gray-700">
                                <td className="p-4"><img src={b.image} className="h-16 w-12 object-cover bg-gray-200"/></td>
                                <td className="p-4">{b.title}</td>
                                <td className="p-4"><span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded text-xs">{b.category_name || 'ไม่มีหมวดหมู่'}</span></td>
                                <td className="p-4 text-green-600">฿{b.price}</td>
                                {/* ✅ แสดงจำนวนสต๊อก (ถ้าเหลือน้อยให้เป็นสีแดง) */}
                                <td className={`p-4 font-bold ${b.stock < 5 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {b.stock} เล่ม
                                </td>
                                <td className="p-4 flex gap-2">
                                    {/* ✅ ปุ่มแก้ไข */}
                                    <button onClick={() => openEditBookModal(b)} className="text-blue-500 hover:bg-blue-100 p-2 rounded"><Edit size={20}/></button>
                                    <button onClick={() => handleDeleteBook(b.id)} className="text-red-500 hover:bg-red-100 p-2 rounded"><Trash2 size={20}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* Orders Tab (เหมือนเดิม) */}
        {activeTab === 'orders' && ( <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-4">ID</th><th className="p-4">ลูกค้า</th><th className="p-4">ยอด</th><th className="p-4">สถานะ</th><th className="p-4">จัดการ</th></tr></thead><tbody>{orders.map(o=>(<tr key={o.id} className="border-b dark:border-gray-700"><td className="p-4">#{o.id}</td><td className="p-4">{o.first_name}<br/><span className="text-xs text-gray-500">{o.email}</span></td><td className="p-4">฿{o.total_price}</td><td className="p-4">{o.status}</td><td className="p-4 flex gap-2"><button onClick={()=>handleUpdateStatus(o.id,'paid')} className="text-green-500">✔</button><button onClick={()=>handleUpdateStatus(o.id,'shipped')} className="text-blue-500">🚚</button><button onClick={()=>handleDeleteOrder(o.id)} className="text-red-500">❌</button></td></tr>))}</tbody></table></div> )}
        
        {/* Categories Modal (เหมือนเดิม) */}
        {showCatModal && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96"><div className="flex justify-between mb-4"><h3>จัดการหมวดหมู่</h3><button onClick={()=>setShowCatModal(false)}><X/></button></div><div className="flex gap-2 mb-4"><input value={newCategory} onChange={e=>setNewCategory(e.target.value)} className="border p-2 w-full dark:bg-gray-700"/><button onClick={handleAddCategory} className="bg-green-600 text-white p-2">+</button></div><ul className="max-h-60 overflow-y-auto">{categories.map(c=><li key={c.id} className="flex justify-between p-2 border-b">{c.name}<div><button onClick={()=>handleEditCategory(c)} className="text-blue-500 mr-2">✏️</button><button onClick={()=>handleDeleteCategory(c.id)} className="text-red-500">🗑️</button></div></li>)}</ul></div></div>)}

        {/* ✅ Book Modal (รองรับทั้งเพิ่มและแก้ไข) */}
        {showBookModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-2xl border dark:border-gray-700">
                    <div className="flex justify-between mb-4">
                        <h2 className="text-2xl font-bold">{isEditingBook ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือใหม่'}</h2>
                        <button onClick={() => setShowBookModal(false)}><X size={24}/></button>
                    </div>
                    
                    <form onSubmit={handleSaveBook} className="space-y-4">
                        <div>
                            <label className="text-sm font-bold">ชื่อหนังสือ</label>
                            <input type="text" required value={newBook.title} className="w-full p-2 border rounded dark:bg-gray-700 mt-1" 
                                onChange={e => setNewBook({...newBook, title: e.target.value})} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold">ราคา (บาท)</label>
                                <input type="number" required value={newBook.price} className="w-full p-2 border rounded dark:bg-gray-700 mt-1" 
                                    onChange={e => setNewBook({...newBook, price: e.target.value})} />
                            </div>
                            <div>
                                {/* ✅ ช่องสต๊อกสินค้า */}
                                <label className="text-sm font-bold">จำนวนสต๊อก (เล่ม)</label>
                                <input type="number" required value={newBook.stock} className="w-full p-2 border rounded dark:bg-gray-700 mt-1" 
                                    onChange={e => setNewBook({...newBook, stock: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold">หมวดหมู่</label>
                            <select className="w-full p-2 border rounded dark:bg-gray-700 mt-1" 
                                onChange={e => setNewBook({...newBook, category_id: e.target.value})}
                                value={newBook.category_id}
                            >
                                <option value="">-- เลือกหมวดหมู่ --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-bold">รูปภาพปก</label>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 mt-1"/>
                        </div>
                        {newBook.image && <img src={newBook.image} alt="Preview" className="h-32 rounded mx-auto border shadow-sm" />}
                        
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg">
                            {isEditingBook ? 'บันทึกการแก้ไข' : 'บันทึกหนังสือ'}
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