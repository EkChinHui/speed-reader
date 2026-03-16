# RSVP Speed Reader

A web-based speed reader using the Rapid Serial Visual Presentation (RSVP) technique. Paste long-form content and read it word-by-word at configurable speeds with a cinematic, distraction-free interface.

## Features

- **ORP-aligned display** — words are centered on their Optimal Recognition Point, eliminating eye movement
- **Adaptive word timing** — longer words and punctuation automatically get more display time
- **Smart paste** — auto-cleans HTML and formatting from pasted text
- **Reading stats** — word count, read time estimate, and time saved vs average reading speed (238 WPM)
- **Keyboard-first controls** — Spacebar pause/resume, arrow keys for speed, Escape to exit
- **Pause context** — surrounding sentence reveals when paused, with 4-word rewind on resume
- **Font selection** — Inter, Lora, or Space Grotesk
- **Speed presets** — 200–600 WPM presets with ±25 WPM nudging (range: 100–1000)

## Getting Started

Requires Node 22+ (`.nvmrc` included).

```sh
nvm use
npm install
npm run dev
```

## Building

```sh
npm run build
```

Static output goes to `build/` — deploy anywhere (Vercel, Netlify, GitHub Pages, etc).

## Project Structure

```
src/
  lib/
    engine/
      text-processor.ts      # Text cleaning, tokenization, ORP calculation, adaptive timing
      rsvp-engine.ts         # Playback state machine with callbacks
    stores/
      app-state.svelte.ts    # Global app state (phase, WPM, font)
    components/
      SetupPhase.svelte      # Text input, stats, configuration
      ReadingPhase.svelte    # Word display, controls, progress bar
  routes/
    +page.svelte             # Phase switching with transitions
    +layout.ts               # SPA mode configuration
```

## Tech Stack

- SvelteKit with Svelte 5 (runes)
- TypeScript
- Static adapter (fully client-side, no backend)
