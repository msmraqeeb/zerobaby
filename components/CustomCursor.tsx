import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<'default' | 'hover' | 'text'>('default');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if it's a touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouchDevice(true);
      return;
    }

    const dot = cursorDotRef.current;
    const outline = cursorOutlineRef.current;

    if (!dot || !outline) return;

    gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(outline, { xPercent: -50, yPercent: -50, opacity: 0 });

    const xToDot = gsap.quickTo(dot, "x", { duration: 0, ease: "none" });
    const yToDot = gsap.quickTo(dot, "y", { duration: 0, ease: "none" });
    
    const xToOutline = gsap.quickTo(outline, "x", { duration: 0.15, ease: "power3.out" });
    const yToOutline = gsap.quickTo(outline, "y", { duration: 0.15, ease: "power3.out" });

    let hasMoved = false;

    const onMouseMove = (e: MouseEvent) => {
      if (!hasMoved) {
        hasMoved = true;
        gsap.to([dot, outline], { opacity: 1, duration: 0.3 });
      }
      xToDot(e.clientX);
      yToDot(e.clientY);
      xToOutline(e.clientX);
      yToOutline(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const isText = target.closest('input[type="text"], input[type="email"], input[type="number"], input[type="password"], input[type="search"], textarea') || 
                     window.getComputedStyle(target).cursor === 'text';

      const isClickable = target.closest('a, button, input[type="submit"], input[type="checkbox"], input[type="radio"], select, [data-cursor-hover]') || 
                          window.getComputedStyle(target).cursor === 'pointer';
      
      if (isText) {
        setCursorState('text');
      } else if (isClickable) {
        setCursorState('hover');
      } else {
        setCursorState('default');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    // Apply global cursor hiding
    document.documentElement.classList.add('hide-native-cursor');

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.classList.remove('hide-native-cursor');
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      <div
        ref={cursorOutlineRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] transition-all duration-300 ease-out ${
          cursorState === 'hover' 
            ? 'w-12 h-12 border border-rose-500 bg-rose-500/10' 
            : cursorState === 'text'
            ? 'w-1 h-6 bg-rose-500 rounded-sm border-0'
            : 'w-8 h-8 border border-rose-500'
        }`}
      />
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 rounded-full bg-rose-500 pointer-events-none z-[10000] transition-all duration-300 ${
          cursorState === 'hover' 
            ? 'w-0 h-0 opacity-0' 
            : cursorState === 'text'
            ? 'w-0 h-0 opacity-0'
            : 'w-2 h-2 opacity-100'
        }`}
      />
    </>
  );
};

export default CustomCursor;
