'use client';
import { useState, useEffect } from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import FeedbackClienteTable from '@/components/admin/feedback-cliente/FeedbackClienteTable';

export default function FeedbackClientePage() {
  const { can } = usePermissions();
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (can('view', 'feedback_cliente')) {
      fetch('/api/admin/feedback-cliente')
        .then(res => res.json())
        .then(setFeedbacks);
    }
  }, [can]);

  if (!can('view', 'feedback_cliente')) return <div>Acceso denegado</div>;

  return (
    <div>
      <h1>Feedback de Clientes</h1>
      <FeedbackClienteTable data={feedbacks} />
    </div>
  );
}