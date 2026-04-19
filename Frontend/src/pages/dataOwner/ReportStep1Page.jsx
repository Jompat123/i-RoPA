import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ข้อมูลขั้นตอน (Steps)
const steps = [
  { id: 1, label: "1.รายละเอียดกิจกรรม" },
  { id: 2, label: "2. การเก็บรวบรวมข้อมูล" },
  { id: 3, label: "3. ฐานทางกฎหมาย" },
  { id: 4, label: "4. ระยะเวลาจัดเก็บและมาตรการความปลอดภัย" },
];

const ReportStep1Page = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("controller");
  const [formValues, setFormValues] = useState({
    "controller-name": "",
    activity: "",
    purpose: "",
  });

  const handleInputChange = (id, value) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex flex-col items-center gap-10 p-4 lg:p-10 font-[Sarabun] max-w-6xl mx-auto animate-fade-up">
      
      {/* 1. ส่วนหัวข้อ (Title) */}
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-800">
          แบบฟอร์ม ROPA - ขั้นตอนที่ 1: ข้อมูลกิจกรรม (Activity Details)
        </h1>
      </div>

      {/* 2. ส่วนแถบขั้นตอน (Step Indicator) - แก้ไข Layout ใหม่ */}
      <div className="relative flex justify-between items-start w-full px-10">
        <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200 -z-10" />
        <div className="absolute top-3 left-0 w-[12.5%] h-0.5 bg-[#3fd5c3] -z-10" />
        
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center gap-3 w-1/4">
            <div className={`relative w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${index === 0 ? "bg-[#3fd5c3]" : "bg-gray-300"}`}>
               {index === 0 && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <span className={`text-[11px] text-center font-medium leading-tight max-w-[100px] ${index === 0 ? "text-gray-800" : "text-gray-400"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* 3. ส่วนบัตรเลือกบทบาท (Role Selection Cards) - กดเลือกได้จริง */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* Controller Button */}
          <button
            onClick={() => setSelectedRole("controller")}
            className={`relative flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === "controller" ? "border-blue-800 ring-4 ring-blue-50" : "border-gray-100 opacity-60"
            }`}
          >
            <div className={`p-4 rounded-xl ${selectedRole === "controller" ? "bg-blue-800 text-white" : "bg-gray-100 text-gray-400"}`}>
               <div className="w-10 h-10 border-2 border-current rounded flex items-center justify-center font-bold">🛡️</div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">ผู้ควบคุมข้อมูล (Controller)</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">ผู้ที่มีอำนาจตัดสินใจเกี่ยวกับวัตถุประสงค์และวิธีการประมวลผลข้อมูลส่วนบุคคล</p>
            </div>
            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === "controller" ? "bg-blue-600 border-blue-600 shadow-sm" : "border-gray-300"}`}>
              {selectedRole === "controller" && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </button>

          {/* Processor Button */}
          <button
            onClick={() => setSelectedRole("processor")}
            className={`relative flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${
              selectedRole === "processor" ? "border-blue-800 ring-4 ring-blue-50" : "border-gray-100 opacity-60"
            }`}
          >
            <div className={`p-4 rounded-xl ${selectedRole === "processor" ? "bg-blue-800 text-white" : "bg-gray-100 text-gray-400"}`}>
               <div className="w-10 h-10 border-2 border-current rounded flex items-center justify-center font-bold">⚙️</div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">ผู้ประมวลผลข้อมูล (Processor)</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">ผู้ประมวลผลข้อมูลส่วนบุคคลตามคำสั่งหรือในนามของผู้ควบคุมข้อมูล</p>
            </div>
            <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === "processor" ? "bg-blue-600 border-blue-600 shadow-sm" : "border-gray-300"}`}>
              {selectedRole === "processor" && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
          </button>
        </div>

        {/* 4. ส่วนฟิลด์ข้อมูล (Form Fields) */}
        <div className="space-y-8">
          {[
            { id: "controller-name", label: "1. ข้อมูลเกี่ยวกับผู้ควบคุมข้อมูล / ชื่อผู้ประมวลผล", placeholder: "(ชื่อหน่วยงาน หรือ ชื่อบริษัท)" },
            { id: "activity", label: "2. กิจกรรมประมวลผล", placeholder: "(เช่น จัดงาน Event, ระบบรับสมัครงาน)" },
            { id: "purpose", label: "3. วัตถุประสงค์ของการประมวลผล", placeholder: "(เช่น เพื่อเก็บเป็นข้อมูลผู้เข้าร่วมงาน)" },
          ].map((field) => (
            <div key={field.id} className="flex flex-col gap-3">
              <label htmlFor={field.id} className="font-bold text-gray-700 text-[15px]">{field.label}</label>
              <input
                id={field.id}
                type="text"
                value={formValues[field.id]}
                placeholder={field.placeholder}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full p-4 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-700 placeholder:text-gray-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. ปุ่มดำเนินการ (Action Buttons) */}
      <div className="flex flex-wrap items-center justify-between w-full gap-4 pt-4">
        <button className="px-8 py-3 bg-[#0057cc] text-white rounded-full font-bold hover:bg-blue-800 transition-all shadow-md active:scale-95">
          บันทึกฉบับร่าง
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-gray-500 text-white rounded-full font-bold hover:bg-gray-600 transition-all shadow-md"
          >
            ยกเลิก
          </button>
          <button 
            onClick={() => navigate("/data-owner/report-step-2")}
            className="px-8 py-3 bg-[#0057cc] text-white rounded-full font-bold hover:bg-blue-800 transition-all shadow-md active:scale-95"
          >
            บันทึกและถัดไป
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportStep1Page;