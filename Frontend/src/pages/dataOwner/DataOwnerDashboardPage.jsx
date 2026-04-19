import React from 'react';
// ดึงข้อมูล Mock Data เข้ามาใช้
import { summaryCardsData, taskListData, recentActivitiesData } from '../../data/dataOwnerMock';

const DataOwnerDashboardPage = () => {
  // ฟังก์ชันช่วยเลือกสี Background ของการ์ด
  const getCardGradient = (type) => {
    switch(type) {
      case 'total': return 'from-[#3b82f6] to-[#2563eb]'; // ฟ้า
      case 'pending': return 'from-[#22d3ee] to-[#06b6d4]'; // มินต์
      case 'edit': return 'from-[#fb923c] to-[#f97316]'; // ส้ม
      case 'approved': return 'from-[#34d399] to-[#10b981]'; // เขียว
      default: return 'from-gray-400 to-gray-500';
    }
  };

  // ฟังก์ชันช่วยเลือกสีของป้ายสถานะ (Badge)
  const getStatusStyle = (status) => {
    switch(status) {
      case 'edit': return { text: 'ต้องแก้ไข', bg: 'bg-[#fb923c]' };
      case 'pending': return { text: 'รอการอนุมัติ', bg: 'bg-[#22d3ee]' };
      case 'approved': return { text: 'อนุมัติแล้ว', bg: 'bg-[#10b981]' };
      default: return { text: 'ไม่ทราบสถานะ', bg: 'bg-gray-400' };
    }
  };

  return (
    <div className="flex flex-col gap-6 font-[Kanit] w-full max-w-7xl mx-auto">
      
      {/* 1. แถวบน: การ์ดสรุป 4 กล่อง */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryCardsData.map((card) => (
          <div key={card.id} className={`flex flex-col p-6 rounded-2xl text-white shadow-sm bg-gradient-to-br ${getCardGradient(card.type)}`}>
            <h2 className="text-lg opacity-90">{card.title}</h2>
            <div className="flex justify-between items-center mt-2">
              <span className="text-4xl font-bold">{card.count}</span>
              <div className="bg-white/20 p-2 rounded-full flex items-center justify-center">
                <img src={card.icon} alt="icon" width="24" height="24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. แถวล่าง: แบ่งเป็น 2 คอลัมน์ (ซ้าย 1 ส่วน, ขวา 2 ส่วน) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* คอลัมน์ซ้าย: ปุ่ม Actions และ รายการงาน */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* กล่องดำเนินการด่วน */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">การดำเนินการด่วน</h2>
            <div className="flex flex-col gap-3">
              <button className="flex items-center gap-3 bg-[#0057cc] hover:bg-blue-700 text-white p-3 rounded-xl transition-colors w-full cursor-pointer">
                <img src="https://app.codigma.io/api/uploads/2026/04/19/svg-2aac8ed1-76b9-44d6-a8bf-11c2251ccab4.svg" alt="icon" width="20" height="20" />
                <span className="font-medium">สร้างบันทึก ROPA ใหม่</span>
              </button>
              <button className="flex items-center gap-3 bg-[#22a345] hover:bg-green-700 text-white p-3 rounded-xl transition-colors w-full cursor-pointer">
                <img src="https://app.codigma.io/api/uploads/2026/04/19/svg-866eae9d-0702-4360-b1b3-d5faa54bcaed.svg" alt="icon" width="20" height="20" />
                <span className="font-medium">อัปโหลด Excel ใหม่</span>
              </button>
            </div>
          </div>

          {/* กล่องรายการงาน */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">รายการงาน</h2>
            <ul className="flex flex-col gap-4">
              {taskListData.map((task, index) => (
                <li key={index} className="text-gray-700 text-sm border-b border-gray-100 pb-4 last:border-0">
                  {task}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* คอลัมน์ขวา: ตารางกิจกรรมล่าสุด */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">กิจกรรมล่าสุด</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 font-semibold text-sm">
                  <th className="pb-4 px-2 font-medium">ชื่อ ROPA</th>
                  <th className="pb-4 px-2 font-medium">แผนก</th>
                  <th className="pb-4 px-2 font-medium">วันที่</th>
                  <th className="pb-4 px-2 font-medium text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {recentActivitiesData.map((activity) => {
                  const statusInfo = getStatusStyle(activity.status);
                  return (
                    <tr key={activity.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2">{activity.name}</td>
                      <td className="py-4 px-2">{activity.department}</td>
                      <td className="py-4 px-2">{activity.date}</td>
                      <td className="py-4 px-2 text-right">
                        <span className={`${statusInfo.bg} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                          {statusInfo.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataOwnerDashboardPage;