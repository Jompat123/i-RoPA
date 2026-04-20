import { redirect } from "next/navigation";

/** ใช้ `/reports` เป็นหน้าสร้างฟอร์ม ROPA — เก็บ path นี้เพื่อลิงก์เก่า */
export default function RopaStep1RedirectPage() {
  redirect("/reports");
}
