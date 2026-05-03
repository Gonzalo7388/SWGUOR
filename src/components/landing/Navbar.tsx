"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { UserCircle2, ShieldCheck, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,244,226,0)", "rgba(255,244,226,0.97)"]
  );

  return (
    <motion.nav
      style={{ backgroundColor }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="GUOR Logo" width={40} height={40} className="object-contain" />
          <span className="text-xl font-black tracking-tight uppercase italic" style={{ color: "#231e1d" }}>
            Guor<span className="not-italic" style={{ color: "#e4c28a" }}>Style</span>
          </span>
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {["nosotros", "catalogo", "preguntas"].map((item) => (
            <Link
              key={item}
              href={`#${item}`}
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "rgba(35,30,29,0.55)", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#b5854b"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(35,30,29,0.55)"}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* BOTONES */}
        <div className="hidden md:flex items-center gap-3">

          {/* ADMIN */}
          <Link
            href="/login-admin"
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl"
            style={{ color: "rgba(35,30,29,0.55)", border: "1px solid transparent", transition: "all 0.2s" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "#231e1d";
              el.style.borderColor = "#e4c28a";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = "rgba(35,30,29,0.55)";
              el.style.borderColor = "transparent";
            }}
          >
            <ShieldCheck size={14} />
            GUOR Corporativo
          </Link>

          {/* CLIENTE */}
          <Link
            href="/login-cliente"
            className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl"
            style={{ background: "#231e1d", color: "#fff4e2", border: "2px solid #231e1d", transition: "all 0.3s" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "#e4c28a";
              el.style.borderColor = "#e4c28a";
              el.style.color = "#231e1d";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "#231e1d";
              el.style.borderColor = "#231e1d";
              el.style.color = "#fff4e2";
            }}
          >
            <UserCircle2 size={16} />
            Portal Socios
          </Link>
        </div>

        {/* MENU MOBILE */}
        <button
          className="md:hidden"
          style={{ color: "#231e1d" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-20 inset-x-0 p-6 flex flex-col gap-4 shadow-lg"
          style={{ background: "#fff4e2", borderBottom: "1px solid #e4c28a" }}
        >
          <Link
            href="/login-cliente"
            className="w-full py-3 text-center rounded-xl font-bold text-xs"
            style={{ background: "#231e1d", color: "#fff4e2", border: "2px solid #231e1d", transition: "all 0.3s" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "#e4c28a";
              el.style.borderColor = "#e4c28a";
              el.style.color = "#231e1d";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "#231e1d";
              el.style.borderColor = "#231e1d";
              el.style.color = "#fff4e2";
            }}
          >
            Portal Socios
          </Link>

          <Link
            href="/login-admin"
            className="w-full py-3 text-center rounded-xl font-bold text-xs"
            style={{ background: "transparent", color: "#231e1d", border: "1px solid #e4c28a", transition: "all 0.3s" }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "#fbddd3";
              el.style.borderColor = "#b5854b";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.borderColor = "#e4c28a";
            }}
          >
            GUOR Corporativo
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;