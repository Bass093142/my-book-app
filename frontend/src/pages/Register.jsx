import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, ShieldQuestion, Camera } from 'lucide-react';

// 👇 Link ของ Render
const API_BASE_URL = "https://bookstore-backend-41ct.onrender.com";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prefix: 'นาย',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    security_question: '',
    security_answer: '',
    profile_image: '' // ✅ เพิ่มตัวแปรเก็บรูป
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ ฟังก์ชันแปลงไฟล์รูปเป็นตัวหนังสือ (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("รูปภาพต้องขนาดไม่เกิน 2MB"); // แจ้งเตือนถ้าไฟล์ใหญ่เกิน Frontend รับไหว
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert("รหัสผ่านไม่ตรงกัน");
    }

    try {
      await axios.post(`${API_BASE_URL}/api/register`, formData);
      alert('สมัครสมาชิกสำเร็จ!');
      navigate('/login');
    } catch (error) {
      console.error("Register Error:", error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Server');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">สร้างบัญชีใหม่</h2>
          <p className="text-gray-500 dark:text-gray-400">กรอกข้อมูลเพื่อเริ่มต้นใช้งาน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ✅ ส่วนอัปโหลดรูป (ไม่บังคับ) */}
          <div className="flex justify-center mb-4">
            <div className="relative w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center group">
              {formData.profile_image ? (
                <img src={formData.profile_image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="text-gray-400" size={32} />
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 -mt-3 mb-4">(เลือกรูปโปรไฟล์ - ไม่บังคับ)</p>

          {/* ข้อมูลส่วนตัว */}
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">คำนำหน้า</label>
              <select name="prefix" className="w-full p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={handleChange}>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
            </div>
            <div className="col-span-3">
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อ - นามสกุล</label>
               <div className="flex gap-2">
                 <input type="text" name="first_name" placeholder="ชื่อจริง" required className="w-1/2 p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={handleChange} />
                 <input type="text" name="last_name" placeholder="นามสกุล" required className="w-1/2 p-2.5 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" onChange={handleChange} />
               </div>
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input type="email" name="email" placeholder="อีเมล" required
              className="w-full pl-10 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input type="password" name="password" placeholder="รหัสผ่าน" required
                className="w-full pl-10 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input type="password" name="confirmPassword" placeholder="ยืนยันรหัส" required
                className="w-full pl-10 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange} />
            </div>
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">เพศ</label>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                    <input type="radio" name="gender" value="male" defaultChecked onChange={handleChange} /> ชาย
                </label>
                <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                    <input type="radio" name="gender" value="female" onChange={handleChange} /> หญิง
                </label>
                <label className="flex items-center gap-2 cursor-pointer dark:text-white">
                    <input type="radio" name="gender" value="other" onChange={handleChange} /> อื่นๆ
                </label>
            </div>
          </div>

          <div className="pt-2 border-t dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">คำถามความปลอดภัย</label>
            <div className="relative mb-3">
              <ShieldQuestion className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input type="text" name="security_question" placeholder="เช่น สัตว์เลี้ยงตัวแรกชื่ออะไร?" required
                className="w-full pl-10 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onChange={handleChange} />
            </div>
            <input type="text" name="security_answer" placeholder="คำตอบของคุณ" required
              className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onChange={handleChange} />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-500/40 flex justify-center items-center gap-2">
            <UserPlus size={20} /> สมัครสมาชิก
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-blue-600 hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;