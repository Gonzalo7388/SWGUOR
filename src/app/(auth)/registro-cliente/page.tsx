"use client";

import { useState } from 'react';
import GoldenThreadBackground from "@/components/auth/GoldenThreadBackground";
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2, Mail, Lock, User,
  ArrowRight, Loader2, CheckCircle2, AlertCircle,
  Phone, MapPin, Eye, EyeOff, Briefcase, Tag
} from 'lucide-react';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      nombre_completo: formData.get('razonSocial') as string,
      ruc: formData.get('ruc') as string,
      razon_social: formData.get('razonSocial') as string,
      nombre_comercial: formData.get('nombreComercial') as string,
      telefono: formData.get('telefono') as string,
      direccion: formData.get('direccion') as string,
      tipo_cliente: formData.get('tipoCliente') as string,
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar el registro');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el registro');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
        <GoldenThreadBackground />
        <div
          className="max-w-md w-full text-center space-y-6 p-10 rounded-[2.5rem]"
          style={{ background: "#fff4e2", border: "1px solid #e4c28a", boxShadow: "0 20px 60px rgba(35,30,29,0.1)" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#fbddd3", border: "2px solid #e4c28a", color: "#b5854b" }}
          >
            <CheckCircle2 size={40} />
          </div>

          <h2 className="text-2xl font-black" style={{ color: "#231e1d" }}>¡Solicitud Enviada!</h2>

          <p className="text-sm" style={{ color: "rgba(35,30,29,0.6)" }}>
            Hemos recibido los datos de su empresa.
          </p>

          <Link
            href="/login-cliente"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            style={{ background: "#231e1d", color: "#fff4e2", border: "2px solid #231e1d" }}
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
            Volver al Inicio de Sesión <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#fff4e2" }}>

    <GoldenThreadBackground />
      <div
  className="relative z-10 max-w-4xl w-full rounded-[3rem] overflow-hidden grid grid-cols-1 md:grid-cols-5"
  style={{ border: "1px solid #e4c28a", boxShadow: "0 20px 60px rgba(35,30,29,0.1)" }}
>

        {/* LADO IZQUIERDO */}
        <div className="hidden md:flex md:col-span-2 p-10 flex-col justify-between" style={{ background: "#231e1d" }}>
          <div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-8 shadow-xl"
              style={{ background: "#fff4e2" }}
            >
              <Image src="/logo.png" alt="Logo Guor" width={40} height={40} />
            </div>

            <h2 className="text-3xl italic" style={{ color: "#fff4e2" }}>
              Excelencia en <br />
              <span className="font-black uppercase text-4xl not-italic" style={{ color: "#e4c28a" }}>
                Textiles B2B
              </span>
            </h2>

            <p
              className="mt-8 text-sm leading-relaxed font-medium pl-4"
              style={{ color: "rgba(255,244,226,0.7)", borderLeft: "2px solid #e4c28a" }}
            >
              Únete a nuestra red mayorista para gestionar pedidos con soporte
              inteligente y optimizar tus procesos comerciales dentro del
              ecosistema GUOR.
            </p>
          </div>

          <p className="text-[9px] uppercase" style={{ color: "rgba(255,244,226,0.3)" }}>© 2026 GUOR</p>
        </div>

        {/* FORMULARIO */}
        <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center" style={{ background: "#fff4e2" }}>
          <div className="mb-8">
            <h1 className="text-3xl font-black" style={{ color: "#231e1d" }}>Registro de Socio</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: "#b5854b" }}>
              Optimización del proceso
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 text-[10px] font-black rounded-xl flex items-center gap-3"
                style={{ background: "#fff4e2", border: "1px solid #b5854b", color: "#b5854b" }}>
                <AlertCircle size={16} /> {error.toUpperCase()}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="md:col-span-2 relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "rgba(35,30,29,0.3)" }} />
                <input name="razonSocial" required placeholder="RAZÓN SOCIAL / EMPRESA" className="register-input" />
              </div>

              <div className="md:col-span-2 relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "rgba(35,30,29,0.3)" }} />
                <input name="nombreComercial" placeholder="NOMBRE COMERCIAL (OPCIONAL)" className="register-input" />
              </div>

              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "rgba(35,30,29,0.3)" }} />
                <input name="ruc" required placeholder="NÚMERO DE RUC" className="register-input" />
              </div>

              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "rgba(35,30,29,0.3)" }} />
                <select name="tipoCliente" required className="register-input">
                  <option value="">TIPO DE CLIENTE</option>
                  <option value="corporativo">CORPORATIVO</option>
                  <option value="persona_natural">PERSONA NATURAL</option>
                </select>
              </div>

              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "rgba(35,30,29,0.3)" }} />
                <input name="telefono" required placeholder="TELÉFONO" className="register-input" />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "rgba(35,30,29,0.3)" }} />
                <input name="direccion" required placeholder="DIRECCIÓN FISCAL" className="register-input" />
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "rgba(35,30,29,0.3)" }} />
                <input name="email" type="email" required placeholder="CORREO CORPORATIVO" className="register-input" />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: "rgba(35,30,29,0.3)" }} />
                <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="CONTRASEÑA" className="register-input pr-12" />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(35,30,29,0.3)" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2"
              style={{ background: "#231e1d", color: "#fff4e2", border: "2px solid #231e1d" }}
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
              {loading ? <><Loader2 className="animate-spin" size={16} /> Procesando...</> : "Solicitar Acceso B2B"}
            </button>
          </form>

          <div className="mt-8 text-center pt-6" style={{ borderTop: "1px solid #e4c28a" }}>
            <p className="text-[10px] uppercase" style={{ color: "rgba(35,30,29,0.5)" }}>
              ¿Ya tiene una cuenta?{' '}
              <Link href="/login-cliente" className="font-bold" style={{ color: "#b5854b" }}>
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>

        <style jsx>{`
          .register-input {
            width: 100%;
            padding: 1rem 1rem 1rem 3.5rem;
            background-color: #fff4e2;
            border: 1px solid #e4c28a;
            border-radius: 1.25rem;
            font-size: 0.75rem;
            font-weight: 700;
            color: #231e1d;
            outline: none;
            transition: all 0.3s ease;
          }
          .register-input:focus {
            border-color: #b5854b;
            box-shadow: 0 4px 12px rgba(181,133,75,0.15);
          }
          .register-input::placeholder {
            color: rgba(35,30,29,0.35);
          }
        `}</style>
      </div>
    </div>
  );
}