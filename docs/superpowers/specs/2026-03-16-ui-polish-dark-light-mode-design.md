# UI Polish & Dark/Light Mode — Design Spec

## Overview

Elevate the RSVP Speed Reader UI from functional MVP to polished product. Add light/dark theme support with OS-aware defaults and manual toggle. Refine visual depth, spacing, micro-interactions, and overall feel while preserving the zen/cinematic identity and keeping the reading phase lean for speed.

## Theme System

### Dual Palette via CSS Custom Properties

Theme is applied via `data-theme` attribute on `<html>`. Variables defined on `:root` (dark default) and `[data-theme="light"]`.

**Accent (both themes):** `#6366f1` (indigo-violet), glow opacity adjusted per theme.

**Dark theme (default):**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#09090b` | Page background |
| `--surface` | `#131316` | Cards, inputs |
| `--surface-raised` | `#1a1a1f` | Elevated elements |
| `--border` | `#27272a` | Default borders |
| `--border-hover` | `#2e2e33` | Hover borders |
| `--text-primary` | `#f0f0f5` | Main text |
| `--text-secondary` | `#9494a8` | Secondary text |
| `--text-muted` | `#5a5a6e` | Muted text |
| `--accent` | `#6366f1` | Accent color |
| `--accent-glow` | `rgba(99, 102, 241, 0.15)` | Accent glow |

**Light theme:**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#fafaf9` | Page background (warm off-white) |
| `--surface` | `#ffffff` | Cards, inputs |
| `--surface-raised` | `#f4f4f3` | Elevated elements |
| `--border` | `#e4e4e2` | Default borders |
| `--border-hover` | `#d4d4d1` | Hover borders |
| `--text-primary` | `#1a1a1e` | Main text |
| `--text-secondary` | `#6b6b7a` | Secondary text |
| `--text-muted` | `#9c9ca8` | Muted text |
| `--accent` | `#6366f1` | Accent color |
| `--accent-glow` | `rgba(99, 102, 241, 0.1)` | Accent glow |

### Theme Detection & Persistence

1. On first visit: check `prefers-color-scheme` media query, apply matching theme.
2. Store user preference in localStorage (alongside existing `rsvp-settings` key).
3. On subsequent visits: load persisted preference, ignore OS setting.
4. Toggle: sun/moon icon button, persisted on change.
5. Smooth transition: `background-color` and `color` transitions (200ms) on theme switch.

### State Store Changes

Add `theme` field to `AppState` class and `PersistedSettings` interface. Type: `'light' | 'dark' | 'system'`. Default: `'system'`. The resolved theme (actual `'light'` or `'dark'`) is derived and applied to `document.documentElement.dataset.theme`.

## Setup Phase Polish

### Header

- Title: subtle CSS gradient text effect (`background-clip: text`) using accent color range.
- Theme toggle: small circular button positioned top-right of the setup container (not absolute to viewport). Animated sun/moon icon swap via CSS rotation (300ms) + opacity crossfade.

### Textarea

- Background: `var(--surface)` with soft `box-shadow: 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 2px rgba(0,0,0,0.04)`.
- Focus: accent border + `0 0 0 3px var(--accent-glow)` ring.
- Border-radius: 14px.
- Placeholder color uses `--text-muted`.

### Stats Row

- Each stat wrapped in a pill: `var(--surface-raised)` background, `border-radius: 10px`, `padding: 0.5rem 1rem`.
- `font-variant-numeric: tabular-nums` on values.
- Staggered fade-in animation when text is pasted: each stat delays 50ms more than previous (CSS `animation-delay`).

### Speed & Font Controls

- Nudge/preset buttons: hover adds subtle `transform: scale(1.05)` + `box-shadow: 0 2px 8px rgba(0,0,0,0.1)`.
- Active preset: brief scale animation on click (`transform: scale(0.95)` then back).
- Font buttons: add small checkmark SVG icon on active state.

### Start Button

- Background: subtle gradient `linear-gradient(135deg, #6366f1, #818cf8)`.
- Glow shadow: `0 4px 20px rgba(99, 102, 241, 0.25)`.
- Hover: brightness(1.1) + translateY(-1px) + increased glow.
- Active/press: `transform: scale(0.97)`.
- Disabled: `filter: grayscale(0.6); opacity: 0.35`.

## Reading Phase Polish

Minimal changes only. Zero animation during word playback.

### Progress Bar

- Height: 4px (from 3px).
- Fill edge: `box-shadow: 0 0 8px var(--accent-glow)` for soft glow trail.

### ORP Center Guide

- Subtle pulse animation only in idle state (CSS `@keyframes pulse`, 2s cycle, 0.2-0.4 opacity range).
- Static during playback.

### Word Display

- Gentle fade-in on first word appearance only (200ms).
- No animation between subsequent words.

### Context Display (Pause)

- Keep existing fadeIn animation.
- Add subtle `filter: blur(2px)` → `blur(0)` transition for blur-to-sharp effect.

### Controls Overlay

- Glassmorphism: `backdrop-filter: blur(12px)` + `background: var(--surface)/80%` (alpha channel).
- Play button: soft `box-shadow: 0 0 16px var(--accent-glow)`.
- Back/speed buttons: same glass background treatment.
- Hover states: subtle scale(1.05) + shadow lift.

### Finished State

- "Done" text: gentle scale-up entrance (`transform: scale(0.9)` → `scale(1)`, 400ms, ease-out).
- Accent glow briefly intensifies (opacity pulse, 600ms, once).

## Micro-animations Policy

### Allowed (Setup Phase)

| Element | Animation | Duration |
|---------|-----------|----------|
| Theme toggle icon | Rotation + opacity crossfade | 300ms |
| Button hover (all) | scale(1.02-1.05) + shadow | 150ms |
| Stats appearing | Staggered fade-in | 300ms + 50ms/item |
| Start button enabled | Subtle glow pulse (CSS) | 2s loop |
| Config sections | Fade-in on mount | 400ms |

### Forbidden (Reading Phase)

- No animation between words during playback.
- No decorative motion during active reading.
- Progress bar transition stays at 0.1s linear (functional only).
- Controls fade stays at 300ms (functional).

## Global Refinements

- Border-radius scale: 8px (small buttons) → 12px (inputs, medium) → 14-16px (containers, textarea).
- Google Fonts: add `&display=swap` to URL for `font-display: swap`.
- Smooth theme transition: `transition: background-color 200ms, color 200ms` on `body` and key containers.
- Two surface tiers (`--surface`, `--surface-raised`) for visual hierarchy.

## Files to Modify

1. `src/routes/+page.svelte` — theme variables, global styles, body transitions.
2. `src/lib/stores/app-state.svelte.ts` — add theme state, persistence, OS detection.
3. `src/lib/components/SetupPhase.svelte` — all setup phase polish, theme toggle button.
4. `src/lib/components/ReadingPhase.svelte` — reading phase polish (minimal).
5. `src/app.html` — add inline script for flash-prevention (set `data-theme` before render).

## Out of Scope

- Mobile touch controls.
- Accessibility (ARIA) — separate effort.
- New features (drag-and-drop, bookmarking).
- Custom accent color picker.
