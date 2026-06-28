import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Zoom, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import 'swiper/css/free-mode';

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imagesList = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'];

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-950 select-none">
      {/* Main Image Slider */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        <Swiper
          style={{
            '--swiper-navigation-color': '#fff',
            '--swiper-pagination-color': '#fff',
          } as React.CSSProperties}
          zoom={true}
          navigation={imagesList.length > 1}
          pagination={imagesList.length > 1 ? { clickable: true } : false}
          thumbs={thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
          modules={[Navigation, Pagination, Thumbs, Zoom]}
          className="w-full h-full"
        >
          {imagesList.map((img, idx) => (
            <SwiperSlide key={idx}>
              <div className="swiper-zoom-container cursor-pointer" onClick={() => setIsFullscreen(true)}>
                <img 
                  src={img} 
                  alt={`${title} - Image ${idx + 1}`} 
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button 
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 left-4 z-10 bg-black/45 backdrop-blur-md rounded-lg px-2 py-1.5 text-[10px] text-white font-medium flex items-center space-x-1 hover:bg-black/60 transition-colors"
        >
          <Maximize2 className="h-3 w-3" />
          <span>Agrandir</span>
        </button>
      </div>

      {/* Thumbnails strip */}
      {imagesList.length > 1 && (
        <div className="h-24 bg-gray-900 border-t border-gray-800 shrink-0 p-2">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            className="w-full h-full"
          >
            {imagesList.map((img, idx) => (
              <SwiperSlide key={`thumb-${idx}`} className="!w-24 h-full">
                <div className="w-full h-full rounded-lg overflow-hidden border-2 border-transparent [&.swiper-slide-thumb-active]:border-primary-500 cursor-pointer transition-colors">
                  <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black backdrop-blur-lg flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent">
              <p className="text-white text-xs font-bold truncate pr-4">{title}</p>
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 w-full h-full pb-8">
              <Swiper
                style={{
                  '--swiper-navigation-color': '#fff',
                  '--swiper-pagination-color': '#fff',
                } as React.CSSProperties}
                zoom={true}
                navigation={imagesList.length > 1}
                pagination={imagesList.length > 1 ? { type: 'fraction' } : false}
                modules={[Navigation, Pagination, Zoom]}
                className="w-full h-full"
                initialSlide={thumbsSwiper && thumbsSwiper.activeIndex ? thumbsSwiper.activeIndex : 0}
              >
                {imagesList.map((img, idx) => (
                  <SwiperSlide key={`full-${idx}`}>
                    <div className="swiper-zoom-container">
                      <img 
                        src={img} 
                        alt={`${title} - Image ${idx + 1}`} 
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/60 rounded-full px-4 py-1.5 text-[10px] text-white/80 font-medium pointer-events-none text-center border border-white/10">
              Double-cliquez pour zoomer • Balayez pour naviguer
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

