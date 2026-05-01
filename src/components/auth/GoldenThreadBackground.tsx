"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const GoldenThreadBackground = () => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  const moveX = useTransform(springX, [0, 2000], [20, -20]);
  const moveY = useTransform(springY, [0, 1200], [15, -15]);

  useEffect(() => {
    setMounted(true);

    const generatedParticles = [...Array(12)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 12 + Math.random() * 10,
      delay: Math.random() * 5,
    }));

    setParticles(generatedParticles);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-gradient-to-br from-[#fff4e2] via-[#fbddd3] to-[#e4c28a]">

      {/* glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(181,133,75,0.15),transparent_60%)]" />

      {/* líneas */}
      <motion.div style={{ x: moveX, y: moveY }} className="absolute inset-0">
        <svg className="w-full h-full opacity-40" viewBox="0 0 1440 900">
          {[...Array(3)].map((_, i) => (
            <motion.path
              key={i}
              d={`M-100,${450 + i * 50} C300,200 500,700 1600,450`}
              fill="none"
              stroke={i % 2 === 0 ? "#b5854b" : "#e4c28a"}
              strokeWidth={0.8 + i}
              animate={{
                d: [
                  `M-100,${450 + i * 50} C300,200 500,700 1600,450`,
                  `M-100,${480 + i * 50} C350,250 550,650 1600,480`,
                  `M-100,${450 + i * 50} C300,200 500,700 1600,450`,
                ],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 12 + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* partículas */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#b5854b] opacity-30 rounded-full blur-[1px]"
          initial={{ opacity: 0, left: p.left, top: p.top }}
          animate={{ opacity: [0, 0.4, 0], y: [0, -80] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

export default GoldenThreadBackground;