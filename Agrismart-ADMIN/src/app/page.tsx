'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ArrowRight, BarChart3, Bell, Bot, ChevronRight, CloudRain, Download,
  Droplets, ExternalLink, FileText, Languages, Layout, Leaf, MapPin,
  MapPinned, Menu, Play, Smartphone, Sprout, Sun, Thermometer,
  UserCircle, Users, Wind, X,
} from 'lucide-react';
import { GITHUB_LATEST_RELEASE_URL } from '@/lib/github';
import { useLatestVersion } from '@/hooks/useLatestVersion';

const HERO_IMG = '/images/onion-field.jpg';
const PHONE_IMG = '/images/onion-seedlings.jpg';
const MINDORO_IMG = '/images/onion-farmer.jpg';
const HARVEST_IMG = '/images/onion-harvest.jpg';
const WORKERS_IMG = '/images/onion-field-workers.jpg';
const CURED_IMG = '/images/harvested-onions.jpg';

const navLinks = [
  { label: 'The app', href: '#platform' },
  { label: 'Season guide', href: '#how' },
  { label: 'Mindoro', href: '#mindoro' },
];

const growthStages = [
  { name: 'Germination', days: 'Day 0–14', desc: 'Seeds sprout', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { name: 'Seedling', days: 'Day 15–30', desc: 'First leaves', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { name: 'Vegetative', days: 'Day 31–60', desc: 'Leaves grow', color: 'bg-green-100 text-green-800 border-green-200' },
  { name: 'Bulbing', days: 'Day 61–90', desc: 'Bulbs swell', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { name: 'Maturation', days: 'Day 91–110', desc: 'Tops fall over', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { name: 'Harvest', days: 'Day 111+', desc: 'Ready to pick', color: 'bg-red-100 text-red-800 border-red-200' },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const version = useLatestVersion();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/icon.svg" alt="AgriSmart" className="w-8 h-8 rounded-lg shadow-sm" />
              <span className="font-display font-bold text-[15px]">AgriSmart</span>
              <span className="hidden sm:inline text-[11px] text-gray-400 border-l border-gray-200 pl-2.5 ml-1">Occidental Mindoro</span>
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
              <Link href="/portal" onClick={() => setMobileOpen(false)} className="btn-primary text-center py-2.5 mt-1">Enter the platform</Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMG}
            alt="Rows of green onions growing in a field"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C210D]/90 via-[#183717]/75 to-[#2E7D32]/20" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-white">
              <p className="inline-flex items-center gap-2 text-[11px] tracking-widest font-bold uppercase bg-white/10 border border-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-[#F9C84B] rounded-full" /> Made for Occidental Mindoro
              </p>
              <h1 className="font-display text-[34px] sm:text-[44px] font-bold leading-[0.95] mt-4">
                Built for<br />
                <span className="text-[#F9C84B]">onion farmers</span>
              </h1>
              <p className="text-white/80 text-[14px] leading-relaxed mt-4 max-w-md">
                Plan your season, watch the weather, and make confident decisions in the field.
                AgriSmart brings your crops, forecasts, and farm advice into one simple app.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <Link href="/portal" className="inline-flex items-center justify-center gap-2 bg-white text-[#122712] px-5 py-3 rounded-xl font-semibold hover:bg-gray-50 shadow">
                  Open the app <ArrowRight size={15} />
                </Link>
                <a href={GITHUB_LATEST_RELEASE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#F9C84B] text-[#122712] px-5 py-3 rounded-xl font-semibold hover:bg-[#F2B705] shadow">
                  <Download size={15} /> Download APK
                </a>
              </div>
              <p className="text-[11px] text-white/50 mt-4">Android app · English &amp; Tagalog · Works offline</p>
            </div>

            {/* App preview */}
            <div className="relative lg:pl-6">
              <div className="bg-white rounded-[24px] shadow-2xl overflow-hidden border border-white/30">
                <div className="relative h-60">
                  <Image
                    src={PHONE_IMG}
                    alt="Young onion seedlings growing in rich soil"
                    fill
                    sizes="(min-width: 1024px) 480px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
                  <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1.5 rounded-xl shadow flex items-center gap-2">
                    <img src="/icon.svg" alt="" className="w-6 h-6 rounded-md" />
                    <span className="text-xs font-bold">AgriSmart</span>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full ml-1 animate-pulse" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1.5 rounded-xl shadow flex items-center gap-1.5">
                    <Sun size={12} className="text-amber-500" />
                    <span className="text-[11px] font-semibold">29°C</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-xl p-3 shadow">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold flex items-center gap-1.5"><Sprout size={13} className="text-[#2E7D32]" /> Sablayan field</p>
                      <span className="text-[9px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-full">Seedling</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Day 22 · About 88 days to harvest</p>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#2E7D32] w-[20%]" /></div>
                  </div>
                </div>
                <div className="p-3 flex gap-2 text-xs">
                  <Link href="/portal" className="flex-1 bg-[#122712] text-white rounded-xl py-2.5 text-center font-medium inline-flex items-center justify-center gap-1.5"><Play size={12} /> Open app</Link>
                  <a href={GITHUB_LATEST_RELEASE_URL} target="_blank" rel="noopener noreferrer" className="flex-1 border border-gray-200 rounded-xl py-2.5 text-center font-medium">Download APK</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform */}
      <section id="platform" className="py-14 sm:py-20 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold tracking-widest text-[#2E7D32] uppercase">One goal, two views</p>
            <a href={GITHUB_LATEST_RELEASE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex text-xs font-medium text-gray-500 hover:text-gray-900 items-center gap-1 shrink-0">Releases <ExternalLink size={11} /></a>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 max-w-2xl">For the field. For the people behind it.</h2>
          <p className="text-sm text-gray-500 leading-relaxed mt-3 max-w-2xl">
            Growers get a simple mobile app. Coordinators get a clear view of every farm, field,
            and advisory — so support reaches the people who need it.
          </p>

          <div className="grid md:grid-cols-2 gap-10 mt-9">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#2E7D32] uppercase flex items-center gap-1.5"><Smartphone size={13} /> Farmer app</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {[
                  { icon: Sprout, title: 'Getting started', desc: 'Add your farm, onion variety, planting date, and location in a few taps.' },
                  { icon: MapPinned, title: 'Your fields', desc: 'Keep every field organized and see its growth stage change with the season.' },
                  { icon: CloudRain, title: 'Today at a glance', desc: 'Local weather, farm advice, and the next five days on one screen.' },
                  { icon: Languages, title: 'In your language', desc: 'Switch between English and Tagalog, with a dark mode for early mornings.' },
                  { icon: UserCircle, title: 'Your account', desc: 'Sign in with email, Google, or a one-time code — or continue as a guest.' },
                  { icon: Bell, title: 'Timely alerts', desc: 'Get a heads-up before heavy rain, strong wind, heat, or high humidity.' },
                ].map(f => (
                  <div key={f.title} className="border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <f.icon size={15} className="text-[#2E7D32]" />
                    </div>
                    <p className="text-sm font-semibold mt-2.5">{f.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase flex items-center gap-1.5"><Layout size={13} /> Admin view</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {[
                  { icon: BarChart3, title: 'Overview', desc: 'See how onion fields across the province are progressing.' },
                  { icon: Users, title: 'People', desc: 'Review new accounts and keep roles and access up to date.' },
                  { icon: FileText, title: 'Guides', desc: 'Publish practical, season-ready advice for growers.' },
                  { icon: Bell, title: 'Advisories', desc: 'Send weather and farm alerts when they matter most.' },
                  { icon: CloudRain, title: 'Provincial weather', desc: 'Follow the forecast and issue local advisories.' },
                  { icon: MapPin, title: 'Farm records', desc: 'View registered farms, crop stages, and progress at a glance.' },
                ].map(f => (
                  <div key={f.title} className="bg-[#F8FAF9] rounded-2xl p-4 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                      <f.icon size={15} className="text-gray-700" />
                    </div>
                    <p className="text-sm font-semibold mt-2.5">{f.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Season guide */}
      <section id="how" className="py-14 sm:py-20 bg-[#F8FAF9] border-y border-gray-100 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-bold tracking-widest text-[#2E7D32] uppercase flex items-center justify-center gap-1.5"><Leaf size={12} /> Season guide</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">A guide for every stage of the season.</h2>
            <p className="text-sm text-gray-500 leading-relaxed mt-3">
              From planting day to harvest, AgriSmart follows your crop and adjusts its advice
              to what your onions need right now.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-7 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs font-bold tracking-widest text-[#2E7D32] uppercase">Your crop, at a glance</p>
              <p className="text-[11px] text-gray-400">Just set your planting date once.</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mt-4">
              {growthStages.map(s => (
                <div key={s.name} className={`rounded-xl border px-2 py-3 text-center ${s.color}`}>
                  <p className="text-[10px] font-bold">{s.days}</p>
                  <p className="text-xs font-bold mt-1 leading-none">{s.name}</p>
                  <p className="text-[10px] opacity-70 mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="flex-1 bg-amber-200" /><div className="flex-1 bg-emerald-200" /><div className="flex-[2] bg-green-300" /><div className="flex-[2] bg-sky-300" /><div className="flex-[1.2] bg-amber-200" /><div className="flex-1 bg-red-200" />
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> Your planting date sets the pace.</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" /> The stage and advice stay up to date.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Weather + Maya */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#2E7D32] uppercase">Weather</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">The forecast, in plain language.</h2>
            <p className="text-sm text-gray-500 leading-relaxed mt-3 max-w-md">
              AgriSmart keeps an eye on the conditions that matter most to onions — and tells you
              when to act.
            </p>
            <div className="space-y-2 mt-6">
              {[
                { icon: CloudRain, label: 'Heavy rain', val: 'Over 10 mm' },
                { icon: Wind, label: 'Strong wind', val: 'Over 60 km/h' },
                { icon: Thermometer, label: 'Extreme heat', val: 'Above 38°C' },
                { icon: Droplets, label: 'High humidity', val: 'Above 85%' },
                { icon: Sun, label: 'Dry spell', val: 'No rain and dry air' },
              ].map(a => (
                <div key={a.label} className="flex items-center gap-3 border border-gray-100 rounded-xl px-3 py-2.5">
                  <a.icon size={14} className="text-gray-600" />
                  <span className="text-sm flex-1">{a.label}</span>
                  <span className="text-xs font-medium bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">{a.val}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Advisories are based on the forecast for your field.</p>
          </div>

          <div className="rounded-2xl bg-[#122712] text-white p-6 sm:p-7 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#F9C84B]/15 rounded-full blur-2xl" />
            <p className="inline-flex items-center gap-1.5 text-[11px] tracking-widest font-bold uppercase bg-white/10 border border-white/10 px-2.5 py-1 rounded-full"><Bot size={12} /> Maya</p>
            <h3 className="font-display text-xl font-bold mt-3">A farm assistant in your pocket.</h3>
            <p className="text-sm text-white/70 leading-relaxed mt-2">
              Ask about planting, pests, or the weather. Maya gives clear, practical answers —
              and keeps helping when the signal drops.
            </p>
            <div className="space-y-2 mt-5">
              <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[12px] text-white/80 max-w-[85%]">
                Maya, is it safe to spray this week?
              </div>
              <div className="bg-[#F9C84B] text-[#122712] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-[12px] font-medium max-w-[90%] ml-auto">
                Light rain is expected Tuesday. Spray before noon on Monday for the best window.
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-[11px] text-white/60">With a signal</p>
                <p className="text-sm font-semibold">Full answers</p>
                <p className="text-[11px] text-white/50">Ask anything</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-[11px] text-white/60">Without a signal</p>
                <p className="text-sm font-semibold">Everyday guidance</p>
                <p className="text-[11px] text-white/50">No connection needed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mindoro */}
      <section id="mindoro" className="py-14 sm:py-20 bg-[#F8FAF0] border-y border-[#E8EED8] scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <div className="rounded-[20px] overflow-hidden shadow-lg border border-white">
                <Image
                  src={MINDORO_IMG}
                  alt="A farmer holding freshly harvested onions"
                  width={1200}
                  height={800}
                  sizes="(min-width: 1024px) 550px, 100vw"
                  className="w-full h-[340px] sm:h-[420px] object-cover"
                />
              </div>
              <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow border border-gray-100 px-3 py-2 flex items-center gap-2">
                <MapPin size={14} className="text-[#2E7D32]" /><span className="text-xs font-medium">From seedbed to harvest</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-[#2E7D32] uppercase flex items-center gap-1.5"><MapPinned size={12} /> Occidental Mindoro</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2 leading-tight">Rooted in Mindoro&apos;s onion country.</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-3">
                Onion farming here is a way of life. AgriSmart is shaped around the seasons,
                weather, and everyday decisions of local growers — from Sablayan to Bulalacao.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">National onion harvest · 2024</p>
                  <p className="text-lg font-bold">264,324 MT <span className="text-xs font-normal text-green-600">+4.5%</span></p>
                  <p className="text-xs text-gray-400">PSA Crops Survey</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Planted area</p>
                  <p className="text-lg font-bold">5,715 → 7,569 ha</p>
                  <p className="text-xs text-gray-400">2021 → 2022 · Doubled after strong earnings</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Sablayan&apos;s onion fields</p>
                  <p className="text-lg font-bold">321 → 521 ha</p>
                  <p className="text-xs text-gray-400">244 → 359 farmers · 3,210 MT · +64% (2023 → 2024)</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wide">Potential &amp; price</p>
                  <p className="text-lg font-bold">7,000 ha · ₱40–45/kg</p>
                  <p className="text-xs text-gray-400">Expansion target · Stable farmgate price, March 2026</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 mt-3">
                <p className="text-xs font-semibold">Cold storage, closer to home</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                  Two 2,800 MT facilities in Magsaysay and San Jose can hold about 100,000 bags each,
                  giving growers more control over when they sell. The ₱125M-per-site project also
                  brings ₱200k in assistance and Good Agricultural Practices training to Bulalacao.
                </p>
                <p className="text-xs text-gray-400 mt-2">Sources: PIA MIMAROPA, DA-MIMAROPA, PSA.</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-4">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1">Grown here</span>
                <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full">Red Creole</span>
                <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full">Yellow Granex</span>
                <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full">Sablayan · Bulalacao · Magsaysay · San Jose</span>
              </div>
            </div>
          </div>

          {/* Gallery + portal */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            <div className="relative rounded-2xl overflow-hidden h-48">
              <Image src={HARVEST_IMG} alt="Farmers packing harvested onions" fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <p className="absolute bottom-2 left-3 right-3 text-white text-xs font-medium">Packing the harvest</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-48">
              <Image src={WORKERS_IMG} alt="Workers harvesting onions in a field" fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <p className="absolute bottom-2 left-3 right-3 text-white text-xs font-medium">Hands in the field</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-48">
              <Image src={CURED_IMG} alt="Harvested onions curing in the field" fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <p className="absolute bottom-2 left-3 right-3 text-white text-xs font-medium">Cured and ready</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col justify-center">
              <p className="text-[11px] font-bold tracking-widest text-[#2E7D32] uppercase">New here?</p>
              <p className="text-sm font-semibold mt-1">Choose your path.</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">Download the farmer app or sign in to the admin dashboard.</p>
              <Link href="/portal" className="mt-3 text-xs font-semibold text-[#2E7D32] inline-flex items-center gap-1">Go to the portal <ChevronRight size={12} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#122712] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold">Grow a better season.</h2>
            <p className="text-sm text-white/60 mt-1">Made for onion growers across Occidental Mindoro.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/portal" className="bg-white text-[#122712] px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5">Enter the platform <ArrowRight size={14} /></Link>
            <a href={GITHUB_LATEST_RELEASE_URL} target="_blank" rel="noopener noreferrer" className="bg-[#F9C84B] text-[#122712] px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5"><Download size={14} /> APK v{version}</a>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/icon.svg" alt="AgriSmart" className="w-7 h-7 rounded-md" />
              <span className="text-sm font-semibold">AgriSmart</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 max-w-sm">Practical weather and farm guidance for Occidental Mindoro onion growers.</p>
            <p className="text-[11px] text-gray-400 mt-1">Data from PIA MIMAROPA, PSA, and DA-MIMAROPA.</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/portal" className="hover:text-[#2E7D32]">Portal</Link>
            <a href="https://github.com/RuiKurumi/Agrismart" target="_blank" rel="noopener noreferrer" className="hover:text-[#2E7D32]">GitHub</a>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
