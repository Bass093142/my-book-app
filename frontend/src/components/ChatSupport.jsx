import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { MessageCircle, X } from 'lucide-react';

const socket = io.connect("http://localhost:3000"); // เชื่อม Backend

const ChatSupport = ({ userId, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if(userId) socket.emit('join_room', userId); // Join ห้องตัวเอง
    
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });
  }, [userId]);

  const sendMessage = () => {
    if (input !== "") {
      const msgData = {
        sender_id: userId,
        message: input,
        is_admin: isAdmin,
        time: new Date().getHours() + ":" + new Date().getMinutes(),
      };
      socket.emit('send_message', msgData);
      setMessages((prev) => [...prev, msgData]);
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="bg-blue-600 p-4 rounded-full text-white shadow-lg hover:bg-blue-700 transition">
          <MessageCircle size={28} />
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 w-80 h-96 rounded-xl shadow-2xl flex flex-col border dark:border-gray-700">
          <div className="bg-blue-600 p-3 rounded-t-xl text-white flex justify-between items-center">
            <h3 className="font-bold">Live Support</h3>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.is_admin === isAdmin ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`p-2 rounded-lg max-w-[80%] text-sm ${msg.is_admin === isAdmin ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t dark:border-gray-700 flex gap-2">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
              placeholder="พิมพ์ข้อความ..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="bg-blue-600 text-white px-3 rounded text-sm">ส่ง</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSupport;