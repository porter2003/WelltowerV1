'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RequestAccessForm } from './RequestAccessForm';

export function LoginCard() {
  const [showRequest, setShowRequest] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-8">
      {showRequest ? (
        <>
          <h1 className="text-[22px] font-extrabold text-brand mb-1">Request Access</h1>
          <p className="text-text-muted text-sm mb-0">Brighton — Welltower Partnership Tool</p>
          <RequestAccessForm onCancel={() => setShowRequest(false)} />
        </>
      ) : (
        <>
          <h1 className="text-[22px] font-extrabold text-brand mb-1">Sign In</h1>
          <p className="text-text-muted text-sm mb-6">Brighton — Welltower Partnership Tool</p>
          <LoginForm />
          <p className="mt-5 text-center text-xs text-text-muted">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => setShowRequest(true)}
              className="text-brand font-semibold hover:underline"
            >
              Request access
            </button>
          </p>
        </>
      )}
    </div>
  );
}
