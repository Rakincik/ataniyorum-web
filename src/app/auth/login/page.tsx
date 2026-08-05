"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";
import Image from "next/image";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const isRegistered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Girdiğiniz e-posta adresi veya şifre hatalı.");
        setIsLoading(false);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        if (session?.user?.role === "ADMIN") {
          window.location.href = "/admin";
        } else if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = "/";
        }
      }
    } catch (error) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden my-6">
        
        {/* Banner if coming from purchase or register */}
        {isRegistered && (
          <div className="bg-emerald-600 text-white p-4 px-6 flex items-center gap-3 text-sm font-semibold">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span>Hesabınız başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.</span>
          </div>
        )}

        <div className="p-8 md:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl p-2.5 mx-auto mb-2 flex items-center justify-center border border-primary-100 shadow-sm">
                <Image src="/logo.png" alt="Atanıyorum Hocam Logo" width={48} height={48} className="object-contain" />
              </div>
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Öğrenci Girişi
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
              Eğitimlerinize ve canlı yayınlara erişmek için giriş yapın.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                E-Posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:font-normal placeholder:text-gray-400"
                  placeholder="ornek@mail.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Şifreniz
                </label>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:font-normal placeholder:text-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-black text-base transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 group mt-6 cursor-pointer"
            >
              {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap ve Derse Başla"}
              {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 text-center text-sm">
            <span className="text-gray-500 font-medium">Henüz bir hesabınız yok mu? </span>
            <Link 
              href={redirectUrl ? `/auth/register?redirect=${encodeURIComponent(redirectUrl)}` : "/auth/register"} 
              className="font-bold text-primary-600 hover:text-primary-700 underline ml-1"
            >
              Hemen Ücretsiz Kayıt Olun
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-sm font-bold text-gray-500">Yükleniyor...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
