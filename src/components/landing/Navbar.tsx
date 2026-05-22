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
              color: '#231e1d',
              letterSpacing: '0.01em',
            }}
          >
            Modas y Estilos{' '}
            <span style={{ color: '#e4c28a' }}>Guor</span>
          </span>
        </Link>

        {/* LINKS DESKTOP */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[11px] font-bold uppercase tracking-widest transition-colors duration-200"
              style={{ color: "rgba(35,30,29,0.55)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#b5854b")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(35,30,29,0.55)")}
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
            style={{
              color: "rgba(35,30,29,0.55)",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#231e1d";
              e.currentTarget.style.borderColor = "#e4c28a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(35,30,29,0.55)";
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
            style={{
              background: "#231e1d",
              color: "#fff4e2",
              border: "2px solid #231e1d",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e4c28a";
              e.currentTarget.style.borderColor = "#e4c28a";
              e.currentTarget.style.color = "#231e1d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#231e1d";
              e.currentTarget.style.borderColor = "#231e1d";
              e.currentTarget.style.color = "#fff4e2";
            }}
          >
            <UserCircle size={16} />
            Portal Socios
          </Link>
        </div>

        {/* MOBILE BUTTON */}
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
          style={{
            background: "#fff4e2",
            borderBottom: "1px solid #e4c28a",
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-bold uppercase tracking-widest py-2"
              style={{ color: "#231e1d" }}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/login-cliente"
            className="w-full py-3 text-center rounded-xl font-bold text-xs"
            style={{
              background: "#231e1d",
              color: "#fff4e2",
              border: "2px solid #231e1d",
            }}
          >
            Portal Socios
          </Link>
          <Link
            href="/login-admin"
            className="w-full py-3 text-center rounded-xl font-bold text-xs"
            style={{
              background: "transparent",
              color: "#231e1d",
              border: "1px solid #e4c28a",
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
