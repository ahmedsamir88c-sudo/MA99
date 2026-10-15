import React, { useState } from 'react';
import { useApp, GoogleAuthPayload } from '../context/AppContext';
import { GraduationCap, Eye, EyeOff, AlertCircle, BadgeCheck, Loader2 } from 'lucide-react';
import { GoogleAuthModal } from './GoogleAuthModal';
import { PWAInstallButton } from './PWAInstallButton';

interface LoginScreenProps {
  onGoToSignUp: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onGoToSignUp }) => {
  const { login, signInWithGoogleReal } = useApp();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Google Onboarding Modal state
  const [onboardingGoogleUser, setOnboardingGoogleUser] = useState<GoogleAuthPayload | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Real Google Sign In trigger
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    const res = await signInWithGoogleReal();
    setIsGoogleLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'تعذر تسجيل الدخول بحساب Google.');
      return;
    }

    if (res.needsOnboarding && res.googleUser) {
      setOnboardingGoogleUser(res.googleUser);
      setIsOnboardingOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const res = await login(studentId.trim(), password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'بيانات الدخول غير صحيحة.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141C2E] border border-[#2B3B5C] rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in duration-300 space-y-6">
        {/* App Logo & Title */}
        <div className="text-center space-y-2">
          <div className="relative mx-auto w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-[#52D6A6] to-[#3B82F6] shadow-xl">
            <img
              src="/icon-192.png"
              alt="MA99 Icon"
              className="w-full h-full rounded-xl object-cover shadow-inner"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">MA99</h1>
          <p className="text-xs text-[#9BB0D6]">المنصة الأكاديمية والتحديات الهندسية والذكاء الاصطناعي</p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-[#3C1F2B] border border-[#FF7E86]/50 rounded-xl flex items-center gap-2.5 text-xs text-[#FF7E86] animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Real Google Sign-In Button */}
        <div>
          <button
            type="button"
            disabled={isGoogleLoading || isLoading}
            onClick={handleGoogleSignIn}
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
              {isGoogleLoading ? 'جاري فتح نافذة Google الرسمية...' : 'تسجيل الدخول عبر Google (حقيقي)'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2B3B5C]" />
          <span className="text-[11px] text-[#7C93C0] font-medium">أو باستخدام كود الطالب</span>
          <div className="flex-1 h-px bg-[#2B3B5C]" />
        </div>

        {/* Local Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#DEEBFF] font-semibold mb-1.5">
              كود الطالب الجامعي (ID) أو اسم المستخدم
            </label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="أدخل ID أو اسم المستخدم"
                className="w-full bg-[#0B1020] border border-[#2B3B5C] focus:border-[#52D6A6] rounded-xl pl-10 pr-3.5 py-3 text-white outline-none text-left transition text-sm"
              />
              <BadgeCheck className="w-4 h-4 text-[#9BB0D6] absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[#DEEBFF] font-semibold mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full bg-[#0B1020] border border-[#2B3B5C] focus:border-[#52D6A6] rounded-xl pl-10 pr-3.5 py-3 text-white outline-none text-left transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3.5 top-3.5 text-[#9BB0D6] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3.5 bg-[#52D6A6] hover:bg-[#23B780] text-[#0B1020] font-bold text-sm rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
          </button>
        </form>

        {/* Install App Prompt */}
        <div className="pt-2">
          <PWAInstallButton />
        </div>

        {/* Switch to Sign Up */}
        <div className="text-center text-xs text-[#9BB0D6] pt-1">
          ليس لديك حساب بعد؟{' '}
          <button
            onClick={onGoToSignUp}
            className="text-[#FFC76A] font-bold hover:underline cursor-pointer"
          >
            إنشاء حساب طالب جديد
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
