<script lang="ts">
	import { appState, WPM_STEP, WPM_MIN, WPM_MAX } from '$lib/stores/app-state.svelte';
	import { RSVPEngine, type EngineState } from '$lib/engine/rsvp-engine';
	import type { Word } from '$lib/engine/text-processor';
	import { onMount } from 'svelte';

	let engineState = $state<EngineState>('idle');
	let currentWord = $state<Word | null>(null);
	let progress = $state(0);
	let wpm = $state(appState.wpm);
	let contextWords = $state<{ before: Word[]; current: Word | null; after: Word[] }>({
		before: [],
		current: null,
		after: []
	});
	let showControls = $state(true);
	let controlsTimeout: ReturnType<typeof setTimeout> | null = null;
	let engine: RSVPEngine;
	let containerEl: HTMLDivElement | undefined = $state();

	let isPaused = $derived(engineState === 'paused');
	let isPlaying = $derived(engineState === 'playing');
	let isFinished = $derived(engineState === 'finished');
	let isIdle = $derived(engineState === 'idle');

	onMount(() => {
		engine = new RSVPEngine({
			onWord(word) {
				currentWord = word;
			},
			onStateChange(state) {
				engineState = state;
				if (state === 'paused') {
					contextWords = engine.getContext(8);
					showControls = true;
				} else if (state === 'playing') {
					showControlsTemporarily();
				}
			},
			onProgress(p) {
				progress = p;
			},
			onFinished() {
				showControls = true;
			}
		});

		engine.load(appState.rawText);
		engine.setWPM(appState.wpm);
		wpm = appState.wpm;

		// Auto-start after a brief pause for the transition
		const startTimer = setTimeout(() => engine.play(), 800);

		return () => {
			engine.destroy();
			clearTimeout(startTimer);
			if (controlsTimeout) clearTimeout(controlsTimeout);
		};
	});

	function showControlsTemporarily() {
		showControls = true;
		if (controlsTimeout) clearTimeout(controlsTimeout);
		controlsTimeout = setTimeout(() => {
			if (engineState === 'playing') {
				showControls = false;
			}
		}, 2500);
	}

	function handleMouseMove() {
		if (isPlaying) {
			showControlsTemporarily();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		switch (e.code) {
			case 'Space':
				e.preventDefault();
				engine.toggle();
				break;
			case 'ArrowUp':
			case 'ArrowRight':
				e.preventDefault();
				wpm = Math.min(WPM_MAX, wpm + WPM_STEP);
				engine.setWPM(wpm);
				showControlsTemporarily();
				break;
			case 'ArrowDown':
			case 'ArrowLeft':
				e.preventDefault();
				wpm = Math.max(WPM_MIN, wpm - WPM_STEP);
				engine.setWPM(wpm);
				showControlsTemporarily();
				break;
			case 'Escape':
				engine.reset();
				appState.backToSetup();
				break;
		}
	}

	function handleBackClick() {
		engine.reset();
		appState.backToSetup();
	}

	function renderORPWord(word: Word): { before: string; orp: string; after: string } {
		const text = word.text;
		const idx = word.orpIndex;
		return {
			before: text.slice(0, idx),
			orp: text[idx] || '',
			after: text.slice(idx + 1)
		};
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="reader"
	class:controls-visible={showControls || isPaused || isFinished || isIdle}
	onmousemove={handleMouseMove}
	bind:this={containerEl}
	style="--font-family: '{appState.font}', sans-serif"
>
	<!-- Progress bar -->
	<div class="progress-bar">
		<div class="progress-fill" style="width: {progress * 100}%"></div>
	</div>

	<!-- ORP center guide line -->
	<div class="orp-center-line"></div>

	<!-- Main word display -->
	<div class="word-container">
		{#if currentWord}
			{@const parts = renderORPWord(currentWord)}
			<div class="word-display-wrapper">
				<div class="word-display" style="font-family: var(--font-family)">
					<span class="word-before">{parts.before}</span><span class="word-orp">{parts.orp}</span><span class="word-after">{parts.after}</span>
				</div>
			</div>
		{:else if isIdle}
			<div class="word-display idle-text" style="font-family: var(--font-family)">
				Ready
			</div>
		{:else if isFinished}
			<div class="finished-display">
				<div class="word-display" style="font-family: var(--font-family)">Done</div>
				<p class="finished-subtitle">Press Space to restart or Esc to go back</p>
			</div>
		{/if}
	</div>

	<!-- Context words (shown when paused) -->
	{#if isPaused && contextWords.current}
		<div class="context-display">
			<span class="context-before">
				{contextWords.before.map((w) => w.text).join(' ')}
			</span>
			<span class="context-current">{contextWords.current.text}</span>
			<span class="context-after">
				{contextWords.after.map((w) => w.text).join(' ')}
			</span>
		</div>
	{/if}

	<!-- Controls overlay -->
	<div class="controls">
		<button class="back-btn" onclick={handleBackClick}>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
				<path d="M12 4L6 10L12 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>

		<div class="center-controls">
			<button class="play-btn" onclick={() => engine.toggle()}>
				{#if isPlaying}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<rect x="6" y="4" width="4" height="16" rx="1" />
						<rect x="14" y="4" width="4" height="16" rx="1" />
					</svg>
				{:else}
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path d="M8 5.14v13.72a1 1 0 001.5.86l11.5-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" />
					</svg>
				{/if}
			</button>
		</div>

		<div class="speed-display">
			<button class="speed-nudge" onclick={() => { wpm = Math.max(WPM_MIN, wpm - WPM_STEP); engine.setWPM(wpm); }}>−</button>
			<span class="speed-value">{wpm}</span>
			<button class="speed-nudge" onclick={() => { wpm = Math.min(WPM_MAX, wpm + WPM_STEP); engine.setWPM(wpm); }}>+</button>
		</div>
	</div>
</div>

<style>
	.reader {
		position: fixed;
		inset: 0;
		background: var(--bg);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: none;
		user-select: none;
	}

	.reader.controls-visible {
		cursor: default;
	}

	/* Progress bar */
	.progress-bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--surface);
	}

	.progress-fill {
		height: 100%;
		background: var(--accent);
		transition: width 0.1s linear;
	}

	/* ORP center guide */
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

	/* Word display */
	.word-container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.word-display-wrapper {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		width: 100vw;
		max-width: 100vw;
		overflow: hidden;
	}

	.word-display {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: subgrid;
		font-size: clamp(2.5rem, 7vw, 5rem);
		font-weight: 500;
		letter-spacing: 0.02em;
		white-space: nowrap;
		color: var(--text-primary);
	}

	.idle-text {
		opacity: 0.3;
		display: block !important;
		text-align: center;
		grid-column: 1 / -1;
	}

	.word-before {
		color: var(--text-primary);
		text-align: right;
	}

	.word-after {
		color: var(--text-primary);
		text-align: left;
	}

	.word-orp {
		color: var(--accent);
		font-weight: 700;
		text-align: center;
	}

	/* Finished */
	.finished-display {
		text-align: center;
	}

	.finished-subtitle {
		color: var(--text-muted);
		font-size: 0.9rem;
		margin-top: 1rem;
	}

	/* Context display */
	.context-display {
		margin-top: 2.5rem;
		max-width: 600px;
		text-align: center;
		font-size: 1rem;
		line-height: 1.8;
		animation: fadeIn 0.3s ease;
	}

	.context-before,
	.context-after {
		color: var(--text-muted);
		opacity: 0.5;
	}

	.context-current {
		color: var(--accent);
		font-weight: 600;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Controls */
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

	.controls-visible .controls {
		opacity: 1;
		pointer-events: auto;
	}

	.back-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}

	.back-btn:hover {
		border-color: var(--text-secondary);
		color: var(--text-primary);
	}

	.center-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.play-btn {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		border: none;
		background: var(--accent);
		color: var(--bg);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}

	.play-btn:hover {
		filter: brightness(1.15);
		transform: scale(1.05);
	}

	.speed-display {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.speed-value {
		font-size: 0.9rem;
		color: var(--text-secondary);
		min-width: 40px;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.speed-nudge {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		transition: all 0.15s;
	}

	.speed-nudge:hover {
		border-color: var(--text-secondary);
		color: var(--text-primary);
	}
</style>
