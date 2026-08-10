"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  MapPin, 
  CreditCard, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  Phone,
  Check,
  Info,
  ChevronDown
} from "lucide-react";
import Image from "next/image";

import { CITIES } from "@/data/turkeyData";

function CustomSelect({
  label,
  placeholder,
  value,
  options,
  disabled,
  onChange
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-1.5 relative">
      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
        {label} <span className="text-red-500">*</span>
      </label>
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-2xl text-sm font-bold text-left flex items-center justify-between transition-all shadow-xs ${
          disabled 
            ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed" 
            : isOpen 
              ? "bg-white border-2 border-primary-600 ring-4 ring-primary-100 text-gray-900 shadow-md" 
              : "bg-white border border-gray-200 text-gray-900 hover:border-gray-300 cursor-pointer"
        }`}
      >
        <span className={value ? "text-gray-900 font-bold" : "text-gray-400 font-normal"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary-600" : ""}`} />
      </button>

      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown Card */}
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-30 overflow-hidden max-h-60 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
            {options.length > 6 && (
              <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                <input
                  type="text"
                  placeholder="İl / İlçe Ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-primary-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="overflow-y-auto py-1 divide-y divide-gray-50 max-h-48">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium">Sonuç bulunamadı</div>
              ) : (
                filtered.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full px-4 py-2.5 text-xs text-left font-bold transition-colors flex items-center justify-between cursor-pointer ${
                      value === opt 
                        ? "bg-primary-50 text-primary-700" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span>{opt}</span>
                    {value === opt && <Check className="w-3.5 h-3.5 text-primary-600" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    tcNo: ""
  });

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Live Validations
  const isTcValid = formData.tcNo.length === 11 && /^\d+$/.test(formData.tcNo);
  const isPhoneValid = formData.phone.length === 10 && formData.phone.startsWith("5");
  const isEmailValid = formData.email.includes("@") && formData.email.includes(".");
  const isPasswordMatch = formData.password.length >= 6 && formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!selectedCity || !selectedDistrict || !streetAddress) {
      setError("Lütfen il, ilçe ve açık adres alanlarını eksiksiz doldurun.");
      setIsLoading(false);
      return;
    }

    if (!isTcValid) {
      setError("T.C. Kimlik numarası tam 11 rakamdan oluşmalıdır.");
      setIsLoading(false);
      return;
    }

    if (!isPhoneValid) {
      setError("Telefon numaranız 0 olmadan 5 ile başlamalı ve 10 haneli olmalıdır. (Örn: 5551234567)");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Girdiğiniz şifreler eşleşmiyor. Lütfen kontrol edin.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Şifreniz en az 6 karakter olmalıdır.");
      setIsLoading(false);
      return;
    }

    const fullAddress = `${selectedCity} / ${selectedDistrict} - ${streetAddress}`;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: `+90${formData.phone}`,
          password: formData.password,
          tcNo: formData.tcNo,
          address: fullAddress
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Kayıt işlemi sırasında bir hata oluştu.");
      }

      if (redirectUrl) {
        router.push(`/auth/login?registered=true&redirect=${encodeURIComponent(redirectUrl)}`);
      } else {
        router.push("/auth/login?registered=true");
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto format TC No to numbers only
    if (name === "tcNo") {
      const numericValue = value.replace(/\D/g, "").slice(0, 11);
      setFormData({ ...formData, tcNo: numericValue });
      return;
    }

    // Auto format Phone No (Strictly 5-start, auto strip leading 0 or 90)
    if (name === "phone") {
      let rawDigits = value.replace(/\D/g, "");

      if (rawDigits.startsWith("90")) {
        rawDigits = rawDigits.slice(2);
      }
      while (rawDigits.startsWith("0")) {
        rawDigits = rawDigits.slice(1);
      }

      if (rawDigits.length > 0 && !rawDigits.startsWith("5")) {
        setError("Telefon numarası 0 olmadan 5 ile başlamalıdır. (Örn: 555 123 45 67)");
        return;
      }

      setError("");
      const cleaned = rawDigits.slice(0, 10);
      setFormData({ ...formData, phone: cleaned });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6">
        
        {/* Top Announcement Bar if redirected from checkout */}
        {redirectUrl ? (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 px-6 flex items-center gap-3 text-sm font-bold shadow-md">
            <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse text-yellow-300" />
            <span>Satın alma işlemine devam etmek için lütfen 10 saniyede ücretsiz öğrenci hesabınızı oluşturun.</span>
          </div>
        ) : (
          <div className="bg-primary-50 border-b border-primary-100 p-3 px-6 text-center text-xs font-bold text-primary-700">
            ⚡ Hızlı & Ücretsiz Öğrenci Hesabı (Sadece 1 Dakika)
          </div>
        )}

        <div className="p-6 md:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-block">
              <div className="w-16 h-16 bg-white rounded-2xl p-2.5 mx-auto mb-2 flex items-center justify-center border border-gray-200 shadow-sm hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="Atanıyorum Hocam Logo" width={48} height={48} className="object-contain" />
              </div>
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Öğrenci Kayıt Formu
            </h1>
            <p className="text-xs md:text-sm text-gray-500 font-medium max-w-md mx-auto">
              Lütfen bilgilerinizi eksiksiz ve doğru doldurun.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm font-bold rounded-2xl flex items-center gap-3 shadow-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1: KİŞİSEL BİLGİLER */}
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-3xl p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-200/80 pb-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                  1
                </div>
                <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">
                  Kişisel & İletişim Bilgileriniz
                </h3>
              </div>

              {/* Ad & Soyad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Adınız <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 shadow-xs"
                      placeholder="Örn: Ahmet"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Soyadınız <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 shadow-xs"
                      placeholder="Örn: Yılmaz"
                    />
                  </div>
                </div>
              </div>

              {/* Cep Telefonu Numarası */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    Cep Telefonu Numarası <span className="text-red-500">*</span>
                    {isPhoneValid && (
                      <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Telefon Formatı Doğru
                      </span>
                    )}
                  </label>
                </div>

                {/* Callout Box for Phone */}
                <div className="bg-amber-50 border border-amber-200/80 p-2.5 px-3 rounded-2xl flex items-center gap-2 text-[11px] font-bold text-amber-800">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>DİKKAT: Numaranızı başında 0 olmadan, doğrudan 5 ile başlayarak yazın.</span>
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 bg-gray-200/90 px-3 py-1.5 rounded-xl text-xs font-black text-gray-800 select-none z-10 border border-gray-300/80 shadow-xs">
                    <span>🇹🇷</span>
                    <span>+90</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className={`w-full pl-24 pr-4 py-3 bg-white border rounded-2xl text-sm font-black tracking-widest text-gray-900 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 shadow-xs ${
                      isPhoneValid ? "border-green-400 bg-green-50/20" : "border-gray-200"
                    }`}
                    placeholder="5XX XXX XX XX"
                  />
                </div>
              </div>
            </div>

            {/* STEP 2: GİRİŞ & ŞİFRE BİLGİLERİ */}
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-3xl p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-200/80 pb-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                  2
                </div>
                <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">
                  Hesap & Giriş Bilgileriniz
                </h3>
              </div>

              {/* E-Posta Adresi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    E-Posta Adresi <span className="text-red-500">*</span>
                  </label>
                  {isEmailValid && (
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> E-Posta Formatı Doğru
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-2xl text-sm font-bold text-gray-900 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 shadow-xs ${
                      isEmailValid ? "border-green-400" : "border-gray-200"
                    }`}
                    placeholder="Örn: ahmet@gmail.com"
                  />
                </div>
                <p className="text-[11px] text-gray-500 font-medium ml-1">
                  🔑 Öğrenci panelinize bu e-posta adresiyle giriş yapacaksınız.
                </p>
              </div>

              {/* Şifre ve Şifre Tekrar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Şifre Belirleyin <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 shadow-xs"
                      placeholder="En az 6 karakter"
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

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Şifre Tekrarı <span className="text-red-500">*</span>
                    </label>
                    {isPasswordMatch && (
                      <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Eşleşti
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full pl-11 pr-4 py-3 bg-white border rounded-2xl text-sm font-bold text-gray-900 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 shadow-xs ${
                        isPasswordMatch ? "border-green-400" : "border-gray-200"
                      }`}
                      placeholder="Şifrenizi doğrulayın"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: FATURA & TESLİMAT BİLGİLERİ */}
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-3xl p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-gray-200/80 pb-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                  3
                </div>
                <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">
                  Resmî Fatura & Adres Bilgileriniz
                </h3>
              </div>

              {/* TC Kimlik No */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    T.C. Kimlik Numarası <span className="text-red-500">*</span>
                  </label>
                  {isTcValid ? (
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> 11 Hane Geçerli
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-medium">Resmî Fatura İçin Zorunludur</span>
                  )}
                </div>
                <div className="relative">
                  <CreditCard className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="tcNo"
                    value={formData.tcNo}
                    onChange={handleChange}
                    required
                    maxLength={11}
                    className={`w-full pl-11 pr-4 py-3 bg-white border rounded-2xl text-sm font-bold text-gray-900 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 tracking-wider shadow-xs ${
                      isTcValid ? "border-green-400" : "border-gray-200"
                    }`}
                    placeholder="11 haneli T.C. Kimlik Numaranız"
                  />
                </div>
                <p className="text-[11px] text-gray-500 font-medium ml-1">
                  📌 Yasal mevzuat gereği faturanız adınıza kesilecektir. Bilgileriniz 256-bit korumalıdır.
                </p>
              </div>

              {/* İl ve İlçe Seçimi (Özel Şık Pop-up Component) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="İl Seçin"
                  placeholder="İl Seçiniz..."
                  value={selectedCity}
                  options={CITIES.map(c => c.name)}
                  onChange={(val) => {
                    setSelectedCity(val);
                    setSelectedDistrict("");
                  }}
                />

                <CustomSelect
                  label="İlçe Seçin"
                  placeholder={selectedCity ? "İlçe Seçiniz..." : "Önce İli Seçin"}
                  value={selectedDistrict}
                  options={selectedCity ? (CITIES.find(c => c.name === selectedCity)?.districts || []) : []}
                  disabled={!selectedCity}
                  onChange={(val) => setSelectedDistrict(val)}
                />
              </div>

              {/* Açık Adres */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Açık Adres (Mahalle, Cadde, Sokak, Bina No) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                  <textarea
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    required
                    rows={2}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:border-primary-600 focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none placeholder:font-normal placeholder:text-gray-400 shadow-xs"
                    placeholder="Örn: Atatürk Mah. Cumhuriyet Cad. No:12 Daire:4"
                  />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-4 h-4" /> %100 Güvenli Üyelik & 256-Bit SSL
              </span>
              <span className="flex items-center gap-1.5 font-bold text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-primary-600" /> Ücretsiz Öğrenci Hesabı
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 group mt-6 cursor-pointer"
            >
              {isLoading ? "Hesap Oluşturuluyor..." : "⚡ KAYIT OL VE EĞİTİME BAŞLA"}
              {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Login Footer */}
          <div className="pt-4 border-t border-gray-100 text-center text-sm">
            <span className="text-gray-500 font-medium">Zaten kayıtlı bir hesabınız var mı? </span>
            <Link 
              href={redirectUrl ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : "/auth/login"} 
              className="font-bold text-primary-600 hover:text-primary-700 underline ml-1"
            >
              Giriş Yapın
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-sm font-bold text-gray-500">Yükleniyor...</div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
