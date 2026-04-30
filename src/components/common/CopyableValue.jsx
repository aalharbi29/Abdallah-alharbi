import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * زر نسخ صغير يظهر بجانب أي قيمة بيانات.
 * - يدعم النسخ الصامت مع إشعار قصير.
 * - يحوّل لرمز ✓ مؤقتاً عند النجاح.
 *
 * Usage:
 *   <CopyableValue value="0501234567" label="رقم الجوال">
 *     0501234567
 *   </CopyableValue>
 */
export default function CopyableValue({ value, label, children, className = "", inline = false }) {
  const [copied, setCopied] = useState(false);

  const textToCopy = value !== undefined && value !== null ? String(value) : "";

  const handleCopy = async (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!textToCopy || textToCopy === "—") return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(label ? `تم نسخ ${label}` : "تم النسخ", { duration: 1500 });
      setTimeout(() => setCopied(false), 1500);
    } catch (_err) {
      // fallback لمتصفحات قديمة
      const ta = document.createElement("textarea");
      ta.value = textToCopy;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        toast.success(label ? `تم نسخ ${label}` : "تم النسخ", { duration: 1500 });
        setTimeout(() => setCopied(false), 1500);
      } catch {
        toast.error("تعذّر النسخ");
      }
      document.body.removeChild(ta);
    }
  };

  const Btn = (
    <button
      type="button"
      onClick={handleCopy}
      title={label ? `نسخ ${label}` : "نسخ"}
      aria-label={label ? `نسخ ${label}` : "نسخ"}
      className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0 print-hide"
    >
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
    </button>
  );

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        {children}
        {Btn}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex-1 min-w-0">{children}</div>
      {Btn}
    </div>
  );
}