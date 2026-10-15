import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AcademicMaterial, QuizQuestion } from '../types';
import {
  BookOpen,
  FileText,
  Upload,
  ArrowRight,
  ExternalLink,
  Download,
  AlertCircle,
  Plus,
  X,
  FileCheck,
  CheckCircle2,
  Lock,
  Cpu,
  Binary,
  GitBranch,
  Network,
  Brain,
  Activity,
  FileQuestion,
  ChevronLeft,
  Loader2,
  Check,
} from 'lucide-react';
import { DocumentExtractionPipeline } from '../services/documentExtractor';

interface SubjectsScreenProps {
  onStartLectureQuiz: (quizData: {
    quiz_id: string;
    questions: QuizQuestion[];
    subject: string;
    lecture: number;
  }) => void;
  onAskAIAboutLecture: (subject: string, lecture: number) => void;
}

export const SubjectsScreen: React.FC<SubjectsScreenProps> = ({
  onStartLectureQuiz,
  onAskAIAboutLecture,
}) => {
  const { subjects, materials, currentUser, uploadMaterial } = useApp();

  // Navigation steps:
  // 1. 'subjects_list': shows only the subjects
  // 2. 'subject_options': shows "محاضرات" or "سكاشن"
  // 3. 'items_list': shows 10 lectures or 10 sections
  const [currentStep, setCurrentStep] = useState<'subjects_list' | 'subject_options' | 'items_list'>('subjects_list');
  const [selectedSubject, setSelectedSubject] = useState<string>('Computer Architecture');
  const [viewType, setViewType] = useState<'lecture' | 'section'>('lecture');

  // Selected item modal / message when student clicks on un-uploaded or uploaded material
  const [activeItemNum, setActiveItemNum] = useState<number | null>(null);
  const [notUploadedNotice, setNotUploadedNotice] = useState<{ open: boolean; itemNum: number } | null>(null);
  const [pdfViewerModal, setPdfViewerModal] = useState<{ open: boolean; material: AcademicMaterial } | null>(null);

  // Owner Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSubject, setUploadSubject] = useState<string>('Computer Architecture');
  const [uploadType, setUploadType] = useState<'lecture' | 'section'>('lecture');
  const [uploadNumber, setUploadNumber] = useState<number>(1);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const SUBJECTS_CONFIG: Record<
    string,
    { code: string; icon: any; color: string; desc: string }
  > = {
    'Computer Architecture': {
      code: 'CS201',
      icon: Cpu,
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
      desc: 'بنية المعالجات وتنظيم الذاكرة وخط الأنابيب Pipelining ومسجلات MIPS',
    },
    'Digital Logic Design': {
      code: 'CS203',
      icon: Binary,
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      desc: 'الجبر البولياني، الدوائر التوافقية والمتسلسلة، K-Maps والقلابات Flip-Flops',
    },
    'Data Structure and Algorithms': {
      code: 'CS202',
      icon: GitBranch,
      color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
      desc: 'الأشجار والقوائم المتصلة والمكدس، تحليل التعقيد الزمني Big-O وخوارزميات الفرز',
    },
    'Computer Networks': {
      code: 'CS301',
      icon: Network,
      color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
      desc: 'نموذج OSI، بروتوكولات TCP/IP، التوجيه Routing وعنونة الشبكات الفرعية Subnetting',
    },
    'Machine Learning': {
      code: 'CS401',
      icon: Brain,
      color: 'border-teal-500/40 text-teal-400 bg-teal-500/10',
      desc: 'الانحدار الخطي والتصنيف، خوارزميات التدريب، تقليل الأبعاد والشبكات العصبية',
    },
    'Modeling and Simulation': {
      code: 'CS302',
      icon: Activity,
      color: 'border-pink-500/40 text-pink-400 bg-pink-500/10',
      desc: 'المحاكاة بالأحداث المنفصلة، طوابير الانتظار، الأرقام العشوائية وطرق Monte Carlo',
    },
  };

  // Helper to check if a specific lecture/section was uploaded by the Owner
  const getUploadedMaterial = (subjectName: string, type: 'lecture' | 'section', num: number): AcademicMaterial | undefined => {
    return materials.find(
      (m) =>
        (m.title.includes(subjectName) || m.original_filename.includes(subjectName.replace(/\s+/g, '_'))) &&
        m.material_type === type &&
        m.lecture_id === num
    );
  };

  const handleItemClick = (num: number) => {
    const uploaded = getUploadedMaterial(selectedSubject, viewType, num);

    if (!uploaded) {
      setNotUploadedNotice({ open: true, itemNum: num });
      return;
    }

    setPdfViewerModal({ open: true, material: uploaded });
  };

  // Handle Owner upload submit with robust document extraction pipeline
  const handleOwnerUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetSubj = subjects.find((s) => s.name === uploadSubject) || subjects[0];
    const itemLabel = uploadType === 'lecture' ? `المحاضرة ${uploadNumber}` : `السكشن ${uploadNumber}`;
    const defaultTitle = `${itemLabel}: ${uploadSubject} (ملف معتمد)`;
    const titleToUse = uploadTitle.trim() || defaultTitle;

    let fileUrlToStore = '';
    let fileNameToStore = uploadFile ? uploadFile.name : `${uploadSubject.replace(/\s+/g, '_')}_${uploadType}_${uploadNumber}.pdf`;
    let extractionRes: any = null;

    setIsExtracting(true);

    try {
      if (uploadFile) {
        fileUrlToStore = URL.createObjectURL(uploadFile);
        extractionRes = await DocumentExtractionPipeline.processFile(uploadFile);
      } else {
        const samplePdfText =
          `%PDF-1.4\n` +
          `Study Challenge Official Academic Document\n` +
          `المادة: ${uploadSubject}\n` +
          `النوع: ${uploadType === 'lecture' ? 'محاضرة نظرية' : 'سكشن معملي'}\n` +
          `الرقم: ${uploadNumber}\n` +
          `العنوان: ${titleToUse}\n` +
          `تاريخ الرفع: ${new Date().toLocaleDateString('ar-EG')}\n` +
          `مرفوع ومعتمد رسمياً بواسطة إدارة المنصة.`;
        const blob = new Blob([samplePdfText], { type: 'application/pdf' });
        fileUrlToStore = URL.createObjectURL(blob);
        extractionRes = await DocumentExtractionPipeline.processFile({
          name: fileNameToStore,
          buffer: await blob.arrayBuffer(),
        });
      }

      uploadMaterial({
        academicYearId: 2,
        subjectId: targetSubj?.id || 3,
        lectureId: uploadNumber,
        title: titleToUse,
        materialType: uploadType,
        sectionTitle: uploadType === 'section' ? `سكشن ${uploadNumber}` : undefined,
        filename: fileNameToStore,
        fileUrl: fileUrlToStore,
        sizeBytes: uploadFile ? uploadFile.size : 3600000,
        extractedText: extractionRes?.text,
        pages: extractionRes?.pages,
        chunks: extractionRes?.chunks,
        extractionReport: extractionRes?.report,
        processingStatus: extractionRes?.report?.status || 'READY',
      });

      setUploadSuccessMsg(true);
      setTimeout(() => {
        setUploadSuccessMsg(false);
        setIsUploadModalOpen(false);
        setUploadTitle('');
        setUploadFile(null);
        setIsExtracting(false);
      }, 1000);
    } catch (err) {
      setIsExtracting(false);
    }
  };

  // Quick Owner Upload Trigger for a specific un-uploaded item
  const openUploadForSpecificItem = (itemNum: number) => {
    setNotUploadedNotice(null);
    setUploadSubject(selectedSubject);
    setUploadType(viewType);
    setUploadNumber(itemNum);
    setUploadTitle(`${viewType === 'lecture' ? 'المحاضرة' : 'السكشن'} ${itemNum}: ${selectedSubject}`);
    setIsUploadModalOpen(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-3 space-y-4 animate-in fade-in duration-300 pb-20">
      {/* ========================================================= */}
      {/* STEP 1: ONLY THE SUBJECTS (مكان فيه المواد بس)            */}
      {/* ========================================================= */}
      {currentStep === 'subjects_list' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#173A2E] border border-[#52D6A6]/40 flex items-center justify-center text-[#52D6A6]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">المواد الدراسية المقررة</h1>
                <p className="text-xs text-[#7C93C0]">الفرقة الثانية • اختر المادة لعرض المحاضرات أو السكاشن</p>
              </div>
            </div>

            {/* Owner Upload Button */}
            {currentUser?.role === 'owner' && (
              <button
                type="button"
                onClick={() => {
                  setUploadSubject(selectedSubject);
                  setIsUploadModalOpen(true);
                }}
                className="py-1.5 px-3 bg-[#52D6A6] hover:bg-[#34c791] text-[#0B1020] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                title="إضافة محاضرات وسكاشن"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>رفع ملف للمواد</span>
              </button>
            )}
          </div>

          {/* Clean List of the 6 Subjects */}
          <div className="space-y-2.5 pt-1">
            {Object.keys(SUBJECTS_CONFIG).map((subjName) => {
              const conf = SUBJECTS_CONFIG[subjName];
              const Icon = conf.icon;
              return (
                <button
                  key={subjName}
                  type="button"
                  onClick={() => {
                    setSelectedSubject(subjName);
                    setCurrentStep('subject_options');
                  }}
                  className="w-full p-4 bg-[#131C31] hover:bg-[#1A2640] border border-[#1E2B47] hover:border-[#52D6A6]/50 rounded-2xl flex items-center justify-between transition cursor-pointer group text-right shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${conf.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-[#0C1322] text-[#7C93C0] font-mono px-2 py-0.5 rounded-md border border-[#1E2B47]">
                          {conf.code}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#52D6A6] transition">
                          {subjName}
                        </h3>
                      </div>
                      <p className="text-xs text-[#7C93C0] mt-1 line-clamp-1">{conf.desc}</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-[#7C93C0] group-hover:text-white transition group-hover:-translate-x-1" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: CHOOSE "محاضرة" OR "سكشن"                        */}
      {/* ========================================================= */}
      {currentStep === 'subject_options' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Back button */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2B47]">
            <button
              type="button"
              onClick={() => setCurrentStep('subjects_list')}
              className="flex items-center gap-1.5 text-xs text-[#52D6A6] hover:underline font-semibold cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-0" />
              <span>العودة لقائمة المواد</span>
            </button>
            <span className="text-xs font-bold text-white font-mono">
              {SUBJECTS_CONFIG[selectedSubject]?.code}
            </span>
          </div>

          {/* Subject Title Card */}
          <div className="bg-[#131C31] border border-[#1E2B47] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                  SUBJECTS_CONFIG[selectedSubject]?.color
                }`}
              >
                {React.createElement(SUBJECTS_CONFIG[selectedSubject]?.icon || BookOpen, {
                  className: 'w-6 h-6',
                })}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{selectedSubject}</h2>
                <p className="text-xs text-[#7C93C0] mt-0.5">حدد هل تريد فتح المحاضرات أم السكاشن؟</p>
              </div>
            </div>

            {/* Owner Quick Upload */}
            {currentUser?.role === 'owner' && (
              <button
                type="button"
                onClick={() => {
                  setUploadSubject(selectedSubject);
                  setIsUploadModalOpen(true);
                }}
                className="p-2 bg-[#52D6A6] text-[#0B1020] rounded-xl hover:bg-[#34c791] transition cursor-pointer"
                title="رفع ملف PDF للمادة"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* The Two Choices: محاضرات أو سكاشن */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Option 1: المحاضرات */}
            <button
              type="button"
              onClick={() => {
                setViewType('lecture');
                setCurrentStep('items_list');
              }}
              className="p-5 bg-[#131C31] hover:bg-[#1A2640] border-2 border-[#1E2B47] hover:border-[#52D6A6] rounded-2xl flex flex-col items-center text-center space-y-3 transition cursor-pointer group shadow-md"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#173A2E] border border-[#52D6A6]/40 text-[#52D6A6] flex items-center justify-center group-hover:scale-105 transition">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#52D6A6] transition">
                  المحاضرات (Lectures)
                </h3>
                <p className="text-xs text-[#7C93C0] mt-1">الـ 10 محاضرات النظرية المقررة لمادة {selectedSubject}</p>
              </div>
              <span className="text-[11px] bg-[#1E2B47] text-[#52D6A6] px-3.5 py-1 rounded-full font-bold">
                تصفح الـ 10 محاضرات ←
              </span>
            </button>

            {/* Option 2: السكاشن */}
            <button
              type="button"
              onClick={() => {
                setViewType('section');
                setCurrentStep('items_list');
              }}
              className="p-5 bg-[#131C31] hover:bg-[#1A2640] border-2 border-[#1E2B47] hover:border-[#60A5FA] rounded-2xl flex flex-col items-center text-center space-y-3 transition cursor-pointer group shadow-md"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#17253A] border border-[#60A5FA]/40 text-[#60A5FA] flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#60A5FA] transition">
                  السكاشن (Sections)
                </h3>
                <p className="text-xs text-[#7C93C0] mt-1">الـ 10 سكاشن العملية والشيتات لمادة {selectedSubject}</p>
              </div>
              <span className="text-[11px] bg-[#1E2B47] text-[#60A5FA] px-3.5 py-1 rounded-full font-bold">
                تصفح الـ 10 سكاشن ←
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: LIST OF 10 ITEMS (LECTURES OR SECTIONS)           */}
      {/* Won't open unless uploaded by Owner, opens PDF directly   */}
      {/* ========================================================= */}
      {currentStep === 'items_list' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Back Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2B47]">
            <button
              type="button"
              onClick={() => setCurrentStep('subject_options')}
              className="flex items-center gap-1.5 text-xs text-[#52D6A6] hover:underline font-semibold cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rtl:rotate-0" />
              <span>رجوع لاختيار (محاضرات / سكاشن)</span>
            </button>
            <span className="text-xs font-bold text-white">{selectedSubject}</span>
          </div>

          {/* List Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {viewType === 'lecture' ? (
                <BookOpen className="w-4 h-4 text-[#52D6A6]" />
              ) : (
                <FileText className="w-4 h-4 text-[#60A5FA]" />
              )}
              <h3 className="text-sm font-bold text-white">
                اختر من الـ 10 {viewType === 'lecture' ? 'محاضرات' : 'سكاشن'}:
              </h3>
            </div>

            {/* Owner button */}
            {currentUser?.role === 'owner' && (
              <button
                type="button"
                onClick={() => {
                  setUploadSubject(selectedSubject);
                  setUploadType(viewType);
                  setIsUploadModalOpen(true);
                }}
                className="text-xs font-bold text-[#52D6A6] bg-[#173A2E] border border-[#52D6A6]/40 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>رفع {viewType === 'lecture' ? 'محاضرة' : 'سكشن'}</span>
              </button>
            )}
          </div>

          {/* 10 Items List */}
          <div className="space-y-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
              const uploadedMat = getUploadedMaterial(selectedSubject, viewType, num);
              const isUploaded = Boolean(uploadedMat);

              return (
                <div
                  key={num}
                  onClick={() => handleItemClick(num)}
                  className={`w-full p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    isUploaded
                      ? 'bg-[#131C31] hover:bg-[#1A2640] border-[#52D6A6]/50 hover:border-[#52D6A6] shadow-sm'
                      : 'bg-[#0E1526] border-[#1E2B47] hover:border-[#2B3B5C] opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                        isUploaded
                          ? 'bg-[#173A2E] text-[#52D6A6] border border-[#52D6A6]/40'
                          : 'bg-[#1B2640] text-[#7C93C0] border border-[#2B3B5C]'
                      }`}
                    >
                      {num}
                    </span>

                    <div className="text-right">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>
                          {viewType === 'lecture' ? `المحاضرة رقم ${num}` : `السكشن رقم ${num}`}
                        </span>
                        {isUploaded ? (
                          <span className="text-[10px] bg-[#173A2E] text-[#52D6A6] px-2 py-0.5 rounded-full font-bold border border-[#52D6A6]/30 flex items-center gap-1">
                            <FileCheck className="w-3 h-3" />
                            <span>PDF مرفوع وجاهز</span>
                          </span>
                        ) : (
                          <span className="text-[10px] bg-[#1E2B47] text-[#7C93C0] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>غير مرفوع بعد</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#7C93C0] mt-0.5 truncate max-w-[220px] sm:max-w-[300px]">
                        {isUploaded
                          ? uploadedMat?.title
                          : 'لم يتم رفع ملف هذه المحاضرة من قبل المالك حتى الآن'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUploaded ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(num);
                        }}
                        className="py-1 px-3 bg-[#52D6A6] text-[#0B1020] text-xs font-bold rounded-lg transition hover:bg-[#34c791] flex items-center gap-1.5 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>فتح PDF</span>
                      </button>
                    ) : currentUser?.role === 'owner' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUploadForSpecificItem(num);
                        }}
                        className="py-1 px-2.5 bg-[#1B2640] hover:bg-[#23314F] border border-[#52D6A6]/40 text-[#52D6A6] text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>رفع PDF</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#7C93C0]">مغلق</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NOT UPLOADED YET DIALOG (ميفتحش غير لما المالك يرفع)        */}
      {/* ========================================================= */}
      {notUploadedNotice?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141C2E] border border-[#2B3B5C] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#1E2B47] border border-[#2B3B5C] text-[#FFC76A] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">الملف غير متاح حالياً</h3>
              <p className="text-xs text-[#9BB0D6] leading-relaxed">
                لم يقم المالك / إدارة الكلية برفع ملف الـ PDF لـ {viewType === 'lecture' ? 'المحاضرة' : 'السكشن'} رقم {notUploadedNotice.itemNum} في مادة {selectedSubject} حتى الآن.
              </p>
            </div>

            {currentUser?.role === 'owner' ? (
              <div className="p-3 bg-[#173A2E] border border-[#52D6A6]/50 rounded-2xl space-y-2">
                <span className="text-xs text-[#52D6A6] font-bold block">
                  أنت المالك المسجل لهذا التطبيق!
                </span>
                <button
                  type="button"
                  onClick={() => openUploadForSpecificItem(notUploadedNotice.itemNum)}
                  className="w-full py-2.5 px-4 bg-[#52D6A6] text-[#0B1020] font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer hover:bg-[#34c791]"
                >
                  <Upload className="w-4 h-4" />
                  <span>رفع ملف الـ PDF الآن وإتاحته</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-[#7C93C0]">
                سيتم فتح الملف تلقائياً للتحميل والمشاهدة بمجرد رفعه من لوحة المالك.
              </p>
            )}

            <button
              type="button"
              onClick={() => setNotUploadedNotice(null)}
              className="w-full py-2.5 bg-[#1B2640] hover:bg-[#23314F] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DIRECT PDF VIEWER & DOWNLOAD MODAL (فتح مباشر وتحميل)      */}
      {/* ========================================================= */}
      {pdfViewerModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#141C2E] border border-[#2B3B5C] rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Top Bar with Prominent Download & External Link */}
            <div className="p-4 border-b border-[#2B3B5C] flex items-center justify-between gap-3 bg-[#131C31]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#173A2E] border border-[#52D6A6]/40 flex items-center justify-center text-[#52D6A6] flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-right">
                  <h3 className="font-bold text-white text-sm truncate">
                    {pdfViewerModal.material.title}
                  </h3>
                  <span className="text-[10px] text-[#9BB0D6] block">
                    {pdfViewerModal.material.original_filename}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Download PDF button */}
                <a
                  href={pdfViewerModal.material.file_url || '#'}
                  download={pdfViewerModal.material.original_filename}
                  className="py-1.5 px-3 bg-[#52D6A6] hover:bg-[#34c791] text-[#0B1020] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  title="تنزيل الملف"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل PDF</span>
                </a>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setPdfViewerModal(null)}
                  className="p-1.5 rounded-lg text-[#9BB0D6] hover:text-white hover:bg-[#1B2640] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs leading-relaxed">
              <div className="p-3 bg-[#0C1322] border border-[#1E2B47] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[#52D6A6] font-bold block">ملف PDF خارجي معتمد</span>
                  <span className="text-[11px] text-[#9BB0D6]">
                    مرفوع في: {pdfViewerModal.material.uploaded_at}
                  </span>
                </div>

                {pdfViewerModal.material.file_url && (
                  <a
                    href={pdfViewerModal.material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-3 bg-[#1B2640] hover:bg-[#23314F] border border-[#2B3B5C] text-[#52D6A6] text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>فتح في تبويب مستقل</span>
                  </a>
                )}
              </div>

              {/* In-app reader preview with extraction status */}
              <div className="bg-[#0B1020] border border-[#1E2B47] rounded-2xl p-4 space-y-3 font-mono text-[#DEEBFF] text-xs">
                <div className="text-[#52D6A6] font-bold pb-2 border-b border-[#1E2B47] font-sans flex items-center justify-between">
                  <span>محتوى المحاضرة / السكشن الرسمي:</span>
                  <span className="text-[10px] text-[#7C93C0]">Study Challenge PDF & Academic Engine</span>
                </div>
                
                {pdfViewerModal.material.extraction_report ? (
                  <div className="p-2.5 bg-[#141F33] rounded-xl border border-[#2B3B5C] font-sans text-xs space-y-1 text-[#DEEBFF]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#52D6A6]">حالة المعالجة والاستخراج:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pdfViewerModal.material.processing_status === 'READY'
                          ? 'bg-[#173A2E] text-[#52D6A6] border border-[#52D6A6]/40'
                          : 'bg-amber-900/40 text-amber-300 border border-amber-500/30'
                      }`}>
                        {pdfViewerModal.material.processing_status === 'READY' ? 'جاهز ومستخرج بالكامل 100%' : 'مستخرج جزئياً'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9BB0D6]">
                      • الصفحات المعالجة: {pdfViewerModal.material.extraction_report.extracted_pages} من {pdfViewerModal.material.extraction_report.total_pages} صفحة.
                    </div>
                    <div className="text-[11px] text-[#9BB0D6]">
                      • القوانين والمعادلات المكتشفة: {pdfViewerModal.material.extraction_report.equations_found} معادلة رياضية.
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2 whitespace-pre-wrap leading-relaxed text-[#9BB0D6]">
                  {pdfViewerModal.material.extracted_text
                    ? pdfViewerModal.material.extracted_text.slice(0, 500) + '...'
                    : `مقرر: ${selectedSubject} (${SUBJECTS_CONFIG[selectedSubject]?.code || 'CS200'})\n` +
                      `الملف: ${pdfViewerModal.material.title}\n` +
                      `المعرف: ${pdfViewerModal.material.original_filename}\n` +
                      `الحالة: جاهز ومتاح للطلاب للتحميل والمذاكرة والامتحانات.`}
                </div>
              </div>

              {/* Direct Quiz and AI Helpers for this lecture */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPdfViewerModal(null);
                    const qz = onStartLectureQuiz({
                      quiz_id: 'quiz-' + Date.now(),
                      questions: [],
                      subject: selectedSubject,
                      lecture: pdfViewerModal.material.lecture_id,
                    });
                  }}
                  className="py-2.5 px-3 bg-[#173A2E] text-[#52D6A6] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#52D6A6]/30 hover:bg-[#235040]"
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  <span>بدء اختبار على الملف</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPdfViewerModal(null);
                    onAskAIAboutLecture(selectedSubject, pdfViewerModal.material.lecture_id);
                  }}
                  className="py-2.5 px-3 bg-[#1B2640] text-[#60A5FA] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#60A5FA]/30 hover:bg-[#23314F]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>سؤال المساعد الذكي</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* OWNER UPLOAD MODAL (خاص بالمالك لرفع المحاضرات والسكاشن)   */}
      {/* ========================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141C2E] border border-[#2B3B5C] rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 left-5 text-[#9BB0D6] hover:text-white p-1 rounded-lg hover:bg-[#1E2B47] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#52D6A6]/10 border border-[#52D6A6]/40 flex items-center justify-center text-[#52D6A6]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">رفع ملف PDF (خاص بالمالك)</h3>
                <p className="text-xs text-[#7C93C0]">لن يتم فتح المحاضرة للطلاب إلا بعد رفعها هنا</p>
              </div>
            </div>

            {uploadSuccessMsg && (
              <div className="p-3 bg-[#173A2E] border border-[#52D6A6]/50 rounded-xl text-xs text-[#52D6A6] font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم رفع ملف الـ PDF بنجاح وأصبح متاحاً للفتح والتنزيل فوراً!</span>
              </div>
            )}

            <form onSubmit={handleOwnerUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#DEEBFF] font-semibold mb-1">المادة الدراسية:</label>
                <select
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  className="w-full bg-[#0B1020] border border-[#2B3B5C] rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#52D6A6]"
                >
                  {Object.keys(SUBJECTS_CONFIG).map((name) => (
                    <option key={name} value={name}>
                      {name} ({SUBJECTS_CONFIG[name]?.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#DEEBFF] font-semibold mb-1">نوع المحتوى:</label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as 'lecture' | 'section')}
                    className="w-full bg-[#0B1020] border border-[#2B3B5C] rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#52D6A6]"
                  >
                    <option value="lecture">محاضرة نظرية</option>
                    <option value="section">سكشن معملي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#DEEBFF] font-semibold mb-1">الرقم (1 إلى 10):</label>
                  <select
                    value={uploadNumber}
                    onChange={(e) => setUploadNumber(Number(e.target.value))}
                    className="w-full bg-[#0B1020] border border-[#2B3B5C] rounded-xl px-3 py-2.5 text-white outline-none focus:border-[#52D6A6]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {uploadType === 'lecture' ? `المحاضرة ${n}` : `السكشن ${n}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#DEEBFF] font-semibold mb-1">
                  عنوان {uploadType === 'lecture' ? 'المحاضرة' : 'السكشن'} المعروض:
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={`مثال: ${uploadType === 'lecture' ? 'المحاضرة' : 'السكشن'} ${uploadNumber} - الشرح الرسمي`}
                  className="w-full bg-[#0B1020] border border-[#2B3B5C] rounded-xl px-3 py-2 text-white outline-none focus:border-[#52D6A6]"
                />
              </div>

              <div>
                <label className="block text-[#DEEBFF] font-semibold mb-1">
                  اختيار ملف PDF من جهازك:
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.pptx,.txt"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#0B1020] border border-[#2B3B5C] rounded-xl px-3 py-2 text-white outline-none file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#1B2640] file:text-[#52D6A6] file:font-bold text-xs"
                />
                <span className="text-[10px] text-[#7C93C0] block mt-1">
                  إذا لم ترفق ملفاً خارجياً، فسيتم إنشاء ملف PDF معتمد تلقائياً بعنوان المحاضرة.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2B3B5C]">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="py-2.5 px-4 bg-[#1B2640] hover:bg-[#23314F] text-white rounded-xl font-semibold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isExtracting}
                  className={`py-2.5 px-5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md ${
                    isExtracting
                      ? 'bg-[#173A2E] text-[#52D6A6] cursor-wait'
                      : 'bg-[#52D6A6] hover:bg-[#34c791] text-[#0B1020] cursor-pointer'
                  }`}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري استخراج وتحليل الملف...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>تأكيد الرفع والإتاحة للطلاب</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
