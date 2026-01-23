import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Search, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Swal from 'sweetalert2'; 

const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { t } = useLanguage ? useLanguage() : { t: { no_book: 'ไม่พบหนังสือ' } }; 

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

  const addToCart = (book) => {
    // ✅ แจ้งเตือนสวยๆ
    Swal.fire({
      icon: 'success',
      title: 'เพิ่มลงตะกร้าแล้ว!',
      text: `${book.title} ถูกเพิ่มเรียบร้อย`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 text-center shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">คลังหนังสือออนไลน์</h1>
        <div className="max-w-xl mx-auto relative mt-8">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อหนังสือ..." 
            className="w-full p-4 pl-6 rounded-full text-gray-800 focus:outline-none shadow-lg"
          />
          <button className="absolute right-2 top-2 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 transition">
            <Search size={24} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 border-l-8 border-blue-600 pl-4">
          หนังสือแนะนำ
        </h2>

        {loading ? (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[1,2,3,4].map(i => (
               <div key={i} className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 group flex flex-col h-full border dark:border-gray-700">
                
                <div className="h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden relative">
                  {book.image ? (
                    <img 
                      src={book.image} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={48} />
                      <span className="text-sm mt-2">ไม่มีรูปปก</span>
                    </div>
                  )}
                  
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                    {book.category || 'General'}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mt-1 group-hover:text-blue-600 line-clamp-2" title={book.title}>
                    {book.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600">฿{book.price}</span>
                    <button onClick={() => addToCart(book)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-600 hover:text-white transition shadow-sm">
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && books.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                <p>ไม่พบหนังสือในระบบ</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;