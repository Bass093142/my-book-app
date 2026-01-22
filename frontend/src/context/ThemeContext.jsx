import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. สร้าง Context
const ThemeContext = createContext();

// 2. สร้าง Provider
export const ThemeProvider = ({ children }) => {
  // ตรวจสอบค่าธีมเดิมจาก LocalStorage ถ้าไม่มีให้เป็น 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // ถ้าเป็น dark ให้เพิ่ม class 'dark' ที่ <html> เพื่อให้ Tailwind ทำงาน
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // บันทึกค่าลง LocalStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. ✅ สร้าง Hook สำหรับดึงค่าไปใช้ (นี่คือส่วนที่ขาดหายไปจนเกิด Error)
export const useTheme = () => {
  return useContext(ThemeContext);
};

export default ThemeContext;