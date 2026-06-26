import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, RefreshCw, Maximize2 } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  const imagesList = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none" id="image-carousel-container">
      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-gray-950">
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={currentIndex}
            src={imagesList[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            onClick={() => setIsOpen(true)}
          />
        </AnimatePresence>

        {/* Instructions Overlay on Hover / Micro-interaction */}
        <div className="absolute top-3 left-3 bg-black/45 backdrop-blur-md rounded-lg px-2 py-1 text-[10px] text-white font-medium flex items-center space-x-1 pointer-events-none">
          <Maximize2 className="h-3 w-3" />
          <span>Tapoter pour zoomer</span>
        </div>

        {/* Counter Badge */}
        <div className="absolute top-3 right-3 bg-black/45 backdrop-blur-md rounded-lg px-2.5 py-1 text-[10px] text-white font-bold font-mono">
          {currentIndex + 1} / {imagesList.length}
        </div>

        {/* Navigation Controls (Hidden if only 1 image) */}
        {imagesList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors z-10 active:scale-95"
              aria-label="Image précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors z-10 active:scale-95"
              aria-label="Image suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Slide Indicators / Thumbnails strip */}
      {imagesList.length > 1 && (
        <div className="p-4 bg-gray-950/20 border-t border-gray-100/10">
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {imagesList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative h-11 w-16 overflow-hidden rounded-lg border-2 shrink-0 transition-all ${
                  currentIndex === idx
                    ? 'border-orange-500 scale-105'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Touch Zoom Lightbox */}
      <AnimatePresence>
        {isOpen && (
          <ZoomableLightbox
            images={imagesList}
            initialIndex={currentIndex}
            title={title}
            onClose={(index) => {
              setCurrentIndex(index);
              setIsOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface LightboxProps {
  images: string[];
  initialIndex: number;
  title: string;
  onClose: (finalIndex: number) => void;
}

const ZoomableLightbox: React.FC<LightboxProps> = ({ images, initialIndex, title, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  // Reset zoom on index change
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [index]);

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(index);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, onClose]);

  const handleNext = () => {
    if (scale > 1) return; // Prevent sliding while zoomed in
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (scale > 1) return; // Prevent sliding while zoomed in
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleDragEnd = (_event: any, info: any) => {
    if (scale > 1) return; // Swiping pages disabled when zoomed

    const swipeThreshold = 60;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  // Double tap to zoom toggle
  const handleImageClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (scale > 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        setScale(2.5);
      }
    }
    lastTapRef.current = now;
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between"
      id="lightbox-overlay"
    >
      {/* Top Header controls */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-xs z-10">
        <div className="text-white">
          <p className="text-xs font-bold font-sans line-clamp-1 opacity-90">{title}</p>
          <p className="text-[10px] font-mono opacity-50 mt-0.5">
            Image {index + 1} sur {images.length}
          </p>
        </div>
        
        {/* Top Control buttons */}
        <div className="flex items-center space-x-3">
          {/* Zoom Actions */}
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90"
              title="Zoom arrière"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-[10px] font-bold font-mono text-white px-2 min-w-[32px] text-center">
              {scale.toFixed(1)}x
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90"
              title="Zoom avant"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            {scale > 1 && (
              <button
                onClick={handleReset}
                className="p-1.5 ml-1 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-all active:scale-90"
                title="Réinitialiser"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => onClose(index)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white transition-all active:scale-90 border border-white/5"
            aria-label="Fermer la visionneuse"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Central Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden touch-none">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={index}
            className="relative w-full h-full flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.img
              src={images[index]}
              alt=""
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain pointer-events-auto cursor-zoom-in"
              style={{
                scale: scale,
                x: position.x,
                y: position.y,
              }}
              drag={scale > 1}
              dragConstraints={false}
              dragElastic={0.1}
              dragMomentum={false}
              onDrag={(e, info) => {
                if (scale > 1) {
                  setPosition({
                    x: position.x + info.delta.x,
                    y: position.y + info.delta.y,
                  });
                }
              }}
              onDragEnd={() => {}}
              onClick={handleImageClick}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 15 }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Mobile Swipe Indicators (disabled when zoomed) */}
        {images.length > 1 && scale === 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-colors z-10 active:scale-95 border border-white/5"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 backdrop-blur-md text-white hover:bg-white/10 transition-colors z-10 active:scale-95 border border-white/5"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Swipe helper tag for mobile on bottom */}
        {scale === 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 border border-white/10 rounded-full px-4 py-1.5 text-[10px] text-white/80 font-medium pointer-events-none tracking-wide text-center">
            {images.length > 1 ? "Glisser pour changer • Double-clic pour zoomer" : "Double-clic pour zoomer"}
          </div>
        )}

        {scale > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-orange-600/90 rounded-full px-4 py-1.5 text-[10px] text-white font-bold pointer-events-none tracking-wide text-center shadow-lg">
            Glisser pour explorer • Double-clic pour réinitialiser
          </div>
        )}
      </div>

      {/* Micro indicator dot navigation at bottom */}
      {images.length > 1 && (
        <div className="flex items-center justify-center space-x-1.5 py-6 z-10">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (scale === 1) setIndex(idx);
              }}
              disabled={scale > 1}
              className={`h-1.5 rounded-full transition-all ${
                index === idx 
                  ? 'w-4 bg-orange-500' 
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              } disabled:opacity-30`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
