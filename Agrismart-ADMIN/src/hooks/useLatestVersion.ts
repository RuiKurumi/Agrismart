'use client';

import { useEffect, useState } from 'react';
import { FALLBACK_VERSION, FALLBACK_APK_URL, fetchLatestVersion, fetchLatestApkUrl } from '@/lib/github';

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

/**
 * Client hook that fetches the direct APK download URL from latest release.
 * Falls back to FALLBACK_APK_URL (release page) while loading or on error.
 */
export function useLatestApkUrl(): string {
  const [url, setUrl] = useState<string>(FALLBACK_APK_URL);

  useEffect(() => {
    let cancelled = false;
    fetchLatestApkUrl().then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return url;
}
