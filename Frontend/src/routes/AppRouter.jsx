import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Layout และ Page ที่เราเพิ่งทำเสร็จ
import DataOwnerLayout from '../layout/DataOwnerLayout';
import DataOwnerDashboardPage from '../pages/dataOwner/DataOwnerDashboardPage';

// สร้างหน้า Placeholder ชั่วคราวสำหรับเมนูที่ยังไม่ได้ทำ
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-full text-gray-400 text-xl font-[Kanit]">
    กำลังสร้างหน้า: {title} 🚧
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ให้เปิดมาปุ๊บ วิ่งไปหน้า Data Owner ก่อนเลยชั่วคราว */}
        <Route path="/" element={<Navigate to="/data-owner/dashboard" replace />} />

        {/* --- โซนของ Data Owner --- */}
        <Route path="/data-owner" element={<DataOwnerLayout />}>
          {/* หน้าแรก (Dashboard) */}
          <Route path="dashboard" element={<DataOwnerDashboardPage />} />
          
          {/* หน้าอื่นๆ ที่กดจาก Sidebar (ใส่ Placeholder ไว้ก่อน) */}
          <Route path="reports" element={<PlaceholderPage title="รายงาน" />} />
          <Route path="activities" element={<PlaceholderPage title="บันทึกรายการกิจกรรม" />} />
          <Route path="destruction" element={<PlaceholderPage title="ตรวจสอบการทำลายข้อมูล" />} />
          <Route path="settings" element={<PlaceholderPage title="ตั้งค่า" />} />
        </Route>

        {/* หน้า 404 หาไม่เจอ */}
        <Route path="*" element={
          <div className="flex h-screen items-center justify-center text-2xl font-bold">
            404 - ไม่พบหน้านี้ 😢
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;