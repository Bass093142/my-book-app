import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ดึงข้อมูลตะกร้าจาก LocalStorage ถ้ามี
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // บันทึกลง LocalStorage ทุกครั้งที่ตะกร้าเปลี่ยน
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // เพิ่มสินค้าลงตะกร้า
  const addToCart = (book) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === book.id);
      if (existingItem) {
        // ถ้ามีอยู่แล้ว ให้เพิ่มจำนวน
        return prevCart.map((item) =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // ถ้ายังไม่มี ให้เพิ่มใหม่
      return [...prevCart, { ...book, quantity: 1 }];
    });
  };

  // ลบสินค้าออกจากตะกร้า
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ล้างตะกร้า
  const clearCart = () => setCart([]);

  // คำนวณราคารวม
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);