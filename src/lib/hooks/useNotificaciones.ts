'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Notificacion } from '@/lib/schemas/notificacionesSchema';

export function useNotifications(userId?: number) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [loading, setLoading]               = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/notificaciones?usuario_id=${userId}&leido=false`  // leido, no leida
      );
      if (!res.ok) return;

      const response = await res.json();
      const raw: any[] = Array.isArray(response.data) ? response.data
                        : Array.isArray(response)      ? response
                        : [];

      const normalized: Notificacion[] = raw.map((n) => ({
        ...n,
        id: String(n.id),   // bigint → string
      }));

      setNotificaciones(normalized);
      setUnreadCount(normalized.filter((n) => !n.leido).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notificaciones/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ leido: true }),  // leido, no leida
      });
      setNotificaciones((prev) =>
        prev.map((n) => n.id === id ? { ...n, leido: true, leido_at: new Date().toISOString() } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notificaciones.filter((n) => !n.leido);
    await Promise.all(unread.map((n) => markAsRead(n.id)));
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