import React from 'react';
import Navbar from '../components/Navbar';
import { Search, ShoppingCart } from 'lucide-react';

const Home = () => {
  // Mock Data หนังสือ (เดี๋ยวเราค่อยดึงจาก API)
  const books = [
    { id: 1, title: 'React ขั้นเทพ', price: 350, img: 'https://via.placeholder.com/150', category: 'Technology' },
    { id: 2, title: 'Node.js 101', price: 290, img: 'https://via.placeholder.com/150', category: 'Technology' },
    { id: 3, title: 'การ์ตูนผจญภัย', price: 120, img: 'https://via.placeholder.com/150', category: 'Cartoon' },
    { id: 4, title: 'ประวัติศาสตร์ไทย', price: 450, img: 'https://via.placeholder.com/150', category: 'History' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar />

      {/* Hero Section (แบนเนอร์) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">คลังหนังสือออนไลน์ที่ใหญ่ที่สุด</h1>
        <p className="text-lg md:text-xl mb-8 opacity-90">ค้นหาหนังสือที่คุณรัก เรียนรู้สิ่งใหม่ๆ ได้ทุกวัน</p>
        
        <div className="max-w-xl mx-auto relative">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง..." 
            className="w-full p-4 pl-6 rounded-full text-gray-800 focus:outline-none shadow-lg"
          />
          <button className="absolute right-2 top-2 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition">
            <Search size={24} />
          </button>
        </div>
      </div>

      {/* Book List Section (รายการหนังสือ) */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-blue-600 pl-4">
          หนังสือแนะนำ
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 group">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                 {/* แทนที่ด้วยรูปจริง */}
                 <span className="text-gray-400">รูปปกหนังสือ</span>
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold text-blue-500 uppercase">{book.category}</span>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1 group-hover:text-blue-600 transition">{book.title}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-green-600">฿{book.price}</span>
                  <button className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-600 hover:text-white transition">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;