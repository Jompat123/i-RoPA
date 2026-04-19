import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layouts_compo/Sidebar';
import Topbar from '../components/layouts_compo/Topbar'; // เอาคอมเมนต์ออกแล้ว

const DataOwnerLayout = () => {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        
        <Topbar /> {/* เอาคอมเมนต์ออกแล้ว! */}
        
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DataOwnerLayout;