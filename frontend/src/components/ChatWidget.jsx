import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

// 👇 ใส่ Link Backend ของคุณให้ถูกต้อง
const socket = io.connect("https://bookstore-backend-41ct.onrender.com");

const ChatWidget = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [user, setUser] = useState(null);
  const bottomRef = useRef(null);

  // ⚠️ สำคัญ: ID ของคนที่เป็น Admin (ไปดูใน Database ว่า Admin ID อะไร แล้วแก้เลขนี้)
  const ADMIN_ID = 3; 

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
        setUser(storedUser);
        socket.emit("join_room", storedUser.id);
        fetchOldChat(storedUser.id);
    }

    // ฟังข้อความเข้าแบบ Real-time
    socket.on("receive_message", (data) => {
        setChatHistory((prev) => [...prev, data]);
        scrollToBottom();
    });

    return () => socket.off("receive_message");
  }, []);

  const fetchOldChat = async (userId) => {
      try {
          const res = await axios.get(`https://bookstore-backend-41ct.onrender.com/api/chat/${userId}`);
          setChatHistory(res.data);
          scrollToBottom();
      } catch (err) {
          console.error(err);
      }
  };

  const scrollToBottom = () => {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = async () => {
    if (!user) return alert(t.login_first || "Please login first");
    if (message.trim() === "") return;

    const msgData = {
      sender_id: user.id,
      receiver_id: ADMIN_ID, // ส่งหาแอดมิน
      message: message,
      created_at: new Date().toISOString()
    };

    // ส่งผ่าน Socket (Server จะบันทึก DB ให้เอง)
    await socket.emit("send_message", msgData);
    setMessage("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* หน้าต่างแชท */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 w-80 h-96 rounded-2xl shadow-2xl mb-4 flex flex-col overflow-hidden border dark:border-gray-700">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <h3 className="font-bold flex items-center gap-2">
                <MessageCircle size={20}/> {t.chat_title || "Chat Support"}
            </h3>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {user ? (
                chatHistory.map((msg, index) => {
                    const isMe = msg.sender_id === user.id;
                    return (
                        <div key={index} className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-2 rounded-lg text-sm ${isMe ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 dark:text-white rounded-bl-none'}`}>
                                {msg.message}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="text-center text-gray-500 mt-10">
                    {t.login_first || "กรุณาเข้าสู่ระบบก่อนแชท"}
                </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
            <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t.type_msg || "พิมพ์ข้อความ..."}
                disabled={!user}
                className="flex-1 p-2 border rounded-full text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={sendMessage} disabled={!user} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50">
                <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ปุ่มเปิดแชท (Floating Button) */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110 flex items-center justify-center"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatWidget;