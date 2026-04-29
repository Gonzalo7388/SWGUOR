// src/config/themes.ts
export const SEASONS = {
  SUMMER: {
    id: 'summer',
    primary: '#D4AF37', // Dorado GUOR
    accent: '#eb6591',  // Rosa GUOR
    heroTitle: 'Colección Verano 2026',
    heroSubtitle: 'Textiles frescos para la temporada más alta.',
    bgImage: '/images/hero-summer.jpg'
  },
  VALENTINE: {
    id: 'valentine',
    primary: '#b8365f', 
    accent: '#fbd9e3',
    heroTitle: 'Especial San Valentín',
    heroSubtitle: 'Diseños que enamoran a tus clientes.',
    bgImage: '/images/hero-valentine.jpg'
  }
  // Añadir Día de la Madre, etc.
};

export const getCurrentTheme = () => {
  const month = new Date().getMonth(); // 0 = Enero, 1 = Feb...
  if (month === 1) return SEASONS.VALENTINE; // Febrero
  if (month >= 0 && month <= 3) return SEASONS.SUMMER; // Enero a Abril
  return SEASONS.SUMMER; // Default
};