import { PortalProvider } from '@/components/portal/_contexts/PortalContext';
import { PortalShell } from '@/components/portal/layout/PortalShell';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      <PortalShell>{children}</PortalShell>
    </PortalProvider>
  );
}