import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';

// ✅ แก้ไข: ใช้ URL ของ Render (ห้ามใช้ localhost)
const socket = io.connect("https://bookstore-backend-41ct.onrender.com");

const ChatSupport = ({ userId, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // เลื่อนลงล่างสุดอัตโนมัติเมื่อมีข้อความใหม่
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if(userId) {
        socket.emit('join_room', userId); // Join ห้องตัวเอง
    }
    
    // รับข้อความ
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
      setTimeout(scrollToBottom, 100);
    };

    socket.on('receive_message', handleReceiveMessage);

    // Cleanup function
    return () => {
        socket.off('receive_message', handleReceiveMessage);
    };
  }, [userId]);

  const sendMessage = async () => {
    if (input.trim() !== "") {
      const msgData = {
        sender_id: userId,
        message: input,
        is_admin: isAdmin,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await socket.emit('send_message', msgData);
      setMessages((prev) => [...prev, msgData]);
      setInput("");
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen ? (
        <button 
            onClick={() => setIsOpen(true)} 
            className="bg-blue-600 p-4 rounded-full text-white shadow-lg hover:bg-blue-700 transition transform hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle size={28} />
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 w-80 h-[28rem] rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <h3 className="font-bold">Live Support</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition"><X size={20} /></button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 scrollbar-thin">
            {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10 text-sm">
                    <p>สวัสดีครับ! 👋</p>
                    <p>มีอะไรให้ช่วยสอบถามได้เลยครับ</p>
                </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.is_admin === isAdmin ? "justify-end" : "justify-start"} mb-3`}>
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm break-words ${
                    msg.is_admin === isAdmin 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
                }`}>
                  <p>{msg.message}</p>
                  <p className={`text-[10px] mt-1 text-right ${msg.is_admin === isAdmin ? "text-blue-200" : "text-gray-400"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-white dark:bg-gray-800 dark:border-gray-700 flex gap-2 items-center">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border dark:border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition"
              placeholder="พิมพ์ข้อความ..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
                onClick={sendMessage} 
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition shadow-md"
            >
                <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSupport;