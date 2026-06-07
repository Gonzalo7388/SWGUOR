import { Suspense } from 'react';
import {
  PagoConfirmacionSkeleton,
  PagoConfirmacionView,
} from '@/components/portal/pago/PagoConfirmacionView';

export default function PagoConfirmacionPage() {
  return (
    <Suspense fallback={<PagoConfirmacionSkeleton />}>
      <PagoConfirmacionView />
    </Suspense>
  );
}
