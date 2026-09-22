# 🏈 Aalto Predators 8v8 Playbook & Tactical Interactive System

[![React](https://img.shields.io/badge/React-19.0-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![League](https://img.shields.io/badge/League-Finland_University_League_(8v8)-red.svg?style=flat-square)](https://www.sajl.fi/)

Official tactical playbook, animation diagramming engine, and coaching management suite for the **Aalto Predators (Aalto University American Football)** competing in the **Finland University League (Korkeakoulusarja)**.

Engineered specifically for **8-on-8 American Football** rules: **3 Offensive Linemen (Left Guard, Center, Right Guard)**, **1 Quarterback**, and **4 Receivers/Skill Positions (X, H, Y, Z / RB)**.

---

## 🌟 Key Features

### 🎯 1. Interactive Tactical Field Board & Animation Engine
- **60 FPS Vector Motion**: Smooth route stem, break point, and ball delivery animations powered by SVG math and `requestAnimationFrame`.
- **Scrubbing & Playback Controls**: Step forward/backward frame-by-frame, continuous auto-looping, speed multiplier adjustments (0.5x, 1.0x, 1.5x, 2.0x), and play reset.
- **3D Stadium Perspective**: Real-time isometric/3D tilt mode providing a dynamic sideline or endzone coaching viewpoint.
- **5-Yard Spacing Grid & Hashmarks**: Precise 5-yard hashmark lines from the line of scrimmage (`LOS 0`) to `+50 YD` depth and `-25 YD` backfield for verifying receiver splits and drop depths.
- **Field Themes**: Quick switching between **Tactical Blue**, **Natural Turf**, **Chalkboard**, and **Stadium Night** themes.
- **Offensive/Defensive Route Coverage Heatmap**: Visual density overlay highlighting field stress zones and open passing windows.

### 📐 2. Formation Gallery & Personnel Lab
- **Categorized Formations**:
  - **Trips 3x1**: Overload flood concepts, boundary 1-on-1 isolation, and high-low triangle reads.
  - **Spread / Twins 2x2**: Horizontal two-high safety stretch with balanced quick-game concepts.
  - **Empty 00 Personnel**: 5-man slide protection with 5 immediate hot route outlets for blitz beating.
  - **Split Backs / Pro 20 Personnel**: Dual-back lead blocking, counter sweeps, and play-action bootlegs.
  - **2-Line Heavy 12 Personnel**: Inline wings and compact line-of-scrimmage power sets.
  - **Bunch & Cluster**: Condensed 3-man clusters creating natural rub routes and switch confusion.
- **Side-by-Side Comparison Mode**: Compare formation geometry, run/pass ratios, coverage strengths, and player coordinates side-by-side.

### 🛡️ 3. Defensive Scout & Coverage Simulator
- **Coverage Schemes**: Interactive simulation against **Cover 0 (All-Out Blitz)**, **Cover 1 (Man-Free)**, **Cover 2 (Tampa/Zone)**, **Cover 3 (Sky/Cloud)**, **Cover 4 (Quarters)**, and **Cover 2 Man-Under**.
- **Defensive Box Counter**: Automatic safety shade and box count tracker (e.g. 4-man, 5-man, or 6-man box) to identify run/pass audibles pre-snap.
- **Pass Protection Diagrams**: 3-Man Slide, BOB (Big-on-Big), Dual-Guard Pinch, and Half-Slide with RB scan rules.

### ✏️ 4. Custom Play Designer & Whiteboard
- **Drag-and-Drop 8v8 Positioning**: Move all 8 offensive tokens (LG, C, RG, QB, RB, X, Y, Z, H) with live SVG coordinate snapping.
- **Visual Route Painter**: Click-to-draw multi-segment passing routes, blocking assignments, and pre-snap motions.
- **Formation Preset Library**: Save custom alignments as reusable formation templates or load standard presets.
- **Playbook Integration**: One-click export to inject custom-designed plays directly into the active game plan.

### 📋 5. In-Game Play Call Tracker & Practice Scripting
- **Real-Time Game Logger**: Record down, distance, field position, play called, play outcome (Complete, Incomplete, Rush Gain, Touchdown, Turnover), and efficiency analytics.
- **Practice Script Generator**: Create period-based practice schedules (e.g. 7-on-7, Team Period, Red Zone, 2-Minute Drill) with rep counters and target concepts.
- **Coaching Cues & Read Progressions**: Primary read cues, key defender conflict reads (e.g., Apex LB, Boundary CB), and quarterback footwork timings.

### 🖨️ 6. Wristband Insert & Print Exporter
- **Coach / QB Wristband Inserts**: Formats plays into a high-density 3-column micro-grid ready to print and insert into quarterback forearm play wristbands.
- **High-Resolution Play Sheets**: Printable play-by-play sheets with vector route diagrams, personnel breakdowns, and coaching notes for game day binders.

### 👥 7. Roster Management & Depth Chart Drag-and-Drop
- **Interactive Depth Chart**: Drag-and-drop university roster players into 8v8 starting slots (`C`, `LG`, `RG`, `QB`, `RB`, `X`, `Y`, `Z`).
- **Player Profiles**: Jersey numbers, dual-position assignments, eligibility, and player performance notes.

### 🇫🇮 8. Bilingual Glossary (English & Suomi) & Quiz Lab
- **Finland University League Terminology**: Complete English and Finnish (Suomi) football definitions (e.g. *Aloituslinja*, *Heittohyökkäys*, *Miespuolustus*, *Aluepuolustus*).
- **Playbook Quiz Mode**: Interactive coaching quiz testing players and rookies on route stems, blitz checks, and assignments.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.react.dev/)
- **Animations**: [Motion](https://motion.dev/) & Native SVG vector transforms
- **Audio Effects**: [Howler.js](https://howlerjs.com/)
- **Data Visualizations & Charts**: [Recharts](https://recharts.org/)
- **State Management & Persistence**: Reactive LocalStorage state with JSON import/export schemas

---

## 📂 Project Structure

```
aalto-predators-8v8-playbook/
├── public/                     # Static assets, SVG logos, and icons
│   ├── aalto-predators-logo.svg
│   └── favicon.svg
├── src/
│   ├── components/             # UI Components & Interactive Modals
│   │   ├── AnimationController.tsx     # 60 FPS play animation & scrubber
│   │   ├── CoachingTipsModal.tsx       # Progression reads & defensive cues
│   │   ├── CustomPlayDesigner.tsx      # Whiteboard drag & route drawing
│   │   ├── DefensiveScoutModal.tsx     # Coverage simulations & box reads
│   │   ├── DepthChartDndSection.tsx    # Drag-and-drop starting lineup
│   │   ├── FieldBoard.tsx              # SVG field, players, & route vectors
│   │   ├── FolderManageModal.tsx       # Custom game plan folders
│   │   ├── FormationGalleryModal.tsx   # Formation comparison & personnel lab
│   │   ├── GamePlanStatsModal.tsx      # Run/pass balance & tendencies
│   │   ├── GlossaryModal.tsx           # Bilingual FI/EN football terms
│   │   ├── InGameTrackerModal.tsx      # Live down & distance drive tracker
│   │   ├── PlaySelector.tsx            # Playbook sidebar & search engine
│   │   ├── PracticeScriptModal.tsx     # Practice script & rep scheduler
│   │   ├── PrintLayoutModal.tsx        # High-res printable coach cards
│   │   ├── RosterManagementModal.tsx   # Team roster & depth chart editor
│   │   ├── RouteTreeModal.tsx          # 0-9 passing route tree reference
│   │   └── WristbandExportModal.tsx    # 3-column QB wristband insert
│   ├── data/                   # Playbook data, formations & defenses
│   │   ├── allPlays.ts                 # Full 8v8 play database
│   │   ├── defenseSchemes.ts           # Cover 0-4 defensive definitions
│   │   ├── formationGalleryData.ts     # Personnel groupings & metadata
│   │   ├── formationTemplates.ts       # Standard & custom templates
│   │   ├── glossary.ts                 # Finnish-English terminology
│   │   ├── passProtectionData.ts       # 3-man OL slide protections
│   │   ├── rosterData.ts               # Default team roster
│   │   └── routeTree.ts                # Route numbers & stem definitions
│   ├── utils/                  # Helper utilities & local persistence
│   │   ├── coachingCuesStorage.ts
│   │   ├── defensiveScoutStorage.ts
│   │   ├── folderStorage.ts
│   │   ├── inGameTracker.ts
│   │   ├── playbookExportImport.ts
│   │   └── practiceScriptStorage.ts
│   ├── App.tsx                 # Main application state orchestration
│   ├── main.tsx                # React root entry point
│   ├── index.css               # Global Tailwind CSS entry
│   └── types.ts                # TypeScript interfaces & types
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML entry point with typography
├── metadata.json               # Applet metadata configuration
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

## 🚀 Getting Started (Hızlı Kurulum)

### Gereksinimler (Prerequisites)
- [Node.js](https://nodejs.org/) (v18.0.0 veya daha yenisi önerilir)
- `npm` veya `yarn` / `pnpm` / `bun`

### 1. Repoyu Klonlayın (Clone the Repository)
```bash
git clone https://github.com/KULLANICI_ADINIZ/aalto-predators-8v8-playbook.git
cd aalto-predators-8v8-playbook
```

### 2. Bağımlılıkları Yükleyin (Install Dependencies)
```bash
npm install
```

### 3. Geliştirme Sunucusunu Başlatın (Start Development Server)
```bash
npm run dev
```
Uygulama yerel olarak `http://localhost:3000` adresinde çalışacaktır.

### 4. Üretim Derlemesi Alın (Production Build)
```bash
npm run build
```
Derleme çıktıları `dist/` klasörüne oluşturulur.

### 5. Derlemeyi Önizleyin (Preview Build)
```bash
npm run preview
```

### 6. TypeScript Tip Kontrolü (Type Check / Lint)
```bash
npm run lint
```

---

## 📤 GitHub'a Yükleme ve Push Rehberi (How to Push to GitHub)

Projeyi sıfırdan GitHub deponuza yüklemek için aşağıdaki adımları terminalinizde sırasıyla çalıştırın:

### 1. Git'i Başlatın (Initialize Git)
```bash
git init
```

### 2. Dosyaları Ekleyin (Stage All Files)
```bash
git add .
```

### 3. İlk Commit'i Oluşturun (Create Initial Commit)
```bash
git commit -m "feat: initial release of Aalto Predators 8v8 Playbook system"
```

### 4. Ana Dalı `main` Olarak Ayarlayın (Set Default Branch)
```bash
git branch -M main
```

### 5. GitHub Deponuzu Uzak Kaynak Olarak Ekleyin (Add Remote Origin)
> *Not: GitHub'da yeni ve boş bir repository oluşturduktan sonra verilen URL adresini girin.*
```bash
git remote add origin https://github.com/KULLANICI_ADINIZ/aalto-predators-8v8-playbook.git
```

### 6. GitHub'a Push Edin (Push to GitHub)
```bash
git push -u origin main
```

---

## ⚙️ Ortam Değişkenleri (Environment Variables)

Proje kök dizininde yer alan `.env.example` dosyasını referans alarak `.env` oluşturabilirsiniz:

```env
# Gemini API Key (Opsiyonel AI taktik asistanı özellikleri için)
GEMINI_API_KEY="your-gemini-api-key"

# Barındırma URL'si
APP_URL="http://localhost:3000"
```

---

## 🏈 8v8 Football Rules Reference (Finland University League)

- **Line of Scrimmage**: 3 Offensive Linemen (`LG`, `C`, `RG`) must be aligned on the line of scrimmage.
- **Eligible Receivers**: All players not on the offensive line are eligible pass catchers (`QB`, `RB`, `X`, `Y`, `Z`, `H`).
- **Pass Protection**: 3-man slide or split protection; RB scans for inside A/B gap blitzers.
- **Roster Flexibility**: Designed to adapt from 8v8 university intramural tournaments up to competitive collegiate league formats.

---

## 📄 Lisans (License)

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır. Serbestçe kullanılabilir, geliştirilebilir ve dağıtılabilir.

---

**Developed for Aalto Predators • Otaniemi, Espoo, Finland 🇫🇮 🏈**
