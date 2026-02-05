import { useState, useEffect } from 'react';

export function useTalleres() {
  const [talleres, setTalleres] = useState<{id: string, nombre: string}[]>([]);

  useEffect(() => {
    const fetchTalleres = async () => {
      const response = await fetch('/api/admin/talleres'); // Asegúrate de tener este endpoint
      const { data } = await response.json();
      // Filtrar solo los activos según el SQL: 'activo'
      setTalleres(data.filter((t: any) => t.estado === 'activo'));
    };
    fetchTalleres();
  }, []);

  return { talleres };
}