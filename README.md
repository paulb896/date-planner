# ✨ FlowCraft - Interactive Flowchart Creator & Decision Simulator

[![Vite](https://img.shields.io/badge/Vite-4.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green.style=for-the-badge)](#license)

**FlowCraft** is a feature-packed, visual interactive flowchart creator and step-by-step decision game simulator built with modern vanilla JavaScript, dynamic SVG bezier connections, and Web Audio synthesis.

It comes pre-loaded with a digitized version of the **Handwritten "Birthday Trip!" Flowchart**, featuring interactive choices, animated transport vehicles (Cars 🚗, Buses 🚌, Ferries ⛴️, Bicycles 🚴), full URL parameter sharing, and GitHub Pages deployment support.

---

## 🌟 Key Features

- 🎂 **Handwritten "Birthday Trip!" Template**:
  - Digitized directly from your notepad drawing!
  - Features Uber decision ($26 vs Bus), Horseshoe Bay Ferry timing, Smitty's Diner vs. Tap Works Brewery, Bike Rental coastal ride, and a complete return trip loop home.

- 🤖 **Smart Vehicle Transport Motion**:
  - Edge wires feature animated vehicles that **drive along SVG cubic bezier curves**.
  - **Smart Auto-Detection**: Automatically assigns matching transport emojis based on the originating node (e.g. 🚗 Cars for Uber, 🚌 Buses for Bus transit, ⛴️ Boats for Ferries, 🚴 Bicycles for Bike rental).
  - **Wheels-on-Line Alignment**: Uses dynamic SVG `<animateMotion rotate="auto">` with offset transforms so vehicle wheels sit directly on top of wire lines facing forward.

- 🎮 **Interactive Decision Simulator ("Play Decision Game")**:
  - Converts any flowchart into an interactive step-by-step RPG decision game.
  - Smoothly pans and focuses the camera onto active decision steps with glowing aura highlights.
  - Features a real-time progress bar, interactive choice buttons, and celebratory `canvas-confetti` fireworks upon reaching end nodes.

- 🎨 **5 Curated Design Themes**:
  - 🍬 **Playful Candy** *(Default)*
  - 🌌 **Cyberpunk Neon**
  - ✨ **Cosmic Midnight**
  - ⚡ **Sunset Arcade**
  - 🎨 **Clean Paper**

- 🔗 **Full URL State Synchronization & Sharing**:
  - Automatically syncs `theme`, `template`, `anim`, `zoom`, `x`, `y`, and base64-encoded flowchart `data` to the URL.
  - **Share Link Button**: Copies a unique shareable URL to clipboard so anyone can open your exact flowchart, theme, and viewport state.

- 🛠️ **Full Visual Editor & Controls**:
  - **Infinite Canvas**: Smooth pan & zoom with viewport grid pattern.
  - **Node Inspector Drawer**: Edit node title, subtitle, shape (Pill, Diamond, Card, Note), emoji, accent colors, and choice branches.
  - **Auto-Layout**: One-click hierarchical tree alignment algorithm (`🪄 Auto Layout`).
  - **Undo / Redo & Shortcuts**: Support for `Ctrl+Z` (Undo), `Ctrl+Y` (Redo), and `Delete` (Delete Node).
  - **Export & Import**: Export flowchart diagrams as JSON files or download high-resolution PNG images.

- 🔊 **Web Audio API Sound Synth**:
  - Built-in sound effects (pops, wire connections, selection clicks, victory chords) synthesized in-browser with zero external audio assets.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16+ recommended) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/paulb896/date-planner.git
   cd date-planner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start local development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000/`.

---

## 📦 Building & Deployment

### Build Production Bundle
To compile the static production build:
```bash
npm run build
```
Outputs optimized bundles to the `dist/` folder.

### Deploy to GitHub Pages
This project is configured with `base: './'` in `vite.config.js` for instant GitHub Pages compatibility.

#### Option A: GitHub Actions (Recommended)
1. In your GitHub Repository, go to **Settings ➔ Pages**.
2. Under **Build and deployment ➔ Source**, select **GitHub Actions**.
3. Push your code to `main` branch. The `.github/workflows/deploy.yml` workflow will automatically build and publish your site.

#### Option B: `npm run deploy` CLI
```bash
npm run deploy
```

> 💡 **Troubleshooting: "Branch main is not allowed to deploy to github-pages due to environment protection rules"**
> 
> **How to fix in GitHub Repository Settings:**
> 1. Go to **Settings ➔ Pages** and set **Source** to **GitHub Actions** (if using workflow) or **Deploy from a branch** (select `gh-pages` branch).
> 2. Go to **Settings ➔ Environments ➔ `github-pages`**.
> 3. Under **Deployment branches**, change the rule to **All branches** or add `main` to allowed branches.

---

## 📁 Project Architecture

```
date-planner/
├── index.html              # Main HTML markup, navigation, canvas layout, simulator modal
├── package.json            # Project dependencies and deployment scripts
├── vite.config.js          # Vite configuration with relative base path
├── src/
│   ├── main.js             # Main application entry point & URL parameter sync
│   ├── state.js            # State management, undo/redo stack, template loader, auto-layout
│   ├── canvas.js           # Pan/zoom viewport control, node rendering, drag-and-drop port wiring
│   ├── connections.js      # Dynamic SVG bezier curve generator & smart vehicle motion engine
│   ├── simulator.js        # Step-by-step decision game simulator controller & confetti trigger
│   ├── templates.js        # Pre-built flowcharts (Birthday Trip, Date Night, Coffee, RPG Quest)
│   ├── audio.js            # Web Audio API sound synthesizer
│   └── style.css           # Glassmorphism design system & CSS variable themes
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions automated deployment workflow
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl` + `Z`** | Undo last action |
| **`Ctrl` + `Y`** / **`Ctrl` + `Shift` + `Z`** | Redo action |
| **`Delete`** / **`Backspace`** | Delete selected node |
| **Drag Canvas** | Pan viewport |
| **Scroll Wheel** | Zoom in / out centered on cursor |
| **Double-Click Node** | Open Node Inspector drawer |
| **Double-Click Wire / Label** | Delete wire connection |

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
