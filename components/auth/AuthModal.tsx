"use client";

import React, { useState, useMemo } from "react";
import { X, Mail, Lock, ShieldCheck, User, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, Send, HelpCircle } from "lucide-react";
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
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // ตรวจสอบความถูกต้องของรูปแบบอีเมล
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email.trim() === "" || emailRegex.test(email.trim());

  // ตรวจสอบคำสะกดผิดที่พบบ่อยใน Domain หรือ Username
  const emailSuggestion = useMemo(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) return null;
    const parts = trimmed.split("@");
    const userPart = parts[0];
    const domainPart = parts[1];

    // ตรวจจับ sumer vs summer
    if (userPart === "sumer0649" && domainPart) {
      return `summer0649@${domainPart}`;
    }

    const domainTypoMap: Record<string, string> = {
      "gmai.com": "gmail.com",
      "gamil.com": "gmail.com",
      "gmial.com": "gmail.com",
      "gmaill.com": "gmail.com",
      "gmal.com": "gmail.com",
      "gmail.co": "gmail.com",
      "hotmial.com": "hotmail.com",
      "hotmai.com": "hotmail.com",
      "yaho.com": "yahoo.com",
      "outlok.com": "outlook.com",
    };

    if (domainPart && domainTypoMap[domainPart]) {
      return `${userPart}@${domainTypoMap[domainPart]}`;
    }

    return null;
  }, [email]);

  if (!isOpen) return null;

  const configured = isSupabaseConfigured();

  const getThaiErrorMessage = (error: any): string => {
    const msg = error?.message || "";
    if (msg.includes("Invalid login credentials")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
    if (msg.includes("Email not confirmed")) return "อีเมลนี้ยังไม่ได้กดยืนยันตัวตน กรุณาตรวจสอบกล่องข้อความหรือกดส่งอีเมลยืนยันใหม่";
    if (msg.includes("User already registered")) return "อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเลือก 'เข้าสู่ระบบ' หรือกด 'ลืมรหัสผ่าน'";
    if (msg.includes("Password should be at least")) return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")) return "คุณทำรายการบ่อยเกินไป กรุณารอสักครู่ (ประมาณ 1 นาที) แล้วลองใหม่อีกครั้ง";
    if (msg.includes("email_address_invalid")) return "รูปแบบอีเมลไม่ถูกต้อง กรุณาระบุอีเมลจริง";
    return msg || "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
  };

  const isUnconfirmedError = errorMsg.includes("ยังไม่ได้กดยืนยันตัวตน") || errorMsg.includes("Email not confirmed");

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
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setInfoMsg("เข้าสู่ระบบสำเร็จ!");
        onAuthSuccess();
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          }
        });
        if (error) throw error;
        if (data.session) {
          setInfoMsg("สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!");
          onAuthSuccess();
          setTimeout(() => {
            onClose();
          }, 600);
        } else {
          setInfoMsg("สมัครสมาชิกสำเร็จ! หากระบบต้องการยืนยันอีเมล กรุณาตรวจสอบใน Inbox หรือ Spam ของคุณก่อนเข้าสู่ระบบ");
          setMode("login");
        }
      }
    } catch (err: any) {
      setErrorMsg(getThaiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!email.trim()) {
      setErrorMsg("กรุณากรอกอีเมลที่ต้องการรีเซ็ตรหัสผ่าน");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}` : undefined,
      });
      if (error) throw error;
      setInfoMsg(`ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยัง ${email} เรียบร้อยแล้ว กรุณาตรวจสอบกล่องข้อความหรือโฟลเดอร์ Spam`);
    } catch (err: any) {
      setErrorMsg(getThaiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setErrorMsg("กรุณากรอกอีเมลที่ต้องการส่งลิงก์ยืนยัน");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        }
      });
      if (error) throw error;
      setInfoMsg(`ส่งอีเมลยืนยันไปยัง ${email} อีกครั้งเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมาย`);
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
        <div className="text-center mb-5">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/25">
            {user ? <ShieldCheck className="w-7 h-7" /> : <User className="w-7 h-7" />}
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {user
              ? "บัญชีผู้ใช้งาน"
              : mode === "login"
              ? "เข้าสู่ระบบ"
              : mode === "register"
              ? "สมัครสมาชิกใหม่"
              : "ลืมรหัสผ่าน"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {user
              ? user.email
              : mode === "login"
              ? "เข้าสู่ระบบ Money Planner เพื่อซิงก์ข้อมูลรายรับ-รายจ่ายบนคลาวด์"
              : mode === "register"
              ? "สร้างบัญชีผู้ใช้ใหม่เพื่อบันทึกและเชื่อมต่อข้อมูลของคุณ"
              : "กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่"}
          </p>
        </div>

        {/* Mode Switcher Tabs (เมื่อยังไม่ได้ล็อกอิน และไม่ใช่หน้าลืมรหัส) */}
        {!user && mode !== "forgot" && (
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
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 leading-relaxed font-medium">{errorMsg}</div>
            </div>

            {/* ปุ่มกดส่งอีเมลยืนยันซ้ำ เมื่อติดปัญหา Email not confirmed */}
            {isUnconfirmedError && (
              <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> ส่งอีเมลยืนยันอีกครั้ง
                </button>
                <p className="text-[11px] text-rose-600/90 leading-tight">
                  💡 หากเป็นผู้ดูแล Supabase สามารถปิด <b>Confirm email</b> ในหน้า Dashboard (Authentication &gt; Providers &gt; Email) เพื่อให้ล็อกอินได้ทันทีโดยไม่ต้องรอยืนยันอีเมล
                </p>
              </div>
            )}
          </div>
        )}

        {/* Success Alert */}
        {infoMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
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
                <p className="text-[11px] text-slate-400">อีเมลบัญชีผู้ใช้</p>
                <p className="text-sm font-semibold text-slate-800 break-all">{user.email}</p>
              </div>
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 mt-2">
                <span>สถานะคลาวด์: เชื่อมต่อแล้ว</span>
                <button
                  onClick={() => { onAuthSuccess(); setInfoMsg("ซิงก์ข้อมูลล่าสุดสำเร็จ!"); }}
                  className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" /> ซิงก์ข้อมูล
                </button>
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
        ) : mode === "forgot" ? (
          /* Forgot Password Form */
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                อีเมลของคุณ
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setInfoMsg("");
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                &larr; ย้อนกลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </form>
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
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    !isEmailValid && email.length > 3
                      ? "border-rose-300 focus:ring-rose-500/20 focus:border-rose-500"
                      : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"
                  }`}
                />
              </div>

              {/* แจ้งเตือนรูปแบบอีเมล */}
              {!isEmailValid && email.length > 3 && (
                <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> รูปแบบอีเมลไม่ถูกต้อง (ต้องมี @ และโดเมน เช่น user@gmail.com)
                </p>
              )}

              {/* ตรวจพบคำสะกดผิดที่พบบ่อย */}
              {emailSuggestion && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2 animate-in fade-in">
                  <span className="truncate">💡 คุณหมายถึง <b>{emailSuggestion}</b> หรือไม่?</span>
                  <button
                    type="button"
                    onClick={() => setEmail(emailSuggestion)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] transition-colors shadow-2xs"
                  >
                    เปลี่ยนเป็นอีเมลนี้
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  รหัสผ่าน (Password)
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMsg("");
                      setInfoMsg("");
                    }}
                    className="text-[11px] text-indigo-600 hover:underline font-medium"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
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
