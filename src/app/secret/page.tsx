'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The login gate is now handled globally by LoginGate in layout.tsx.
// This route exists only so /secret doesn't 404 — it redirects home.
export default function SecretPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  return null;
}
