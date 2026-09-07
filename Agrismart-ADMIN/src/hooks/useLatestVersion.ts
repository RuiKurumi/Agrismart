'use client';

import { useEffect, useState } from 'react';
import { FALLBACK_VERSION, fetchLatestVersion } from '@/lib/github';

/**
 * Client hook that fetches the latest GitHub release version.
 * Falls back to FALLBACK_VERSION while loading or on error.
 * Returns formatted version string (without leading 'v').
 */
export function useLatestVersion(): string {
  const [version, setVersion] = useState<string>(FALLBACK_VERSION);

  useEffect(() => {
    let cancelled = false;
    fetchLatestVersion().then((v) => {
      if (!cancelled && v) setVersion(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return version;
}
