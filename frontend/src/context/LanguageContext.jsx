import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('th'); // เริ่มต้นภาษาไทย

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'th' ? 'en' : 'th'));
  };

  // คำศัพท์
  const translations = {
    th: {
      home: "หน้าแรก",
      cart: "ตะกร้าสินค้า",
      login: "เข้าสู่ระบบ",
      logout: "ออกจากระบบ",
      admin: "จัดการระบบ",
      no_book: "ไม่พบหนังสือ",
      add_to_cart: "เพิ่มลงตะกร้า",
      search_placeholder: "ค้นหาหนังสือ...",
      recommend: "หนังสือแนะนำ"
    },
    en: {
      home: "Home",
      cart: "My Cart",
      login: "Login",
      logout: "Logout",
      admin: "Admin Dashboard",
      no_book: "No books found",
      add_to_cart: "Add to Cart",
      search_placeholder: "Search books...",
      recommend: "Recommended Books"
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook สำหรับเรียกใช้
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        // คืนค่า default เพื่อกัน Error หน้าขาว ถ้าลืมครอบ Provider
        return { 
            language: 'th', 
            toggleLanguage: () => {}, 
            t: { home: 'หน้าแรก', cart: 'ตะกร้า', login: 'เข้าสู่ระบบ', logout: 'ออก', admin: 'แอดมิน' } 
        };
    }
    return context;
};