import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, CheckCircle, Sparkles } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running in standalone mode (installed as an app), do not show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback modal with guide for browsers where prompt hasn't fired yet
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#52D6A6]/20 to-[#3B82F6]/20 hover:from-[#52D6A6]/30 hover:to-[#3B82F6]/30 border border-[#52D6A6]/40 text-[#52D6A6] text-xs font-bold transition shadow-sm cursor-pointer"
          title="تثبيت تطبيق MA99 على هاتفك"
        >
          <img
            src="/icon-192.png"
            alt="MA99 Icon"
            className="w-4 h-4 rounded object-cover shadow"
            referrerPolicy="no-referrer"
          />
          <Download className="w-3.5 h-3.5" />
          <span>تنزيل MA99</span>
        </button>
      ) : (
        <div className="mx-3 my-2 p-3 rounded-2xl bg-gradient-to-r from-[#111C35] to-[#152544] border border-[#2B3B5C] shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="MA99"
              className="w-11 h-11 rounded-xl shadow-md border border-[#52D6A6]/30 object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white">تطبيق MA99</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#52D6A6]/20 text-[#52D6A6] border border-[#52D6A6]/30">
                  تثبيت سريع
                </span>
              </div>
              <p className="text-[11px] text-[#8EA3CB]">
                نزّل التطبيق على هاتفك للوصول السريع بدون متصفح
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#52D6A6] hover:bg-[#34c791] active:scale-95 text-[#0B1020] text-xs font-black rounded-xl transition shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل</span>
          </button>
        </div>
      )}

      {/* Success notification */}
      {installSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#173A2E] border border-[#52D6A6] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 text-[#52D6A6]" />
          <span>تم تثبيت تطبيق MA99 بنجاح على جهازك!</span>
        </div>
      )}

      {/* Guide Modal for iOS Safari / Manual Installation */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#141C2E] border border-[#2B3B5C] p-6 shadow-2xl space-y-4 text-center">
            <div className="relative mx-auto w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-[#52D6A6] to-[#3B82F6] shadow-lg">
              <img
                src="/icon-192.png"
                alt="MA99"
                className="w-full h-full rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">تثبيت تطبيق MA99</h3>
              <p className="text-xs text-[#8EA3CB]">
                سيظهر التطبيق على شاشة هاتفك باسم <strong className="text-[#52D6A6]">MA99</strong> بنفس الأيقونة
              </p>
            </div>

            <div className="bg-[#0B1020] rounded-2xl p-3.5 space-y-3 text-right text-xs text-[#DEEBFF] border border-[#202E4B]">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#1E2B47] text-[#52D6A6] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  {isIOS ? (
                    <span>
                      اضغط على زر المشاركة <Share2 className="w-3.5 h-3.5 inline mx-1 text-[#52D6A6]" /> في أسفل شريط Safari.
                    </span>
                  ) : (
                    <span>
                      اضغط على زر القائمة <strong className="text-white">⋮</strong> في أعلى المتصفح.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#1E2B47] text-[#52D6A6] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  اختر <strong className="text-[#52D6A6]">إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#52D6A6]" />
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#1E2B47] text-[#52D6A6] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  اضغط على <strong className="text-white">إضافة (Add)</strong>، وسيتم تنزيل التطبيق فوراً باسم <strong className="text-[#52D6A6]">MA99</strong>!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1E2B47] hover:bg-[#28395F] text-white text-xs font-bold transition cursor-pointer"
            >
              فهمت ذلك، إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
