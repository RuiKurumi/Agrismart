'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  MapPin, Sun, CloudRain, Wind, Thermometer, Droplets, Sprout, Bell,
  Smartphone, Languages, UserCircle, BarChart3, Users, FileText,
  Bot, Database, Cpu, Layout, ArrowRight, Download, ExternalLink, Menu, X,
  Leaf, MapPinned, Waves, ChevronRight, Play
} from 'lucide-react';
import { GITHUB_LATEST_RELEASE_URL } from '@/lib/github';
import { useLatestVersion } from '@/hooks/useLatestVersion';

const HERO_IMG = 'https://pia.gov.ph/wp-content/uploads/2024/02/Occidental-Mindoro-to-boost-onion-cassava-production-through-specialized-training-1-1024x683.jpg';
const SPOTLIGHT_IMG = 'https://pia.gov.ph/wp-content/uploads/2026/03/Onion-prices-in-Occidental-Mindoro-stabilize-after-earlier-fluctuations-1024x768.jpg';
const FIELD_IMG = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80&auto=format&fit=crop';
const ONION_ROWS_IMG = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80&auto=format&fit=crop';

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'How it works', href: '#how' },
  { label: 'Mindoro', href: '#mindoro' },
];

const growthStages = [
  { name: 'Germination', dap: '0–14', desc: 'Seed sprouts', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { name: 'Seedling', dap: '15–30', desc: 'First leaves', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { name: 'Vegetative', dap: '31–60', desc: 'Rapid leaf growth', color: 'bg-green-100 text-green-800 border-green-200' },
  { name: 'Bulbing', dap: '61–90', desc: 'Bulb swells', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { name: 'Maturation', dap: '91–110', desc: 'Neck softens', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { name: 'Ready', dap: '111+', desc: 'Harvest', color: 'bg-red-100 text-red-800 border-red-200' },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const version = useLatestVersion();
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav — minimal */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/icon.svg" alt="AgriSmart" className="w-8 h-8 rounded-lg shadow-sm" />
              <span className="font-display font-bold text-[15px]">AgriSmart</span>
              <span className="hidden sm:inline text-[11px] text-gray-400 border-l border-gray-200 pl-2.5 ml-1">DSS · Occidental Mindoro</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5">
              {navLinks.map(l => <a key={l.href} href={l.href} className="text-sm text-gray-500 hover:text-gray-900">{l.label}</a>)}
            </nav>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/portal" className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2">Enter</Link>
              <Link href="/portal" className="btn-primary py-2 px-4 text-sm">Get started</Link>
            </div>
            <button className="md:hidden p-2 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
          {mobileOpen && (
            <div className="md:hidden py-3 border-t border-gray-100 flex flex-col gap-2">
              {navLinks.map(l => <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="py-2 text-sm text-gray-600">{l.label}</a>)}
              <Link href="/portal" onClick={() => setMobileOpen(false)} className="btn-primary text-center py-2.5 mt-1">Enter Platform</Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero — single message, no stats */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src={HERO_IMG} alt="Occidental Mindoro onion training field — PIA" fill priority className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-r from-[#122712]/95 via-[#1B3A1A]/80 to-[#2E7D32]/30" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <p className="inline-flex items-center gap-2 text-[11px] tracking-widest font-bold uppercase bg-white/10 border border-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#F9C84B] rounded-full" /> Capstone · Sprague & Carlson DSS
              </p>
              <h1 className="font-display text-[34px] sm:text-[44px] font-bold leading-[0.95] mt-4">
                Built for<br />
                <span className="text-[#F9C84B]">onion farmers</span>
              </h1>
              <p className="text-white/80 text-[14px] leading-relaxed mt-4 max-w-md">
                A decision support system combining weather, AI, and field management — mobile-first, designed with and for Occidental Mindoro.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <Link href="/portal" className="inline-flex items-center justify-center gap-2 bg-white text-[#122712] px-5 py-3 rounded-xl font-semibold hover:bg-gray-50 shadow">
                  Enter Platform <ArrowRight size={15} />
                </Link>
                <a href={GITHUB_LATEST_RELEASE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#F9C84B] text-[#122712] px-5 py-3 rounded-xl font-semibold hover:bg-[#F2B705] shadow">
                  <Download size={15} /> APK v{version}
                </a>
              </div>
              <p className="text-[11px] text-white/50 mt-4">Flutter app + Next.js admin · MapLibre · No weather API key needed</p>
            </div>

            {/* Mock — simplified, no duplicated numbers */}
            <div className="relative lg:pl-6">
              <div className="bg-white rounded-[20px] shadow-2xl overflow-hidden border border-white/20">
                <div className="relative h-56">
                  <Image src={FIELD_IMG} alt="Mindoro lowland field" fill className="object-cover" unoptimized />
                  <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1.5 rounded-xl shadow flex items-center gap-2">
                    <img src="/icon.svg" alt="" className="w-6 h-6 rounded-md" />
                    <span className="text-xs font-bold">AgriSmart</span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1 animate-pulse" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-xl p-3 shadow">
                    <p className="text-xs font-semibold flex items-center gap-1.5"><Sprout size={13} className="text-[#2E7D32]" /> Field · Sablayan</p>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#2E7D32] w-[41%]" /></div>
                    <p className="text-[10px] text-gray-400 mt-1">Auto stage from planting date</p>
                  </div>
                </div>
                <div className="p-3 flex gap-2 text-xs">
                  <Link href="/portal" className="flex-1 bg-[#122712] text-white rounded-xl py-2.5 text-center font-medium inline-flex items-center justify-center gap-1.5"><Play size={12} /> Open</Link>
                  <a href={GITHUB_LATEST_RELEASE_URL} target="_blank" rel="noopener noreferrer" className="flex-1 border border-gray-200 rounded-xl py-2.5 text-center font-medium">App v{version}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform — app & admin, no market numbers */}
      <section id="platform" className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">One cycle, two surfaces.</h2>
            <a href={GITHUB_LATEST_RELEASE_URL} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex text-xs font-medium text-gray-500 hover:text-gray-900 items-center gap-1">Releases <ExternalLink size={11} /></a>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mt-8">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#2E7D32] uppercase">Mobile — Flutter</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {[
                  { icon: Sprout, title: 'Onboarding', desc: 'Size, irrigation, variety, planting & sowing dates, geolocation.' },
                  { icon: Layout, title: 'Field management', desc: 'Multiple fields, edit & delete, DAP auto stage.' },
                  { icon: CloudRain, title: 'Home', desc: 'Live weather, alerts, articles, 5-day forecast.' },
                  { icon: Languages, title: 'Local', desc: 'English & Tagalog + dark mode.' },
                  { icon: UserCircle, title: 'Auth', desc: 'Email, Google, OTP, guest · profile & photo.' },
                  { icon: Bell, title: 'Alerts', desc: 'Push for heavy rain, wind, heat, humidity.' },
                ].map(f => (
                  <div key={f.title} className="border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors">
                    <f.icon size={16} className="text-[#2E7D32]" />
                    <p className="text-sm font-semibold mt-2">{f.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Admin — Next.js</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {[
                  { icon: BarChart3, title: 'Dashboard', desc: 'Growth chart & fields by variety.' },
                  { icon: Users, title: 'Users', desc: 'Search, roles, pending approvals.' },
                  { icon: FileText, title: 'Guides', desc: 'Publish farming articles.' },
                  { icon: Bell, title: 'Alerts', desc: 'Global toggles & deletes.' },
                  { icon: CloudRain, title: 'Weather', desc: 'Province forecast + advisory.' },
                  { icon: Sprout, title: 'Farms', desc: 'All fields with stage & progress.' },
                ].map(f => (
                  <div key={f.title} className="bg-[#F8FAF9] rounded-2xl p-4 border border-gray-100">
                    <f.icon size={16} className="text-gray-700" />
                    <p className="text-sm font-semibold mt-2">{f.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — tech only, no reuse of feature text */}
      <section id="how" className="py-12 bg-[#F8FAF9] border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-center">How it’s built</h2>
          <p className="text-center text-sm text-gray-500 mt-2">Turban — knowledge base separate from inference.</p>

          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <Database size={20} className="mx-auto text-blue-600" />
              <p className="text-sm font-semibold mt-3">Data</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Firestore (farms, alerts, articles) · Open-Meteo · SharedPreferences offline cache</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center ring-1 ring-[#2E7D32]/10">
              <Cpu size={20} className="mx-auto text-[#2E7D32]" />
              <p className="text-sm font-semibold mt-3">Model</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Rule engine for alerts · Groq LLM · On-device inference</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <Layout size={20} className="mx-auto text-amber-600" />
              <p className="text-sm font-semibold mt-3">Interface</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Flutter app · Next.js admin · Tailwind · Recharts · MapLibre</p>
            </div>
          </div>

          {/* Growth stages — sole place for DAP data */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 mt-6">
            <p className="text-xs font-bold tracking-widest text-[#2E7D32] uppercase flex items-center gap-1.5"><Leaf size={12} /> Growth stages — auto from planting date</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mt-4">
              {growthStages.map(s => (
                <div key={s.name} className={`rounded-xl border px-2 py-3 text-center ${s.color}`}>
                  <p className="text-[10px] font-bold">{s.dap} DAP</p>
                  <p className="text-xs font-bold mt-1 leading-none">{s.name}</p>
                  <p className="text-[10px] opacity-70 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="flex-1 bg-amber-200" /><div className="flex-1 bg-emerald-200" /><div className="flex-[2] bg-green-300" /><div className="flex-[2] bg-sky-300" /><div className="flex-[1.2] bg-amber-200" /><div className="flex-1 bg-red-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Weather + Maya — each has exclusive data */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <h3 className="font-display text-xl font-bold">Weather intelligence</h3>
            <p className="text-xs text-gray-500 mt-1">Thresholds live here only — not repeated elsewhere.</p>
            <div className="space-y-2 mt-4">
              {[
                { icon: CloudRain, label: 'Heavy rain', val: '> 10 mm' },
                { icon: Wind, label: 'Strong wind', val: '> 60 km/h' },
                { icon: Thermometer, label: 'Extreme heat', val: '> 38 °C' },
                { icon: Droplets, label: 'High humidity', val: '> 85 %' },
                { icon: Sun, label: 'Drought risk', val: '0 mm + < 40 %' },
              ].map(a => (
                <div key={a.label} className="flex items-center gap-3 border border-gray-100 rounded-xl px-3 py-2.5">
                  <a.icon size={14} className="text-gray-600" />
                  <span className="text-sm flex-1">{a.label}</span>
                  <span className="text-xs font-mono bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">{a.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-[#122712] text-white p-6 sm:p-7 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#F9C84B]/15 rounded-full blur-2xl" />
              <p className="inline-flex items-center gap-1.5 text-[11px] tracking-widest font-bold uppercase bg-white/10 border border-white/10 px-2.5 py-1 rounded-full"><Bot size={12} /> Maya</p>
              <h3 className="font-display text-xl font-bold mt-3">Onion-aware, offline-capable</h3>
              <p className="text-sm text-white/70 leading-relaxed mt-2">Maya is exclusive to this card — model names appear nowhere else. Auto-switch with manual force-offline for low-connectivity sitios.</p>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                  <p className="text-[11px] text-white/60">Online</p>
                  <p className="text-sm font-semibold">LLaMA 3.3 70B</p>
                  <p className="text-[11px] text-white/50">GROQ API</p>
                </div>
                <div className="bg-[#F9C84B] rounded-xl p-3 text-[#122712]">
                  <p className="text-[11px] opacity-70">Offline</p>
                  <p className="text-sm font-bold">Qwen2.5 0.5B</p>
                  <p className="text-[11px] opacity-70">GGUF on-device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mindoro — sole place for ALL production/market numbers */}
      <section id="mindoro" className="py-12 bg-[#F8FAF0] border-y border-[#E8EED8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="relative">
              <div className="rounded-[20px] overflow-hidden shadow-lg border border-white">
                <Image src={SPOTLIGHT_IMG} alt="Onion fields — Occidental Mindoro — PIA" width={1024} height={768} className="w-full h-[340px] object-cover" unoptimized />
              </div>
              <div className="absolute -bottom-3 -right-2 sm:right-3 bg-white rounded-xl shadow border border-gray-100 px-3 py-2 flex items-center gap-2">
                <Waves size={14} className="text-[#2E7D32]" /><span className="text-xs font-medium">Apo Reef → Mina de Oro</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-[#2E7D32] uppercase flex items-center gap-1.5"><MapPinned size={12} /> Occidental Mindoro</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 leading-tight">The market story, in one place.</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-3">
                Numbers on this page appear <span className="font-semibold text-gray-900">only here</span> — nowhere else — to keep the story decluttered.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">National output · 2024</p>
                  <p className="text-lg font-bold">264,324 MT <span className="text-xs font-normal text-green-600">+4.5%</span></p>
                  <p className="text-xs text-gray-400">PSA Crops Survey</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Planted area</p>
                  <p className="text-lg font-bold">5,715 → 7,569 ha</p>
                  <p className="text-xs text-gray-400">2021 → 2022 · doubled after high earnings</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Sablayan growth</p>
                  <p className="text-lg font-bold">321 → 521 ha</p>
                  <p className="text-xs text-gray-400">244 → 359 farmers · 3,210 MT · +64% (2023→2024)</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Potential & price</p>
                  <p className="text-lg font-bold">7,000 ha · ₱40–45/kg</p>
                  <p className="text-xs text-gray-400">MAO expansion · farmgate stabilized Mar 2026</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 mt-3">
                <p className="text-xs font-semibold">Value chain unlocked</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">PRDP cold storages — <span className="font-medium text-gray-900">2× 2,800 MT (100k bags)</span> in Magsaysay (Genaro MPC) & San Jose (Watchers MPC) at <span className="font-medium">₱125M each</span>, plus <span className="font-medium">₱200k</span> assistance & GAP training — monitored in Bulalacao.</p>
                <p className="text-xs text-gray-400 mt-2">Sources: PIA MIMAROPA, DA-MIMAROPA, PSA.</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full">Red Creole</span>
                <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full">Yellow Granex</span>
                <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full">Sablayan · Bulalacao · Magsaysay · San Jose</span>
              </div>
            </div>
          </div>

          {/* Gallery + onboarding — no numbers */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <div className="relative rounded-2xl overflow-hidden h-40">
              <Image src={ONION_ROWS_IMG} alt="Furrows like the icon" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-2 left-3 text-white text-xs font-medium">Icon’s furrows, real fields</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-40">
              <Image src={FIELD_IMG} alt="Irrigated lowland after rice" fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-2 left-3 text-white text-xs font-medium">Lowland after rice</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col justify-center">
              <p className="text-[11px] font-bold tracking-widest text-[#2E7D32] uppercase">Onboarding</p>
              <p className="text-sm font-semibold mt-1">Front page → portal → app/admin</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Choose <span className="font-medium text-gray-700">End User</span> (APK) or <span className="font-medium text-gray-700">Admin</span> (login) at <span className="font-mono text-xs bg-gray-50 border border-gray-100 px-1 rounded">/portal</span>.</p>
              <Link href="/portal" className="mt-3 text-xs font-semibold text-[#2E7D32] inline-flex items-center gap-1">Go to portal <ChevronRight size={12} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — no new data */}
      <section className="bg-[#122712] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold">Grow smarter, together.</h2>
            <p className="text-sm text-white/60 mt-1">For Sablayan, Magsaysay, and San Jose.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/portal" className="bg-white text-[#122712] px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5">Enter <ArrowRight size={14} /></Link>
            <a href={GITHUB_LATEST_RELEASE_URL} target="_blank" rel="noopener noreferrer" className="bg-[#F9C84B] text-[#122712] px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5"><Download size={14} /> APK v{version}</a>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="AgriSmart" className="w-7 h-7 rounded-md" />
            <span className="text-sm font-semibold">AgriSmart</span>
            <span className="text-xs text-gray-400 hidden sm:inline">· Capstone DSS · PIA/PSA/DA data · Open-Meteo · Icon farm/pin design</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Link href="/portal" className="hover:text-[#2E7D32]">Portal</Link>
            <a href="https://github.com/RuiKurumi/Agrismart" target="_blank" rel="noopener noreferrer" className="hover:text-[#2E7D32]">GitHub</a>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
