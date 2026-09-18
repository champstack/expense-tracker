"use client";

import React, { useState } from "react";
import { X, Mail, Lock, ShieldCheck, Database, KeyRound, AlertCircle } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onAuthSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, user, onAuthSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  if (!isOpen) return null;

  const configured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!configured) {
      setErrorMsg(
        "ยังไม่ได้ตั้งค่า Supabase URL และ Anon Key ในไฟล์ .env.local กรุณาใส่คีย์ก่อนเข้าใช้งานระบบคลาวด์"
      );
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setInfoMsg("เข้าสู่ระบบสำเร็จ!");
        onAuthSuccess();
        setTimeout(onClose, 800);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfoMsg("ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน หรือเข้าสู่ระบบ");
        setMode("login");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      onAuthSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {user ? "ข้อมูลผู้ใช้งาน Supabase" : "เชื่อมต่อบัญชีผู้ใช้"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {user
              ? `กำลังล็อกอินด้วย: ${user.email}`
              : "เข้าสู่ระบบเพื่อซิงก์ข้อมูลรายรับ-รายจ่ายของคุณบน Supabase Cloud"}
          </p>
        </div>

        {!configured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">ยังไม่ได้เชื่อมต่อ Supabase Key</p>
              <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                ระบบกำลังทำงานใน <strong>โหมดทดลอง (Demo Mode)</strong> ข้อมูลจะถูกบันทึกลงในเครื่องของคุณ (LocalStorage) เพื่อให้ใช้งานได้ทันที
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            {infoMsg}
          </div>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" /> เชื่อมต่อระบบสำเร็จ
              </div>
              <p className="text-slate-600">อีเมล: {user.email}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">ID: {user.id}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-xs transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 mt-2"
            >
              {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {mode === "login"
                  ? "ยังไม่มีบัญชี? สมัครสมาชิกใหม่"
                  : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
