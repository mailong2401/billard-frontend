'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

// Import ảnh từ thư mục assets
import banner1 from '@/assets/bannder/banner_1.jpg';
import banner2 from '@/assets/bannder/banner_2.jpg';
import banner3 from '@/assets/bannder/banner_3.jpg';
import banner4 from '@/assets/bannder/banner_4.jpg';
import banner5 from '@/assets/bannder/banner_5.jpg';
import banner6 from '@/assets/bannder/banner_5.jpg'; // Dùng lại banner_5.jpg nếu không có banner_6

interface BannerSlide {
  id: number;
  imageUrl: string | StaticImageData; // Cho phép cả string và StaticImageData
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

interface BannerSliderProps {
  slides?: BannerSlide[];
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  height?: string;
}

// Sử dụng ảnh đã import
const defaultSlides: BannerSlide[] = [
  {
    id: 1,
    imageUrl: banner1,
    title: 'Billiard Club',
    description: 'Trải nghiệm không gian bi da đẳng cấp nhất',
    buttonText: 'Đặt bàn ngay',
    buttonLink: '/client/tables'
  },
  {
    id: 2,
    imageUrl: banner2,
    title: 'Bàn VIP',
    description: 'Không gian sang trọng, phục vụ tận tâm',
    buttonText: 'Xem chi tiết',
    buttonLink: '/client/tables'
  },
  {
    id: 3,
    imageUrl: banner3,
    title: 'Giờ vàng ưu đãi',
    description: 'Giảm giá 20% cho khách hàng đặt trước',
    buttonText: 'Đặt ngay',
    buttonLink: '/client/booking'
  },
  {
    id: 4,
    imageUrl: banner4,
    title: 'Giải đấu hấp dẫn',
    description: 'Tham gia các giải đấu với giải thưởng lớn',
    buttonText: 'Đăng ký',
    buttonLink: '/client/tournaments'
  },
  {
    id: 5,
    imageUrl: banner5,
    title: 'Dịch vụ đồ uống',
    description: 'Thưởng thức đồ uống trong khi chơi',
    buttonText: 'Xem menu',
    buttonLink: '/client/menu'
  },
  {
    id: 6,
    imageUrl: banner5, // Hoặc tạo thêm banner_6.jpg
    title: 'Khuyến mãi đặc biệt',
    description: 'Ưu đãi lớn cho thành viên mới',
    buttonText: 'Đăng ký ngay',
    buttonLink: '/client/register'
  }
];

export default function BannerSlider({
  slides = defaultSlides,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  height = 'h-[400px] md:h-[500px]'
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Auto play
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, isHovered]);

  // Next slide
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  // Previous slide
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Go to specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Toggle auto play
  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <div
      className={`relative w-full ${height} overflow-hidden rounded-2xl shadow-xl`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="relative w-full h-full flex-shrink-0"
          >
            {/* Background Image */}
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 100vw"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in-up">
                {slide.title}
              </h2>
              <p className="text-base md:text-xl lg:text-2xl mb-8 max-w-2xl animate-fade-in-up animation-delay-100">
                {slide.description}
              </p>
              {slide.buttonText && (
                <a
                  href={slide.buttonLink}
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 animate-fade-in-up animation-delay-200"
                >
                  {slide.buttonText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {showControls && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Auto play toggle */}
          <button
            onClick={toggleAutoPlay}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10 backdrop-blur-sm"
            aria-label={isAutoPlaying ? 'Pause' : 'Play'}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm z-10">
        {currentIndex + 1} / {slides.length}
      </div>
    </div>
  );
}
