'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Notificacion } from '@/lib/schemas/notificaciones';

export function useNotifications(userId?: number) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Llamamos a tu API unificada (removimos ?leido=false para que liste el historial completo en el dropdown)
      const res = await fetch(`/api/admin/notificaciones?usuario_id=${userId}`);
      if (!res.ok) return;

      const response = await res.json();
      
      // Validamos y extraemos el array de la propiedad "data" devuelta por tu API
      const raw: any[] = response && Array.isArray(response.data) ? response.data : [];

      const normalized: Notificacion[] = raw.map((n) => ({
        ...n,
        id: Number(n.id), // Normalización segura de BigInt (string/number)
        leido_at: n.leido_at ? new Date(n.leido_at) : null,
      }));

      setNotificaciones(normalized);
      
      // Seteamos el contador basándonos en los KPIs reales calculados por el servidor o localmente
      setUnreadCount(response.kpis?.sinLeer ?? normalized.filter((n) => !n.leido).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Efecto de inicialización y sincronización periódica (Polling controlado)
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000); // Subimos a 45s para aliviar carga en servidor
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // 1. Marcar una alerta como leída (Corregido a PATCH)
  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/notificaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('No se pudo actualizar la alerta en el servidor');

      // Actualización optimista de la UI (Instantánea)
      setNotificaciones((prev) =>
        prev.map((n) => n.id === id ? { ...n, leido: true, leido_at: new Date() } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // 2. Marcar TODO como leído (Optimizado: 1 sola petición de red en lote)
  const markAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    try {
      const res = await fetch(`/api/admin/notificaciones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: userId }),
      });

      if (!res.ok) throw new Error('Error al actualizar lote masivo');

      // Actualización masiva local inmediata sin esperar al refetch
      setNotificaciones((prev) =>
        prev.map((n) => !n.leido ? { ...n, leido: true, leido_at: new Date() } : n)
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notificaciones,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}