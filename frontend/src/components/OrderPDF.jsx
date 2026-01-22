import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Download } from 'lucide-react';

const OrderPDF = ({ orderData }) => {
  const contentRef = useRef();

  const generatePDF = () => {
    const element = contentRef.current;
    const opt = {
      margin: 0.5,
      filename: `Order-${orderData.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <>
      <button onClick={generatePDF} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
        <Download size={18} /> ดาวน์โหลดใบเสร็จ (PDF)
      </button>

      {/* ส่วนที่ซ่อนไว้สำหรับ Gen PDF โดยเฉพาะ (ใช้ฟอนต์ Sarabun) */}
      <div className="hidden">
        <div ref={contentRef} className="p-8 bg-white text-black font-sans">
          <h1 className="text-2xl font-bold mb-4 text-center">ใบเสร็จรับเงิน / Receipt</h1>
          <div className="mb-6">
            <p><strong>Order ID:</strong> {orderData.id}</p>
            <p><strong>Customer:</strong> {orderData.customerName}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString('th-TH')}</p>
          </div>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">รายการ</th>
                <th className="border p-2 text-right">ราคา</th>
              </tr>
            </thead>
            <tbody>
              {orderData.items.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2 text-right">{item.price} บาท</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="border p-2 font-bold text-right">รวมทั้งสิ้น</td>
                <td className="border p-2 font-bold text-right">{orderData.total} บาท</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};

export default OrderPDF;