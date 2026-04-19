import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  // สร้างข้อมูลเมนูเป็น Array ธรรมดา (ดึงมาจากไอคอนที่เครื่องมือ Gen ให้)
  const navLinks = [
    { path: '/data-owner/dashboard', text: 'หน้าแรก', iconSrc: 'https://app.codigma.io/api/uploads/2026/04/19/svg-69bbf97b-d4c5-4dce-9935-c30604eddc90.svg' },
    { path: '/data-owner/reports', text: 'รายงาน', iconSrc: 'https://app.codigma.io/api/uploads/2026/04/19/svg-fd26f20c-1d75-4162-bb09-0d97dee183e3.svg' },
    { path: '/data-owner/activities', text: 'บันทึกรายการกิจกรรม', iconSrc: 'https://app.codigma.io/api/uploads/2026/04/19/svg-470e2db0-02de-446b-a293-2e3fa9241426.svg' },
    { path: '/data-owner/destruction', text: 'ตรวจสอบการทำลายข้อมูล', iconSrc: 'https://app.codigma.io/api/uploads/2026/04/19/svg-2c4ec08b-8ed7-4257-8c76-11c6ce9497f2.svg' },
    { path: '/data-owner/settings', text: 'ตั้งค่า', iconSrc: 'https://app.codigma.io/api/uploads/2026/04/19/svg-63c614ab-0269-4c05-8c6d-f198b8c2f5a6.svg' },
  ];

  return (
    // กำหนดความกว้างของ Sidebar ให้คงที่ (เช่น w-64) และความสูงเต็มจอ (h-screen)
    <aside className="flex flex-col w-64 h-screen bg-gradient-to-b from-[#1e3a8a] to-[#1e3a8a]">
      
      {/* ส่วน Logo */}
      <div className="flex flex-col items-center p-8 w-full">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center w-10 h-10 bg-gradient-to-r from-green-400 to-blue-600 rounded-xl">
            {/* โลโก้ i-RoPA */}
            <img src="https://app.codigma.io/api/uploads/2026/04/19/svg-3b5ef670-89f3-48db-a17d-c6328c3e621f.svg" alt="Logo SVG" width="28" height="28" />
          </div>
          <div className="text-white text-3xl font-semibold flex items-center">
            i-RoPA
          </div>
        </div>
        <div className="flex justify-center text-white text-xs font-bold mt-1">
          <span>integrated with </span>
          <span className="text-teal-400 ml-1">Netbay</span>
        </div>
      </div>

      {/* ส่วน เมนู Navigation */}
      <nav className="flex flex-col px-4 gap-2 flex-1 w-full">
        {navLinks.map((link, index) => (
          // ใช้ NavLink แทน <a> เพื่อจัดการเรื่อง Active State ได้อัตโนมัติ
          <NavLink
            key={index}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-4 p-3 rounded-xl text-sm font-normal transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-700 text-teal-400' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <img
              src={link.iconSrc}
              alt={`${link.text} icon`}
              width="20"
              height="20"
              className="flex-shrink-0"
            />
            <span>{link.text}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;