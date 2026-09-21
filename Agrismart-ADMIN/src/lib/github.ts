// Central GitHub release config for End User App download
export const GITHUB_REPO = 'RuiKurumi/Agrismart';
export const GITHUB_LATEST_RELEASE_URL = `https://github.com/${GITHUB_REPO}/releases/latest`;
export const GITHUB_API_LATEST_RELEASE_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
export const FALLBACK_VERSION = '1.3.5';
export const FALLBACK_APK_URL = GITHUB_LATEST_RELEASE_URL;

/**
 * Strip leading 'v' from tag_name (e.g. v1.3.5 -> 1.3.5)
 */
export function formatVersion(tag: string): string {
  return tag.replace(/^v/i, '').trim();
}

/**
 * Fetch latest release tag from GitHub API.
 * Returns formatted version string or null on failure.
 */
export async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(GITHUB_API_LATEST_RELEASE_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.tag_name) return formatVersion(data.tag_name as string);
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch direct APK download URL from latest release assets.
 * Looks for asset with .apk extension. Falls back to release page URL.
 */
export async function fetchLatestApkUrl(): Promise<string> {
  try {
    const res = await fetch(GITHUB_API_LATEST_RELEASE_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (!res.ok) return FALLBACK_APK_URL;
    const data = await res.json();
    const assets: Array<{ name: string; browser_download_url: string }> = data?.assets || [];
    const apkAsset = assets.find((a) => a.name.toLowerCase().endsWith('.apk'));
    if (apkAsset?.browser_download_url) return apkAsset.browser_download_url;
    return FALLBACK_APK_URL;
  } catch {
    return FALLBACK_APK_URL;
  }
}
