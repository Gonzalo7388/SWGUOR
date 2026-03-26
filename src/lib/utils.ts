import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear moneda (Soles)
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(value);
};

// Formatear fechas para el Dashboard
export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};