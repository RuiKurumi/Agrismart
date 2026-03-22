# 🧅 AgriSmart

A Decision Support System (DSS) for Filipino onion farmers, combining real-time weather data, AI-powered advisory, and farm management tools into a mobile-first platform.

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
- **Maya AI Chatbot** — Powered by Gemini 1.5 Flash (online) with local GGUF model fallback (offline)
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
| AI (Online) | Google Gemini 1.5 Flash |
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

**Setup:**
```bash
cd agrismart_dev2
flutter pub get
```

Create a `.env` file in the project root:
```
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

Run:
```bash
flutter run
```

### Admin Panel

**Prerequisites:**
- Node.js 18+
- Firebase project with Web app registered

**Setup:**
```bash
cd Agrismart-ADMIN
npm install
```

Create a `.env.local` file:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Run:
```bash
npm run dev
```

---

## 🔐 Admin Access

To grant admin access, set `role: "admin"` on a user's Firestore document:

```
users/{uid}/
  role: "admin"
```

Only users with this role can access the admin panel.

---

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

- **Online mode** — Google Gemini 1.5 Flash via API
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

## 🗂️ Firestore Structure

```
users/{uid}
  ├── name, email, province, city, bio
  ├── photoUrl
  ├── role: "user" | "admin"
  ├── onboardingComplete: true
  └── fields/{fieldId}
        ├── name, size, variety, irrigationType
        ├── plantingDate, status, createdAt

alerts/{alertId}
  ├── title, subtitle, type, severity
  ├── active, autoGenerated, location

articles/{articleId}
  ├── title, summary, content, category
  └── published, createdAt
```

---

## 🌐 Deployment

The admin panel is designed for deployment on **Render**:

1. Push to GitHub
2. Create a new **Web Service** on Render
3. Connect the `Agrismart-ADMIN` folder
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables in Render dashboard

---

## 📄 License

This project is developed as part of an academic requirement. All rights reserved.

---

*Built with 🧅 for Filipino farmers.*
