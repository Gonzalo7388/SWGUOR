"use client";

import Link from "next/link";
import { Phone, MapPin } from "lucide-react";
import { FaInstagram, FaFacebookF } from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className="mt-auto py-14"
      style={{
        background: "#231e1d",
        borderTop: "1px solid #b5854b",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 items-start">
          {/* LOGO */}
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black mb-4" style={{ color: "#fff4e2" }}>
              GUOR Style
            </h2>
            <p className="text-lg leading-relaxed max-w-sm mx-auto md:mx-0" style={{ color: "rgba(255,244,226,0.8)" }}>
              Moda y confección premium para negocios modernos.
            </p>
          </div>

          {/* CONTACTO */}
          <div className="text-center">
            <h3 className="text-3xl font-black mb-6" style={{ color: "#e4c28a" }}>
              Contacto
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Phone size={20} color="#e4c28a" />
                <span className="text-lg" style={{ color: "#fff4e2" }}>+51 908 801 912</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <MapPin size={20} color="#e4c28a" />
                <span className="text-lg" style={{ color: "#fff4e2" }}>Tienda Virtual</span>
              </div>
            </div>
          </div>

          {/* REDES */}
          <div className="text-center md:text-right">
            <h3 className="text-3xl font-black mb-6" style={{ color: "#e4c28a" }}>
              Redes Sociales
            </h3>
            <div className="flex justify-center md:justify-end gap-5">
              <Link
                href="https://www.instagram.com/giobrand.pe?igsh=MTZzZHNkMXc3cDZo"
                target="_blank"
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                style={{ background: "#fff4e2", color: "#231e1d" }}
              >
                <FaInstagram size={28} />
              </Link>
              <Link
                href="https://www.facebook.com/share/18ZangYR1J/"
                target="_blank"
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                style={{ background: "#fff4e2", color: "#231e1d" }}
              >
                <FaFacebookF size={28} />
              </Link>
            </div>
          </div>
        </div>

        {/* LINEA */}
        <div className="my-10" style={{ height: "1px", background: "rgba(228,194,138,0.2)" }} />

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm tracking-[0.3em] uppercase" style={{ color: "rgba(255,244,226,0.45)" }}>
            © 2026 GUOR S.A.C.
          </p>
          <p className="text-sm" style={{ color: "rgba(255,244,226,0.35)" }}>
            Excelencia en cada puntada.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
