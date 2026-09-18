import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Money Planner | ระบบบันทึกรายรับ-รายจ่าย",
  description: "เว็บแอปพลิเคชันบันทึกรายรับ-รายจ่าย เรียบง่าย สบายตา รองรับหลายขนาดหน้าจอ พัฒนาด้วย Next.js, Supabase, Tailwind CSS และ Recharts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} h-full antialiased`}>
      <body className="min-h-full text-slate-800 flex flex-col" style={{ fontFamily: "var(--font-prompt), sans-serif", backgroundColor: "#F5F5F7" }}>
        {children}
      </body>
    </html>
  );
}
