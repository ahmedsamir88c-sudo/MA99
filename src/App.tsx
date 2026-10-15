import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { QuizSetupScreen } from './components/QuizSetupScreen';
import { QuizScreen } from './components/QuizScreen';
import { SubjectsScreen } from './components/SubjectsScreen';
import { AIChatScreen } from './components/AIChatScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { OwnerDashboardScreen } from './components/OwnerDashboardScreen';
import { OwnerManagementScreen } from './components/OwnerManagementScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { NotificationsModal } from './components/NotificationsModal';
import { PreferencesModal } from './components/PreferencesModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { QuizQuestion } from './types';
import {
  FileQuestion,
  BookOpen,
  Sparkles,
  BarChart3,
  User,
  ShieldCheck,
  X,
  Settings,
  Bell,
  LogOut,
  BadgeCheck,
} from 'lucide-react';

export default function App() {
  const { currentUser, logout, dailyChallenge } = useApp();

  // Navigation tab state:
  // 0 = مسابقات (Quiz / Competitions)
  // 1 = المواد (Subjects / Lectures & Slides)
  // 2 = Ai (AI Study Assistant)
  // 3 = المتصدرون (Leaderboard)
  // 4 = حسابي (Profile)
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [isAuthSignUp, setIsAuthSignUp] = useState<boolean>(false);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<{
    quiz_id: string;
    questions: QuizQuestion[];
    subject: string;
    lecture: number;
    isDailyChallenge?: boolean;
  } | null>(null);

  // Owner View mode
  const [ownerMode, setOwnerMode] = useState<'dashboard' | 'management' | 'student_preview'>('student_preview');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);

  // If not logged in, show Auth screens
  if (!currentUser) {
    if (isAuthSignUp) {
      return <SignUpScreen onGoToLogin={() => setIsAuthSignUp(false)} />;
    }
    return <LoginScreen onGoToSignUp={() => setIsAuthSignUp(true)} />;
  }

  // Handle starting daily challenge
  const handleStartDailyChallenge = () => {
    if (dailyChallenge.quiz) {
      setActiveQuiz({
        ...dailyChallenge.quiz,
        subject: dailyChallenge.subject,
        lecture: dailyChallenge.lecture,
        isDailyChallenge: true,
      });
      setCurrentTab(0);
    }
  };

  // If logged in as Owner and chose full Owner dashboard
  if (currentUser.role === 'owner' && ownerMode === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#0C1222] text-[#F3F7FF] flex flex-col max-w-xl mx-auto shadow-2xl">
        <div className="bg-[#131C31] border-b border-[#1E2B47] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="w-5 h-5 text-[#52D6A6]" />
            <span>لوحة تحكم المنصة (Owner)</span>
          </div>
          <button
            onClick={() => setOwnerMode('student_preview')}
            className="text-xs bg-[#52D6A6] text-[#0B1020] px-3 py-1.5 rounded-lg font-bold hover:bg-[#34c791] transition cursor-pointer"
          >
            معاينة واجهة الطالب
          </button>
        </div>
        <main className="flex-1 pb-16">
          <OwnerDashboardScreen
            onOpenManagement={() => setOwnerMode('management')}
            onOpenStudentView={() => setOwnerMode('student_preview')}
          />
        </main>
      </div>
    );
  }

  if (currentUser.role === 'owner' && ownerMode === 'management') {
    return (
      <div className="min-h-screen bg-[#0C1222] text-[#F3F7FF] flex flex-col max-w-xl mx-auto shadow-2xl">
        <OwnerManagementScreen onBack={() => setOwnerMode('dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C1222] text-[#F3F7FF] flex flex-col justify-between selection:bg-[#52D6A6]/30">
      <div className="w-full max-w-[440px] mx-auto min-h-screen bg-[#0C1222] flex flex-col relative shadow-2xl border-x border-[#1E2B47]/40">
        
        {/* Owner Preview Banner */}
        {currentUser.role === 'owner' && (
          <div className="bg-[#173A2E] border-b border-[#52D6A6]/30 px-3 py-1.5 flex items-center justify-between text-[11px] text-[#52D6A6] z-20">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>وضع معاينة الطالب (حساب المدير)</span>
            </span>
            <button
              onClick={() => setOwnerMode('dashboard')}
              className="px-2.5 py-0.5 bg-[#52D6A6] text-[#0B1020] rounded-md font-bold text-[10px] cursor-pointer"
            >
              لوحة التحكم
            </button>
          </div>
        )}

        {/* Top MA99 App Header Bar (shows app icon, name MA99, and install button) */}
        {!activeQuiz && currentTab !== 2 && (
          <header className="sticky top-0 z-20 bg-[#0C1222]/95 backdrop-blur-md border-b border-[#1E2B47] px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#52D6A6]/40 shadow-sm">
                <img
                  src="/icon-192.png"
                  alt="MA99 Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-base tracking-tight leading-none">MA99</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#52D6A6]/20 text-[#52D6A6] border border-[#52D6A6]/30">
                    منصة التعلم
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PWAInstallButton compact={true} />
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${currentTab === 2 ? 'pb-16 overflow-hidden' : 'pb-24 overflow-y-auto'}`}>
          {activeQuiz ? (
            <QuizScreen
              quizData={activeQuiz}
              onClose={() => setActiveQuiz(null)}
              onNewQuiz={() => setActiveQuiz(null)}
              isDailyChallenge={activeQuiz.isDailyChallenge}
            />
          ) : (
            <>
              {/* Tab 0: مسابقات */}
              {currentTab === 0 && (
                <QuizSetupScreen onStartQuiz={(data) => setActiveQuiz(data)} />
              )}

              {/* Tab 1: المواد */}
              {currentTab === 1 && (
                <SubjectsScreen
                  onStartLectureQuiz={(quizData) => {
                    setActiveQuiz(quizData);
                  }}
                  onAskAIAboutLecture={(_subject, _lecture) => {
                    setCurrentTab(2);
                  }}
                />
              )}

              {/* Tab 2: Ai */}
              {currentTab === 2 && <AIChatScreen />}

              {/* Tab 3: المتصدرون */}
              {currentTab === 3 && (
                <LeaderboardScreen onStartQuizTab={() => setCurrentTab(0)} />
              )}

              {/* Tab 4: حسابي */}
              {currentTab === 4 && (
                <ProfileScreen
                  onStartDailyChallenge={handleStartDailyChallenge}
                  onOpenDrawer={() => setIsDrawerOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Bar (The 5 requested tabs in exact order: مسابقات، المواد، Ai، المتصدرون، حسابي) */}
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
          <div className="max-w-[440px] mx-auto pointer-events-auto bg-[#0C1222]/95 backdrop-blur-md border-t border-[#1E2B47] px-1 pt-2 pb-1">
            <nav className="flex items-center justify-between">
              {/* Tab 0: مسابقات */}
              <button
                type="button"
                onClick={() => {
                  setActiveQuiz(null);
                  setCurrentTab(0);
                }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1 px-1 transition cursor-pointer ${
                  currentTab === 0 && !activeQuiz
                    ? 'text-[#52D6A6]'
                    : 'text-[#7C93C0] hover:text-[#DEEBFF]'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition ${
                    currentTab === 0 && !activeQuiz ? 'bg-[#15392D]' : ''
                  }`}
                >
                  <FileQuestion className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">مسابقات</span>
              </button>

              {/* Tab 1: المواد */}
              <button
                type="button"
                onClick={() => {
                  setActiveQuiz(null);
                  setCurrentTab(1);
                }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1 px-1 transition cursor-pointer ${
                  currentTab === 1
                    ? 'text-[#52D6A6]'
                    : 'text-[#7C93C0] hover:text-[#DEEBFF]'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition ${
                    currentTab === 1 ? 'bg-[#15392D]' : ''
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">المواد</span>
              </button>

              {/* Tab 2: Ai */}
              <button
                type="button"
                onClick={() => {
                  setActiveQuiz(null);
                  setCurrentTab(2);
                }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1 px-1 transition cursor-pointer ${
                  currentTab === 2
                    ? 'text-[#52D6A6]'
                    : 'text-[#7C93C0] hover:text-[#DEEBFF]'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition ${
                    currentTab === 2 ? 'bg-[#15392D]' : ''
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Ai</span>
              </button>

              {/* Tab 3: المتصدرون */}
              <button
                type="button"
                onClick={() => {
                  setActiveQuiz(null);
                  setCurrentTab(3);
                }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1 px-1 transition cursor-pointer ${
                  currentTab === 3
                    ? 'text-[#52D6A6]'
                    : 'text-[#7C93C0] hover:text-[#DEEBFF]'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition ${
                    currentTab === 3 ? 'bg-[#15392D]' : ''
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">المتصدرون</span>
              </button>

              {/* Tab 4: حسابي */}
              <button
                type="button"
                onClick={() => {
                  setActiveQuiz(null);
                  setCurrentTab(4);
                }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1 px-1 transition cursor-pointer ${
                  currentTab === 4
                    ? 'text-[#52D6A6]'
                    : 'text-[#7C93C0] hover:text-[#DEEBFF]'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition ${
                    currentTab === 4 ? 'bg-[#15392D]' : ''
                  }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">حسابي</span>
              </button>
            </nav>

            <div className="w-32 h-1 bg-white/60 rounded-full mx-auto mt-2 mb-1" />
          </div>
        </div>

        {/* Side Drawer */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-72 bg-[#131C31] border-l border-[#1E2B47] p-5 flex flex-col justify-between shadow-2xl h-full ml-auto animate-in slide-in-from-right duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1E2B47]">
                  <span className="font-bold text-white text-sm">القائمة والخيارات</span>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 text-[#7C93C0] hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Info Card */}
                <div className="p-3 bg-[#0C1322] border border-[#1E2B47] rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#173A2E] border border-[#52D6A6]/40 text-[#52D6A6] font-bold flex items-center justify-center overflow-hidden text-sm flex-shrink-0">
                    {currentUser.profile_image ? (
                      <img src={currentUser.profile_image} alt={currentUser.username} className="w-full h-full object-cover" />
                    ) : (
                      (currentUser.full_name || currentUser.username)[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-xs font-bold text-white truncate">
                      {currentUser.full_name || currentUser.username}
                    </div>
                    <div className="text-[10px] text-[#7C93C0] truncate">
                      @{currentUser.username} • {currentUser.role === 'owner' ? 'المدير' : 'طالب'}
                    </div>
                  </div>
                </div>

                {/* Owner Dashboard link if owner */}
                {currentUser.role === 'owner' && (
                  <button
                    onClick={() => {
                      setOwnerMode('dashboard');
                      setIsDrawerOpen(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#52D6A6] text-[#0B1020] font-bold text-xs flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>لوحة تحكم المدير</span>
                  </button>
                )}

                {/* Preferences & Notifications */}
                <div className="pt-3 border-t border-[#1E2B47] space-y-1.5">
                  <button
                    onClick={() => {
                      setIsPreferencesOpen(true);
                      setIsDrawerOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#0C1322] text-[#DEEBFF] hover:text-white text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#7C93C0]" />
                    <span>إعدادات الدراسة</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(true);
                      setIsDrawerOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#0C1322] text-[#DEEBFF] hover:text-white text-xs flex items-center gap-2 transition cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-[#7C93C0]" />
                    <span>التنبيهات والإشعارات</span>
                  </button>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  setIsDrawerOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2A171D] border border-[#EF4444]/40 text-[#EF4444] font-bold text-xs flex items-center justify-center gap-2 transition hover:bg-[#EF4444] hover:text-white cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
        <PreferencesModal
          isOpen={isPreferencesOpen}
          onClose={() => setIsPreferencesOpen(false)}
        />
      </div>
    </div>
  );
}
