import { LoginCard } from '@/components/auth/LoginCard';
import Image from 'next/image';

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#e8f0f8' }}>
      <div className="w-full max-w-md px-4">
        {/* Logo lockup */}
        <div className="flex items-center justify-center gap-5 mb-8">
          <Image src="/brighton-logo.png" alt="Brighton" height={36} width={180} className="object-contain" priority />
          <span className="w-px h-8 bg-gray-300" />
          <Image src="/welltower-logo.png" alt="Welltower" height={36} width={120} className="object-contain" priority />
        </div>

        {error === 'invalid-link' && (
          <p className="text-[13px] text-red-600 bg-white border border-red-200 px-4 py-3 rounded-xl mb-4 text-center">
            Your invite link has expired or is invalid. Please contact an admin for a new invite.
          </p>
        )}

        <LoginCard />
      </div>
    </div>
  );
}
