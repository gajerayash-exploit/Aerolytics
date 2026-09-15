'use client';
import ViewHost from '@/components/ViewHost';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ViewHost view="SignalLost" variant="500" errorRef={error?.digest} reset={reset} />;
}
