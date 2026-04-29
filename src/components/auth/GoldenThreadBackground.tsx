"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

const GoldenThreadBackground = () => {
  const [mounted, setMounted] = useState(false);
  
  // 1. PARALLAX SUAVE
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  const moveX = useTransform(springX, [0, 2000], [20, -20]);
  const moveY = useTransform(springY, [0, 1200], [15, -15]);

  // 2. MEMOIZACIÓN DE PARTÍCULAS (Evita saltos visuales)
  const particles = useMemo(() => 
    [...Array(10)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 5
    })), []);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return <div className="fixed inset-0 z-0 bg-[#FFF9F2]" />;

  return (
    <div className="fixed inset-0 z-0 bg-[#FFF9F2] overflow-hidden pointer-events-none">
      
      {/* CAPA 1: TEXTURA DE TELA (Noise Filter) */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")` 
        }} 
      />

      {/* CAPA 2: HILOS CON MOVIMIENTO REACTIVO */}
      <motion.div style={{ x: moveX, y: moveY }} className="absolute inset-0">
        <svg className="w-full h-full opacity-30" viewBox="0 0 1440 900" preserveAspectRatio="none">
          {[...Array(3)].map((_, i) => (
            <motion.path
              key={`thread-${i}`}
              d={`M-100,${450 + i * 50} C300,${200} 500,${700} 1600,${450}`}
              fill="none"
              stroke="#D4AF37"
              strokeWidth={0.8 + i}
              animate={{ 
                d: [
                  `M-100,${450 + i * 50} C300,${200} 500,${700} 1600,${450}`,
                  `M-100,${480 + i * 50} C350,${250} 550,${650} 1600,${480}`,
                  `M-100,${450 + i * 50} C300,${200} 500,${700} 1600,${450}`
                ]
              }}
              transition={{ duration: 12 + i * 3, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </svg>
      </motion.div>

      {/* CAPA 3: BARRIDO DE LUZ (Shimmer) */}
      <motion.div 
        animate={{ left: ["-100%", "200%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-y-0 w-[40%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] blur-3xl"
      />

      {/* CAPA 4: FIBRAS FLOTANTES */}
      {particles.map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-[#D4AF37] rounded-full blur-[1px]"
          initial={{ opacity: 0, left: p.left, top: p.top }}
          animate={{ 
            opacity: [0, 0.5, 0],
            y: [0, -100],
          }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
        />
      ))}

      {/* GRADIENTE DE ENFOQUE CENTRAL */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(255,249,242,0.6)_100%)]" />
    </div>
  );
};

export default GoldenThreadBackground;