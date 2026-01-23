import React from 'react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const Cart = () => {
  const { cart, removeFromCart, clearCart, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return Swal.fire('กรุณาเข้าสู่ระบบ', 'ต้องล็อกอินก่อนสั่งซื้อครับ', 'warning');

    // ยืนยันการสั่งซื้อ
    const result = await Swal.fire({
        title: 'ยืนยันการสั่งซื้อ?',
        text: `ยอดรวมทั้งหมด ฿${total.toLocaleString()} (ระบบจะส่งออเดอร์ไปยังแอดมิน)`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยืนยันการสั่งซื้อ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        try {
            // ส่งข้อมูลไป Backend
            await axios.post(`${API_BASE_URL}/api/orders`, {
                user_id: user.id,
                items: cart,
                total_price: total
            });
            
            Swal.fire('สั่งซื้อสำเร็จ!', 'แอดมินได้รับออเดอร์แล้ว', 'success');
            clearCart(); // ล้างตะกร้า
            navigate('/'); // กลับหน้าแรก
        } catch (error) {
            Swal.fire('เกิดข้อผิดพลาด', 'สั่งซื้อไม่สำเร็จ โปรดลองใหม่', 'error');
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white flex items-center gap-2">
            <ShoppingBag /> ตะกร้าสินค้าของคุณ
        </h1>

        {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-20 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-xl">ไม่มีสินค้าในตะกร้า</p>
                <a href="/" className="text-blue-500 hover:underline mt-4 inline-block">กลับไปเลือกซื้อสินค้า</a>
            </div>
        ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <div className="flex items-center gap-4">
                            {/* รูปสินค้า */}
                            <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                {item.image ? (
                                    <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold dark:text-white text-lg line-clamp-1">{item.title}</h3>
                                <p className="text-gray-500">ราคา: <span className="text-green-600 font-bold">฿{item.price}</span> | จำนวน: {item.quantity}</p>
                            </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-full transition">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
                
                <div className="p-6 bg-gray-50 dark:bg-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-2xl font-bold dark:text-white">รวมทั้งสิ้น: <span className="text-green-600">฿{total.toLocaleString()}</span></span>
                    <button onClick={handleCheckout} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition transform hover:scale-105 w-full md:w-auto">
                        สั่งซื้อสินค้า
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Cart;