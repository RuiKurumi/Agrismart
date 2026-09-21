'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Smartphone, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { GITHUB_LATEST_RELEASE_URL } from '@/lib/github';
import { useLatestVersion } from '@/hooks/useLatestVersion';

export default function PortalPage() {
  const router = useRouter();
  const [view, setView] = useState<'select' | 'enduser'>('select');
  const version = useLatestVersion();

  if (view === 'enduser') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Back */}
          <button
            onClick={() => setView('select')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to selection
          </button>

          {/* Logo header */}
          <div className="text-center mb-6">
            <img src="/icon.svg" alt="AgriSmart" className="w-14 h-14 rounded-2xl mx-auto mb-3 shadow-lg" />
            <h1 className="font-display text-2xl font-bold text-gray-900">AgriSmart</h1>
            <p className="text-gray-500 text-sm mt-1">For Farmers & End Users</p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone size={28} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">End User App</h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Download the AgriSmart mobile application for onion farmers.
              Monitor your fields, weather, and smart advisories directly on your device.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href={GITHUB_LATEST_RELEASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-[15px]"
              >
                <Download size={18} />
                Download App v{version}
                <ExternalLink size={14} className="opacity-80" />
              </a>
              <a
                href={GITHUB_LATEST_RELEASE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-gray-400 hover:text-[#2E7D32] hover:underline break-all"
              >
                {GITHUB_LATEST_RELEASE_URL}
              </a>
            </div>

            <div className="mt-6 p-3 bg-gray-50 rounded-xl text-left">
              <p className="text-xs font-semibold text-gray-700">What&apos;s included:</p>
              <ul className="text-xs text-gray-500 mt-1.5 space-y-1 list-disc list-inside">
                <li>Real-time field monitoring & minute-level readings</li>
                <li>Weather forecasts & AI farm advisories</li>
                <li>Onion growth stage tracking</li>
              </ul>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              Available for Android. Check the Releases page for APK and changelog.
            </p>
            <a href="/" className="inline-block mt-4 text-xs text-gray-400 hover:text-[#2E7D32] hover:underline">← Back to home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/icon.svg" alt="AgriSmart" className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-lg" />
          <h1 className="font-display text-3xl font-bold text-gray-900">AgriSmart</h1>
          <p className="text-gray-500 mt-2 text-sm">Smart Onion Farming Platform</p>
          <div className="mt-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Are you an:</h2>
            <p className="text-sm text-gray-400 mt-1">Choose your portal to continue</p>
          </div>
        </div>

        {/* Selection cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* End User */}
          <button
            onClick={() => setView('enduser')}
            className="card p-6 sm:p-8 text-left hover:shadow-lg hover:border-[#2E7D32]/20 hover:-translate-y-0.5 transition-all duration-200 group text-center"
          >
            <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
              <Smartphone size={26} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">End User</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Farmer or field owner. Get the mobile app to manage your crops.
            </p>
            <span className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium group-hover:bg-blue-700 transition-colors">
              Continue as End User
            </span>
            <p className="text-xs text-gray-400 mt-3">Download APK v{version}</p>
          </button>

          {/* Admin */}
          <button
            onClick={() => router.push('/login')}
            className="card p-6 sm:p-8 text-left hover:shadow-lg hover:border-[#2E7D32]/30 hover:-translate-y-0.5 transition-all duration-200 group text-center border-[#2E7D32]/10"
          >
            <div className="w-14 h-14 bg-green-50 group-hover:bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
              <ShieldCheck size={26} className="text-[#2E7D32]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Admin</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Administrator. Sign in to manage users, fields, and alerts.
            </p>
            <span className="mt-5 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#2E7D32] text-white text-sm font-medium group-hover:bg-[#1B5E20] transition-colors">
              Continue as Admin
            </span>
            <p className="text-xs text-gray-400 mt-3">Requires admin credentials</p>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="/" className="hover:underline hover:text-[#2E7D32]">← Back to AgriSmart home</a>
          <span className="mx-2">·</span>
          By continuing you agree to AgriSmart Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
