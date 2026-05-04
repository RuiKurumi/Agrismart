# 🧅 AgriSmart

A Decision Support System (DSS) for Filipino onion farmers, combining real-time weather data, AI-powered advisory, and farm management tools into a mobile-first platform. Following the Agile Development model, this repository is a representation of our progress in our Capstone Project.

---

## 📱 Overview

AgriSmart is a Flutter mobile application paired with a Next.js admin panel, designed to help smallholder onion farmers in the Philippines make better farming decisions. The app provides weather-based alerts, crop growth tracking, and an AI chatbot assistant named **Maya** that works both online and offline.

---

## 🏗️ Project Structure

```
Agrismart/
├── agrismart_dev2/        # Flutter mobile app
└── Agrismart-ADMIN/       # Next.js admin panel
```

---

## ✨ Features

### Mobile App (Flutter)
- **Authentication** — Email/password, Google Sign-In, Phone (OTP), Guest access
- **Farm Onboarding** — Set up farm size, irrigation type, onion variety, and planting date
- **Farm Management** — Add, edit, delete multiple fields with growth stage tracking
- **Home Dashboard** — Real-time weather via Open-Meteo API, auto-generated alerts, 5-day forecast
- **Maya AI Chatbot** — Powered by Gemini 2.5 Flash (online) with local GGUF model fallback (offline)
- **Localization** — English and Filipino (Tagalog) support
- **Dark Mode** — Full app-wide dark theme support
- **Profile Management** — Photo upload, province/municipality, bio

### Admin Panel (Next.js)
- **Dashboard** — Real-time stats, user growth chart, fields by variety chart
- **User Management** — View, search, promote/demote admin roles, delete users
- **Alerts** — Create, toggle, and delete global weather alerts
- **Weather Monitor** — Fetch live weather for any Philippine province with agricultural advisory
- **Articles & Guides** — Create and publish farming guides visible in the app
- **Farm Fields** — View all registered fields across all users with growth stage tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | Flutter 3.41+ / Dart |
| Admin Panel | Next.js 14 (App Router) / TypeScript |
| Backend | Firebase (Auth, Firestore, Storage) |
| AI (Online) | Google Gemini 2.5 Flash |
| AI (Offline) | llama_flutter_android (GGUF models) |
| Weather | Open-Meteo API (free, no key required) |
| Styling (Admin) | Tailwind CSS |
| Charts | Recharts |

---

## 🚀 Getting Started

### Mobile App

**Prerequisites:**
- Flutter 3.41+
- Android SDK 26+
- Firebase project with Android app registered

**Prerequisites:**
- Node.js 18+
- Firebase project with Web app registered

## 🌾 Onion Growth Stages

AgriSmart automatically calculates the crop growth stage based on days after planting (DAP):

| Stage | Days After Planting |
|-------|-------------------|
| Germination | 0 – 14 DAP |
| Seedling | 15 – 30 DAP |
| Vegetative | 31 – 60 DAP |
| Bulbing | 61 – 90 DAP |
| Maturation | 91 – 110 DAP |
| Ready for Harvest | 111+ DAP |

---

## 🤖 Maya — AI Agricultural Assistant

Maya is AgriSmart's built-in AI assistant specialized in Philippine onion farming. She automatically switches between:

- **Online mode** — Google Gemini 2.5 Flash via API
- **Offline mode** — Local GGUF model via `llama_flutter_android`
- **Force offline** — Manual override in Advanced Settings

---

## 🌦️ Weather Alerts

The app auto-generates alerts based on real-time weather data:

| Alert | Trigger Condition |
|-------|-----------------|
| 🌧 Heavy Rain | Precipitation > 10mm |
| 🌀 Strong Winds | Wind speed > 60 km/h |
| 🌡 Extreme Heat | Temperature > 38°C |
| 💧 High Humidity | Humidity > 85% |
| ☀️ Drought Risk | No rain forecast + humidity < 40% |

---

## 📦 Key Dependencies

### Flutter
```yaml
firebase_core, firebase_auth, cloud_firestore, firebase_storage
google_sign_in, google_generative_ai
llama_flutter_android, connectivity_plus
image_picker, http, flutter_dotenv
flutter_localizations, intl
```

### Next.js
```json
"firebase", "recharts", "lucide-react", "tailwindcss"
```

---

## 📄 License

This project is developed as part of an academic requirement. All rights reserved.

---

*Built for Filipino farmers.*
