<script lang="ts">
	import {
		appState,
		FONT_OPTIONS,
		SPEED_PRESETS,
		WPM_STEP,
		WPM_MIN,
		WPM_MAX
	} from '$lib/stores/app-state.svelte';
	import {
		cleanText,
		wordCount,
		charCount,
		estimateReadTime,
		timeSaved,
		formatTime
	} from '$lib/engine/text-processor';

	let textareaEl: HTMLTextAreaElement | undefined = $state();
	let showInfo = $state(false);

	let cleaned = $derived(cleanText(appState.rawText));
	let words = $derived(wordCount(cleaned));
	let chars = $derived(charCount(cleaned));
	let readTime = $derived(estimateReadTime(words, appState.wpm));
	let saved = $derived(timeSaved(words, appState.wpm));
	let hasText = $derived(cleaned.length > 0);

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const pasted = e.clipboardData?.getData('text/plain') ?? '';
		appState.rawText = pasted;
	}

	function nudgeWPM(delta: number) {
		appState.wpm = Math.max(WPM_MIN, Math.min(WPM_MAX, appState.wpm + delta));
	}

	function startReading() {
		appState.startReading();
	}

	$effect(() => {
		textareaEl?.focus();
	});
</script>

<div class="setup">
	<div class="header-row">
		<div class="header-spacer"></div>
		<header class="setup-header">
			<h1 class="title">Speed Reader</h1>
			<p class="subtitle">Paste your text and read at your own pace</p>
		</header>
		<button class="theme-toggle" onclick={() => appState.toggleTheme()} aria-label="Toggle theme">
			{#key appState.theme}
				{#if appState.theme === 'dark'}
					<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
					<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
					</svg>
				{/if}
			{/key}
		</button>
	</div>

	<div class="info-section">
		<button class="info-toggle" onclick={() => showInfo = !showInfo}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" y1="16" x2="12" y2="12"/>
				<line x1="12" y1="8" x2="12.01" y2="8"/>
			</svg>
			How it works
			<svg class="info-chevron" class:open={showInfo} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="6 9 12 15 18 9"/>
			</svg>
		</button>
		{#if showInfo}
			<div class="info-content">
				<p>This app uses <strong>RSVP</strong> (Rapid Serial Visual Presentation) to help you read faster. Instead of scanning lines of text, words are shown one at a time at a fixed point — eliminating eye movement and letting you focus purely on comprehension.</p>
				<div class="info-features">
					<div class="info-feature">
						<span class="info-feature-title">ORP alignment</span>
						<span class="info-feature-desc">Each word is positioned at its Optimal Recognition Point — the character your eye naturally fixates on first</span>
					</div>
					<div class="info-feature">
						<span class="info-feature-title">Smart pacing</span>
						<span class="info-feature-desc">Longer words and punctuation get extra display time so you never feel rushed</span>
					</div>
					<div class="info-feature">
						<span class="info-feature-title">Keyboard controls</span>
						<span class="info-feature-desc">Space to pause, arrows to adjust speed, Esc to exit</span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="input-section">
		<textarea
			bind:this={textareaEl}
			bind:value={appState.rawText}
			onpaste={handlePaste}
			placeholder="Paste your article or text here..."
			class="text-input"
			rows="10"
		></textarea>

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
	</div>

	<div class="config-section">
		<div class="speed-control">
			<label class="config-label">Speed</label>
			<div class="speed-row">
				<button class="nudge-btn" onclick={() => nudgeWPM(-WPM_STEP)}>−</button>
				<span class="wpm-display">{appState.wpm} <small>WPM</small></span>
				<button class="nudge-btn" onclick={() => nudgeWPM(WPM_STEP)}>+</button>
			</div>
			<div class="speed-presets">
				{#each SPEED_PRESETS as preset}
					<button
						class="preset-btn"
						class:active={appState.wpm === preset}
						onclick={() => (appState.wpm = preset)}
					>
						{preset}
					</button>
				{/each}
			</div>
		</div>

		<div class="font-control">
			<label class="config-label">Font</label>
			<div class="font-options">
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
			</div>
		</div>
	</div>

	<button class="start-btn" disabled={!hasText} onclick={startReading}>
		Start Reading
	</button>
</div>

<style>
	.setup {
		max-width: 640px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		min-height: 100dvh;
		justify-content: center;
		transition: color 200ms;
	}

	.setup-header {
		text-align: center;
	}

	.info-section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.info-toggle {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: none;
		border: none;
		color: var(--text-muted);
		font-size: 0.85rem;
		cursor: pointer;
		padding: 0.3rem 0.6rem;
		border-radius: 8px;
		transition: color 0.2s;
	}

	.info-toggle:hover {
		color: var(--text-secondary);
	}

	.info-chevron {
		transition: transform 0.2s ease;
	}

	.info-chevron.open {
		transform: rotate(180deg);
	}

	.info-content {
		margin-top: 0.75rem;
		max-width: 520px;
		animation: infoFadeIn 300ms ease both;
	}

	.info-content p {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.6;
		text-align: center;
		margin: 0 0 1rem;
	}

	.info-content strong {
		color: var(--accent);
		font-weight: 600;
	}

	.info-features {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.info-feature {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 0.6rem 0.8rem;
		background: var(--surface-raised);
		border-radius: 10px;
	}

	.info-feature-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.info-feature-desc {
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.4;
	}

	@keyframes infoFadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

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

	.title {
		font-size: 2.5rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		margin: 0;
		background: linear-gradient(135deg, var(--accent), #fbbf24);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: var(--text-secondary);
		margin: 0.5rem 0 0;
		font-size: 1.1rem;
	}

	.input-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

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
		transition: border-color 0.2s, box-shadow 0.2s, background-color 200ms, color 200ms;
		outline: none;
		box-sizing: border-box;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(0, 0, 0, 0.04);
	}

	.text-input:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-glow);
	}

	.text-input::placeholder {
		color: var(--text-muted);
	}

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

	.config-label {
		display: block;
		font-size: 0.8rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.speed-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		justify-content: center;
	}

	.wpm-display {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
		min-width: 100px;
		text-align: center;
	}

	.wpm-display small {
		font-size: 0.7em;
		color: var(--text-muted);
		font-weight: 400;
	}

	.nudge-btn {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-primary);
		font-size: 1.2rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}

	.nudge-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
		transform: scale(1.05);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.speed-presets {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.5rem;
		justify-content: center;
	}

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

	.preset-btn.active {
		background: var(--accent);
		color: #1a1a1e;
		border-color: var(--accent);
	}

	.font-options {
		display: flex;
		gap: 0.5rem;
	}

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
		color: #1a1a1e;
		border-color: var(--accent);
	}

	.check-icon {
		flex-shrink: 0;
	}

	.start-btn {
		align-self: center;
		padding: 0.9rem 3rem;
		border: none;
		border-radius: 12px;
		background: linear-gradient(135deg, var(--accent), #fbbf24);
		color: #1a1a1e;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		letter-spacing: 0.01em;
		box-shadow: 0 4px 20px rgba(245, 158, 11, 0.25);
	}

	.start-btn:hover:not(:disabled) {
		filter: brightness(1.1);
		transform: translateY(-1px);
		box-shadow: 0 6px 28px rgba(245, 158, 11, 0.35);
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
</style>
