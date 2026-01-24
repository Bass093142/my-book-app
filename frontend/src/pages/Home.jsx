import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Search, ShoppingCart, Image as ImageIcon, Package, X } from 'lucide-react'; // ✅ เพิ่ม icon Package
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2'; 

const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
  // ✅ [เพิ่มใหม่] State สำหรับติดตามออเดอร์
  const [myOrders, setMyOrders] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/books`);
        setBooks(res.data);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleAddToCart = (book) => {
    addToCart(book);
    Swal.fire({
      icon: 'success',
      title: 'เพิ่มลงตะกร้าแล้ว',
      text: `${book.title} อยู่ในตะกร้าของคุณ`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });
  };

  // ✅ [เพิ่มใหม่] ฟังก์ชันกดดูคำสั่งซื้อ
  const handleCheckStatus = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if(!user) return Swal.fire('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนครับ', 'warning');

      try {
          const res = await axios.get(`${API_BASE_URL}/api/orders/user/${user.id}`);
          setMyOrders(res.data);
          setShowOrderModal(true);
      } catch (error) {
          Swal.fire('Error', 'ไม่สามารถดึงข้อมูลได้', 'error');
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 text-center shadow-lg relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">คลังหนังสือออนไลน์</h1>
        <div className="max-w-xl mx-auto relative mt-8">
          <input type="text" placeholder="ค้นหาชื่อหนังสือ..." className="w-full p-4 pl-6 rounded-full text-gray-800 focus:outline-none shadow-lg" />
          <button className="absolute right-2 top-2 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition"><Search size={24} /></button>
        </div>
        
        {/* ✅ [เพิ่มใหม่] ปุ่มติดตามคำสั่งซื้อ */}
        <button onClick={handleCheckStatus} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm transition border border-white/30">
            <Package size={20} /> ติดตามคำสั่งซื้อ
        </button>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 border-l-8 border-blue-600 pl-4">หนังสือแนะนำ</h2>

        {loading ? (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{[1,2,3,4].map(i => (<div key={i} className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>))}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 group flex flex-col h-full border dark:border-gray-700">
                <div className="h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                  {book.image ? (
                    <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><ImageIcon size={48} /><span className="text-sm mt-2">ไม่มีรูปปก</span></div>
                  )}
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">{book.category || 'General'}</span>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1 group-hover:text-blue-600 line-clamp-2" title={book.title}>{book.title}</h3>
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600">฿{book.price}</span>
                    <button onClick={() => handleAddToCart(book)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition shadow-sm">
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ [เพิ่มใหม่] Modal แสดงรายการคำสั่งซื้อ */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in px-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl shadow-2xl border dark:border-gray-700 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Package className="text-blue-500"/> รายการคำสั่งซื้อของฉัน</h2>
                    <button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-red-500"><X size={24}/></button>
                </div>
                
                <div className="overflow-y-auto flex-grow">
                    {myOrders.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">ยังไม่มีคำสั่งซื้อ</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="p-3">Order ID</th>
                                    <th className="p-3">วันที่</th>
                                    <th className="p-3">ยอดรวม</th>
                                    <th className="p-3">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myOrders.map(o => (
                                    <tr key={o.id} className="border-b dark:border-gray-700">
                                        <td className="p-3 font-bold text-blue-600">#{o.id}</td>
                                        <td className="p-3 text-sm">{new Date(o.created_at).toLocaleDateString('th-TH')}</td>
                                        <td className="p-3 font-bold">฿{o.total_price.toLocaleString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                o.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                o.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {o.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Home;