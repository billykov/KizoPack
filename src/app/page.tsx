'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';

export default function Root() {
  const router = useRouter();
  const profiles      = useStore(s => s.profiles);
  const tripFinished  = useStore(s => s.tripFinished);
  const activeTrip    = useStore(s => s.activeTrip);

  useEffect(() => {
    if (profiles.length === 0)  router.replace('/onboard');
    else if (tripFinished)      router.replace('/done');
    else if (activeTrip)        router.replace('/packing');
    else                        router.replace('/home');
  }, []);

  return null;
}
