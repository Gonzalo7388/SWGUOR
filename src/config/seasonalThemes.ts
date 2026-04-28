// src/config/seasonalThemes.ts
export const SEASONS = {
  SUMMER: {
    id: 'summer',
    title: 'Colección Verano 2026',
    accent: '#D4AF37',
  gradient: 'from-[#D4AF37] via-[#F7E7A1] to-[#AA8418]',  },
  VALENTINE: {
    id: 'valentine',
    title: 'Especial San Valentín',
    accent: '#eb6591',
    gradient: 'from-[#eb6591] via-[#fbd9e3] to-[#eb6591]',
  },
  DEFAULT: {
    id: 'default',
    title: 'Excelencia Textil',
    accent: '#D4AF37',
    // ✅ CAMBIO: Volvemos al dorado corporativo como color base
    gradient: 'from-[#D4AF37] via-[#F7E7A1] to-[#D4AF37]', 
  }
};

export const getCurrentSeason = () => {
  const month = new Date().getMonth(); // Abril es 3

  // 1. San Valentín debe ir PRIMERO para tener prioridad en febrero
  if (month === 1) return SEASONS.VALENTINE;
  
  // 2. Verano (Enero y Marzo)
  if (month === 0 || month === 2) return SEASONS.SUMMER;
  
  // 3. Todo lo demás (incluyendo Abril)
  return SEASONS.DEFAULT;
};