import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';

export default function DraggableWatermark({ 
  defaultWidth = 400, 
  className = "", 
  storageKey = "default",
  imageUrl = "https://media.base44.com/images/public/68af5003813e47bd07947b30/2779dde91_logo_transparent.png"
}) {
  const savedSettings = JSON.parse(localStorage.getItem(`watermark_settings_${storageKey}`)) || {};
  
  const [show, setShow] = useState(savedSettings.show ?? true);
  const [width, setWidth] = useState(savedSettings.width || defaultWidth);
  const [opacity, setOpacity] = useState(savedSettings.opacity || 15);
  
  const x = useMotionValue(savedSettings.x || 0);
  const y = useMotionValue(savedSettings.y || 0);
  
  const isResizing = useRef(false);

  useEffect(() => {
    const saveToLocal = () => {
      localStorage.setItem(`watermark_settings_${storageKey}`, JSON.stringify({
        show,
        width,
        opacity,
        x: x.get(),
        y: y.get()
      }));
    };
    
    saveToLocal();
    
    const unsubscribeX = x.on("change", saveToLocal);
    const unsubscribeY = y.on("change", saveToLocal);
    
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [show, width, opacity, x, y]);

  useEffect(() => {
    const handleShow = () => setShow(true);
    window.addEventListener(`show-watermark-${storageKey}`, handleShow);
    return () => window.removeEventListener(`show-watermark-${storageKey}`, handleShow);
  }, [storageKey]);

  if (!show) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      className={`absolute z-0 cursor-move group hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-1 flex items-center justify-center ${className}`}
      style={{ width, x, y, left: '50%', top: '50%', marginLeft: -(width/2), marginTop: -(width/2) }}
      onPointerDown={(e) => {
        if (isResizing.current) e.stopPropagation();
      }}
    >
      <img 
        src={imageUrl} 
        alt="علامة مائية" 
        className="w-full h-auto object-contain pointer-events-none mix-blend-multiply" 
        style={{ opacity: opacity / 100 }}
        crossOrigin="anonymous" 
        draggable="false"
      />
      
      {/* لوحة التحكم */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 no-print z-50 min-w-[200px] max-w-[240px]" onPointerDown={(e) => e.stopPropagation()}>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-2 flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center w-full mb-1 border-b border-slate-100 pb-1">
            <span className="text-[11px] text-slate-700 font-bold">إعدادات العلامة المائية</span>
            <button 
              onClick={() => setShow(false)}
              className="text-red-500 hover:bg-red-50 rounded p-0.5"
              title="إخفاء العلامة المائية"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold w-12">الشفافية:</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={opacity} 
              onChange={(e) => setOpacity(e.target.value)}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-500 w-8 text-left">{opacity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold w-12">الحجم:</span>
            <input 
              type="range" 
              min="100" 
              max="2000" 
              value={width} 
              onChange={(e) => setWidth(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-500 w-8 text-left">{width}px</span>
          </div>
        </div>
      </div>

      {/* مقبض تغيير الحجم */}
      <div
        className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize opacity-0 group-hover:opacity-100 no-print flex items-center justify-center bg-white rounded-full shadow-md border border-blue-200 z-10 transition-opacity"
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          isResizing.current = true;
          const startX = e.clientX;
          const startWidth = width;

          const onPointerMove = (moveEvent) => {
            const diffX = startX - moveEvent.clientX; 
            setWidth(Math.max(100, startWidth + (diffX * 2))); // *2 because it's centered
          };

          const onPointerUp = () => {
            isResizing.current = false;
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
          };

          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerUp);
        }}
        title="اسحب لتغيير الحجم"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 rotate-90">
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="9" y1="21" x2="21" y2="9"></line>
        </svg>
      </div>
    </motion.div>
  );
}