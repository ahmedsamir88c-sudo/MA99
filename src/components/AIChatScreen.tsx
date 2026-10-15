import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChatMessage, ChatConversation } from '../types';
import { generateAcademicExplanation } from '../services/aiAcademicEngine';
import { DocumentExtractionPipeline } from '../services/documentExtractor';
import { MathMarkdownRenderer } from './MathMarkdownRenderer';
import {
  Send,
  Plus,
  MoreVertical,
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  FileCheck,
  FolderOpen,
  Trash2,
  Check,
  Copy,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Loader2,
  ListChecks,
  GraduationCap,
  Calculator,
  RefreshCw,
  HelpCircle,
  Layers,
  SquarePen,
} from 'lucide-react';

const STORAGE_KEY = 'study_challenge_ai_conversations';

const SUBJECT_OPTIONS = [
  'Digital Logic Design',
  'Data Structure and Algorithms',
  'Computer Architecture',
  'Modeling and Simulation',
  'Computer Networks',
  'Machine Learning',
];

export const AIChatScreen: React.FC = () => {
  const { materials } = useApp();

  // Settings State
  const [selectedSubject, setSelectedSubject] = useState<string>('Computer Architecture');
  const [selectedLecture, setSelectedLecture] = useState<number>(1);
  const [explanationLanguage, setExplanationLanguage] = useState<'bilingual' | 'arabic' | 'english'>('bilingual');
  const [explanationMode, setExplanationMode] = useState<'complete_lecture' | 'page' | 'topic' | 'summary' | 'questions'>('complete_lecture');
  const [specificPage, setSpecificPage] = useState<number>(1);
  const [specificTopic, setSpecificTopic] = useState<string>('');

  // Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isThreeDotOpen, setIsThreeDotOpen] = useState<boolean>(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState<boolean>(false);
  const [isExistingMaterialPickerOpen, setIsExistingMaterialPickerOpen] = useState<boolean>(false);

  // Chat State
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Attachment State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    sizeBytes?: number;
    type: string;
    previewUrl?: string;
    extractedText?: string;
    isExtracting?: boolean;
    pagesCount?: number;
    equationsCount?: number;
  } | null>(null);

  // Hidden File Inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message generator
  const createDefaultWelcome = (subj: string, lec: number): ChatMessage => ({
    id: 'welcome-' + Date.now(),
    text: `### 🎓 مرحباً بك في المساعد الأكاديمي الذكي (ChatGPT)
أنا مخصص لطلاب الحاسبات والمعلومات والهندسة في **الفرقة الثانية (Year 2)**.
المادة النشطة حالياً: **${subj} (المحاضرة ${lec})**

أشرح لك كل تفصيلة في المحاضرة بأسلوب أكاديمي دقيق وشامل دون أي اختصار:
* **ثنائي اللغة (Bilingual):** ذكر المصطلحات الإنجليزية الدقيقة مع الشرح العربي السلس.
* **قوانين ومعادلات رياضية بدقة LaTeX:** مثل $$\\text{CPU Time} = \\frac{\\text{IC} \\times \\text{CPI}}{f}$$
* **مسائل عددية محلولة خطوة بخطوة بالأرقام والوحدات.**
* **💡 تلخيص سريع بعد كل جزئية.**

اضغط على **(+)** لإرفاق محاضرة أو صورة، أو افتح قائمة **(⋮)** لتحديد المحاضرة والبدء في الشرح الشامل!`,
    is_user: false,
    time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    provider: 'ChatGPT / AI Academic Engine Pro',
  });

  // Conversations in LocalStorage
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parse error
    }
    const initialId = 'conv-' + Date.now();
    return [
      {
        id: initialId,
        title: 'محاضرة 1: Computer Architecture',
        subject: 'Computer Architecture',
        lecture: 1,
        lastUpdated: new Date().toISOString(),
        messages: [createDefaultWelcome('Computer Architecture', 1)],
      },
    ];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversations[0]?.id || 'conv-1'
  );

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const messages = activeConversation?.messages || [];

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to save conversations to localStorage', e);
    }
  }, [conversations]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Matching uploaded material for current subject & lecture
  const matchingMaterial = materials.find(
    (m) =>
      (m.title.toLowerCase().includes(selectedSubject.toLowerCase()) ||
        m.original_filename.toLowerCase().includes(selectedSubject.toLowerCase().replace(/\s+/g, '_'))) &&
      m.lecture_id === selectedLecture &&
      m.material_type === 'lecture'
  );

  // Filtered materials for the existing materials picker
  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(selectedSubject.toLowerCase()) ||
      m.original_filename.toLowerCase().includes(selectedSubject.toLowerCase().replace(/\s+/g, '_'))
  );

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Create New Conversation (Completely empty page, zero previous text)
  const handleNewConversation = () => {
    const newId = 'conv-' + Date.now();
    const newConv: ChatConversation = {
      id: newId,
      title: 'صفحة جديدة',
      subject: selectedSubject,
      lecture: selectedLecture,
      lastUpdated: new Date().toISOString(),
      messages: [], // 100% blank page with zero previous text
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setInputMessage('');
    setAttachedFile(null);
    setIsTyping(false);
    setIsDrawerOpen(false);
    setIsThreeDotOpen(false);
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      handleNewConversation();
      return;
    }
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    if (activeConversationId === id) {
      setActiveConversationId(filtered[0].id);
    }
  };

  // File Extraction Handlers
  const handleProcessUploadedFile = async (file: File) => {
    setIsPlusMenuOpen(false);
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

    setAttachedFile({
      name: file.name,
      sizeBytes: file.size,
      type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain'),
      previewUrl,
      isExtracting: true,
    });

    try {
      const extracted = await DocumentExtractionPipeline.processFile(file);
      setAttachedFile({
        name: file.name,
        sizeBytes: file.size,
        type: file.type || 'application/pdf',
        previewUrl,
        extractedText: extracted.text,
        isExtracting: false,
        pagesCount: extracted.pages.length,
        equationsCount: extracted.report.equations_found,
      });
    } catch {
      setAttachedFile({
        name: file.name,
        sizeBytes: file.size,
        type: file.type,
        previewUrl,
        extractedText: `[تم إرفاق الملف: ${file.name}]`,
        isExtracting: false,
      });
    }
  };

  // Select an existing material from AppContext
  const handleSelectExistingMaterial = (mat: (typeof materials)[0]) => {
    setSelectedSubject(mat.title.includes('Architecture') ? 'Computer Architecture' : selectedSubject);
    setSelectedLecture(mat.lecture_id);
    setAttachedFile({
      name: mat.title,
      sizeBytes: mat.size_bytes,
      type: 'application/pdf',
      extractedText: mat.extracted_text || '',
      pagesCount: mat.pages?.length || 1,
      isExtracting: false,
    });
    setIsExistingMaterialPickerOpen(false);
  };

  // Send Message Handler
  const handleSendMessage = async (
    customText?: string,
    modeOverride?: 'complete_lecture' | 'detailed' | 'quick' | 'exam_summary',
    continuationPart?: number
  ) => {
    const rawText = customText !== undefined ? customText : inputMessage;
    const text = rawText.trim();
    if ((!text && !attachedFile) || isTyping) return;

    if (customText === undefined) {
      setInputMessage('');
    }

    const currentAttachment = attachedFile;
    setAttachedFile(null);

    const userMsgText = text || (currentAttachment ? `مرفق: ${currentAttachment.name}` : '');
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      text: userMsgText,
      is_user: true,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      attachment: currentAttachment
        ? {
            name: currentAttachment.name,
            sizeBytes: currentAttachment.sizeBytes,
            type: currentAttachment.type,
            thumbnailUrl: currentAttachment.previewUrl,
            extractedText: currentAttachment.extractedText,
          }
        : undefined,
    };

    // Append user message to active conversation
    const updatedMessages = [...messages, userMsg];
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastUpdated: new Date().toISOString(),
              messages: updatedMessages,
              title: c.messages.length <= 1 ? (text.slice(0, 32) || c.title) : c.title,
            }
          : c
      )
    );

    setIsTyping(true);

    try {
      let depthMode: 'complete_lecture' | 'detailed' | 'quick' | 'exam_summary' =
        modeOverride ||
        (explanationMode === 'complete_lecture'
          ? 'complete_lecture'
          : explanationMode === 'summary'
          ? 'exam_summary'
          : 'detailed');

      // Build context query
      let enrichedQuery = text;
      if (explanationMode === 'page' && specificPage) {
        enrichedQuery = `[المطلوب شرح الصفحة رقم ${specificPage} بالتفصيل الكامل]: ${text}`;
      } else if (explanationMode === 'topic' && specificTopic) {
        enrichedQuery = `[المطلوب شرح موضوع: ${specificTopic} بالتفصيل مع القوانين والمسائل]: ${text}`;
      } else if (explanationMode === 'questions') {
        enrichedQuery = `[المطلوب توليد أسئلة امتحانات وتدريبات ومسائل محلولة]: ${text}`;
      }

      if (explanationLanguage === 'arabic') {
        enrichedQuery += ' (الشرح باللغة العربية الفصيحة)';
      } else if (explanationLanguage === 'english') {
        enrichedQuery += ' (Explain in English)';
      } else {
        enrichedQuery += ' (ثنائي اللغة: المصطلحات بالإنجليزية والشرح بالعربية)';
      }

      // Extracted document text preference: attachment text > matching uploaded lecture text
      const docText =
        currentAttachment?.extractedText || matchingMaterial?.extracted_text || '';

      const result = await generateAcademicExplanation(
        enrichedQuery,
        selectedSubject,
        selectedLecture,
        {
          depthMode,
          continuationPart: continuationPart || 1,
          extractedDocumentText: docText,
        }
      );

      const botResponse: ChatMessage = {
        id: 'bot-' + Date.now(),
        text: result.reply,
        is_user: false,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        sources: result.sources,
        provider: result.provider,
        model: result.model,
        coverage_checklist: result.coverage_checklist,
        has_continuation: result.has_continuation,
        continuation_part: result.continuation_part,
        total_parts: result.total_parts,
        next_part_prompt: result.has_continuation
          ? `أكمل شرح الجزء التالي (الجزء ${(result.continuation_part || 1) + 1}) من محاضرة ${selectedSubject}`
          : undefined,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                lastUpdated: new Date().toISOString(),
                messages: [...updatedMessages, botResponse],
              }
            : c
        )
      );
    } catch {
      // Handled inside engine
    } finally {
      setIsTyping(false);
    }
  };

  // Prominent action: "شرح المحاضرة بالتفصيل — Explain Lecture"
  const handleExplainFullLecture = () => {
    setIsThreeDotOpen(false);
    const requestText = `اشرح لي المحاضرة ${selectedLecture} في مادة ${selectedSubject} شرحاً أكاديمياً شاملاً ومفصلاً بالكامل مع جميع القوانين الرياضية ومعادلات LaTeX والمسائل المحلولة خطوة بخطوة وتلخيص كل نقطة.`;
    handleSendMessage(requestText, 'complete_lecture', 1);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-68px)] bg-[#090D16] text-[#F3F7FF] select-none font-['Cairo',sans-serif]">
      {/* =========================================================================
          TOP NAVIGATION (ChatGPT Mobile Style: Minimal, Spacious, Lightweight)
      ========================================================================= */}
      <header className="sticky top-0 z-20 bg-[#090D16]/95 backdrop-blur-md border-b border-[#18233C] px-3 py-2.5 flex items-center justify-between">
        {/* Left: Drawer / Conversation History Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#131D31] transition cursor-pointer"
          title="سجل المحادثات"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Selected Subject & Lecture Title Badge */}
        <div className="flex flex-col items-center cursor-pointer" onClick={() => setIsThreeDotOpen(true)}>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wide">
            <span className="truncate max-w-[190px]">{selectedSubject}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#52D6A6]/15 text-[#52D6A6] font-semibold border border-[#52D6A6]/30">
              م.{selectedLecture}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
          </div>
          <span className="text-[10px] text-[#64748B]">المساعد الأكاديمي ChatGPT</span>
        </div>

        {/* Right: New Conversation & Three-dot Menu */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleNewConversation}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-[#52D6A6] hover:bg-[#131D31] transition cursor-pointer"
            title="صفحة جديدة فارغة"
          >
            <SquarePen className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsThreeDotOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#131D31] transition cursor-pointer"
            title="إعدادات الشرح والمحاضرة"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Hidden File Inputs for Plus (+) Button */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessUploadedFile(file);
          e.target.value = '';
        }}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessUploadedFile(file);
          e.target.value = '';
        }}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".docx,.pptx,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessUploadedFile(file);
          e.target.value = '';
        }}
      />

      {/* =========================================================================
          CONVERSATION AREA (Spacious, Minimalist, Responsive)
      ========================================================================= */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 py-8 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#131D31] border border-[#52D6A6]/30 flex items-center justify-center mb-3 shadow-xl">
              <GraduationCap className="w-7 h-7 text-[#52D6A6]" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">صفحة جديدة فارغة تماماً</h2>
            <p className="text-xs text-[#94A3B8] max-w-xs mb-5 leading-relaxed">
              المساعد الأكاديمي جاهز للشرح لمادة <span className="text-[#52D6A6] font-semibold">{selectedSubject}</span> (المحاضرة {selectedLecture}). اكتب سؤالك أو اختر أحد الاقتراحات:
            </p>

            <div className="w-full max-w-sm grid grid-cols-1 gap-2 text-right">
              {[
                { label: '📖 شرح المحاضرة كاملة بالتفصيل دون اختصار', text: 'اشرح لي المحاضرة كاملة بالتفصيل دون أي اختصار مع القوانين والمسائل خطوة بخطوة' },
                { label: '📐 استخراج القوانين وحل المسائل بالأرقام', text: 'استخرج كل قوانين هذه المحاضرة واحل عليها مسائل عددية بالأرقام والوحدات' },
                { label: '🌐 مصطلحات إنجليزية وشرح عربي سلس', text: 'شرح ثنائي اللغة مع التركيز على المصطلحات التقنية وتلخيص بعد كل جزئية' },
                { label: '🎯 أهم أسئلة امتحانات الميدتيرم والفاينال', text: 'ما هي أهم الأسئلة والمسائل المتوقعة في الامتحان على هذه المحاضرة؟' },
              ].map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(opt.text)}
                  className="p-3 rounded-xl bg-[#131D31] hover:bg-[#1C2A47] border border-[#1E2B47] hover:border-[#52D6A6]/40 text-xs text-[#E2E8F0] text-right transition cursor-pointer flex items-center justify-between group"
                >
                  <span className="font-medium">{opt.label}</span>
                  <ArrowLeft className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#52D6A6] transition" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
          const isUser = msg.is_user;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[98%] sm:max-w-[92%] ${
                isUser ? 'mr-auto' : 'ml-auto'
              }`}
            >
              <div
                className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative ${
                  isUser
                    ? 'bg-[#1E293B] text-white border border-[#334155]/60 rounded-tr-none'
                    : 'bg-[#101726] text-[#E2E8F0] border border-[#1E2A44] rounded-tl-none shadow-sm'
                }`}
              >
                {/* Header for Bot response */}
                {!isUser && (
                  <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#1E2A44] text-[10px] text-[#64748B]">
                    <span className="flex items-center gap-1.5 font-bold text-[#52D6A6]">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{msg.provider || 'ChatGPT Academic Engine Pro'}</span>
                    </span>
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="opacity-75 hover:opacity-100 transition text-[#94A3B8] hover:text-white flex items-center gap-1 cursor-pointer"
                      title="نسخ الشرح"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-[#52D6A6]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>نسخ</span>
                    </button>
                  </div>
                )}

                {/* Attachment Chip in User Message */}
                {isUser && msg.attachment && (
                  <div className="mb-2.5 p-2 bg-[#0F172A] border border-[#334155] rounded-xl flex items-center gap-2">
                    {msg.attachment.thumbnailUrl ? (
                      <img
                        src={msg.attachment.thumbnailUrl}
                        alt="attachment"
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#52D6A6]/20 flex items-center justify-center text-[#52D6A6]">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{msg.attachment.name}</p>
                      <p className="text-[10px] text-[#94A3B8]">
                        {msg.attachment.sizeBytes ? `${(msg.attachment.sizeBytes / 1024).toFixed(0)} KB` : 'مستند مرفق'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Message Content: Math & Markdown Rendering */}
                {isUser ? (
                  <div className="whitespace-pre-line text-sm text-[#F1F5F9]">{msg.text}</div>
                ) : (
                  <MathMarkdownRenderer content={msg.text} />
                )}

                {/* Coverage Checklist Box */}
                {msg.coverage_checklist && msg.coverage_checklist.length > 0 && (
                  <div className="mt-3 p-3 bg-[#0A0E1A] border border-[#1E2B47] rounded-xl text-[11px] space-y-1">
                    <span className="flex items-center gap-1.5 font-bold text-[#52D6A6]">
                      <ListChecks className="w-3.5 h-3.5" />
                      <span>عناصر التغطية الأكاديمية للمحاضرة:</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[#CBD5E1]">
                      {msg.coverage_checklist.map((item, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#52D6A6] flex-shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multi-part continuation button */}
                {msg.has_continuation && (
                  <div className="mt-3 pt-2 border-t border-[#1E2A44]">
                    <button
                      type="button"
                      onClick={() => {
                        const nextPart = (msg.continuation_part || 1) + 1;
                        handleSendMessage(msg.next_part_prompt, 'complete_lecture', nextPart);
                      }}
                      className="w-full py-2 bg-[#122E24] hover:bg-[#1a3d31] border border-[#52D6A6]/40 text-[#52D6A6] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>متابعة الشرح المفصل (الجزء {(msg.continuation_part || 1) + 1}) دون اختصار</span>
                    </button>
                  </div>
                )}

                {/* Sources & Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#1E2A44] text-[10px] text-[#F59E0B] space-y-0.5">
                    {msg.sources.map((s, idx) => (
                      <div key={idx} className="text-[#94A3B8]">
                        📄 المرجع المعتمد: {s.file_name} {s.section_title ? `• ${s.section_title}` : ''}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-left ${
                    isUser ? 'text-[#94A3B8]' : 'text-[#64748B]'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })
      )}

        {/* Typing / Thinking Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] bg-[#101726] border border-[#1E2A44] px-3.5 py-2.5 rounded-2xl w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-[#52D6A6]" />
            <span>جاري تحليل المحاضرة واستخراج القوانين والمعادلات وحل المسائل...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* =========================================================================
          FIXED BOTTOM COMPOSER (ChatGPT Mobile Rounded Pill Design)
      ========================================================================= */}
      <footer className="sticky bottom-0 z-20 bg-[#090D16]/95 backdrop-blur-md px-3 pt-1 pb-3 border-t border-[#18233C]/80">
        {/* Attachment preview chip if a file was selected */}
        {attachedFile && (
          <div className="mb-2 p-2 bg-[#131D31] border border-[#52D6A6]/40 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2 overflow-hidden">
              {attachedFile.previewUrl ? (
                <img
                  src={attachedFile.previewUrl}
                  alt="preview"
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-[#173A2E] flex items-center justify-center text-[#52D6A6] flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
              )}
              <div className="truncate">
                <p className="text-white font-semibold truncate text-[11px]">{attachedFile.name}</p>
                <p className="text-[10px] text-[#52D6A6]">
                  {attachedFile.isExtracting
                    ? 'جاري استخراج وفهرسة المحتوى...'
                    : attachedFile.pagesCount
                    ? `${attachedFile.pagesCount} صفحات • جاهز للشرح`
                    : 'جاهز للإرسال'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="p-1 text-[#94A3B8] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Rounded Input Pill */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[#131D31] border border-[#223254] focus-within:border-[#52D6A6] rounded-full px-2 py-1.5 transition"
        >
          {/* Plus (+) Button for attachments */}
          <button
            type="button"
            onClick={() => setIsPlusMenuOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E2B47] transition flex-shrink-0 cursor-pointer"
            title="إرفاق ملف أو محاضرة"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="اسأل عن محاضرتك..."
            className="flex-1 bg-transparent text-white text-xs sm:text-sm outline-none placeholder:text-[#64748B] px-1"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputMessage.trim() && !attachedFile) || isTyping}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition flex-shrink-0 ${
              (inputMessage.trim() || attachedFile) && !isTyping
                ? 'bg-white text-[#0B1020] hover:bg-[#E2E8F0] cursor-pointer'
                : 'bg-[#1E2A44] text-[#64748B] cursor-not-allowed'
            }`}
            title="إرسال"
          >
            <Send className="w-4 h-4 -rotate-90" />
          </button>
        </form>
      </footer>

      {/* =========================================================================
          PLUS (+) BUTTON BOTTOM SHEET (Image, PDF, DOCX/PPTX, Existing Lectures)
      ========================================================================= */}
      {isPlusMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#101726] border-t border-[#1E2B47] rounded-t-3xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-[#2B3B5C] rounded-full mx-auto mb-1" />
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2B47]">
              <span className="text-sm font-bold text-white">إرفاق مادة دراسية للمساعد الأكاديمي</span>
              <button
                onClick={() => setIsPlusMenuOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {/* Option 1: Upload image */}
              <button
                type="button"
                onClick={() => {
                  imageInputRef.current?.click();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#141E33] hover:bg-[#1A2844] border border-[#1E2B47] text-right transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#52D6A6]/20 text-[#52D6A6] flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">رفع صورة من الجهاز</h4>
                  <p className="text-[10px] text-[#94A3B8]">شرح مخطط هندسي، مسألة في ورقة، أو دائرة منطقية</p>
                </div>
              </button>

              {/* Option 2: Select PDF Lecture */}
              <button
                type="button"
                onClick={() => {
                  pdfInputRef.current?.click();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#141E33] hover:bg-[#1A2844] border border-[#1E2B47] text-right transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#60A5FA]/20 text-[#60A5FA] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">اختيار ملف محاضرة PDF</h4>
                  <p className="text-[10px] text-[#94A3B8]">استخراج النصوص والقوانين والمعادلات صفحة بصفحة</p>
                </div>
              </button>

              {/* Option 3: Select DOCX, PPTX, or TXT */}
              <button
                type="button"
                onClick={() => {
                  docInputRef.current?.click();
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#141E33] hover:bg-[#1A2844] border border-[#1E2B47] text-right transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center flex-shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">مستند DOCX أو سلايدات PPTX أو TXT</h4>
                  <p className="text-[10px] text-[#94A3B8]">دعم السلايدات والملفات النصية الجامعية</p>
                </div>
              </button>

              {/* Option 4: Select an existing lecture from Study Challenge */}
              <button
                type="button"
                onClick={() => {
                  setIsPlusMenuOpen(false);
                  setIsExistingMaterialPickerOpen(true);
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#141E33] hover:bg-[#1A2844] border border-[#1E2B47] text-right transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#A855F7]/20 text-[#A855F7] flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">اختيار محاضرة مرفوعة مسبقاً في التطبيق</h4>
                  <p className="text-[10px] text-[#94A3B8]">المواد المعتمدة المرفوعة في Study Challenge</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EXISTING MATERIALS MODAL
      ========================================================================= */}
      {isExistingMaterialPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#101726] border border-[#1E2B47] rounded-3xl p-4 space-y-3 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2B47]">
              <span className="text-sm font-bold text-white">المحاضرات المرفوعة في التطبيق</span>
              <button
                onClick={() => setIsExistingMaterialPickerOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredMaterials.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#94A3B8]">
                  لم يتم رفع ملفات PDF مخصصة لهذه المادة بعد. يمكنك رفع ملف جديد مباشرة من خيار (+)
                </div>
              ) : (
                filteredMaterials.map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => handleSelectExistingMaterial(mat)}
                    className="w-full p-3 rounded-xl bg-[#141E33] hover:bg-[#1C2A47] border border-[#1E2B47] flex items-center justify-between text-right cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileCheck className="w-4 h-4 text-[#52D6A6] flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{mat.title}</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          محاضرة {mat.lecture_id} • {mat.original_filename}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#173A2E] text-[#52D6A6] px-2 py-0.5 rounded font-semibold flex-shrink-0">
                      معتمد
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          THREE-DOT MENU (Subject, Lecture, Language, Modes, & Full Lecture Action)
      ========================================================================= */}
      {isThreeDotOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#101726] border border-[#1E2B47] rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#1E2B47]">
              <span className="text-sm font-bold text-white">إعدادات الشرح الأكاديمي</span>
              <button
                onClick={() => setIsThreeDotOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action: Start 100% empty new page */}
            <button
              type="button"
              onClick={handleNewConversation}
              className="w-full p-2.5 rounded-xl bg-[#142338] hover:bg-[#1A2E4B] border border-[#52D6A6]/40 text-right text-xs font-bold text-[#52D6A6] flex items-center justify-between cursor-pointer transition shadow-sm"
            >
              <span className="flex items-center gap-2">
                <SquarePen className="w-4 h-4 text-[#52D6A6]" />
                <span>صفحة جديدة فارغة (بدء محادثة نظيفة تماماً)</span>
              </span>
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* 1. Select Academic Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]">المادة الأكاديمية:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-[#141E33] text-white border border-[#1E2B47] rounded-xl p-2.5 text-xs outline-none cursor-pointer"
              >
                {SUBJECT_OPTIONS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Lecture */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]">رقم المحاضرة:</label>
              <select
                value={selectedLecture}
                onChange={(e) => setSelectedLecture(Number(e.target.value))}
                className="w-full bg-[#141E33] text-white border border-[#1E2B47] rounded-xl p-2.5 text-xs outline-none cursor-pointer"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    المحاضرة رقم {n}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Explanation Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]">لغة الشرح:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bilingual', label: 'ثنائي اللغة (Bilingual)' },
                  { id: 'arabic', label: 'العربية فقط' },
                  { id: 'english', label: 'English' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExplanationLanguage(item.id as any)}
                    className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold border transition cursor-pointer ${
                      explanationLanguage === item.id
                        ? 'bg-[#173A2E] text-[#52D6A6] border-[#52D6A6]/40'
                        : 'bg-[#141E33] text-[#94A3B8] border-[#1E2B47]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Explanation Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94A3B8]">نمط الشرح الأكاديمي:</label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'complete_lecture', label: 'شرح المحاضرة كاملة بالتفصيل دون اختصار' },
                  { id: 'page', label: 'شرح صفحة محددة من المحاضرة' },
                  { id: 'topic', label: 'شرح موضوع معين مع القوانين والمسائل' },
                  { id: 'summary', label: 'تلخيص المحاضرة والتركيز على الامتحانات' },
                  { id: 'questions', label: 'توليد أسئلة وتدريبات ومسائل محلولة' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setExplanationMode(m.id as any)}
                    className={`p-2.5 rounded-xl text-right text-xs font-semibold border flex items-center justify-between cursor-pointer transition ${
                      explanationMode === m.id
                        ? 'bg-[#173A2E] text-[#52D6A6] border-[#52D6A6]/50'
                        : 'bg-[#141E33] text-[#CBD5E1] border-[#1E2B47]'
                    }`}
                  >
                    <span>{m.label}</span>
                    {explanationMode === m.id && <Check className="w-4 h-4 text-[#52D6A6]" />}
                  </button>
                ))}
              </div>

              {explanationMode === 'page' && (
                <div className="pt-1.5">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={specificPage}
                    onChange={(e) => setSpecificPage(Number(e.target.value))}
                    placeholder="رقم الصفحة..."
                    className="w-full bg-[#141E33] text-white border border-[#1E2B47] rounded-xl p-2 text-xs outline-none"
                  />
                </div>
              )}

              {explanationMode === 'topic' && (
                <div className="pt-1.5">
                  <input
                    type="text"
                    value={specificTopic}
                    onChange={(e) => setSpecificTopic(e.target.value)}
                    placeholder="اكتب اسم الموضوع..."
                    className="w-full bg-[#141E33] text-white border border-[#1E2B47] rounded-xl p-2 text-xs outline-none"
                  />
                </div>
              )}
            </div>

            {/* 5. Prominent Action Button: "شرح المحاضرة بالتفصيل — Explain Lecture" */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExplainFullLecture}
                disabled={isTyping}
                className="w-full py-3 bg-[#52D6A6] hover:bg-[#34c791] text-[#0B1020] font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>شرح المحاضرة بالتفصيل — Explain Lecture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONVERSATION HISTORY DRAWER (Sidebar / Slide-out)
      ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-[#0E1524] border-l border-[#1E2B47] h-full flex flex-col p-4 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2B47]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#52D6A6]" />
                <span className="font-bold text-sm text-white">سجل المحادثات</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Conversation Button */}
            <button
              type="button"
              onClick={handleNewConversation}
              className="mt-3 w-full py-2.5 px-3 bg-[#173A2E] hover:bg-[#204c3c] text-[#52D6A6] border border-[#52D6A6]/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow"
            >
              <SquarePen className="w-4 h-4" />
              <span>صفحة جديدة فارغة تماماً</span>
            </button>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 mt-4 pr-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setSelectedSubject(conv.subject);
                    setSelectedLecture(conv.lecture);
                    setIsDrawerOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between group cursor-pointer transition ${
                    conv.id === activeConversationId
                      ? 'bg-[#142338] border-[#52D6A6]/50 text-white'
                      : 'bg-[#101726] border-[#1E2B47] text-[#94A3B8] hover:text-white hover:bg-[#141E33]'
                  }`}
                >
                  <div className="truncate flex-1 min-w-0 pr-1">
                    <p className="text-xs font-semibold truncate">{conv.title}</p>
                    <p className="text-[10px] text-[#64748B]">
                      {conv.messages.length} رسالة • {new Date(conv.lastUpdated).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition cursor-pointer"
                    title="حذف المحادثة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#1E2B47] text-center text-[10px] text-[#64748B]">
              Study Challenge Academic AI (ChatGPT)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
