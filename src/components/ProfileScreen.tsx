import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Camera,
  RotateCw,
  GraduationCap,
  Flame,
  Zap,
  Calendar,
  Trophy,
  Award,
  Scan,
  Menu,
  Check,
  Save,
  ChevronDown,
  LogOut,
  BadgeCheck,
  Lock,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface ProfileScreenProps {
  onStartDailyChallenge: () => void;
  onOpenDrawer?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onStartDailyChallenge,
  onOpenDrawer,
}) => {
  const { currentUser, updateProfile, updateProfileImage, dailyChallenge, attemptHistory, logout } = useApp();
  const [username, setUsername] = useState(currentUser?.username || 'user');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30 يوم');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!currentUser) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    updateProfile({ username: username.trim() });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProfileImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const totalQuestions = attemptHistory.reduce((acc, c) => acc + c.total_questions, 0);
  const totalCorrect = attemptHistory.reduce((acc, c) => acc + c.score, 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalQuizzes = attemptHistory.length;
  const initialLetter = (currentUser.full_name || currentUser.username || 'U')[0].toUpperCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-3 space-y-4 animate-in fade-in duration-300 pb-20 relative">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#52D6A6]" />
          <h1 className="text-base font-bold text-white">الملف الشخصي والأكاديمي</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            className="text-[#7C93C0] hover:text-white transition p-1.5 rounded-lg hover:bg-[#1E2B47] cursor-pointer"
            title="تحديث البيانات"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#52D6A6]' : ''}`} />
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition p-1.5 rounded-lg cursor-pointer flex items-center gap-1"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Avatar & Info */}
      <div className="flex flex-col items-center justify-center pt-2 pb-1 text-center">
        <div className="w-24 h-24 rounded-full bg-[#173A2E] border-2 border-[#52D6A6]/40 flex items-center justify-center text-[#52D6A6] text-4xl font-extrabold shadow-lg overflow-hidden">
          {currentUser.profile_image ? (
            <img
              src={currentUser.profile_image}
              alt={currentUser.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initialLetter}</span>
          )}
        </div>

        <label
          htmlFor="profile-photo-input"
          className="mt-3 flex items-center gap-1.5 text-xs text-[#52D6A6] hover:underline cursor-pointer font-medium"
        >
          <Camera className="w-4 h-4" />
          <span>تغيير الصورة الشخصية</span>
          <input
            id="profile-photo-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </label>

        <h2 className="text-lg font-bold text-white mt-2">{currentUser.full_name || currentUser.username}</h2>
        <p className="text-xs text-[#7C93C0] mt-0.5">@{currentUser.username} • ID: {currentUser.university_id}</p>

        {/* Auth Provider Pill */}
        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-0.5 rounded-full bg-[#173A2E] border border-[#52D6A6]/50 text-xs text-[#52D6A6] font-semibold">
            {currentUser.role === 'owner' ? 'المدير الأكاديمي' : 'طالب جامعي مقيد'}
          </span>
          {currentUser.auth_provider === 'google' && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-[11px] text-blue-400 font-bold flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Google موثق</span>
            </span>
          )}
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <GraduationCap className="w-5 h-5 text-[#52D6A6] mb-1" />
          <span className="text-[11px] text-[#7C93C0]">الفرقة</span>
          <span className="text-xs font-bold text-white mt-0.5">الثانية</span>
        </div>

        <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <Flame className="w-5 h-5 text-[#FFC76A] mb-1" />
          <span className="text-[11px] text-[#7C93C0]">الحماس</span>
          <span className="text-xs font-bold text-[#FFC76A] mt-0.5">{currentUser.streak || 0} أيام</span>
        </div>

        <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <Zap className="w-5 h-5 text-[#60A5FA] mb-1" />
          <span className="text-[11px] text-[#7C93C0]">النقاط</span>
          <span className="text-xs font-bold text-white mt-0.5">{currentUser.xp || 0} XP</span>
        </div>
      </div>

      {/* Daily Challenge Card */}
      <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#52D6A6]" />
            <h3 className="font-bold text-white text-sm">التحدي اليومي</h3>
          </div>
          <button
            onClick={handleRefresh}
            className="text-[#7C93C0] hover:text-white transition cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#52D6A6]' : ''}`} />
          </button>
        </div>
        <div className="bg-[#0C1322] border border-[#1E2B47] rounded-xl p-3.5 flex flex-col items-center justify-center text-center space-y-2">
          {dailyChallenge.completed ? (
            <div className="text-xs text-[#52D6A6] font-bold">
              تم إكمال التحدي اليوم بنجاح (+{dailyChallenge.bonus_xp} XP)
            </div>
          ) : (
            <>
              <span className="text-xs font-semibold text-white">
                {dailyChallenge.subject || 'Computer Architecture'} - المحاضرة {dailyChallenge.lecture || 2}
              </span>
              <span className="text-[11px] text-[#7C93C0]">
                5 أسئلة من المنهج • مكافأة حماس +25 XP
              </span>
              <button
                type="button"
                onClick={onStartDailyChallenge}
                className="mt-1 py-2 px-4 bg-[#52D6A6] text-[#0B1020] text-xs font-bold rounded-xl transition hover:bg-[#34c791] flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>بدء التحدي اليومي الآن (+25 XP)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Reports Section Header */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="font-bold text-white text-sm">تقارير التقدم الأكاديمي</h3>
        {totalQuestions >= 100 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-1 text-xs text-white bg-[#131C31] border border-[#1E2B47] px-3 py-1 rounded-lg cursor-pointer"
            >
              <span>{selectedPeriod}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#7C93C0]" />
            </button>
            {showPeriodMenu && (
              <div className="absolute left-0 mt-1 z-30 bg-[#131C31] border border-[#1E2B47] rounded-lg shadow-xl py-1 text-xs text-white min-w-[100px]">
                {['7 أيام', '30 يوم', 'فصل دراسي'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPeriod(p);
                      setShowPeriodMenu(false);
                    }}
                    className="w-full text-right px-3 py-1.5 hover:bg-[#1E2B47] transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reports Display: Locked until 100 questions are solved */}
      {totalQuestions < 100 ? (
        <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2640] border border-[#2B3B5C] flex items-center justify-center text-[#FFC76A] flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">التقارير والإحصائيات مقفلة حالياً</h4>
              <p className="text-xs text-[#7C93C0] mt-0.5">
                يلزم حل 100 سؤال على الأقل في المسابقات لبدء إنشاء التقارير وتحليل الأداء ومعدل الدقة.
              </p>
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#DEEBFF]">التقدم نحو فتح التقارير:</span>
              <span className="text-[#52D6A6]">{totalQuestions} / 100 سؤال ({Math.min(100, totalQuestions)}%)</span>
            </div>
            <div className="w-full bg-[#0C1322] border border-[#1E2B47] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#52D6A6] h-full transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, (totalQuestions / 100) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-[#7C93C0] text-left">متبقي {Math.max(0, 100 - totalQuestions)} سؤالاً للفتح</p>
          </div>
        </div>
      ) : (
        /* 4 Stats Grid Box unlocked */
        <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-4 grid grid-cols-2 gap-y-4 gap-x-2 text-center animate-in fade-in">
          <div>
            <div className="text-xl font-black text-[#52D6A6]">{totalCorrect}</div>
            <div className="text-[11px] text-[#7C93C0] mt-0.5">إجابة صحيحة</div>
          </div>
          <div>
            <div className="text-xl font-black text-[#52D6A6]">{totalQuestions}</div>
            <div className="text-[11px] text-[#7C93C0] mt-0.5">إجمالي الأسئلة</div>
          </div>
          <div>
            <div className="text-xl font-black text-[#52D6A6]">{totalQuizzes}</div>
            <div className="text-[11px] text-[#7C93C0] mt-0.5">اختبار مكتمل</div>
          </div>
          <div>
            <div className="text-xl font-black text-[#52D6A6]">{accuracy}%</div>
            <div className="text-[11px] text-[#7C93C0] mt-0.5">نسبة الدقة العامة</div>
          </div>
        </div>
      )}

      {/* Edit Account Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-[#52D6A6] rounded-full" />
          <h3 className="font-bold text-white text-sm">تعديل بيانات الحساب</h3>
        </div>
        <form onSubmit={handleSave} className="space-y-2">
          <label className="block text-xs text-[#7C93C0]">اسم المستخدم</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم المستخدم"
              className="w-full bg-[#0C1322] border border-[#52D6A6] rounded-xl pr-10 pl-4 py-3 text-sm text-white outline-none"
            />
            <span className="absolute right-3.5 top-3.5 text-[#52D6A6] text-sm font-bold">@</span>
          </div>
          <button
            type="submit"
            className="w-full mt-2 py-3 bg-[#52D6A6] hover:bg-[#34c791] text-[#0B1020] font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'تم الحفظ بنجاح!' : 'حفظ التعديلات'}</span>
          </button>
        </form>
      </div>

      {/* App Install Card */}
      <div className="pt-1">
        <PWAInstallButton />
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>تسجيل الخروج من الحساب</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-5 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">تأكيد تسجيل الخروج</h3>
              <p className="text-xs text-[#7C93C0]">
                هل أنت متأكد من رغبتك في تسجيل الخروج من حساب{' '}
                <span className="text-white font-semibold">@{currentUser.username}</span>؟
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-4 bg-[#1E2B47] hover:bg-[#2A3C63] text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="py-2.5 px-4 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-red-500/25 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>نعم، خروج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {onOpenDrawer && (
        <button
          type="button"
          onClick={onOpenDrawer}
          className="fixed bottom-24 left-6 z-40 w-12 h-12 rounded-full bg-white text-[#0B1020] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
          title="القائمة السريعة"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
