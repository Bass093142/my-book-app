import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Search, ShoppingCart } from 'lucide-react';

// 👇 ใช้ Link ของ Render
const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ดึงข้อมูลหนังสือจาก Render Backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/books`);
        setBooks(res.data);
      } catch (error) {
        console.error("Error fetching books:", error);
        // ถ้าดึงไม่ได้ ให้ใช้ Mock Data สำรองกันหน้าขาว
        setBooks([
           { id: 1, title: 'Mock: React Guide', price: 350, category: 'Tech' },
           { id: 2, title: 'Mock: Node.js', price: 290, category: 'Tech' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar />

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">คลังหนังสือออนไลน์</h1>
        <div className="max-w-xl mx-auto relative mt-8">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อหนังสือ..." 
            className="w-full p-4 pl-6 rounded-full text-gray-800 focus:outline-none shadow-lg"
          />
          <button className="absolute right-2 top-2 bg-blue-600 p-2 rounded-full text-white">
            <Search size={24} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-blue-600 pl-4">
          หนังสือแนะนำ
        </h2>

        {loading ? (
           <p className="text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูลหนังสือ...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1 group">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">รูปปก</span>
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-blue-500 uppercase">{book.category}</span>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1 group-hover:text-blue-600 truncate">{book.title}</h3>
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
        )}
      </div>
    </div>
  );
};

export default Home;