import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import img1 from "../../assets/images/img1-12 (4).png";
import img2 from "../../assets/pexels-pixabay-159866.jpg";
import img3 from "../../assets/pexels-minan1398-694740.jpg";
import img4 from "../../assets/images/img1-12 (4).png";
import ButtonFill from "@/Button/ButtonFill";
import { Link } from "react-router-dom";

/**
 * Responsive notes:
 * - Height:    mobile h-[420px] → md:h-[70vh] → lg:h-[85vh] → xl:h-screen
 * - Text:      text-base → md:text-lg → lg:text-xl (titles scale too)
 * - Controls:  bigger hit-targets on mobile, spaced further on desktop
 * - Dots:      slightly larger on md+
 */
const defaultImages = [
  { src: img1, alt: "Hero slide 1" },
  { src: img2, alt: "Hero slide 2" },
  { src: img3, alt: "Hero slide 3" },
  { src: img4, alt: "Hero slide 4" },
];

const Hero = ({
  images = defaultImages,
  intervalMs = 4000,
  fullWidth = true, // false = centered container with side padding
  pauseOnHover = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const hoveringRef = useRef(false);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);
  const timerRef = useRef(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const length = images.length;

  const prevSlide = useCallback(() => {
    setActiveIndex((p) => (p - 1 + length) % length);
  }, [length]);

  const nextSlide = useCallback(() => {
    setActiveIndex((p) => (p + 1) % length);
  }, [length]);

  // autoplay with visibility + reduced-motion
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (
      reducedMotion ||
      (pauseOnHover && hoveringRef.current) ||
      document.hidden
    )
      return;
    clearTimer();
    timerRef.current = window.setInterval(() => {
      setActiveIndex((p) => (p + 1) % length);
    }, intervalMs);
  }, [clearTimer, intervalMs, length, reducedMotion, pauseOnHover]);

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer, activeIndex]);

  useEffect(() => {
    const onVis = () => (document.hidden ? clearTimer() : startTimer());
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [startTimer, clearTimer]);

  // keyboard (focus the section)
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      }
    },
    [prevSlide, nextSlide]
  );

  // hover
  const onMouseEnter = () => {
    if (!pauseOnHover) return;
    hoveringRef.current = true;
    clearTimer();
  };
  const onMouseLeave = () => {
    if (!pauseOnHover) return;
    hoveringRef.current = false;
    startTimer();
  };

  // touch swipe
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    clearTimer();
  };
  const onTouchMove = (e) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    const threshold = 50;
    if (delta > threshold) prevSlide();
    else if (delta < -threshold) nextSlide();
    startTimer();
  };

  // responsive container + height
  const widthClass = fullWidth ? "w-full" : "max-w-7xl mx-auto px-4";
  const heightClass = "h-[350px] md:h-[50vh] lg:h-[60vh] xl:h-[70vh]";

  // track style (viewport-based width per slide)
  const trackStyle = {
    width: `${length * 100}vw`,
    transform: `translate3d(-${activeIndex * 100}vw, 0, 0)`,
    transition: reducedMotion ? "none" : "transform 700ms ease-in-out",
    willChange: "transform",
    WebkitBackfaceVisibility: "hidden",
    backfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  };

  // preload next
  useEffect(() => {
    const next = (activeIndex + 1) % length;
    const img = new Image();
    img.src = images[next].src;
  }, [activeIndex, images, length]);

  const month = useMemo(
    () => new Date().toLocaleString(undefined, { month: "long" }),
    []
  );

  return (
    <section
      className={`relative ${widthClass} ${heightClass} select-none m-5d:m-8 lg:m-10 rounded-none md:rounded-2xl shadow-sm md:shadow-md`}
      aria-roledescription="carousel"
      aria-label="Featured slides"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full h-full overflow-hidden bg-black rounded-none md:rounded-2xl">
        {/* Slides track */}
        <div ref={trackRef} className="flex h-full gap-0" style={trackStyle}>
          {images.map(({ src, alt }, i) => (
            <div
              key={i}
              className="relative w-screen h-full flex-shrink-0 overflow-hidden"
              style={{ lineHeight: 0 }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${length}`}
            >
              <img
                src={src}
                alt={alt ?? `Slide ${i + 1}`}
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                className="block w-full h-full object-cover"
                style={{ display: "block" }}
              />
              {/* overlay for text readability */}
              <div className="absolute inset-0 bg-black/55 md:bg-black/50 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Center content (responsive typography + spacing) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center px-3 sm:px-4">
          <div className="text-center max-w-[680px]">
            <p className="uppercase text-gray-200 text-xs sm:text-sm md:text-base tracking-widest">
              The Bookworm Editors&apos;
            </p>
            <h1 className="mt-2 sm:mt-3 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Featured Book of the{" "}
              <span className="text-indigo-400">{month}</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-gray-200 text-sm sm:text-base md:text-lg">
              Discover our handpicked recommendation — a book that inspires,
              educates, and entertains. Dive in and explore the story everyone’s
              talking about this month.
            </p>

            <Link to="/shop" className="mt-6 inline-block">
              <ButtonFill>Shop Now</ButtonFill>
            </Link>
          </div>
        </div>

        {/* Controls (touch-friendly on mobile; spaced on desktop) */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-3 md:left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 shadow-md
                     p-2 sm:p-2.5 md:p-3 rounded-full z-30"
        >
          &#10094;
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-2 sm:right-3 md:right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 shadow-md
                     p-2 sm:p-2.5 md:p-3 rounded-full z-30"
        >
          &#10095;
        </button>
      </div>
    </section>
  );
};

export default Hero;
