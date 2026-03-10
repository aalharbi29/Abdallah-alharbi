import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, RotateCcw, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ENHANCE_OPTIONS = [
  { id: 'formal', label: 'صياغة رسمية', icon: '📜', prompt: 'أعد صياغة النص التالي بأسلوب رسمي واحترافي يليق بالمخاطبات الحكومية السعودية، مع الحفاظ على المعنى الأصلي. اجعل النص مختصراً ومباشراً.' },
  { id: 'improve', label: 'تحسين اللغة', icon: '✨', prompt: 'حسّن لغة النص التالي وصحح أي أخطاء إملائية أو نحوية، واجعله أكثر وضوحاً واحترافية مع الحفاظ على المعنى.' },
  { id: 'shorten', label: 'اختصار النص', icon: '📝', prompt: 'اختصر النص التالي مع الحفاظ على جميع المعلومات المهمة، واجعله مختصراً ومباشراً بأسلوب رسمي.' },
  { id: 'elaborate', label: 'توسيع النص', icon: '📖', prompt: 'وسّع النص التالي بإضافة عبارات رسمية مناسبة وتفاصيل تجعله أكثر اكتمالاً واحترافية للمخاطبات الرسمية.' },
  { id: 'suggest_title', label: 'اقتراح عنوان', icon: '🏷️', prompt: 'بناءً على النص التالي، اقترح عنواناً رسمياً مناسباً للخطاب/التقرير باللغة العربية. أعد العنوان فقط بدون شرح.' },
];

export default function AITextEnhancer({ text, onApply, type = 'narrative', disabled }) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [open, setOpen] = useState(false);

  const handleEnhance = async (option) => {
    if (!text?.trim()) return;
    setIsEnhancing(true);
    setSelectedOption(option.id);
    setEnhancedText('');

    const contextHint = type === 'title'
      ? 'هذا عنوان تقرير/خطاب رسمي. أعد العنوان المحسّن فقط بدون شرح أو إضافات.'
      : 'هذا نص تعبيري لخطاب رسمي حكومي سعودي.';

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${option.prompt}\n\n${contextHint}\n\nالنص:\n"${text}"\n\nأعد النص المحسّن فقط بدون أي شرح أو مقدمة أو علامات اقتباس.`,
    });

    setEnhancedText(typeof response === 'string' ? response.trim() : '');
    setIsEnhancing(false);
  };

  const applyEnhancement = () => {
    if (enhancedText) {
      onApply(enhancedText);
      setEnhancedText('');
      setSelectedOption(null);
      setOpen(false);
    }
  };

  const resetEnhancement = () => {
    setEnhancedText('');
    setSelectedOption(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled || !text?.trim()}
          className="gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-7 px-2 text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          تحسين بالذكاء الاصطناعي
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="start">
        <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <p className="text-sm font-bold text-purple-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            تحسين النص بالذكاء الاصطناعي
          </p>
          <p className="text-xs text-gray-500 mt-1">اختر نوع التحسين المطلوب</p>
        </div>

        {!enhancedText && !isEnhancing && (
          <div className="p-2 space-y-1">
            {ENHANCE_OPTIONS.filter(opt => {
              if (type === 'title') return ['formal', 'improve', 'suggest_title'].includes(opt.id);
              return opt.id !== 'suggest_title';
            }).map(option => (
              <button
                key={option.id}
                onClick={() => handleEnhance(option)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-right hover:bg-purple-50 transition-colors text-sm"
              >
                <span className="text-lg">{option.icon}</span>
                <span className="font-medium text-gray-800">{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {isEnhancing && (
          <div className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">جاري تحسين النص...</p>
          </div>
        )}

        {enhancedText && !isEnhancing && (
          <div className="p-3 space-y-3">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1.5">النص المحسّن:</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm leading-relaxed text-gray-800 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {enhancedText}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={applyEnhancement}
                className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                تطبيق
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetEnhancement}
                className="gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                خيار آخر
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}