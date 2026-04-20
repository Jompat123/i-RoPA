import type { Metadata } from "next";
import { Kanit } from "next/font/google";

import "./globals.css";

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "i-RoPA",
  description: "integrated with Netbay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kanit.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-200/80 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
