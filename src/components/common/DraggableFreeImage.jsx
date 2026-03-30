import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const CLUSTER_LOGO = "https://media.base44.com/images/public/68af5003813e47bd07947b30/2779dde91_logo_transparent.png";

/**
 * شعار التجمع قابل للسحب والتحريك والتكبير/التصغير
 * مع التحكم بالشفافية وحرية الوضع
 */
export default function DraggableFreeImage({ storageKey = "default_img", defaultWidth = 120 }) {
  const savedSettings = JSON.parse(localStorage.getItem(`free_img_${storageKey}`)) || {};
  
  const [show, setShow] = useState(savedSettings.show !== undefined ? savedSettings.show : true);
  const [width, setWidth] = useState(savedSettings.width || defaultWidth);
  const [opacity, setOpacity] = useState(savedSettings.opacity || 100);
  
  const x = useMotionValue(savedSettings.x || 0);
  const y = useMotionValue(savedSettings.y || 0);
  
  const isResizing = useRef(false);

  useEffect(() => {
    const save = () => {
      localStorage.setItem(`free_img_${storageKey}`, JSON.stringify({
        show, width, opacity,
        x: x.get(), y: y.get()
      }));
    };
    save();
    const unX = x.on("change", save);
    const unY = y.on("change", save);
    return () => { unX(); unY(); };
  }, [show, width, opacity]);

  if (!show) {
    return (
      <div className="no-print" style={{ position: 'absolute', top: 8, left: 8, zIndex: 50 }}>
        <button
          onClick={() => setShow(true)}
          className="bg-white border border-slate-300 shadow-sm text-xs px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-50 font-bold"
        >
          + إضافة شعار التجمع
        </button>
      </div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="absolute z-50 cursor-move group hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-1"
      style={{ width, x, y }}
      onPointerDown={(e) => {
        if (isResizing.current) e.stopPropagation();
      }}
    >
      <img
        src={CLUSTER_LOGO}
        alt="شعار التجمع"
        className="w-full h-auto object-contain pointer-events-none mix-blend-multiply"
        style={{ opacity: opacity / 100 }}
        crossOrigin="anonymous"
        draggable="false"
      />

      {/* لوحة التحكم */}
      <div
        className="absolute -top-14 left-0 opacity-0 group-hover:opacity-100 transition-opacity no-print bg-white/95 p-2 rounded-lg shadow-lg border border-slate-200 z-50 min-w-[150px]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-slate-700 font-bold whitespace-nowrap">الشفافية:</span>
          <input
            type="range" min="0" max="100" value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-[10px] text-slate-500">{opacity}%</span>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-[11px] text-red-600 hover:bg-red-50 font-bold w-full text-center py-0.5 rounded"
        >
          إخفاء الشعار
        </button>
      </div>

      {/* مقبض التكبير/التصغير */}
      <div
        className="absolute bottom-0 left-0 w-5 h-5 cursor-sw-resize opacity-0 group-hover:opacity-100 no-print flex items-center justify-center bg-white rounded-full shadow-md border border-blue-200 z-10 transition-opacity"
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          isResizing.current = true;
          const startX = e.clientX;
          const startWidth = width;

          const onMove = (me) => {
            const diff = startX - me.clientX;
            setWidth(Math.max(40, startWidth + diff));
          };
          const onUp = () => {
            isResizing.current = false;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        }}
        title="اسحب لتغيير الحجم"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" className="text-blue-600 rotate-90">
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="9" y1="21" x2="21" y2="9"></line>
        </svg>
      </div>
    </motion.div>
  );
}