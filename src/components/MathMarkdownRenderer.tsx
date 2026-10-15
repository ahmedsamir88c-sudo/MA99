import React, { useMemo } from 'react';
import katex from 'katex';
import { Lightbulb, AlertTriangle, Calculator, Check, Copy } from 'lucide-react';

interface MathMarkdownRendererProps {
  content: string;
  className?: string;
}

export const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedFormula, setCopiedFormula] = React.useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(text);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // Safely render a KaTeX formula
  const renderLatex = (latex: string, displayMode: boolean): string => {
    try {
      return katex.renderToString(latex.trim(), {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return `<code class="font-mono text-[#52D6A6] bg-[#0E1726] px-1.5 py-0.5 rounded text-xs">${latex}</code>`;
    }
  };

  // Process text into structured tokens: display math, paragraphs, headings, callouts
  const renderedElements = useMemo(() => {
    if (!content) return [];

    // Split by display math ($$...$$ or \[...\])
    const blocks: { type: 'math' | 'text'; value: string }[] = [];
    const displayMathRegex = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g;
    let lastIndex = 0;
    let match;

    while ((match = displayMathRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'text',
          value: content.slice(lastIndex, match.index),
        });
      }
      const formula = match[1] || match[2] || '';
      blocks.push({
        type: 'math',
        value: formula,
      });
      lastIndex = displayMathRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      blocks.push({
        type: 'text',
        value: content.slice(lastIndex),
      });
    }

    return blocks;
  }, [content]);

  // Helper to render inline text with inline math ($...$ or \(...\)) and basic markdown
  const renderInlineFormatted = (text: string) => {
    // Regex for inline math: $...$ (not preceded by digit or followed by digit) or \(...\)
    const parts: React.ReactNode[] = [];
    const inlineMathRegex = /\\\(([\s\S]*?)\\\)|\$([^\$\n]+?)\$/g;
    let lastIdx = 0;
    let m;

    while ((m = inlineMathRegex.exec(text)) !== null) {
      if (m.index > lastIdx) {
        parts.push(renderBasicMarkdown(text.slice(lastIdx, m.index)));
      }
      const rawFormula = m[1] || m[2] || '';
      const html = renderLatex(rawFormula, false);
      parts.push(
        <span
          key={`inline-math-${m.index}`}
          className="inline-flex items-center px-1 py-0.5 mx-0.5 font-mono text-[#DEEBFF] direction-ltr"
          dir="ltr"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      lastIdx = inlineMathRegex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(renderBasicMarkdown(text.slice(lastIdx)));
    }

    return parts;
  };

  // Helper for bold, italic, code tags
  const renderBasicMarkdown = (raw: string): React.ReactNode => {
    // Replace **bold**
    const tokens = raw.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white text-emerald-300/90">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('*') && token.endsWith('*') && !token.startsWith('**')) {
        return <em key={i} className="italic text-[#9BB0D6]">{token.slice(1, -1)}</em>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={i}
            dir="ltr"
            className="font-mono text-xs bg-[#0C1322] text-[#52D6A6] px-1.5 py-0.5 rounded border border-[#1E2B47] mx-0.5"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  };

  return (
    <div className={`space-y-3 leading-relaxed text-xs sm:text-sm text-[#DEEBFF] ${className}`}>
      {renderedElements.map((block, idx) => {
        if (block.type === 'math') {
          const html = renderLatex(block.value, true);
          return (
            <div
              key={idx}
              className="my-3 p-3.5 bg-[#0C1322] border border-[#2B3B5C] rounded-2xl relative group overflow-x-auto shadow-inner"
              dir="ltr"
            >
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#1E2B47] text-[10px] text-[#7C93C0]">
                <span className="flex items-center gap-1 text-[#52D6A6] font-sans font-bold">
                  <Calculator className="w-3 h-3" />
                  <span>معادلة رياضية / قانون معتمد</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(block.value)}
                  className="opacity-70 hover:opacity-100 transition text-[#7C93C0] hover:text-white flex items-center gap-1 cursor-pointer"
                  title="نسخ صيغة LaTeX"
                >
                  {copiedFormula === block.value ? (
                    <Check className="w-3.5 h-3.5 text-[#52D6A6]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>LaTeX</span>
                </button>
              </div>
              <div
                className="py-1 text-center overflow-x-auto select-all text-white"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          );
        }

        // Parse paragraphs and special callouts in text block
        const lines = block.value.split('\n');
        return (
          <div key={idx} className="space-y-2">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Check for horizontal rule
              if (trimmed === '---' || trimmed === '***') {
                return <hr key={lineIdx} className="border-[#1E2B47] my-3" />;
              }

              // Check for H3 / H4 headers
              if (trimmed.startsWith('#### ')) {
                return (
                  <h4
                    key={lineIdx}
                    className="text-xs sm:text-sm font-bold text-[#FFC76A] mt-3 mb-1 flex items-center gap-1.5"
                  >
                    {renderInlineFormatted(trimmed.slice(5))}
                  </h4>
                );
              }

              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={lineIdx}
                    className="text-sm sm:text-base font-bold text-white mt-4 mb-2 pb-1 border-b border-[#1E2B47] flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#52D6A6]" />
                    <span>{renderInlineFormatted(trimmed.slice(4))}</span>
                  </h3>
                );
              }

              if (trimmed.startsWith('## ')) {
                return (
                  <h2
                    key={lineIdx}
                    className="text-base sm:text-lg font-bold text-[#52D6A6] mt-4 mb-2 pb-1.5 border-b border-[#2B3B5C]"
                  >
                    {renderInlineFormatted(trimmed.slice(3))}
                  </h2>
                );
              }

              // Special Callout: تلخيص الجزئية
              if (trimmed.includes('💡 تلخيص الجزئية') || trimmed.includes('💡 تلخيص')) {
                return (
                  <div
                    key={lineIdx}
                    className="p-3 my-2 bg-[#122E25]/80 border border-[#52D6A6]/40 rounded-2xl flex items-start gap-2.5 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#173A2E] text-[#52D6A6] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs text-[#DEEBFF] leading-relaxed">
                      {renderInlineFormatted(trimmed.replace(/^[💡\s*]+/, ''))}
                    </div>
                  </div>
                );
              }

              // Special Callout: تنبيه أو أخطاء شائعة
              if (
                trimmed.includes('⚠️ تنبيه') ||
                trimmed.includes('❌ أخطاء شائعة') ||
                trimmed.includes('🚨 ملاحظة هامة')
              ) {
                return (
                  <div
                    key={lineIdx}
                    className="p-3 my-2 bg-[#2B1B15]/80 border border-amber-500/40 rounded-2xl flex items-start gap-2.5 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#3A2218] text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs text-amber-200/90 leading-relaxed">
                      {renderInlineFormatted(trimmed)}
                    </div>
                  </div>
                );
              }

              // Blockquotes: > Text
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote
                    key={lineIdx}
                    className="border-r-4 border-[#52D6A6] bg-[#141F33] p-2.5 rounded-l-xl my-2 text-xs text-[#9BB0D6] italic"
                  >
                    {renderInlineFormatted(trimmed.slice(2))}
                  </blockquote>
                );
              }

              // List items
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pr-2 my-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#52D6A6] mt-2 flex-shrink-0" />
                    <div className="flex-1 leading-relaxed">
                      {renderInlineFormatted(trimmed.slice(2))}
                    </div>
                  </div>
                );
              }

              // Numbered list items: 1. , 2.
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pr-2 my-1 text-xs">
                    <span className="w-5 h-5 rounded-md bg-[#1B2640] border border-[#2B3B5C] text-[#52D6A6] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {numMatch[1]}
                    </span>
                    <div className="flex-1 leading-relaxed">
                      {renderInlineFormatted(numMatch[2])}
                    </div>
                  </div>
                );
              }

              // Regular paragraph
              return (
                <p key={lineIdx} className="leading-relaxed">
                  {renderInlineFormatted(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
