import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { User, Camera, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    id: '',
    prefix: 'นาย',
    first_name: '',
    last_name: '',
    email: '',
    profile_image: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ดึงข้อมูล User จาก LocalStorage หรือ API
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
        navigate('/login');
        return;
    }
    
    // ดึงข้อมูลล่าสุดจาก Server เสมอ
    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/profile/${storedUser.id}`);
            setUser(res.data);
        } catch (error) {
            console.error(error);
        }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // ฟังก์ชันแปลงไฟล์รูปเป็น Base64 String
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // เช็คขนาดเกิน 2MB
          return alert("ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, profile_image: reader.result }); // เก็บรูปเป็น String ยาวๆ
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/profile/update`, user);
      
      // อัปเดตข้อมูลในเครื่องด้วย
      localStorage.setItem('user', JSON.stringify(user));
      
      alert('บันทึกข้อมูลสำเร็จ!');
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-blue-600 h-32 relative">
                <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-white flex items-center gap-1 hover:underline">
                    <ArrowLeft size={20} /> กลับหน้าหลัก
                </button>
            </div>
            
            <div className="px-8 pb-8">
                {/* Profile Image Section */}
                <div className="relative -mt-16 mb-6 flex justify-center">
                    <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 overflow-hidden shadow-lg group">
                        {user.profile_image ? (
                            <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <User size={64} />
                            </div>
                        )}
                        
                        {/* Overlay Upload Button */}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
                            <Camera size={24} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold dark:text-white">{user.first_name} {user.last_name}</h1>
                    <p className="text-gray-500">{user.email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">คำนำหน้า</label>
                            <select name="prefix" value={user.prefix || 'นาย'} onChange={handleChange} className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="นาย">นาย</option>
                                <option value="นาง">นาง</option>
                                <option value="นางสาว">นางสาว</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อ - นามสกุล</label>
                             <div className="flex gap-2">
                                <input type="text" name="first_name" value={user.first_name || ''} onChange={handleChange} className="w-1/2 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="ชื่อจริง" />
                                <input type="text" name="last_name" value={user.last_name || ''} onChange={handleChange} className="w-1/2 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="นามสกุล" />
                             </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">อีเมล (เปลี่ยนไม่ได้)</label>
                        <input type="email" value={user.email} disabled className="w-full p-3 rounded-lg border bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transition transform active:scale-95">
                        {loading ? 'กำลังบันทึก...' : <><Save size={20} /> บันทึกการเปลี่ยนแปลง</>}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;