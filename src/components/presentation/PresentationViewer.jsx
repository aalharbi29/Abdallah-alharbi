import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';

export default function PresentationViewer({ presentation, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen();
        } else {
          onClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isFullscreen]);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, presentation.slides.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const slide = presentation.slides[currentSlide];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">{presentation.title}</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Slide Content */}
          <div
            className="flex-1 flex flex-col justify-center items-center p-12"
            style={{
              background: slide.background_color || presentation.theme.bg,
              color: presentation.theme.primary
            }}
          >
            <h1 className="text-5xl font-bold mb-8 text-center animate-fade-in">
              {slide.title}
            </h1>
            <div className="text-2xl text-center max-w-4xl whitespace-pre-wrap animate-slide-up">
              {slide.content}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="text-white hover:bg-white/20"
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                السابق
              </Button>

              <Badge variant="secondary" className="text-base px-6 py-2">
                {currentSlide + 1} / {presentation.slides.length}
              </Badge>

              <Button
                variant="ghost"
                onClick={nextSlide}
                disabled={currentSlide === presentation.slides.length - 1}
                className="text-white hover:bg-white/20"
              >
                التالي
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${((currentSlide + 1) / presentation.slides.length) * 100}%`,
                background: presentation.theme.primary
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
          .animate-slide-up {
            animation: slide-up 0.7s ease-out;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}