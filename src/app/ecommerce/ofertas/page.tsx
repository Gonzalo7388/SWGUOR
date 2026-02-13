'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OfertasRedirect() {
  const router = useRouter();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpired(true);
      router.push('/ecommerce/promociones');
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  if (isExpired) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );
}
