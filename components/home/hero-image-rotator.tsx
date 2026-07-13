'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import type { HeroImageSlide } from '@/lib/media/hero-images'
import { HERO_IMAGE_SECONDS } from '@/lib/media/hero-images'

export function HeroImageRotator({ playlist }: { playlist: HeroImageSlide[] }) {
  const slides = playlist.length > 0 ? playlist : []
  const [index, setIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || reducedMotion) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, HERO_IMAGE_SECONDS * 1000)
    return () => window.clearInterval(id)
  }, [slides.length, reducedMotion])

  if (slides.length === 0) {
    return <div className="absolute inset-0 bg-black" aria-hidden />
  }

  return (
    <div className="absolute inset-0">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.src}
            alt={slide.label}
            fill
            priority={i === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  )
}
