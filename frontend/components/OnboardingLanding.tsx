'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Sun, Moon, ArrowRight, Sparkles } from 'lucide-react'

interface SlideData {
  id: string
  titleLine1: string
  titleLine2: string
  subtitle: string
  badge: string
  imageSrc: string
}

const SLIDES: SlideData[] = [
  {
    id: 'slide-1',
    titleLine1: 'So many books.',
    titleLine2: 'So little time.',
    subtitle: 'Turn the books you’ve been meaning to read into small moments of discovery.',
    badge: 'AI Knowledge Distillation',
    imageSrc: '/illustrations/onboarding-1.jpg',
  },
  {
    id: 'slide-2',
    titleLine1: 'Big ideas.',
    titleLine2: 'Little by little.',
    subtitle: 'Discover the key ideas, lessons, and questions that make every chapter count.',
    badge: 'Daily Key Insights',
    imageSrc: '/illustrations/onboarding-2.jpg',
  },
  {
    id: 'slide-3',
    titleLine1: 'A reading plan that',
    titleLine2: 'fits your life.',
    subtitle: 'Choose your pace, set your schedule, and make steady progress every day.',
    badge: 'Personalized Cadence',
    imageSrc: '/illustrations/onboarding-3.jpg',
  },
  {
    id: 'slide-4',
    titleLine1: 'Make knowledge',
    titleLine2: 'stay with you.',
    subtitle: 'Revisit important ideas with smart flashcards and build a learning habit that lasts.',
    badge: 'SM-2 Spaced Repetition',
    imageSrc: '/illustrations/onboarding-4.jpg',
  },
]

export default function OnboardingLanding() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDark, setIsDark] = useState(false)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  // Detect system color scheme preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDark(prefersDark)
    }
  }, [])

  const isLastSlide = currentIndex === SLIDES.length - 1

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev < SLIDES.length - 1 ? prev + 1 : prev))
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev))
  }, [])

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlide()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  // Swipe support for touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return
    const diff = touchStartX - e.changedTouches[0].clientX
    if (diff > 50) nextSlide()
    if (diff < -50) prevSlide()
    setTouchStartX(null)
  }

  const currentSlide = SLIDES[currentIndex]

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-500 selection:bg-[#F5A623]/30 ${
        isDark ? 'bg-[#080809] text-[#F3F3F5]' : 'bg-[#F4F4F6] text-[#111111]'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Header ── */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 sm:py-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDark(prev => !prev)}
            aria-label="Toggle visual theme"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isDark
                ? 'bg-white/10 hover:bg-white/15 text-amber-300'
                : 'bg-black/5 hover:bg-black/10 text-neutral-700'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <span
              className={`text-xs font-semibold tracking-[0.2em] uppercase transition-colors font-sans ${
                isDark ? 'text-neutral-400 group-hover:text-white' : 'text-neutral-600 group-hover:text-black'
              }`}
            >
              BOOKTUTOR
            </span>
          </Link>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                : 'text-neutral-600 hover:text-black hover:bg-black/5'
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={`text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full transition-all shadow-sm ${
              isDark
                ? 'bg-white text-black hover:bg-neutral-200'
                : 'bg-[#111111] text-white hover:bg-black/85'
            }`}
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ── Main Editorial Showcase ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-4 flex flex-col justify-center items-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left/Top: Illustration Artwork Frame */}
          <div className="flex justify-center items-center">
            <div
              className={`relative w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 rounded-[32px] p-4 flex items-center justify-center transition-all duration-700 shadow-xl overflow-hidden border ${
                isDark
                  ? 'bg-[#121215] border-[#27272A]/80 shadow-black/60'
                  : 'bg-white border-[#E4E4E7] shadow-neutral-200/60'
              }`}
            >
              {/* Ambient radial glow */}
              <div
                className={`absolute inset-0 opacity-20 pointer-events-none rounded-[32px] transition-colors duration-700 ${
                  isDark
                    ? 'bg-[radial-gradient(circle_at_center,_rgba(245,166,35,0.18)_0%,_transparent_70%)]'
                    : 'bg-[radial-gradient(circle_at_center,_rgba(245,166,35,0.12)_0%,_transparent_70%)]'
                }`}
              />

              {/* Artwork Image */}
              <div className="relative w-full h-full rounded-[24px] overflow-hidden">
                <Image
                  key={currentSlide.id}
                  src={currentSlide.imageSrc}
                  alt={`${currentSlide.titleLine1} ${currentSlide.titleLine2}`}
                  fill
                  sizes="(max-width: 768px) 300px, 400px"
                  priority
                  className="object-contain p-2 transition-all duration-700 transform scale-100 animate-fadeIn"
                />
              </div>

              {/* Badge */}
              <div
                className={`absolute bottom-5 left-5 right-5 backdrop-blur-md rounded-full px-3.5 py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold border ${
                  isDark
                    ? 'bg-black/60 border-white/10 text-neutral-300'
                    : 'bg-white/80 border-black/10 text-neutral-700 shadow-sm'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#F5A623]" />
                <span>{currentSlide.badge}</span>
              </div>
            </div>
          </div>

          {/* Right/Bottom: Typography & Value Proposition */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            
            {/* Slide step counter tag */}
            <span
              className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                isDark
                  ? 'bg-[#27272A] text-[#F5A623]'
                  : 'bg-[#FFE9C9] text-[#C2720F]'
              }`}
            >
              Step {currentIndex + 1} of {SLIDES.length}
            </span>

            {/* Editorial Serif Titles */}
            <div className="space-y-1">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
                {currentSlide.titleLine1}
              </h1>
              <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#F5A623] leading-tight">
                {currentSlide.titleLine2}
              </h2>
            </div>

            {/* Subtitle */}
            <p
              className={`text-sm sm:text-base font-sans leading-relaxed max-w-md pt-2 ${
                isDark ? 'text-[#A0A0A8]' : 'text-[#71717A]'
              }`}
            >
              {currentSlide.subtitle}
            </p>

            {/* Desktop Direct Actions on Slide 4 */}
            {isLastSlide ? (
              <div className="pt-4 w-full flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/signup"
                  className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold transition-all transform hover:scale-[1.02] shadow-lg ${
                    isDark
                      ? 'bg-white text-black hover:bg-neutral-100 shadow-white/10'
                      : 'bg-[#111111] text-white hover:bg-black shadow-black/20'
                  }`}
                >
                  <span>Get started</span>
                  <span className="text-[#F5A623] font-bold">➔</span>
                </Link>

                <Link
                  href="/login"
                  className={`w-full sm:w-auto text-center px-6 py-3.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    isDark
                      ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                      : 'text-neutral-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  I already have an account
                </Link>
              </div>
            ) : (
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={nextSlide}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-md ${
                    isDark
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-[#111111] text-white hover:bg-black'
                  }`}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 text-[#F5A623]" />
                </button>
                <Link
                  href="/login"
                  className={`text-xs sm:text-sm font-medium px-4 py-2 transition-colors ${
                    isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Skip
                </Link>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── Footer Controls ── */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 sm:py-8 flex flex-col items-center gap-5 z-20">
        
        {/* Stepper Dots */}
        <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Onboarding slides">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-8 bg-[#F5A623]'
                    : isDark
                    ? 'w-2 bg-[#27272A] hover:bg-[#3E3E46]'
                    : 'w-2 bg-[#E4E4E7] hover:bg-[#D4D4D8]'
                }`}
              />
            )
          })}
        </div>

        {/* Carousel Prev / Next Circular Buttons */}
        <div className="w-full flex items-center justify-between max-w-md">
          {/* Back button */}
          <button
            type="button"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            aria-label="Previous slide"
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
              currentIndex === 0
                ? 'opacity-0 pointer-events-none'
                : isDark
                ? 'border-[#27272A] text-white hover:bg-white/10'
                : 'border-[#E4E4E7] text-neutral-800 hover:bg-black/5'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Quick status message */}
          <p className="text-[12px] font-sans font-medium text-neutral-400">
            {currentIndex + 1} / {SLIDES.length}
          </p>

          {/* Forward / Finish button */}
          {!isLastSlide ? (
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                isDark ? 'bg-white text-black' : 'bg-[#111111] text-white'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <Link
              href="/signup"
              aria-label="Finish and start"
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#F5A623] text-white shadow-lg shadow-[#F5A623]/30 transition-transform hover:scale-105"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Safe bar indicator */}
        <div
          className={`w-28 h-1 rounded-full transition-colors ${
            isDark ? 'bg-[#27272A]' : 'bg-[#E4E4E7]'
          }`}
        />
      </footer>
    </div>
  )
}
