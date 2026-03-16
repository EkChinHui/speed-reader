# UI/UX Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 16 UI/UX issues identified in the audit, prioritized by severity.

**Architecture:** All changes are in 3 files: `SetupPhase.svelte`, `ReadingPhase.svelte`, and `app-state.svelte.ts`. No new files needed. Changes are mostly CSS/template-level with a few logic tweaks.

**Tech Stack:** SvelteKit (Svelte 5 runes), CSS, TypeScript

---

## Chunk 1: High Priority Fixes (Blocking UX Issues)

### Task 1: Fix mobile scrolling on setup page (#14)

**Files:**
- Modify: `src/routes/+page.svelte` (global body styles)

- [ ] **Step 1: Change body overflow to allow scrolling**

In `+page.svelte` global styles, change:
```css
:global(body) {
    overflow: hidden;
    height: 100dvh;
```
to:
```css
:global(body) {
    overflow-y: auto;
    min-height: 100dvh;
```

The `ReadingPhase.svelte` already uses `position: fixed; inset: 0` so it naturally covers the viewport — body overflow won't affect it.

- [ ] **Step 2: Remove fixed height from .app container**

Change `.app` from `height: 100dvh` to `min-height: 100dvh`.

- [ ] **Step 3: Verify on mobile viewport (390x844)**

### Task 2: Add touch controls to finished state (#11)

**Files:**
- Modify: `src/lib/components/ReadingPhase.svelte`

- [ ] **Step 1: Add restart and back buttons to finished display**

Replace the finished-subtitle paragraph with visible buttons:
```svelte
{:else if isFinished}
    <div class="finished-display">
        <div class="word-display finished-word" style="font-family: var(--font-family)">Done</div>
        <div class="finished-actions">
            <button class="finished-btn" onclick={() => engine.toggle()}>Restart</button>
            <button class="finished-btn secondary" onclick={handleBackClick}>Back</button>
        </div>
    </div>
{/if}
```

- [ ] **Step 2: Add styles for finished action buttons**

```css
.finished-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    justify-content: center;
}

.finished-btn {
    padding: 0.6rem 1.5rem;
    border: none;
    border-radius: 8px;
    background: var(--accent);
    color: #1a1a1e;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.finished-btn:hover {
    filter: brightness(1.1);
    transform: scale(1.03);
}

.finished-btn.secondary {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
}

.finished-btn.secondary:hover {
    border-color: var(--border-hover);
    color: var(--text-primary);
}
```

- [ ] **Step 3: Keep the subtitle as a hint below buttons**

Add `<p class="finished-subtitle">or press Space / Esc</p>` after the buttons div.

### Task 3: Fix paste behavior to not replace all text (#7)

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Remove the handlePaste function and onpaste handler**

Delete the `handlePaste` function entirely and remove `onpaste={handlePaste}` from the textarea. Standard browser paste behavior already works correctly with `bind:value`.

- [ ] **Step 2: Commit high priority fixes**

```bash
git add -A && git commit -m "fix: mobile scroll, touch controls on finish, paste behavior"
```

---

## Chunk 2: Medium Priority Fixes

### Task 4: Fix config bar mobile layout (#3)

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte` (styles)

- [ ] **Step 1: Add responsive styles for config bar**

```css
@media (max-width: 480px) {
    .config-bar {
        gap: 0.1rem;
    }
    .config-opt {
        font-size: 0.75rem;
        padding: 0.2rem 0.35rem;
    }
    .config-bar-label {
        font-size: 0.6rem;
    }
}
```

### Task 5: Add WPM label to reading phase (#9)

**Files:**
- Modify: `src/lib/components/ReadingPhase.svelte`

- [ ] **Step 1: Add "wpm" label after speed value**

Change:
```svelte
<span class="speed-value">{wpm}</span>
```
to:
```svelte
<span class="speed-value">{wpm} <small>wpm</small></span>
```

- [ ] **Step 2: Style the small label**

```css
.speed-value small {
    font-size: 0.65rem;
    color: var(--text-muted);
    font-weight: 400;
}
```

### Task 6: Fix disabled start button visibility (#5)

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte` (styles)

- [ ] **Step 1: Change disabled state to be more visible**

```css
.start-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    background: var(--surface-raised);
    color: var(--text-muted);
}
```

### Task 7: Simplify stats to inline text (#4)

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Replace stat cards with inline text**

Replace the stats div with:
```svelte
{#if hasText}
    <div class="stats-line">
        <span>{words} words</span>
        <span class="stats-dot"></span>
        <span>{chars} chars</span>
        <span class="stats-dot"></span>
        <span>{formatTime(readTime)}</span>
        <span class="stats-dot"></span>
        <span class="stats-highlight">{formatTime(saved)} saved</span>
    </div>
{/if}
```

- [ ] **Step 2: Replace stat card styles with inline styles**

Remove all `.stat`, `.stat-value`, `.stat-label`, `@keyframes statFadeIn` styles. Add:
```css
.stats-line {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: var(--text-muted);
    flex-wrap: wrap;
}

.stats-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--text-muted);
    opacity: 0.4;
}

.stats-highlight {
    color: var(--accent);
}
```

### Task 8: Raise minimum WPM to 400, update presets (#16)

**Files:**
- Modify: `src/lib/stores/app-state.svelte.ts`
- Modify: `src/lib/components/SetupPhase.svelte` (config bar presets still use SPEED_PRESETS)
- Modify: `src/lib/components/ReadingPhase.svelte` (speed nudge still uses WPM_MIN)

- [ ] **Step 1: Update constants**

```ts
export const SPEED_PRESETS = [400, 500, 600, 700, 800];
export const DEFAULT_WPM = 500;
export const WPM_MIN = 400;
export const WPM_MAX = 1200;
```

- [ ] **Step 2: Clamp saved WPM on load**

In `loadSettings`, clamp the loaded WPM:
```ts
wpm: typeof parsed.wpm === 'number' ? Math.max(WPM_MIN, Math.min(WPM_MAX, parsed.wpm)) : DEFAULT_WPM,
```

- [ ] **Step 3: Commit medium priority fixes**

```bash
git add -A && git commit -m "fix: config bar mobile, WPM label, button visibility, inline stats, min WPM 400"
```

---

## Chunk 3: Low Priority Polish

### Task 9: Fix theme toggle placement (#1)

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Remove header-row/header-spacer pattern**

Replace the header-row structure with the header directly + absolutely positioned toggle:
```svelte
<header class="setup-header">
    <h1 class="title">Speed Reader</h1>
    <p class="subtitle">Paste your text and read at your own pace</p>
</header>
<button class="theme-toggle" onclick={() => appState.toggleTheme()} aria-label="Toggle theme">
    ...
</button>
```

- [ ] **Step 2: Position toggle absolutely**

```css
.theme-toggle {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    /* ... rest of existing styles */
}

.setup {
    position: relative;  /* add this */
}
```

Remove `.header-row`, `.header-spacer` styles.

### Task 10: Add word position indicator (#8)

**Files:**
- Modify: `src/lib/components/ReadingPhase.svelte`

- [ ] **Step 1: Track word index in component**

Add `currentIndex` state and update it in `onWord` callback.

- [ ] **Step 2: Display counter near speed display**

Add a `<span class="word-counter">{currentIndex + 1}/{engine.totalWords}</span>` in the controls.

### Task 11: Make progress bar clickable (#10)

**Files:**
- Modify: `src/lib/components/ReadingPhase.svelte`

- [ ] **Step 1: Add click handler to progress bar**

```svelte
<div class="progress-bar" onclick={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(pct * (engine.totalWords - 1));
    engine.seekTo(idx);
}}>
```

- [ ] **Step 2: Add cursor pointer and hover state**

```css
.progress-bar { cursor: pointer; }
.progress-bar:hover { height: 6px; }
```

### Task 12: Integrate info button into header (#2)

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Move info button next to subtitle or make it a small icon in header**

Position the info toggle absolutely next to the theme toggle or inline with the subtitle.

### Task 13: Auto-grow textarea (#6)

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Reduce min-height and use auto-resize**

Change `min-height: 200px` to `min-height: 120px`. Add reactive auto-resize on input.

### Task 14: Improve pause context display (#12)

Skip for now — current behavior is acceptable.

### Task 15: Add keyboard hints to setup page (#13)

**Files:**
- Modify: `src/lib/components/SetupPhase.svelte`

- [ ] **Step 1: Add subtle hint below start button**

```svelte
<p class="keyboard-hint">space pause · arrows speed · esc exit</p>
```

### Task 16: Add favicon.ico fallback (#15)

- [ ] **Step 1: Generate favicon.ico from existing SVG or add a simple one**

- [ ] **Step 2: Commit low priority fixes**

```bash
git add -A && git commit -m "fix: theme toggle position, word counter, seekable progress, inline stats, keyboard hints"
```
