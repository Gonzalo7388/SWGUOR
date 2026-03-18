import { Suspense } from 'react';
import LoginContent from './LoginContent';
 
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-sm text-[#8A7676]">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  );
}