'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export const Hero = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const lightImages = [
    '/overview-lightmode.svg',
    '/promotions-lightmode.svg',
    '/transaction-lightmode.svg',
    '/giftcard-lightmode.svg'
  ];
  
  const darkImages = [
    '/overview-darkmode.svg',
    '/promotions-darkmode.svg',
    '/transaction-darkmode.svg',
    '/giftcard-darkmode.svg'
  ];

  const images = isDarkMode ? darkImages : lightImages;

  useEffect(() => {
    const htmlElement = document.documentElement;
    const updateDarkMode = () => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    };

    updateDarkMode();

    const observer = new MutationObserver(updateDarkMode);
    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative isolate overflow-hidden py-12 md:py-24">
      {/* Background elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className={`relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] ${
            isDarkMode
              ? 'bg-gradient-to-tr from-[#2F855A] to-[#36CFC9] opacity-20'
              : 'bg-gradient-to-tr from-[#4CAF50] to-[#36CFC9] opacity-30'
          } sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]`}
        />
      </div>

      <div className="container grid place-items-center gap-8 md:gap-12 lg:grid-cols-2">
        {/* Text Content */}
        <div className="space-y-6 text-center lg:text-start">
          <main className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-[#4CAF50] via-[#2F855A] to-[#36CFC9] bg-clip-text text-transparent">
                Rewardify
              </span>{' '}
              Revolutionizes
            </h1>
            <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 md:text-4xl lg:text-5xl">
              Customer Loyalty Programs
            </h2>
          </main>

          <p className="mx-auto text-base leading-snug text-gray-600 dark:text-gray-400 md:w-10/12 lg:mx-0 lg:text-lg">
            Transform customer interactions into lasting relationships with AI-driven insights, 
            automated reward systems, and real-time analytics.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link href="/signin" className="sm:w-auto w-full">
              <Button 
                size="lg"
                className="w-full transform transition-all hover:scale-105 bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold shadow-lg hover:shadow-xl"
              >
                Start Free Trial →
              </Button>
            </Link>
          </div>
        </div>

        {/* Image Carousel */}
        <div className="w-full max-w-2xl px-4 lg:px-8 relative">
          <div className="relative rounded-2xl bg-gray-900/5 p-2 ring-1 ring-gray-900/10 lg:p-4 dark:bg-gray-100/5 dark:ring-gray-100/10">
            <div className="relative w-full overflow-hidden rounded-xl">
              {/* Indicators */}
              <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
                {images.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 rounded-full transition-all duration-500 ${
                      activeImage === index 
                        ? 'bg-cyan-500 dark:bg-cyan-600' 
                        : 'bg-gray-300/50 dark:bg-gray-600/50'
                    }`}
                  />
                ))}
              </div>
              
              {/* Carousel Images */}
              <div 
                className="flex transition-transform duration-1000 ease-\[cubic-bezier\(0.33,1,0.68,1\)\]"
                style={{ transform: `translateX(-${activeImage * 100}%)` }}
              >
                {images.map((src, index) => (
                  <div 
                    key={index}
                    className="relative h-64 w-full flex-none md:h-72 lg:h-80"
                  >
                    <div className="h-full w-full bg-white dark:bg-gray-900 p-4 md:p-6 rounded-lg shadow-xl">
                      <Image
                        src={src}
                        alt={`Feature ${index + 1}`}
                        fill
                        className="object-contain p-2"
                        unoptimized
                        loading="eager"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right-side background element */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className={`relative aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] ${
            isDarkMode
              ? 'bg-gradient-to-tr from-[#2F855A] to-[#36CFC9] opacity-20'
              : 'bg-gradient-to-tr from-[#4CAF50] to-[#36CFC9] opacity-30'
          } sm:w-[72.1875rem]`}
        />
      </div>
    </section>
  );
};