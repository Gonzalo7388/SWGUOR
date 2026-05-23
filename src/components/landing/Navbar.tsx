"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { UserCircle, ShieldCheck, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { name: "Inicio", href: "/" },
  { name: "Nosotros", href: "/nosotros" },
  { name: "Beneficios", href: "/beneficios" },
  { name: "Colecciones", href: "/colecciones" },
  { name: "Preguntas", href: "/preguntas" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(253,249,243,0)", "rgba(253,249,243,0.97)"]
  );

  const boxShadow = useTransform(
    scrollY,
    [0, 100],
    ["none", "0 1px 0 0 rgba(232,213,168,0.4), 0 4px 24px -6px rgba(26,20,16,0.07)"]
  );

  return (
    <motion.nav
      style={{ backgroundColor, boxShadow }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="GUOR Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span
            style={{
              fontFamily: "var(--font-great-vibes)",
              fontSize: '1.75rem',
              lineHeight: 1,
              color: '#1a1410',
              letterSpacing: '0.01em',
            }}
          >
            Modas y Estilos{' '}
            <span style={{ color: '#c4a35a' }}>Guor</span>
          </span>
        </Link>

        {/* LINKS DESKTOP */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[11px] font-bold uppercase tracking-widest transition-colors duration-200"
              style={{ color: "rgba(26,20,16,0.50)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#8a6d3b")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,20,16,0.50)")}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* BOTONES */}
        <div className="hidden md:flex items-center gap-3">
          {/* ADMIN */}
          <Link
            href="/login-admin"
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-200"
            style={{ color: "rgba(26,20,16,0.50)", border: "1px solid transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#1a1410";
              e.currentTarget.style.borderColor = "#e8d5a8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(26,20,16,0.50)";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <ShieldCheck size={14} />
            GUOR Corporativo
          </Link>

          {/* CLIENTE */}
          <Link
            href="/login-cliente"
            className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300"
            style={{ background: "#1a1410", color: "#fdf9f3", border: "1.5px solid #1a1410" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#c4a35a";
              e.currentTarget.style.borderColor = "#c4a35a";
              e.currentTarget.style.color = "#1a1410";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1a1410";
              e.currentTarget.style.borderColor = "#1a1410";
              e.currentTarget.style.color = "#fdf9f3";
            }}
          >
            <UserCircle size={16} />
            Portal Socios
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden"
          style={{ color: "#1a1410" }}
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
          style={{ background: "#fdf9f3", borderBottom: "1px solid #e8d5a8" }}
        >
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-bold uppercase tracking-widest py-2"
              style={{ color: "#1a1410" }}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/login-cliente"
            className="w-full py-3 text-center rounded-xl font-bold text-xs"
            style={{ background: "#1a1410", color: "#fdf9f3", border: "1.5px solid #1a1410" }}
          >
            Portal Socios
          </Link>
          <Link
            href="/login-admin"
            className="w-full py-3 text-center rounded-xl font-bold text-xs"
            style={{ background: "transparent", color: "#1a1410", border: "1px solid #e8d5a8" }}
          >
            GUOR Corporativo
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;