'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Toaster = dynamic(() => import('@/components/ui/sonner').then(mod => mod.Toaster), {
  ssr: false,
});

const TooltipProvider = dynamic(() => import('@/components/ui/tooltip').then(mod => mod.TooltipProvider), {
  ssr: false,
});

interface ClientProvidersProps {
  children: React.ReactNode;
  theme?: 'dark' | 'light';
}

export default function ClientProviders({ children, theme }: ClientProvidersProps) {
  return (
    <TooltipProvider delayDuration={0}>
      {children}
      <Toaster theme={theme} />
    </TooltipProvider>
  );
}