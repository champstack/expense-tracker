"use client";

import React, { useState, useMemo } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Send,
  Wallet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onContinueAsGuest?: () => void;
}

export function AuthScreen({ onAuthSuccess, onContinueAsGuest }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const configured = isSupabaseConfigured();

  // ตรวจสอบรูปแบบอีเมล
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = email.trim() === "" || emailRegex.test(email.trim());

  // ตรวจจับคำสะกดผิดที่พบบ่อย
  const emailSuggestion = useMemo(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) return null;
    const parts = trimmed.split("@");
    const userPart = parts[0];
    const domainPart = parts[1];

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

  const getThaiErrorMessage = (error: any): string => {
    const msg = error?.message || "";
    if (msg.includes("Invalid login credentials")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
    if (msg.includes("Email not confirmed")) return "อีเมลนี้ยังไม่ได้กดยืนยันตัวตน กรุณาตรวจสอบกล่องข้อความในอีเมลของคุณ";
    if (msg.includes("User already registered")) return "อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณากดเลือก 'เข้าสู่ระบบ'";
    if (msg.includes("Password should be at least")) return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    if (msg.includes("rate limit") || msg.includes("over_email_send_rate_limit")) return "คุณทำรายการบ่อยเกินไป กรุณารอสักครู่ (ประมาณ 1 นาที) แล้วลองใหม่อีกครั้ง";
    if (msg.includes("email_address_invalid")) return "รูปแบบอีเมลไม่ถูกต้อง กรุณากรอกอีเมลจริง";
    return msg || "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
  };

  const isUnconfirmedError = errorMsg.includes("ยังไม่ได้กดยืนยันตัวตน") || errorMsg.includes("Email not confirmed");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!configured) {
      setErrorMsg("ระบบยังไม่ได้เชื่อมต่อฐานข้อมูล Supabase กรุณาตั้งค่า Environment Variables");
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
        setInfoMsg("เข้าสู่ระบบสำเร็จ กำลังพาเข้าสู่หน้าหลัก...");
        setTimeout(() => {
          onAuthSuccess();
        }, 500);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        if (data.session) {
          setInfoMsg("สมัครสมาชิกและเข้าสู่ระบบสำเร็จ!");
          setTimeout(() => {
            onAuthSuccess();
          }, 600);
        } else {
          setInfoMsg("สมัครสมาชิกเรียบร้อย! หากมีการเปิดยืนยันอีเมล กรุณากดยืนยันในกล่องจดหมาย Inbox/Spam แล้วเข้าสู่ระบบ");
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
        redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      });
      if (error) throw error;
      setInfoMsg(`ส่งลิงก์รีเซ็ตรหัสผ่านไปยัง ${email} แล้ว กรุณาตรวจสอบกล่องข้อความหรือโฟลเดอร์ Spam`);
    } catch (err: any) {
      setErrorMsg(getThaiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setErrorMsg("กรุณากรอกอีเมลก่อนกดส่ง");
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
        },
      });
      if (error) throw error;
      setInfoMsg(`ส่งอีเมลยืนยันไปยัง ${email} อีกครั้งเรียบร้อยแล้ว`);
    } catch (err: any) {
      setErrorMsg(getThaiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-purple-50/50">
      <div className="w-full max-w-md">
        {/* App Logo & Welcome Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/25 mb-3.5">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Money Planner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === "login"
              ? "กรุณาเข้าสู่ระบบก่อนเริ่มต้นใช้งาน"
              : mode === "register"
              ? "สร้างบัญชีใหม่เพื่อเริ่มบันทึกรายรับ-รายจ่าย"
              : "รีเซ็ตรหัสผ่านของคุณ"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8">
          {/* Mode Switcher Tabs */}
          {mode !== "forgot" && (
            <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setInfoMsg("");
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
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
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  mode === "register"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                สมัครสมาชิกใหม่
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
              </div>
              {isUnconfirmedError && (
                <div className="mt-3 pt-2.5 border-t border-rose-200/60">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> ส่งอีเมลยืนยันอีกครั้ง
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info/Success Message */}
          {infoMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 font-medium leading-relaxed">{infoMsg}</div>
            </div>
          )}

          {/* Forgot Password View */}
          {mode === "forgot" ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
            <form onSubmit={handleAuth} className="space-y-4">
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

                {!isEmailValid && email.length > 3 && (
                  <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> รูปแบบอีเมลไม่ถูกต้อง (เช่น user@gmail.com)
                  </p>
                )}

                {emailSuggestion && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2 animate-in fade-in">
                    <span className="truncate">💡 คุณหมายถึง <b>{emailSuggestion}</b> หรือไม่?</span>
                    <button
                      type="button"
                      onClick={() => setEmail(emailSuggestion)}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] transition-colors"
                    >
                      แก้ไข
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

          {/* Optional Guest fallback if needed */}
          {onContinueAsGuest && (
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                ทดลองใช้งานแบบไม่เข้าสู่ระบบ (บันทึกเฉพาะในเครื่องนี้)
              </button>
            </div>
          )}
        </div>

        {/* Security badge footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>ข้อมูลปลอดภัยด้วยระบบจัดเก็บ Supabase Cloud</span>
        </div>
      </div>
    </div>
  );
}
