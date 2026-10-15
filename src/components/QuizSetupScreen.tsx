import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QuizQuestion } from '../types';
import {
  Trophy,
  BookOpen,
  CheckCircle2,
  Play,
  ChevronDown,
  FileQuestion,
  Smile,
  Meh,
  Frown,
  Gauge,
  BookMarked,
} from 'lucide-react';

interface QuizSetupScreenProps {
  onStartQuiz: (quizData: {
    quiz_id: string;
    questions: QuizQuestion[];
    subject: string;
    lecture: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }) => void;
  initialSubject?: string;
  isDailyChallenge?: boolean;
}

export const QuizSetupScreen: React.FC<QuizSetupScreenProps> = ({
  onStartQuiz,
  initialSubject,
  isDailyChallenge = false,
}) => {
  const { createQuiz } = useApp();

  const SUBJECTS_LIST = [
    'Digital Logic Design',
    'Machine Learning',
    'Computer Networks',
    'Modeling and Simulation',
    'Computer Architecture',
    'Data Structure and Algorithms',
  ];

  const QUESTION_COUNTS = [10, 20, 25, 30, 35, 40, 50];

  const [selectedSubject, setSelectedSubject] = useState<string>(
    initialSubject || 'Digital Logic Design'
  );
  const [selectedLecture, setSelectedLecture] = useState<number>(2);
  const [selectedCount, setSelectedCount] = useState<number>(25);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | null>('medium');

  const [openDropdown, setOpenDropdown] = useState<'subject' | 'lecture' | 'count' | 'difficulty' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const difficultyDetails = {
    easy: {
      label: 'مستوى سهل (1 نقطة / سؤال)',
      fullText: 'سهل (أسئلة مباشرة)',
      points: 1,
      badgeText: '+1 نقطة / سؤال',
      icon: Smile,
      color: 'text-[#52D6A6]',
      bg: 'bg-[#52D6A6]/10',
    },
    medium: {
      label: 'مستوى متوسط (2 نقطة / سؤال)',
      fullText: 'متوسط (أسئلة فهم وتركيب)',
      points: 2,
      badgeText: '+2 نقطة / سؤال',
      icon: Meh,
      color: 'text-[#60A5FA]',
      bg: 'bg-[#60A5FA]/10',
    },
    hard: {
      label: 'مستوى متقدم (3 نقاط / سؤال)',
      fullText: 'صعب (مسائل وتحليل عميق)',
      points: 3,
      badgeText: '+3 نقاط / سؤال',
      icon: Frown,
      color: 'text-[#F87171]',
      bg: 'bg-[#F87171]/10',
    },
  };

  const handleStart = () => {
    const diff = selectedDifficulty || 'medium';
    const quiz = createQuiz(selectedSubject, selectedLecture, selectedCount, diff, isDailyChallenge);
    if (quiz) {
      onStartQuiz({
        ...quiz,
        subject: selectedSubject,
        lecture: selectedLecture,
        difficulty: diff,
      });
    }
  };

  return (
    <div ref={containerRef} className="max-w-xl mx-auto px-4 py-3 space-y-4 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex items-center gap-2 pt-1 pb-2">
        <div className="w-8 h-8 rounded-lg border border-[#52D6A6] flex items-center justify-center text-[#52D6A6]">
          <FileQuestion className="w-4 h-4" />
        </div>
        <h1 className="text-lg font-bold text-white">إعداد الاختبار الأكاديمي</h1>
      </div>

      {/* Hero Banner Card */}
      <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#173A2E] border border-[#52D6A6]/30 flex items-center justify-center text-[#52D6A6] flex-shrink-0">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white leading-tight">ابدأ تحدياً جديداً الآن!</h2>
          <p className="text-xs text-[#7C93C0] mt-1">اختر المادة والمحاضرة وعدد الأسئلة واختبر مدى جاهزيتك للاختبارات</p>
        </div>
      </div>

      {/* Step 1: Choose Subject */}
      <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-4 space-y-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-[#52D6A6] text-[#52D6A6] text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-white text-sm">المادة الدراسية</h3>
          </div>
          <span className="text-[#EF4444] text-base leading-none">*</span>
        </div>

        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'subject' ? null : 'subject')}
          className="w-full bg-[#0C1322] border border-[#52D6A6] rounded-xl px-3.5 py-3 flex items-center justify-between text-xs sm:text-sm text-white cursor-pointer transition hover:border-[#52D6A6]"
        >
          <div className="flex items-center gap-2.5">
            <BookMarked className="w-4 h-4 text-[#52D6A6]" />
            <span className="font-medium">{selectedSubject}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#7C93C0] transition-transform duration-200 ${
              openDropdown === 'subject' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'subject' && (
          <div className="absolute top-[88px] left-4 right-4 z-40 bg-[#131C31] border border-[#1E2B47] rounded-xl shadow-2xl overflow-hidden py-1">
            {SUBJECTS_LIST.map((subjectName) => (
              <button
                key={subjectName}
                type="button"
                onClick={() => {
                  setSelectedSubject(subjectName);
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 text-xs sm:text-sm transition text-right cursor-pointer ${
                  selectedSubject === subjectName
                    ? 'bg-[#1E2B47] text-white font-bold'
                    : 'text-[#DEEBFF] hover:bg-[#1A2640]'
                }`}
              >
                <BookMarked className="w-4 h-4 text-[#52D6A6] flex-shrink-0" />
                <span className="flex-1">{subjectName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Choose Lecture */}
      <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-4 space-y-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-[#52D6A6] text-[#52D6A6] text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-white text-sm">المحاضرة</h3>
          </div>
          <span className="text-[#EF4444] text-base leading-none">*</span>
        </div>
        <p className="text-[11px] text-[#7C93C0] pr-8">
          اختر رقم المحاضرة: (من 1 إلى 16) لمادة {selectedSubject}
        </p>

        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'lecture' ? null : 'lecture')}
          className="w-full bg-[#0C1322] border border-[#52D6A6] rounded-xl px-3.5 py-3 flex items-center justify-between text-xs sm:text-sm text-white cursor-pointer transition hover:border-[#52D6A6]"
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#FFC76A]" />
            <span className="font-medium">المحاضرة ({selectedLecture})</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#7C93C0] transition-transform duration-200 ${
              openDropdown === 'lecture' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'lecture' && (
          <div className="absolute top-[108px] left-4 right-4 z-40 bg-[#131C31] border border-[#1E2B47] rounded-xl shadow-2xl max-h-60 overflow-y-auto py-1">
            {Array.from({ length: 16 }, (_, i) => i + 1).map((lec) => (
              <button
                key={lec}
                type="button"
                onClick={() => {
                  setSelectedLecture(lec);
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-xs sm:text-sm transition text-right cursor-pointer ${
                  selectedLecture === lec
                    ? 'bg-[#1E2B47] text-white font-bold'
                    : 'text-[#DEEBFF] hover:bg-[#1A2640]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#FFC76A] flex-shrink-0" />
                <span className="flex-1">المحاضرة ({lec})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Question Count */}
      <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-4 space-y-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-[#52D6A6] text-[#52D6A6] text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-white text-sm">عدد الأسئلة</h3>
          </div>
          <span className="text-[#EF4444] text-base leading-none">*</span>
        </div>

        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'count' ? null : 'count')}
          className="w-full bg-[#0C1322] border border-[#52D6A6] rounded-xl px-3.5 py-3 flex items-center justify-between text-xs sm:text-sm text-white cursor-pointer transition hover:border-[#52D6A6]"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#52D6A6]" />
            <span className="font-medium">{selectedCount} سؤالاً</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#7C93C0] transition-transform duration-200 ${
              openDropdown === 'count' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'count' && (
          <div className="absolute top-[88px] left-4 right-4 z-40 bg-[#131C31] border border-[#1E2B47] rounded-xl shadow-2xl max-h-60 overflow-y-auto py-1">
            {QUESTION_COUNTS.map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => {
                  setSelectedCount(cnt);
                  setOpenDropdown(null);
                }}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-xs sm:text-sm transition text-right cursor-pointer ${
                  selectedCount === cnt
                    ? 'bg-[#1E2B47] text-white font-bold'
                    : 'text-[#DEEBFF] hover:bg-[#1A2640]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#52D6A6] flex-shrink-0" />
                <span className="flex-1">{cnt} سؤالاً</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 4: Difficulty */}
      <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-4 space-y-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-[#52D6A6] text-[#52D6A6] text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-white text-sm">مستوى الصعوبة</h3>
          </div>
          <span className="text-[#EF4444] text-base leading-none">*</span>
        </div>

        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === 'difficulty' ? null : 'difficulty')}
          className="w-full bg-[#0C1322] border border-[#52D6A6] rounded-xl px-3.5 py-3 flex items-center justify-between text-xs sm:text-sm text-white cursor-pointer transition hover:border-[#52D6A6]"
        >
          {selectedDifficulty ? (
            <div className="flex items-center gap-2.5">
              {React.createElement(difficultyDetails[selectedDifficulty].icon, {
                className: `w-4 h-4 ${difficultyDetails[selectedDifficulty].color}`,
              })}
              <span className="font-medium text-white">
                {difficultyDetails[selectedDifficulty].fullText}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-[#7C93C0]">
              <Gauge className="w-4 h-4" />
              <span>اختر المستوى...</span>
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#7C93C0] transition-transform duration-200 ${
              openDropdown === 'difficulty' ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openDropdown === 'difficulty' && (
          <div className="absolute top-[88px] left-4 right-4 z-40 bg-[#131C31] border border-[#1E2B47] rounded-xl shadow-2xl overflow-hidden py-1">
            {(['easy', 'medium', 'hard'] as const).map((diffKey) => {
              const diff = difficultyDetails[diffKey];
              const DiffIcon = diff.icon;
              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => {
                    setSelectedDifficulty(diffKey);
                    setOpenDropdown(null);
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between text-xs sm:text-sm transition text-right cursor-pointer ${
                    selectedDifficulty === diffKey
                      ? 'bg-[#1E2B47] text-white font-bold'
                      : 'text-[#DEEBFF] hover:bg-[#1A2640]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DiffIcon className={`w-4 h-4 ${diff.color} flex-shrink-0`} />
                    <span>{diff.fullText}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${diff.bg} ${diff.color}`}>
                    {diff.badgeText}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Card */}
      {selectedDifficulty && (
        <div className="bg-[#131C31] border border-[#52D6A6]/40 rounded-2xl p-4 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-[#52D6A6]">
            <CheckCircle2 className="w-4 h-4" />
            <h4 className="font-bold text-sm">ملخص الاختبار المختار</h4>
          </div>
          <div className="divide-y divide-[#1E2B47] text-xs space-y-0">
            <div className="py-2 flex justify-between items-center">
              <span className="text-[#7C93C0]">المادة:</span>
              <span className="text-white font-semibold">{selectedSubject}</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-[#7C93C0]">المحاضرة:</span>
              <span className="text-white font-semibold">المحاضرة {selectedLecture}</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-[#7C93C0]">عدد الأسئلة:</span>
              <span className="text-white font-semibold">{selectedCount} سؤالاً</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-[#7C93C0]">المستوى:</span>
              <span className="text-white font-semibold">
                {difficultyDetails[selectedDifficulty].label}
              </span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-[#7C93C0]">النقاط المكتسبة المتوقعة:</span>
              <div className="text-left">
                <span className="text-[#52D6A6] font-bold text-sm block">
                  +{selectedCount * difficultyDetails[selectedDifficulty].points} XP
                </span>
                <span className="text-[10px] text-[#7C93C0]">
                  ({selectedCount} سؤالاً × {difficultyDetails[selectedDifficulty].points} {difficultyDetails[selectedDifficulty].points === 1 ? 'نقطة' : difficultyDetails[selectedDifficulty].points === 2 ? 'نقطتان' : 'نقاط'})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        type="button"
        onClick={handleStart}
        className="w-full py-3.5 bg-[#52D6A6] hover:bg-[#34c791] active:scale-[0.99] text-[#0B1020] font-bold text-sm sm:text-base rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#52D6A6]/10 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>ابدأ الاختبار الآن</span>
      </button>
    </div>
  );
};
