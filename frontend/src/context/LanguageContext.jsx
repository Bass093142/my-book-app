import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('th'); // default ภาษาไทย

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'th' ? 'en' : 'th'));
  };

  // 📖 พจนานุกรมคำศัพท์ (อยากเพิ่มคำไหน ใส่ตรงนี้เลย)
  const translations = {
    th: {
      home: "หน้าแรก",
      cart: "ตะกร้า",
      login: "เข้าสู่ระบบ",
      logout: "ออกจากระบบ",
      admin: "จัดการระบบ",
      search_placeholder: "ค้นหาหนังสือ...",
      recommend: "หนังสือแนะนำ",
      no_book: "ไม่พบหนังสือ",
      price: "ราคา",
      add_cart: "ใส่ตะกร้า",
      chat_title: "แจ้งปัญหา / ติดต่อแอดมิน",
      type_msg: "พิมพ์ข้อความ...",
      send: "ส่ง",
      login_first: "กรุณาเข้าสู่ระบบก่อนแชท"
    },
    en: {
      home: "Home",
      cart: "Cart",
      login: "Login",
      logout: "Logout",
      admin: "Admin Dashboard",
      search_placeholder: "Search books...",
      recommend: "Recommended Books",
      no_book: "No books found",
      price: "Price",
      add_cart: "Add to Cart",
      chat_title: "Support / Contact Admin",
      type_msg: "Type a message...",
      send: "Send",
      login_first: "Please login to chat"
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);