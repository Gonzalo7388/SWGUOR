'use client';

import { useState, useEffect } from 'react';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  created_at: string;
}

export function useNotifications(userId?: number) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/admin/notificaciones?usuario_id=${userId}&leida=false`);
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data);
        setUnreadCount(data.filter((n: Notificacion) => !n.leida).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Polling cada 30 segundos para notificaciones en tiempo real
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/admin/notificaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leida: true }),
      });
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return {
    notificaciones,
    unreadCount,
    markAsRead,
    refetch: fetchNotifications,
  };
}