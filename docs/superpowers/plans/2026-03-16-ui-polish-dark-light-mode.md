# UI Polish & Dark/Light Mode Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add light/dark theme support and polish the entire UI — refined depth, micro-animations, glassmorphism — while keeping the reading phase lean for speed.

**Architecture:** Theme system uses CSS custom properties on `:root` (dark default) and `[data-theme="light"]` selector. A flash-prevention inline script in `app.html` sets the theme before first paint. Theme state is persisted alongside existing WPM/font settings in localStorage. UI polish is CSS-only changes to existing components.

**Tech Stack:** SvelteKit 2 / Svelte 5 (runes), CSS custom properties, `color-mix()`, `backdrop-filter`, CSS animations.

**Spec:** `docs/superpowers/specs/2026-03-16-ui-polish-dark-light-mode-design.md`

---

## Chunk 1: Theme Infrastructure

### Task 1: Flash-Prevention Script in app.html

**Files:**
- Modify: `src/app.html`

- [ ] **Step 1: Add inline theme script**

Add this `<script>` block inside `<head>`, before `%sveltekit.head%`:

```html
<script>
  (function() {
    try {
      var s = JSON.parse(localStorage.getItem('rsvp-settings'));
      if (s && (s.theme === 'light' || s.theme === 'dark')) {
        document.documentElement.dataset.theme = s.theme;
        return;
      }
    } catch(e) {}
    document.documentElement.dataset.theme =
      window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  })();
</script>
```

- [ ] **Step 2: Verify app.html is valid**

Run: `npx vite build --mode development 2>&1 | head -20`
Expected: No HTML parse errors.

- [ ] **Step 3: Commit**

```bash
git add src/app.html
git commit -m "feat: add flash-prevention theme script to app.html"
```

---

### Task 2: Theme State & Persistence

**Files:**
- Modify: `src/lib/stores/app-state.svelte.ts`

- [ ] **Step 1: Add theme to PersistedSettings and AppState**

Update the `PersistedSettings` interface to include `theme`:

```typescript
interface PersistedSettings {
  wpm: number;
  font: FontFamily;
  theme: 'light' | 'dark';
}
```

Export the Theme type:

```typescript
export type Theme = 'light' | 'dark';
```

Update `loadSettings()` to read `theme` from stored JSON. If not present, resolve from `document.documentElement.dataset.theme` (which the flash-prevention script already set), falling back to `'dark'`:

```typescript
function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const validThemes = ['light', 'dark'];
      return {
        wpm: typeof parsed.wpm === 'number' ? parsed.wpm : DEFAULT_WPM,
        font: FONT_OPTIONS.some((o) => o.value === parsed.font) ? parsed.font : 'Inter',
        theme: validThemes.includes(parsed.theme) ? parsed.theme : resolveSystemTheme()
      };
    }
  } catch {
    // ignore
  }
  return { wpm: DEFAULT_WPM, font: 'Inter', theme: resolveSystemTheme() };
}
```

Add the `resolveSystemTheme` helper:

```typescript
function resolveSystemTheme(): Theme {
  if (typeof document !== 'undefined' && document.documentElement.dataset.theme) {
    return document.documentElement.dataset.theme as Theme;
  }
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
}
```

Update `saveSettings` to include `theme`:

```typescript
function saveSettings(settings: PersistedSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
```

- [ ] **Step 2: Add theme field and toggle to AppState class**

```typescript
class AppState {
  phase = $state<Phase>('setup');
  rawText = $state('');
  wpm = $state(DEFAULT_WPM);
  font = $state<FontFamily>('Inter');
  theme = $state<Theme>('dark');

  constructor() {
    const saved = loadSettings();
    this.wpm = saved.wpm;
    this.font = saved.font;
    this.theme = saved.theme;

    $effect.root(() => {
      $effect(() => {
        saveSettings({ wpm: this.wpm, font: this.font, theme: this.theme });
      });
      $effect(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.dataset.theme = this.theme;
        }
      });
    });
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
  }

  // ... existing methods unchanged
}
```

- [ ] **Step 3: Verify build passes**

Run: `npx vite build --mode development 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/stores/app-state.svelte.ts
git commit -m "feat: add theme state with persistence and OS detection"
```

---

### Task 3: CSS Theme Variables — Dual Palette

**Files:**
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Replace current `:root` variables with dark theme and add light theme**

Replace the existing `:global(:root)` block with:

```css
:global(:root) {
  --bg: #09090b;
  --surface: #131316;
  --surface-raised: #1a1a1f;
  --border: #27272a;
  --border-hover: #2e2e33;
  --text-primary: #f0f0f5;
  --text-secondary: #9494a8;
  --text-muted: #5a5a6e;
  --accent: #6366f1;
  --accent-glow: rgba(99, 102, 241, 0.15);
}

:global([data-theme="light"]) {
  --bg: #fafaf9;
  --surface: #ffffff;
  --surface-raised: #f4f4f3;
  --border: #e4e4e2;
  --border-hover: #d4d4d1;
  --text-primary: #1a1a1e;
  --text-secondary: #6b6b7a;
  --text-muted: #9c9ca8;
  --accent: #6366f1;
  --accent-glow: rgba(99, 102, 241, 0.1);
}
```

- [ ] **Step 2: Add smooth theme transition to body**

Add to the existing `:global(body)` block:

```css
transition: background-color 200ms, color 200ms;
```

- [ ] **Step 3: Verify both themes render**

Run: `npm run dev` (manual check — toggle theme in browser devtools by changing `data-theme` attribute on `<html>`)

- [ ] **Step 4: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: add dual theme CSS variables — dark default, light override"
```

---

## Chunk 2: Setup Phase Polish

### Task 4: Theme Toggle Button

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Add theme toggle to the template**

Import `appState` already exists. Add a wrapper around the header with the toggle positioned top-right:

Replace the `<header class="setup-header">` section with:

```svelte
<div class="header-row">
  <div class="header-spacer"></div>
  <header class="setup-header">
    <h1 class="title">Speed Reader</h1>
    <p class="subtitle">Paste your text and read at your own pace</p>
  </header>
  <button class="theme-toggle" onclick={() => appState.toggleTheme()} aria-label="Toggle theme">
    {#if appState.theme === 'dark'}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    {:else}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    {/if}
  </button>
</div>
```

Note: When dark, show sun icon (switch to light). When light, show moon icon (switch to dark). Each icon SVG gets `class="theme-icon"` for the swap animation.

Wrap each SVG in a `{#key}` block to trigger mount animation on swap:

```svelte
<button class="theme-toggle" onclick={() => appState.toggleTheme()} aria-label="Toggle theme">
  {#key appState.theme}
    {#if appState.theme === 'dark'}
      <svg class="theme-icon" width="18" height="18" ...>
        <!-- sun icon -->
      </svg>
    {:else}
      <svg class="theme-icon" width="18" height="18" ...>
        <!-- moon icon -->
      </svg>
    {/if}
  {/key}
</button>
```

- [ ] **Step 2: Add theme toggle styles**

```css
.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
}

.header-spacer {
  width: 36px;
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, color 0.2s;
  flex-shrink: 0;
}

.theme-toggle:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.theme-icon {
  animation: iconSwap 300ms ease both;
}

@keyframes iconSwap {
  from {
    opacity: 0;
    transform: rotate(-90deg) scale(0.8);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}
```

- [ ] **Step 3: Verify toggle works**

Run: `npm run dev` — click toggle, confirm theme switches and persists on reload.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/SetupPhase.svelte
git commit -m "feat: add theme toggle button with sun/moon icons"
```

---

### Task 5: Title Gradient & Textarea Polish

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Update title styles for gradient text**

Replace `.title` CSS:

```css
.title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 0;
  background: linear-gradient(135deg, var(--accent), #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 2: Update textarea styles for depth**

Replace `.text-input` and `.text-input:focus` CSS (preserve the existing `.text-input::placeholder` rule — it already uses `--text-muted` and needs no change):

```css
.text-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 200px;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.text-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
```

- [ ] **Step 3: Verify visually**

Run: `npm run dev` — check title gradient shows, textarea has depth and focus ring.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/SetupPhase.svelte
git commit -m "feat: add title gradient text and textarea depth styling"
```

---

### Task 6: Stats Pills with Staggered Animation

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Update stats markup for staggered animation**

Update the stats section in the template. Add `style="--i: {index}"` to each stat for stagger:

```svelte
{#if hasText}
  <div class="stats">
    <div class="stat" style="--i: 0">
      <span class="stat-value">{words.toLocaleString()}</span>
      <span class="stat-label">words</span>
    </div>
    <div class="stat" style="--i: 1">
      <span class="stat-value">{chars.toLocaleString()}</span>
      <span class="stat-label">characters</span>
    </div>
    <div class="stat" style="--i: 2">
      <span class="stat-value">{formatTime(readTime)}</span>
      <span class="stat-label">read time</span>
    </div>
    <div class="stat highlight" style="--i: 3">
      <span class="stat-value">{formatTime(saved)}</span>
      <span class="stat-label">saved vs avg</span>
    </div>
  </div>
{/if}
```

- [ ] **Step 2: Update stats CSS for pill styling and stagger**

Replace `.stats`, `.stat`, `.stat-value`, `.stat-label`, and `.stat.highlight .stat-value` CSS:

```css
.stats {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  background: var(--surface-raised);
  border-radius: 10px;
  padding: 0.5rem 1rem;
  animation: statFadeIn 300ms ease both;
  animation-delay: calc(var(--i) * 50ms);
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat.highlight .stat-value {
  color: var(--accent);
}

@keyframes statFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 3: Verify stats pills and animation**

Run: `npm run dev` — paste text, confirm stats appear as pills with staggered fade-in.

- [ ] **Step 4: Commit**

```bash
git add src/lib/components/SetupPhase.svelte
git commit -m "feat: style stats as pills with staggered fade-in animation"
```

---

### Task 7: Button Polish — Controls & Start

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Update nudge button hover styles**

Replace `.nudge-btn:hover`:

```css
.nudge-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

- [ ] **Step 2: Update preset button styles**

Replace `.preset-btn` and `.preset-btn:hover`:

```css
.preset-btn {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.preset-btn:hover {
  border-color: var(--border-hover);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preset-btn:active {
  transform: scale(0.95);
}
```

- [ ] **Step 3: Update font button styles with checkmark**

Replace the font button template to add a checkmark on active:

```svelte
{#each FONT_OPTIONS as opt}
  <button
    class="font-btn"
    class:active={appState.font === opt.value}
    style="font-family: '{opt.value}', sans-serif"
    onclick={() => (appState.font = opt.value)}
  >
    {#if appState.font === opt.value}
      <svg class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    {/if}
    {opt.label}
  </button>
{/each}
```

Update `.font-btn` styles:

```css
.font-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.font-btn:hover {
  border-color: var(--border-hover);
  transform: scale(1.02);
}

.font-btn.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.check-icon {
  flex-shrink: 0;
}
```

- [ ] **Step 4: Update start button styles**

Replace `.start-btn`, `.start-btn:hover:not(:disabled)`, and `.start-btn:disabled`:

```css
.start-btn {
  align-self: center;
  padding: 0.9rem 3rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.25);
}

.start-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(99, 102, 241, 0.35);
}

.start-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.start-btn:disabled {
  filter: grayscale(0.6);
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
```

- [ ] **Step 5: Add config section fade-in on mount and preserve preset active style**

Add a fade-in animation to `.config-section` and ensure `.preset-btn.active` is preserved:

```css
.config-section {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: configFadeIn 400ms ease both;
}

@keyframes configFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Note: The existing `.preset-btn.active` style block (accent background, contrasting text, accent border) must be preserved as-is — do not remove it when replacing other `.preset-btn` rules.

- [ ] **Step 6: Verify all button interactions**

Run: `npm run dev` — check hover/active states on all buttons, start button glow, font checkmark.

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/SetupPhase.svelte
git commit -m "feat: polish buttons — hover scale, glow, gradient, checkmarks, config fade-in"
```

---

## Chunk 3: Reading Phase Polish

### Task 8: Progress Bar & ORP Guide Polish

**Files:**
- Modify: `src/lib/components/ReadingPhase.svelte`

- [ ] **Step 1: Update progress bar styles**

Replace `.progress-bar` height and add glow to `.progress-fill`:

```css
.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--surface);
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.1s linear;
  box-shadow: 0 0 8px var(--accent-glow);
}
```

- [ ] **Step 2: Add ORP pulse animation for idle state**

Update `.orp-center-line` and add conditional class in template.

In template, change the ORP line div:

```svelte
<div class="orp-center-line" class:pulsing={isIdle}></div>
```

Update CSS:

```css
.orp-center-line {
  position: absolute;
  left: 50%;
  top: calc(50% - 3.2rem);
  width: 2px;
  height: 10px;
  background: var(--accent);
  opacity: 0.3;
  border-radius: 1px;
  transform: translateX(-50%);
}

.orp-center-line.pulsing {
  animation: orpPulse 2s ease-in-out infinite;
}

@keyframes orpPulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.4; }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/ReadingPhase.svelte
git commit -m "feat: progress bar glow trail and ORP idle pulse"
```

---

### Task 9: Controls Glassmorphism & Hover Polish

**Files:**
- Modify: `src/lib/components/ReadingPhase.svelte`

- [ ] **Step 1: Update controls overlay with glassmorphism**

Replace `.controls` CSS:

```css
.controls {
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
```

- [ ] **Step 2: Update back button with glass effect**

Replace `.back-btn` and `.back-btn:hover`:

```css
.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 80%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.back-btn:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
  transform: scale(1.05);
}
```

- [ ] **Step 3: Update play button with glow**

Replace `.play-btn` and `.play-btn:hover`:

```css
.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  box-shadow: 0 0 16px var(--accent-glow);
}

.play-btn:hover {
  filter: brightness(1.15);
  transform: scale(1.05);
  box-shadow: 0 0 24px var(--accent-glow);
}
```

- [ ] **Step 4: Update speed nudge buttons with glass effect**

Replace `.speed-nudge` and `.speed-nudge:hover`:

```css
.speed-nudge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--surface) 80%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.15s;
}

.speed-nudge:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
  transform: scale(1.05);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ReadingPhase.svelte
git commit -m "feat: glassmorphism controls and play button glow"
```

---

### Task 10: Context Display, Word Fade-in & Finished State

**Files:**
- Modify: `src/lib/components/ReadingPhase.svelte`

- [ ] **Step 1: Add first-word fade-in via CSS mount animation**

Add a `animation` to `.word-display-wrapper` CSS. Since the wrapper mounts once and subsequent words update its content without re-mounting, the animation only plays on the first word appearance — which is the desired behavior. No JS changes needed.

Replace the existing `.word-display-wrapper` CSS:

```css
.word-display-wrapper {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  width: 100vw;
  max-width: 100vw;
  overflow: hidden;
  animation: wordFadeIn 200ms ease both;
}

@keyframes wordFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

- [ ] **Step 2: Update context display with blur-to-sharp**

Replace the `@keyframes fadeIn` and `.context-display` animation:

```css
.context-display {
  margin-top: 2.5rem;
  max-width: 600px;
  text-align: center;
  font-size: 1rem;
  line-height: 1.8;
  animation: fadeInSharp 0.3s ease;
}

@keyframes fadeInSharp {
  from {
    opacity: 0;
    transform: translateY(8px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
```

- [ ] **Step 3: Update finished state with scale-up entrance and accent glow pulse**

Add `class="finished-word"` to the existing "Done" div in the finished-display markup (the markup structure stays the same, just adding the class):

```svelte
{:else if isFinished}
  <div class="finished-display">
    <div class="word-display finished-word" style="font-family: var(--font-family)">Done</div>
    <p class="finished-subtitle">Press Space to restart or Esc to go back</p>
  </div>
{/if}
```

Replace the existing `.finished-display` and `.finished-subtitle` CSS, and add `.finished-word` and keyframes:

```css
.finished-display {
  text-align: center;
  animation: finishedEntrance 400ms ease-out both;
}

.finished-word {
  display: block !important;
  text-align: center;
  animation: finishedGlow 600ms ease-out 400ms both;
}

@keyframes finishedEntrance {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes finishedGlow {
  0% { text-shadow: 0 0 20px var(--accent-glow); }
  100% { text-shadow: none; }
}

.finished-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 1rem;
}
```

- [ ] **Step 4: Verify reading phase polish**

Run: `npm run dev` — paste text, start reading. Check:
- First word fades in
- Pause shows context with blur-to-sharp
- Progress bar has glow
- Controls have glass effect
- Finish shows scale-up "Done"

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/ReadingPhase.svelte
git commit -m "feat: word fade-in, blur-to-sharp context, finished scale-up animation"
```

---

## Chunk 4: Final Verification

### Task 11: Build Verification & Visual QA

**Files:** None (verification only)

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors or warnings.

- [ ] **Step 2: Preview production build**

Run: `npm run preview`
Manual check:
- Dark theme loads by default (or matches OS)
- Toggle switches themes smoothly
- Theme persists across page reload
- No flash of wrong theme on load
- Setup phase: gradient title, depth textarea, pill stats, polished buttons
- Reading phase: glow progress bar, glass controls, clean animations
- Both themes look correct

- [ ] **Step 3: Final commit if any adjustments needed**

Only if fixes were required during QA.

- [ ] **Step 4: Update Obsidian task**

Run: `obsidian tasks:check file="RSVP Speed Reader" task="Add dark/light theme toggle"`
