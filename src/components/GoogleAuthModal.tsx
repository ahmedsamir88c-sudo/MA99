import React, { useState } from 'react';
import { useApp, GoogleAuthPayload } from '../context/AppContext';
import {
  X,
  BadgeCheck,
  User,
  Camera,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mail,
  CheckCircle2,
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: GoogleAuthPayload | null;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  googleUser,
}) => {
  const { completeGoogleOnboarding } = useApp();

  const [universityId, setUniversityId] = useState<string>('');
  const [username, setUsername] = useState<string>(() => {
    if (!googleUser) return '';
    return (googleUser.displayName || googleUser.email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_|_$/g, '') || 'student';
  });
  const [profileImage, setProfileImage] = useState<string>(googleUser?.photoURL || '');
  const [academicYear, setAcademicYear] = useState<number>(2);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen || !googleUser) return null;

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

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universityId.trim()) {
      setErrorMessage('يرجى إدخال كود الطالب الجامعي (ID).');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('يرجى تحديد اسم المستخدم.');
      return;
    }
    if (Number(academicYear) !== 2) {
      setErrorMessage('التطبيق مخصص حصرياً لطلاب الفرقة الثانية (Year 2).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await completeGoogleOnboarding({
      googleUser,
      universityId: universityId.trim(),
      username: username.trim(),
      academicYear: 2,
      profileImage: profileImage || googleUser.photoURL,
    });

    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || 'حدث خطأ أثناء حفظ البيانات.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#141C2E] border border-[#2B3B5C] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-[#9BB0D6] hover:text-white p-1 rounded-lg hover:bg-[#1E2B47] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-1">
          {/* Google Logo */}
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-md">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">إكمال التسجيل عبر Google</h3>
          <p className="text-xs text-[#9BB0D6]">
            تم التحقق من حسابك في Google بنجاح. يرجى إدخال كود الطالب الجامعي لإكمال ربط ملفك الأكاديمي.
          </p>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-[#3C1F2B] border border-[#FF7E86]/50 rounded-xl flex items-center gap-2.5 text-xs text-[#FF7E86]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleComplete} className="space-y-4 text-xs">
          {/* Verified Google Account Badge */}
          <div className="p-3 bg-[#173A2E] border border-[#52D6A6]/50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-[#52D6A6]/40 flex items-center justify-center overflow-hidden">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#52D6A6] font-bold text-sm">
                    {(googleUser.displayName || googleUser.email)[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-xs">{googleUser.displayName}</div>
                <div className="text-[#9BB0D6] text-[11px] font-mono dir-ltr">{googleUser.email}</div>
              </div>
            </div>
            <div className="bg-[#52D6A6]/20 text-[#52D6A6] px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>موثّق</span>
            </div>
          </div>

          {/* University Student ID (Required) */}
          <div>
            <label className="block text-[#DEEBFF] font-semibold mb-1">
              كود الطالب الجامعي (University ID) *
            </label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                required
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                placeholder="مثال: 2024105"
                className="w-full bg-[#0B1020] border border-[#2B3B5C] focus:border-[#52D6A6] rounded-xl pl-10 pr-3.5 py-2.5 text-white outline-none text-left transition text-sm"
              />
              <BadgeCheck className="w-4 h-4 text-[#9BB0D6] absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[#DEEBFF] font-semibold mb-1">
              اسم المستخدم (Username) *
            </label>
            <div className="relative">
              <input
                type="text"
                dir="ltr"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: ahmed_samir"
                className="w-full bg-[#0B1020] border border-[#2B3B5C] focus:border-[#52D6A6] rounded-xl pl-10 pr-3.5 py-2.5 text-white outline-none text-left transition text-sm"
              />
              <User className="w-4 h-4 text-[#9BB0D6] absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Academic Year (Strictly Year 2) */}
          <div>
            <label className="block text-[#DEEBFF] font-semibold mb-1">
              الفرقة الدراسية
            </label>
            <div className="p-3 bg-[#0C1322] border border-[#52D6A6]/50 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#52D6A6]" />
                <span className="font-bold text-white text-xs">الفرقة الثانية (Year 2)</span>
              </div>
              <span className="text-[10px] bg-[#173A2E] text-[#52D6A6] px-2 py-0.5 rounded-full font-bold">
                حصري للمقررات الحالية
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#52D6A6] hover:bg-[#23B780] active:scale-[0.99] text-[#0B1020] font-bold text-sm rounded-xl transition shadow-lg shadow-[#52D6A6]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <span>جاري إتمام الربط...</span>
            ) : (
              <>
                <span>تأكيد الحساب والدخول للتطبيق</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
