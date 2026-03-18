import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import useLogoSettings from '../settings/useLogoSettings';

export default function DraggableLogo({ defaultWidth = 300, className = "" }) {
  const { logoSettings, isLoaded } = useLogoSettings();
  const [width, setWidth] = useState(defaultWidth);
  const [brightness, setBrightness] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const isResizing = useRef(false);

  useEffect(() => {
    if (isLoaded && logoSettings && logoSettings.max_height) {
      setWidth(logoSettings.max_height);
    }
  }, [isLoaded, logoSettings]);

  if (!isLoaded || !logoSettings.show_logo || !logoSettings.logo_url) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      className={`absolute z-50 cursor-move group hover:ring-2 hover:ring-blue-400 hover:ring-dashed rounded p-1 ${className}`}
      style={{ width }}
      onPointerDown={(e) => {
        if (isResizing.current) e.stopPropagation();
      }}
    >
      <img 
        src={logoSettings.logo_url} 
        alt="شعار" 
        className="w-full h-auto object-contain pointer-events-none mix-blend-multiply" 
        style={{ filter: `brightness(${brightness}%)`, opacity: opacity / 100 }}
        crossOrigin="anonymous" 
        draggable="false"
      />
      
      {/* لوحة التحكم بالسطوع والشفافية */}
      <div className="absolute -top-12 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1 no-print" onPointerDown={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-md shadow-md border border-slate-200 px-2 py-1 flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold w-12">السطوع:</span>
          <input 
            type="range" 
            min="0" 
            max="200" 
            value={brightness} 
            onChange={(e) => setBrightness(e.target.value)}
            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="bg-white rounded-md shadow-md border border-slate-200 px-2 py-1 flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold w-12">الشفافية:</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={opacity} 
            onChange={(e) => setOpacity(e.target.value)}
            className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* مقبض تغيير الحجم - يظهر عند التمرير فوق الشعار */}
      <div
        className="absolute bottom-0 left-0 w-6 h-6 cursor-sw-resize opacity-0 group-hover:opacity-100 no-print flex items-center justify-center bg-white rounded-full shadow-md border border-blue-200 z-10 transition-opacity"
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          isResizing.current = true;
          const startX = e.clientX;
          const startWidth = width;

          const onPointerMove = (moveEvent) => {
            // بما أننا في واجهة عربية (RTL)، السحب لليسار يزيد العرض
            const diffX = startX - moveEvent.clientX; 
            setWidth(Math.max(50, startWidth + diffX));
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