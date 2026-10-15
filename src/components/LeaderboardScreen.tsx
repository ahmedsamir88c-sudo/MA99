import React from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Medal, Award, User, Play, Star } from 'lucide-react';

interface LeaderboardScreenProps {
  onStartQuizTab: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onStartQuizTab }) => {
  const { users } = useApp();

  const rankedStudents = [...users]
    .filter((u) => u.role === 'student' && u.is_active && u.xp > 0)
    .sort((a, b) => b.xp - a.xp);

  const first = rankedStudents[0];
  const second = rankedStudents[1];
  const third = rankedStudents[2];

  return (
    <div className="max-w-xl mx-auto px-4 py-3 space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center gap-2 pt-1 pb-2">
        <Trophy className="w-5 h-5 text-[#60A5FA]" />
        <div>
          <h1 className="text-base font-bold text-white leading-tight">لوحة الشرف والمتصدرين</h1>
          <p className="text-xs text-[#FFC76A]">أبطال الفرقة الثانية الأكثر حماساً ونقاطاً</p>
        </div>
      </div>

      {/* Olympic Podium */}
      <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-5 shadow-sm space-y-6">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-white">
          <div className="w-4 h-4 rounded-full bg-[#3B82F6] flex items-center justify-center text-white">
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>
          <span>المراكز الثلاثة الأولى</span>
        </div>

        {/* 3 Pedestals Columns */}
        <div className="flex items-end justify-center gap-3 pt-2">
          {/* Rank 2 (Left) */}
          <div className="flex-1 max-w-[110px] flex flex-col items-center">
            <div className="w-5 h-5 text-[#60A5FA] mb-1">
              <Award className="w-5 h-5" />
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1E2B47] border border-[#2B3B5C] flex items-center justify-center text-[#7C93C0] mb-2 shadow-sm overflow-hidden">
              {second?.profile_image ? (
                <img src={second.profile_image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <span className="text-xs font-semibold text-white truncate max-w-[90px]">
              {second ? second.full_name || second.username : 'شاغر'}
            </span>
            <span className="text-[11px] text-[#7C93C0] mt-0.5">
              {second ? second.xp : 0} XP
            </span>
            <div className="w-full h-32 bg-[#0C1322] border border-[#1E2B47] rounded-t-2xl mt-3 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">#2</span>
              <span className="text-[11px] text-[#7C93C0] mt-0.5">
                {second ? 'المركز الثاني' : 'شاغر'}
              </span>
            </div>
          </div>

          {/* Rank 1 (Center) */}
          <div className="flex-1 max-w-[120px] flex flex-col items-center">
            <div className="w-6 h-6 text-[#60A5FA] mb-1">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="w-14 h-14 rounded-full bg-[#1E2B47] border border-[#2B3B5C] flex items-center justify-center text-[#7C93C0] mb-2 shadow-md overflow-hidden">
              {first?.profile_image ? (
                <img src={first.profile_image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[100px]">
              {first ? first.full_name || first.username : 'شاغر'}
            </span>
            <span className="text-[11px] text-[#7C93C0] mt-0.5">
              {first ? first.xp : 0} XP
            </span>
            <div className="w-full h-44 bg-[#0C1322] border border-[#1E2B47] rounded-t-2xl mt-3 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">#1</span>
              <span className="text-[11px] text-[#7C93C0] mt-0.5">
                {first ? 'المركز الأول' : 'شاغر'}
              </span>
            </div>
          </div>

          {/* Rank 3 (Right) */}
          <div className="flex-1 max-w-[110px] flex flex-col items-center">
            <div className="w-5 h-5 text-[#FFC76A] mb-1">
              <Medal className="w-5 h-5" />
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1E2B47] border border-[#2B3B5C] flex items-center justify-center text-[#7C93C0] mb-2 shadow-sm overflow-hidden">
              {third?.profile_image ? (
                <img src={third.profile_image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <span className="text-xs font-semibold text-white truncate max-w-[90px]">
              {third ? third.full_name || third.username : 'شاغر'}
            </span>
            <span className="text-[11px] text-[#7C93C0] mt-0.5">
              {third ? third.xp : 0} XP
            </span>
            <div className="w-full h-24 bg-[#0C1322] border border-[#1E2B47] rounded-t-2xl mt-3 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">#3</span>
              <span className="text-[11px] text-[#FFC76A]/90 mt-0.5">
                {third ? 'المركز الثالث' : 'شاغر'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Card */}
      <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#1E2B47] flex items-center justify-center text-[#60A5FA]">
          <Award className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            {rankedStudents.length === 0 ? 'ابدأ وكن أول من يعتلي القمة!' : 'نافس زملاءك وارتقِ في الترتيب!'}
          </h3>
          <p className="text-xs text-[#DEEBFF] font-medium">كل إجابة صحيحة تمنحك +1 XP، والتحدي اليومي يمنحك +25 XP!</p>
          <p className="text-xs text-[#7C93C0]">كلما أنجزت اختبارات أكثر ارتفعت نقاطك في لوحة الشرف.</p>
        </div>
        <button
          type="button"
          onClick={onStartQuizTab}
          className="mt-2 w-full sm:w-auto px-8 py-3 bg-[#52D6A6] hover:bg-[#34c791] text-[#0B1020] font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#52D6A6]/10 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>ابدأ اختباراً جديداً</span>
        </button>
      </div>

      {/* Ranks 4+ */}
      {rankedStudents.length > 3 && (
        <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-[#7C93C0] mb-2">باقي المتصدرين:</h4>
          {rankedStudents.slice(3, 10).map((student, idx) => (
            <div
              key={student.uid}
              className="flex items-center justify-between p-2.5 bg-[#0C1322] border border-[#1E2B47] rounded-xl text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#1E2B47] text-white font-bold flex items-center justify-center text-[10px]">
                  #{idx + 4}
                </span>
                <span className="text-white font-medium">{student.full_name || student.username}</span>
              </div>
              <span className="text-[#52D6A6] font-bold">{student.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
