"use client";

import { useEffect, useState } from "react";

type Slide = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
};

export function HeroCarousel({
  slides,
  tagline,
  description,
  facebookUrl
}: {
  slides: Slide[];
  tagline: string;
  description: string;
  facebookUrl?: string | null;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="rounded-2xl border border-white/20 bg-black/20 p-8 text-emerald-100">
        Add your first hero slide from Admin Home.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border border-white/10 bg-black/30 shadow-[0_24px_80px_rgba(4,20,14,0.35)]">
      <div className="relative h-[74vh] min-h-[460px]">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === index ? 1 : 0 }}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className={`h-full w-full object-cover transition-transform duration-[4200ms] ${idx === index ? "scale-105" : "scale-100"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/80" />
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="max-w-4xl text-center text-white">
                <h2 className="text-6xl leading-none md:text-9xl">
                  CINEMATIC <span className="text-brand-500">AI</span>
                </h2>
                <p className="mx-auto mt-4 max-w-3xl text-xl font-semibold tracking-wide text-brand-100 md:text-3xl">
                  {tagline}
                </p>
                <p className="mx-auto mt-3 max-w-4xl text-base text-zinc-200 md:text-2xl md:leading-[1.25]">
                  {description}
                </p>
                <div className="mt-8 flex justify-center">
                  <a
                    href={facebookUrl || "https://facebook.com"}
                    className="rounded-full border border-white/80 bg-black/25 px-8 py-3 text-sm font-semibold transition hover:bg-white/10"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ติดตามเรา Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-5 right-5 flex gap-2 rounded-full bg-black/50 px-3 py-2 backdrop-blur">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setIndex(idx)}
            className={`h-2.5 w-2.5 rounded-full transition ${idx === index ? "bg-white" : "bg-white/40"}`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
