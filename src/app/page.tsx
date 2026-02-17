'use client';

import { useEffect, useState } from 'react';
import { AppRouter } from '@/presentation/pages/AppRouter';
import { RequestFooter } from '@/presentation/components/features/RequestFooter';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="pb-8">
      <AppRouter />
      <RequestFooter />
    </main>
  );
}
