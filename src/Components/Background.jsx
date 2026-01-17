"use client";

import { motion } from "framer-motion";

export default function MirageBackground() {
  return (
    <div className="fixed inset-0 z-100 overflow-hidden mix-blend-screen">

      {/* Base gradient (subtle techno-blue) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#001025] via-[#071429] to-[#001025]" />

      {/* 🔵 Soft Blue Core */}
      <motion.div
        className="absolute w-[68rem] h-[68rem] rounded-full blur-[60px]"
        style={{
          background:
            "radial-gradient(circle, rgba(24,58,130,0.22), rgba(15,35,80,0) 65%)",
          top: "-25%",
          left: "-18%",
        }}
        animate={{
          x: [0, 160, -120, 0],
          y: [0, 120, -90, 0],
          scale: [1, 1.06, 0.96, 1],
        }}
        transition={{
          duration: 36,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 🔷 Deep Tech Core (rotating) */}
      <motion.div
        className="absolute w-[58rem] h-[58rem] rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0, 65, 170, 0.18), rgba(6,18,48,0) 65%)",
          top: "18%",
          right: "-18%",
        }}
        animate={{
          x: [0, -140, 110, 0],
          y: [0, 110, -85, 0],
          rotate: [0, 140, 320, 0],
          scale: [1, 0.94, 1.08, 1],
        }}
        transition={{
          duration: 44,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 🟦 Gentle Cyan Motion Layer */}
      <motion.div
        className="absolute w-[52rem] h-[52rem] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(25, 25, 25, 0.14), rgba(6,18,48,0) 65%)",
          bottom: "-22%",
          left: "8%",
        }}
        animate={{
          x: [0, 140, -110, 0],
          y: [0, -140, 90, 0],
          scale: [1, 1.12, 1, 1.06],
        }}
        transition={{
          duration: 34,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ⚡ Subtle Accent Pulse */}
      <motion.div
        className="absolute w-[32rem] h-[32rem] rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(50,120,255,0.16), rgba(6,18,48,0) 70%)",
          top: "42%",
          left: "40%",
        }}
        animate={{
          x: [0, 90, -90, 0],
          y: [0, -90, 90, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle Noise = Depth (reduced) */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />
    </div>
  );
}
