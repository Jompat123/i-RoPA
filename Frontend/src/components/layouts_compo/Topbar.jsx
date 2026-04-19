import React, { useState } from 'react';

const Topbar = () => {
  // สร้าง State สำหรับเก็บข้อความในช่องค้นหา
  const [searchQuery, setSearchQuery] = useState('');

  // ฟังก์ชันจำลองเมื่อมีการกดปุ่มต่างๆ (เดี๋ยวค่อยมาต่อ API หรือใส่ Logic ของจริงทีหลัง)
  const handleSearch = (e) => {
    // ถ้ากดปุ่ม Enter ในช่องค้นหา
    if (e.key === 'Enter') {
      alert(`คุณกำลังค้นหาคำว่า: ${searchQuery}`);
    }
  };

  const handleNotificationClick = () => {
    alert('เปิดหน้าต่างแจ้งเตือน!');
  };

  const handleProfileClick = () => {
    alert('เปิดเมนู Dropdown โปรไฟล์');
  };

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 bg-white border-b border-gray-100">
      
      {/* 1. ส่วนช่องค้นหา (Search Bar) */}
      <div className="relative flex items-center w-72">
        <div className="absolute left-4 flex items-center justify-center">
          <img src="https://app.codigma.io/api/uploads/2026/04/19/svg-a7ad0d3e-3b3f-4b58-8885-9e5a972a5b15.svg" alt="Search Icon" width="20" height="20" />
        </div>
        <input
          type="text"
          placeholder="Search"
          // ผูก State เข้ากับช่อง Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch} // ดักจับเวลากดปุ่ม Enter
          className="w-full bg-gray-100 rounded-full py-2.5 pl-12 pr-4 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-200 transition-all font-[Kanit]"
        />
      </div>

      {/* 2. ส่วนเมนูจัดการด้านขวา (Actions) */}
      <div className="flex items-center gap-6">
        
        <div className="flex items-center gap-4">
          {/* เพิ่ม onClick ให้ปุ่มแจ้งเตือน */}
          <button 
            onClick={handleNotificationClick}
            className="relative p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
          >
            <img src="https://app.codigma.io/api/uploads/2026/04/19/svg-7d8c71d0-eadb-40ff-a931-6a380474e9eb.svg" alt="Notification" width="24" height="24" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 border-2 border-white">1</span>
          </button>
          
          <button className="p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer">
            <img src="https://app.codigma.io/api/uploads/2026/04/19/svg-60e9caf4-2991-4f8a-a080-b0e79ff34932.svg" alt="Settings" width="24" height="24" />
          </button>
        </div>

        {/* เพิ่ม onClick ให้ส่วนโปรไฟล์ */}
        <div 
          onClick={handleProfileClick}
          className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src="https://app.codigma.io/api/uploads/2026/04/19/svg-5a0df9fb-79a4-4cde-ad99-758efebc0a15.svg" alt="Profile Avatar" width="40" height="40" className="rounded-full" />
          <div className="flex flex-col font-[Kanit]">
            <span className="text-sm font-semibold text-gray-800">คุณลี ทองทิพย์</span>
            <span className="text-xs text-gray-400">Data Owner</span>
          </div>
          <img src="https://app.codigma.io/api/uploads/2026/04/19/svg-ef821c24-902b-4d44-b639-b70b2a2f2a2a.svg" alt="Dropdown" width="16" height="16" className="ml-1" />
        </div>
        
      </div>
    </header>
  );
};

export default Topbar;