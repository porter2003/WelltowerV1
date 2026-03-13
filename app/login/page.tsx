import { LoginCard } from '@/components/auth/LoginCard';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#e8f0f8' }}>
      <div className="w-full max-w-md">
        {/* Logo lockup */}
        <div className="flex items-center justify-center gap-5 mb-8">
          <Image src="/brighton-logo.png" alt="Brighton" height={36} width={180} className="object-contain" priority />
          <span className="w-px h-8 bg-gray-300" />
          <Image src="/welltower-logo.png" alt="Welltower" height={36} width={120} className="object-contain" priority />
        </div>

        <LoginCard />
      </div>
    </div>
  );
}
