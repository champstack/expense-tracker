"use client";

import React, { useState } from "react";
import { X, Mail, Lock, ShieldCheck, User, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  if (!isOpen) return null;

  const configured = isSupabaseConfigured();

  const getThaiErrorMessage = (error: any): string => {
    const msg = error?.message || "";
    if (msg.includes("Invalid login credentials")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    if (msg.includes("Email not confirmed")) return "กรุณาตรวจสอบอีเมลของคุณเพื่อกดยืนยันตัวตนก่อนเข้าสู่ระบบ";
    if (msg.includes("User already registered")) return "อีเมลนี้ถูกลงทะเบียนแล้ว กรุณาเลือก 'เข้าสู่ระบบ'";
    if (msg.includes("Password should be at least")) return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    if (msg.includes("rate limit")) return "คุณทำรายการบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่";
    return msg || "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!configured) {
      setErrorMsg("ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล กรุณาตรวจสอบการตั้งค่า");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setErrorMsg("รหัสผ่านทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
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
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          setInfoMsg("สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!");
          onAuthSuccess();
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setInfoMsg("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบกล่องจดหมายอีเมลของคุณเพื่อยืนยันตัวตน");
          setMode("login");
        }
      }
    } catch (err: any) {
      setErrorMsg(getThaiErrorMessage(err));
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
      setErrorMsg(getThaiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 p-6 md:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/25">
            {user ? <ShieldCheck className="w-7 h-7" /> : <User className="w-7 h-7" />}
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {user
              ? "บัญชีผู้ใช้งาน"
              : mode === "login"
              ? "เข้าสู่ระบบ"
              : "สมัครสมาชิกใหม่"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {user
              ? user.email
              : mode === "login"
              ? "เข้าสู่ระบบ Money Planner เพื่อเริ่มจัดการรายรับ-รายจ่ายของคุณ"
              : "สร้างบัญชีผู้ใช้ใหม่เพื่อบันทึกข้อมูลและซิงก์บนคลาวด์"}
          </p>
        </div>

        {/* Mode Switcher Tabs (เมื่อยังไม่ได้ล็อกอิน) */}
        {!user && (
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
                setInfoMsg("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMsg("");
                setInfoMsg("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              สมัครสมาชิกใหม่
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Success Alert */}
        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1 leading-relaxed font-medium">{infoMsg}</div>
          </div>
        )}

        {/* User Logged In Profile Card */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                เข้าสู่ระบบอยู่ขณะนี้
              </div>
              <div className="pt-1">
                <p className="text-[11px] text-slate-400">อีเมลที่ใช้งาน</p>
                <p className="text-sm font-semibold text-slate-800">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs transition-colors border border-rose-100"
            >
              {loading ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <form onSubmit={handleAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (โหมดสมัครสมาชิก) */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ยืนยันรหัสผ่านอีกครั้ง
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                "กำลังดำเนินการ..."
              ) : mode === "login" ? (
                <>
                  เข้าสู่ระบบ <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  สร้างบัญชีผู้ใช้ <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Bottom link to switch mode */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setErrorMsg("");
                  setInfoMsg("");
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {mode === "login"
                  ? "ยังไม่มีบัญชีผู้ใช้? กดสมัครสมาชิกที่นี่"
                  : "มีบัญชีผู้ใช้อยู่แล้ว? กดเข้าสู่ระบบ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
