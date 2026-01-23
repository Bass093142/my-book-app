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
    if (!user) return Swal.fire('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ', 'warning');

    const result = await Swal.fire({
        title: 'ยืนยันการสั่งซื้อ?',
        text: `ยอดรวม ฿${total.toLocaleString()}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
        try {
            await axios.post(`${API_BASE_URL}/api/orders`, {
                user_id: user.id,
                items: cart,
                total_price: total
            });
            Swal.fire('สำเร็จ!', 'สั่งซื้อเรียบร้อย', 'success');
            clearCart();
            navigate('/');
        } catch (error) { Swal.fire('Error', 'สั่งซื้อไม่สำเร็จ', 'error'); }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 dark:text-white flex items-center gap-2"><ShoppingBag /> ตะกร้าสินค้า</h1>
        {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-20">ตะกร้าว่างเปล่า</div>
        ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden">
                                {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="text-xs text-center pt-8">No Pic</div>}
                            </div>
                            <div>
                                <h3 className="font-bold dark:text-white">{item.title}</h3>
                                <p className="text-gray-500">฿{item.price} x {item.quantity}</p>
                            </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500"><Trash2 /></button>
                    </div>
                ))}
                <div className="p-6 flex justify-between items-center bg-gray-50 dark:bg-gray-700">
                    <span className="text-xl font-bold dark:text-white">รวม: ฿{total.toLocaleString()}</span>
                    <button onClick={handleCheckout} className="bg-green-600 text-white px-6 py-2 rounded-lg">สั่งซื้อ</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
export default Cart;