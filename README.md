# 🏈 Aalto Predators 8v8 Playbook & Tactical Interactive System

[![React](https://img.shields.io/badge/React-19.0-blue.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![League](https://img.shields.io/badge/League-Finland_University_League_(8v8)-red.svg?style=flat-square)](https://www.sajl.fi/)

An advanced, interactive tactical playbook, vector animation diagramming engine, and comprehensive coaching operations suite developed for the **Aalto Predators (Aalto University American Football)** competing in the **Finland University League (*Korkeakoulusarja*)** under the **SAJL (Suomen Amerikkalaisen Jalkapallon Liitto)** framework.

Engineered specifically around official **8-on-8 American Football rules**: **3 Offensive Linemen (Left Guard, Center, Right Guard)**, **1 Quarterback**, and **4 Receivers / Skill Positions (X, H, Y, Z / RB)**.

---

## 📋 Table of Contents

- [Overview & Tactical Philosophy](#-overview--tactical-philosophy)
- [8v8 Field Geometry & Personnel Alignment](#-8v8-field-geometry--personnel-alignment)
- [Core Feature Modules](#-core-feature-modules)
  - [1. 60 FPS Interactive Vector Field & Animation Engine](#1-60-fps-interactive-vector-field--animation-engine)
  - [2. Formation Gallery & Personnel Lab](#2-formation-gallery--personnel-lab)
  - [3. Defensive Scout & Coverage Simulator](#3-defensive-scout--coverage-simulator)
  - [4. Custom Play Designer & Whiteboard Studio](#4-custom-play-designer--whiteboard-studio)
  - [5. In-Game Play Call Tracker & Live Analytics](#5-in-game-play-call-tracker--live-analytics)
  - [6. Practice Script Generator & Rep Scheduler](#6-practice-script-generator--rep-scheduler)
  - [7. Coach Wristband Inserts & Print Layout Exporter](#7-coach-wristband-inserts--print-layout-exporter)
  - [8. Drag-and-Drop Depth Chart & Roster Management](#8-drag-and-drop-depth-chart--roster-management)
  - [9. Bilingual Football Glossary & Rookie Quiz Lab](#9-bilingual-football-glossary--rookie-quiz-lab)
  - [10. 0–9 Route Tree Reference & Stem Timing Engine](#10-09-route-tree-reference--stem-timing-engine)
  - [11. 3-Man Pass Protection Scheme Visualizer](#11-3-man-pass-protection-scheme-visualizer)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Project Directory Structure](#-project-directory-structure)
- [Tech Stack & Dependencies](#-tech-stack--dependencies)
- [Installation & Local Setup](#-installation--local-setup)
- [Complete GitHub Push & Repository Setup Guide](#-complete-github-push--repository-setup-guide)
- [Keyboard Shortcuts & Navigation Controls](#-keyboard-shortcuts--navigation-controls)
- [Environment Configuration](#-environment-configuration)
- [Deployment Guide](#-deployment-guide)
- [Contributing Guidelines](#-contributing-guidelines)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🎯 Overview & Tactical Philosophy

The **Aalto Predators 8v8 Playbook System** was created to modernize collegiate 8v8 football coaching. Traditional 11-man playbooks fail to capture the unique geometric realities, spatial open fields, and condensed protection schemes of 8v8 football.

In Finnish University 8v8 football:
- The offensive line is reduced to **3 down linemen** (`LG`, `C`, `RG`).
- Interior protection relies heavily on **slide rules**, **big-on-big (BOB)** calls, and the **running back scanning inside A/B gap blitzes**.
- Offensive spacing spans the entire width of the field, creating severe mismatches for single-high safeties and aggressive zone blitzers.
- Pre-snap coverage recognition (man vs. zone, safety rotation, box counts) dictates immediate quarterback progression reads and hot audibles.

This application provides the entire pipeline—from diagramming whiteboard concepts to interactive player quiz training, printed quarterback wristband cards, and real-time sideline drive logging.

---

## 📐 8v8 Field Geometry & Personnel Alignment

```
               [ ENDZONE / GOAL LINE (+50 YDS) ]
===================================================================
 |                                                               |
 |      (Cover 3 Deep 1/3)      (Free Safety)      (Deep 1/3)    |
 |              FS                                               |
 |                                                               |
 |   [CB]                                                  [CB]  |
 |               (Apex LB / Will)        (Sam / Mike)            |
 |                                                               |
 |------------------ LINE OF SCRIMMAGE (LOS 0) -------------------|
 |                                                               |
 |   (X)             [LG]       [C]       [RG]       (Y)    (Z)  |
 |  Split WR        Guard     Center     Guard      Slot  Flanker|
 |                                                               |
 |                              [QB]                             |
 |                           Quarterback                         |
 |                                                               |
 |                              (RB)                             |
 |                          Running Back                         |
 |                                                               |
===================================================================
               [ OFFENSIVE BACKFIELD (-10 to -25 YDS) ]
```

### Starting 8v8 Alignment Breakdown:
1. **Left Guard (LG)**: Down lineman, slide protection anchor, puller on power/counter schemes.
2. **Center (C)**: Ball snapper, interior protector, identifies defensive front and Mike linebacker.
3. **Right Guard (RG)**: Down lineman, backside seal block or slide pass protection anchor.
4. **Quarterback (QB)**: Field general in Shotgun (4.5–5 yds) or Pistol (3.5 yds), orchestrates progression reads and cadence.
5. **Running Back (RB)**: Primary ground threat, lead blocker, pass protector (scans A-gap to B-gap blitzes), or wheel/flat outlet.
6. **X Receiver (X)**: Boundary split end, primary 1-on-1 isolation target on backside routes.
7. **Y Receiver (Y)**: Field slot receiver or flexed tight end, operates on seams, crossing digs, and option stems.
8. **Z Receiver (Z)**: Field flanker, stretches deep third coverage and attacks perimeter leverage.

---

## 🌟 Core Feature Modules

### 1. 60 FPS Interactive Vector Field & Animation Engine
- **Vector-Calculated Route Paths**: Computes exact cubic Bézier curves, break points, and stem angles for all active receivers.
- **Scrubbing & Playback Controls**:
  - Play, pause, step forward/backward (+0.1s increments).
  - Variable playback speed multipliers (`0.5x`, `1.0x`, `1.5x`, `2.0x`).
  - Seamless auto-looping for repetitive film room study.
- **Dynamic 3D Perspective**: Toggle an isometric 3D sideline/endzone tilt to visualize passing lane elevation and defensive depth.
- **5-Yard Line Hashmark Grid Overlay**: Displays precision dashed grid lines from `+50 YD` (endzone) to `-25 YD` (backfield) with yardage indicators along both sidelines for split and dropback verification.
- **Field Themes**: Switch seamlessly between **Tactical Blue**, **Natural Turf**, **Chalkboard**, and **Stadium Night**.
- **Coverage Heatmap**: Visualizes field stress densities and anticipated soft spots against current defensive shell alignments.

### 2. Formation Gallery & Personnel Lab
- **Personnel Packages**:
  - **10 Personnel (1 RB, 3 WR, 0 TE)**: Standard 8v8 spread passing and zone read foundation.
  - **00 Personnel (0 RB, 4 WR, 0 TE)**: Empty backfield, 5-man slide protection, 5 immediate passing outlets.
  - **11 Personnel (1 RB, 2 WR, 1 TE/Wing)**: Balanced run/pass hybrid sets.
  - **20 Personnel (2 RB, 2 WR, 0 TE)**: Split Backs / Pro set for heavy power, lead options, and play-action bootlegs.
  - **12 Personnel (1 RB, 1 WR, 2 TE/Wings)**: Heavy 2-Line and Goal-Line compressed blocking surfaces.
- **Side-by-Side Comparison Lab**: Compare two formations simultaneously to evaluate run/pass efficiency, blocking personnel, and pre-snap coverage advantages.
- **Tactical Breakdown Cards**: Philosophy, strengths, ideal coverage match-ups, and common defensive vulnerability warnings for each formation.

### 3. Defensive Scout & Coverage Simulator
- **Coverage Types Simulated**:
  - **Cover 0 (Zero Blitz)**: 6-man all-out pressure with no deep safety help; hot route alert.
  - **Cover 1 (Man-Free)**: Single-high safety with man-to-man underneath; crossing concepts and rubs.
  - **Cover 2 (Tampa / Zone)**: Two-deep safeties with 3 underneath zone defenders; attacks middle hole and sideline honey-holes.
  - **Cover 3 (Sky / Cloud)**: 3-deep zone with rotated strong safety; floods deep third with curl-flat and sail concepts.
  - **Cover 4 (Quarters)**: 4-deep zone bracket; stresses safeties with inside seam posts.
  - **Cover 2 Man-Under**: Two deep safeties with tight trail-technique underneath.
- **Pre-Snap Box Counter**: Automatically counts defensive linemen and box linebackers to declare light (3-4), neutral (5), or heavy (6+) defensive boxes.

### 4. Custom Play Designer & Whiteboard Studio
- **Drag-and-Drop Token Placement**: Full tactile control over all 8 offensive player tokens with magnetic line-of-scrimmage snap.
- **Multi-Segment Route Drawing**: Click-and-drag to plot stems, cuts, comebacks, wheel arcs, and blocking arrows.
- **Pre-Snap Motion Engine**: Assign pre-snap fly, orbit, or jet motion to any skill position.
- **Template Presets**: Save custom alignments as reusable formation templates (saved locally with instant recall).
- **Direct Playbook Export**: Seamlessly import user-designed plays into active game plans without restarting the app.

### 5. In-Game Play Call Tracker & Live Analytics
- **Sideline Play Caller**: Record live game snaps with downs (1st–4th), distance, yard line, and hash alignment.
- **Outcome Classification**: Track completed passes, incomplete throws, rushing yardage, sacks, penalties, touchdowns, and turnovers.
- **Real-Time Efficiency Charts**:
  - Run vs. Pass play selection ratio.
  - 3rd down conversion percentage.
  - Yards-per-play and red-zone touchdown efficiency.

### 6. Practice Script Generator & Rep Scheduler
- **Period-Based Practice Scripts**: Build tailored practice sessions (e.g., 7-on-7 Passing, Team Run Period, Red Zone Script, 2-Minute Hurry-Up).
- **Rep Progression Counter**: Track player reps, completions, and execution accuracy across repetitions.
- **Printable Coaching Sheet**: Generate an organized, high-contrast practice script ready for clipboards.

### 7. Coach Wristband Inserts & Print Layout Exporter
- **Micro-Formatted Wristband Sheets**: Formats plays into a 3-column micro-grid designed to fit standard 3-window quarterback and coach wristbands.
- **Customizable Wristband Views**: Filter by play type, category, or favorite game-plan folder.
- **High-Resolution Print Binders**: Generates clean, printer-friendly PDF layout pages containing vector route diagrams, progression reads, and pass protection rules.

### 8. Drag-and-Drop Depth Chart & Roster Management
- **Visual 8v8 Starting Lineup**: Drag student-athlete tokens directly into starting formation slots (`C`, `LG`, `RG`, `QB`, `RB`, `X`, `Y`, `Z`).
- **Comprehensive Roster Tracking**: Player numbers, names, heights, weights, primary/secondary positions, academic year, and player status notes.
- **JSON Import/Export**: Backup or transfer roster databases across coaching devices.

### 9. Bilingual Football Glossary & Rookie Quiz Lab
- **Finnish & English Terminology**: Complete technical vocabulary covering concepts, formations, rules, and penalties in both English and Finnish (e.g., *Aloituslinja / Line of Scrimmage*, *Pelisysteemi / Playbook*, *Miespuolustus / Man Coverage*).
- **Interactive Coaching Quiz**: Multi-category trivia engine testing players on route trees, blitz checks, safety reads, and playbook assignments with score tracking.

### 10. 0–9 Route Tree Reference & Stem Timing Engine
- **Full Route Tree System**:
  - `0`: Hitch / Smoke Screen (5 yds)
  - `1`: Quick Out (5 yds)
  - `2`: Slant (3-step break at 45°)
  - `3`: Deep Out (10–12 yds)
  - `4`: Comeback (12–14 yds)
  - `5`: Curl / Hook (10–12 yds)
  - `6`: Dig / In (10–12 yds)
  - `7`: Corner / Flag (12 yds)
  - `8`: Post (12–14 yds break toward goalposts)
  - `9`: Go / Fade / Streak (vertical sideline boundary stretch)
- **Stem Depths & Footwork**: Footwork timing guide (3-step quick game, 5-step intermediate, 7-step deep drop).

### 11. 3-Man Pass Protection Scheme Visualizer
- **Full Slide Protection**: All 3 linemen slide towards the designated protection call (Slide Left / Slide Right); RB responsible for opposite edge.
- **Big-on-Big (BOB)**: Guards and Center lock onto down defensive linemen in 1-on-1 drive blocks; RB scans middle linebackers.
- **Dual Guard Pinch**: LG and RG pinch inside to seal the A-gaps while Center handles head-up nose tackle; tackles the aggressive interior double-A gap blitz.

---

## 🏗️ System Architecture & Data Flow

```
[ Application Root: App.tsx ]
       │
       ├── Global State Orchestration (Active Play, Themes, View Modes, Modals)
       │
       ├── Data Providers (Static & Persistent)
       │     ├── ALL_PLAYBOOK_PLAYS (/data/allPlays.ts)
       │     ├── DEFENSE_SCHEMES (/data/defenseSchemes.ts)
       │     ├── FORMATION_GALLERY_ITEMS (/data/formationGalleryData.ts)
       │     ├── ROSTER_DATA (/data/rosterData.ts)
       │     └── ROUTE_TREE_DATA (/data/routeTree.ts)
       │
       ├── Local Persistence Engines (/utils/)
       │     ├── folderStorage.ts (Custom game-plan folders)
       │     ├── inGameTracker.ts (Drive & down/distance tracking)
       │     ├── practiceScriptStorage.ts (Practice scripts)
       │     ├── playbookExportImport.ts (JSON backup & migration)
       │     └── coachingCuesStorage.ts (Coach notes & progression keys)
       │
       └── UI View Layer (/components/)
             ├── FieldBoard.tsx (SVG vector math, 3D CSS transforms, route renderers)
             ├── AnimationController.tsx (Animation loop, time scrubber, speed)
             ├── PlaySelector.tsx (Search, category filtering, folder selector)
             └── Feature Modals (Formation Gallery, Scout, Whiteboard, Wristband, etc.)
```

---

## 📂 Project Directory Structure

```
aalto-predators-8v8-playbook/
├── public/                         # Static web assets & team branding
│   ├── aalto-predators-logo.svg    # Official Aalto Predators vector crest
│   └── favicon.svg                 # Application favicon
├── src/
│   ├── components/                 # Modular React UI components
│   │   ├── AnimationController.tsx     # Vector animation scrubber & loop control
│   │   ├── CoachingTipsModal.tsx       # Progression reads & defensive cues
│   │   ├── CustomPlayDesigner.tsx      # Whiteboard drag & vector route painter
│   │   ├── DefensiveScoutModal.tsx     # Coverage simulations & box reads
│   │   ├── DepthChartDndSection.tsx    # Drag-and-drop starting lineup
│   │   ├── FieldBoard.tsx              # Core SVG field, player tokens, & routes
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
│   ├── data/                       # Tactical playbooks & configurations
│   │   ├── allPlays.ts                 # Full 8v8 play database
│   │   ├── defenseSchemes.ts           # Cover 0-4 defensive definitions
│   │   ├── formationGalleryData.ts     # Personnel groupings & metadata
│   │   ├── formationTemplates.ts       # Standard & custom templates
│   │   ├── glossary.ts                 # Finnish-English terminology
│   │   ├── passProtectionData.ts       # 3-man OL slide protections
│   │   ├── rosterData.ts               # Default team roster
│   │   └── routeTree.ts                # Route numbers & stem definitions
│   ├── utils/                      # Helper utilities & local persistence
│   │   ├── coachingCuesStorage.ts      # Progression read storage
│   │   ├── defensiveScoutStorage.ts    # Coverage simulator storage
│   │   ├── folderStorage.ts            # Custom game-plan folders
│   │   ├── inGameTracker.ts            # Live play-by-play drive tracking
│   │   ├── playbookExportImport.ts     # JSON backup & migration
│   │   └── practiceScriptStorage.ts    # Practice scripts
│   ├── App.tsx                     # Main application layout and coordinator
│   ├── main.tsx                    # React DOM entry point
│   ├── index.css                   # Global Tailwind CSS stylesheet
│   └── types.ts                    # Global TypeScript interfaces & types
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore patterns
├── index.html                      # HTML entry with font preconnections
├── LICENSE                         # MIT License
├── metadata.json                   # Applet metadata configuration
├── package.json                    # Project dependencies and npm scripts
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build and plugin setup
```

---

## 🛠️ Tech Stack & Dependencies

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom`) | Declarative, component-based user interface |
| **Language** | TypeScript 5.8 | End-to-end type safety, enums, and interfaces |
| **Build Tooling** | Vite 6 | Lightning-fast HMR and optimized production bundles |
| **Styling & Design** | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first responsive design system |
| **Animation & Motion** | Native SVG Math + Motion (`motion`) | High-performance 60 FPS vector transformations |
| **Iconography** | Lucide React (`lucide-react`) | Consistent tactical and administrative iconography |
| **Data Visualization** | Recharts (`recharts`) | In-game efficiency curves and run/pass distribution |
| **Audio Effects** | Howler.js (`howler`) | Optional tactile audio cues for snap & whistle timings |
| **Backend Integration** | Express + `@google/genai` | Optional AI-assisted tactical coaching capabilities |

---

## 🚀 Installation & Local Setup

### Prerequisites
Make sure you have installed on your local workstation:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **Package Manager**: `npm` (bundled with Node.js), `yarn`, `pnpm`, or `bun`
- **Git**: Installed and configured on your machine

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/aalto-predators-8v8-playbook.git
cd aalto-predators-8v8-playbook
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the sample environment file to create your local `.env`:
```bash
cp .env.example .env
```
*(Optional: Provide your Gemini API key if you plan to use AI play assistance features).*

### Step 4: Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### Step 5: Build for Production
To generate an optimized, self-contained production bundle in the `dist/` directory:
```bash
npm run build
```

### Step 6: Preview Production Build Locally
```bash
npm run preview
```

### Step 7: Run TypeScript Type Check / Linter
```bash
npm run lint
```

---

## 📤 Complete GitHub Push & Repository Setup Guide

If you are initializing this project and pushing it to a brand-new GitHub repository, follow these exact step-by-step terminal commands:

### 1. Initialize Git Locally
```bash
git init
```

### 2. Verify `.gitignore`
Ensure that build outputs, environment files, and `node_modules` are ignored:
```bash
git status
```
*(Verify that `node_modules/`, `dist/`, and `.env` are NOT listed in the untracked files).*

### 3. Stage All Project Files
```bash
git add .
```

### 4. Commit Project Snapshot
```bash
git commit -m "feat: initial commit for Aalto Predators 8v8 Playbook & Tactical System"
```

### 5. Set Default Branch to `main`
```bash
git branch -M main
```

### 6. Create a New Repository on GitHub
1. Navigate to [github.com/new](https://github.com/new).
2. Set the **Repository name** to: `aalto-predators-8v8-playbook` (or your preferred name).
3. Choose **Public** or **Private**.
4. **Do NOT** initialize with a README, `.gitignore`, or License (these are already present in this project).
5. Click **Create repository**.

### 7. Link Your Remote Repository
Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/aalto-predators-8v8-playbook.git
```

### 8. Push to GitHub
```bash
git push -u origin main
```

---

## ⌨️ Keyboard Shortcuts & Navigation Controls

The application supports responsive touch, mouse drag, and keyboard shortcuts for rapid sideline and film room navigation:

| Key / Control | Action | Scope |
| :--- | :--- | :--- |
| `Spacebar` | Play / Pause route vector animation | Main Field Board |
| `Arrow Left (←)` | Step animation backward by 0.1 seconds | Main Field Board |
| `Arrow Right (→)` | Step animation forward by 0.1 seconds | Main Field Board |
| `Key R` | Reset animation to line-of-scrimmage snap | Main Field Board |
| `Key L` | Toggle continuous auto-looping playback | Main Field Board |
| `Key G` | Toggle 5-Yard Hashmark Field Grid overlay | Main Field Board |
| `Key T` | Cycle Field Theme (Blue / Turf / Chalk / Night) | Main Field Board |
| `Key 3` | Toggle 3D Stadium perspective angle | Main Field Board |
| `Escape (Esc)` | Close active modal dialog | Global |
| `Mouse Drag` | Reposition players on Whiteboard | Custom Play Designer |

---

## ⚙️ Environment Configuration

Refer to `.env.example` for all supported configuration options:

```env
# Optional Gemini AI API key for coaching assistant features
GEMINI_API_KEY="your_api_key_here"

# Application host URL (used for local development and reverse-proxy deployment)
APP_URL="http://localhost:3000"
```

> **Security Notice**: Never commit `.env` containing sensitive credentials to your GitHub repository. The `.gitignore` file is pre-configured to exclude all `.env` files except `.env.example`.

---

## 🌐 Deployment Guide

### Deploying to Cloud Run / Docker
This application includes standard Vite output and can be run behind an Nginx or Node.js static server:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deploying to Vercel / Netlify
1. Connect your GitHub repository to Vercel or Netlify.
2. Set **Build Command** to: `npm run build`
3. Set **Output Directory** to: `dist`
4. Deploy with zero configuration.

---

## 🤝 Contributing Guidelines

Contributions, bug reports, and playbook concept suggestions are welcome!

1. **Fork the Repository**: Click the `Fork` button at the top right of this GitHub page.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/new-trips-concept
   ```
3. **Commit Your Changes**:
   ```bash
   git commit -m "feat: add 8v8 trips flood sail pass concept"
   ```
4. **Push to Your Fork**:
   ```bash
   git push origin feature/new-trips-concept
   ```
5. **Open a Pull Request**: Submit your pull request to the `main` branch with a summary of the additions.

---

## 📄 License & Acknowledgments

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

### Acknowledgments
- **Aalto Predators Football**: Aalto University American Football Club (*Espoo/Helsinki, Finland*).
- **SAJL (Suomen Amerikkalaisen Jalkapallon Liitto)**: For fostering university and 8-man football across Finland.
- Built with React, TypeScript, Vite, Tailwind CSS, and Lucide Icons.

---

**Crafted for Aalto Predators • Otaniemi, Espoo, Finland 🇫🇮 🏈**
