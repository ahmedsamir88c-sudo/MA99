import React, { useState } from 'react';
import { useApp, GoogleAuthPayload } from '../context/AppContext';
import {
  UserPlus,
  User,
  Mail,
  BadgeCheck,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Camera,
  GraduationCap,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { GoogleAuthModal } from './GoogleAuthModal';

interface SignUpScreenProps {
  onGoToLogin: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onGoToLogin }) => {
  const { register, signInWithGoogleReal } = useApp();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [academicYear, setAcademicYear] = useState<number>(2);
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google Onboarding Modal
  const [onboardingGoogleUser, setOnboardingGoogleUser] = useState<GoogleAuthPayload | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    const res = await signInWithGoogleReal();
    setIsGoogleLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'تعذر التسجيل عبر Google.');
      return;
    }

    if (res.needsOnboarding && res.googleUser) {
      setOnboardingGoogleUser(res.googleUser);
      setIsOnboardingOpen(true);
    }
  };

  const isInvalidYear = Number(academicYear) !== 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(academicYear) !== 2) {
      setErrorMessage('التسجيل متاح حصرياً لطلاب الفرقة الثانية (Year 2).');
      return;
    }
    if (!username.trim() || !email.trim() || !universityId.trim() || !password) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('يجب أن لا تقل كلمة المرور عن 6 أحرف.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await register({
      username: username.trim(),
      email: email.trim(),
      universityId: universityId.trim(),
      academicYear: 2,
      password: password,
      profileImage: profileImage || undefined,
      authProvider: 'local',
    });

    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'تعذر إتمام عملية التسجيل.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141C2E] border border-[#2B3B5C] rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in duration-300 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="relative mx-auto w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-[#52D6A6] to-[#3B82F6] shadow-xl">
            <img
              src="/icon-192.png"
              alt="MA99 Icon"
              className="w-full h-full rounded-xl object-cover shadow-inner"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">إنشاء حساب في MA99</h2>
          <p className="text-xs text-[#9BB0D6]">انضم إلى منصة وتحديات MA99 الأكاديمية</p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-[#3C1F2B] border border-[#FF7E86]/50 rounded-xl flex items-center gap-2.5 text-xs text-[#FF7E86] animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real Google Sign-Up Button */}
        <div>
          <button
            type="button"
            disabled={isGoogleLoading || isLoading}
            onClick={handleGoogleSignUp}
            className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 active:bg-gray-100 text-[#1F2937] font-bold text-xs sm:text-sm rounded-2xl transition shadow-lg flex items-center justify-center gap-3 cursor-pointer border border-gray-200"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {isGoogleLoading ? 'جاري فتح نافذة Google الرسمية...' : 'التسجيل الفوري عبر Google (حقيقي)'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2B3B5C]" />
          <span className="text-[11px] text-[#7C93C0] font-medium">أو إنشاء حساب محلي</span>
          <div className="flex-1 h-px bg-[#2B3B5C]" />
        </div>

        {/* Local Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Profile Photo */}
          <div className="flex items-center gap-3 p-2 bg-[#0C1322] border border-[#2B3B5C] rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#173A2E] border border-[#52D6A6]/50 flex items-center justify-center text-[#52D6A6] font-bold overflow-hidden flex-shrink-0">
              {profileImage ? (
                <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <label
                htmlFor="signup-photo-input"
                className="text-xs text-[#52D6A6] font-bold hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{profileImage ? 'تغيير الصورة' : 'إضافة صورة شخصية (اختياري)'}</span>
                <input
                  id="signup-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
              <span className="text-[10px] text-[#7C93C0] block mt-0.5">
                تظهر في لوحة المتصدرين والبروفايل
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[#DEEBFF] font-semibold mb-1">اسم المستخدم (Username) *</label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: ahmed_samir"
                className="w-full bg-[#0B1020] border border-[#2B3B5C] focus:border-[#52D6A6] rounded-xl pl-10 pr-3.5 py-2.5 text-white outline-none text-left transition"
              />
              <User className="w-4 h-4 text-[#9BB0D6] absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[#DEEBFF] font-semibold mb-1">البريد الإلكتروني *</label>
            <div className="relative">
              <input
                type="email"
                dir="ltr"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#0B1020] border border-[#2B3B5C] focus:border-[#52D6A6] rounded-xl pl-10 pr-3.5 py-2.5 text-white outline-none text-left transition"
              />
              <Mail className="w-4 h-4 text-[#9BB0D6] absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[#DEEBFF] font-semibold mb-1">كود الطالب الجامعي (ID) *</label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                required
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                placeholder="مثال: 2024001"
                className="w-full bg-[#0B1020] border border-[#2B3B5C] focus:border-[#52D6A6] rounded-xl pl-10 pr-3.5 py-2.5 text-white outline-none text-left transition"
              />
              <BadgeCheck className="w-4 h-4 text-[#9BB0D6] absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Academic Year Selection with strict Year 2 enforcement */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[#DEEBFF] font-semibold">
                الفرقة الدراسية المقيد بها
              </label>
              <span className="text-[10px] text-[#52D6A6] font-bold">
                (مخصص للفرقة الثانية فقط)
              </span>
            </div>
            <div className="relative">
              <select
                value={academicYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAcademicYear(val);
                  if (val !== 2) {
                    setErrorMessage('عذراً، هذا النظام مخصص لطلاب الفرقة الثانية فقط حالياً.');
                  } else {
                    setErrorMessage(null);
                  }
                }}
                className={`w-full bg-[#0B1020] border ${
                  isInvalidYear ? 'border-red-500' : 'border-[#2B3B5C] focus:border-[#52D6A6]'
                } text-white rounded-xl px-3.5 py-2.5 text-xs outline-none transition cursor-pointer`}
              >
                <option value={2}>الفرقة الثانية (2) - متاح</option>
                <option value={1}>الفرقة الأولى (1) - غير متاح</option>
                <option value={3}>الفرقة الثالثة (3) - غير متاح</option>
                <option value={4}>الفرقة الرابعة (4) - غير متاح</option>
              </select>
            </div>

            {isInvalidYear && (
              <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/40 rounded-xl flex items-center gap-2 text-[11px] text-red-400 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  نعتذر، التسجيل مقصور حالياً على طلاب الفرقة الثانية لتوافق المقررات وتوزيع المحاضرات.
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#DEEBFF] font-semibold mb-1">كلمة المرور *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 أحرف أو أرقام على الأقل"
                className="w-full bg-[#0B1020] border border-[#2B3B5C] focus:border-[#52D6A6] rounded-xl pl-10 pr-3.5 py-2.5 text-white outline-none text-left transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3 text-[#9BB0D6] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isInvalidYear || isGoogleLoading}
            className={`w-full py-3.5 font-bold text-sm rounded-xl transition shadow-lg mt-3 flex items-center justify-center gap-2 ${
              isInvalidYear
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                : 'bg-[#52D6A6] hover:bg-[#23B780] text-[#0B1020] cursor-pointer'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isLoading ? 'جاري التسجيل...' : 'إنشاء الحساب'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-[#9BB0D6] pt-1">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={onGoToLogin}
            className="text-[#FFC76A] font-bold hover:underline cursor-pointer"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>

      {/* Google Real Onboarding Modal */}
      <GoogleAuthModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        googleUser={onboardingGoogleUser}
      />
    </div>
  );
};
