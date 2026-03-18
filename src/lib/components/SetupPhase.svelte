<script lang="ts">
	import {
		appState,
		FONT_OPTIONS,
		SPEED_PRESETS
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
	let zenTextareaEl: HTMLTextAreaElement | undefined = $state();
	let showInfo = $state(false);
	let zenMode = $state(false);
	let zenVisible = $state(false);
	let zenMounted = $state(false);

	let cleaned = $derived(cleanText(appState.rawText));
	let words = $derived(wordCount(cleaned));
	let chars = $derived(charCount(cleaned));
	let readTime = $derived(estimateReadTime(words, appState.wpm));
	let saved = $derived(timeSaved(words, appState.wpm));
	let hasText = $derived(cleaned.length > 0);

	function startReading() {
		appState.startReading();
	}

	function openZen() {
		zenMounted = true;
		// Trigger enter transition on next frame
		requestAnimationFrame(() => {
			zenVisible = true;
		});
		zenMode = true;
	}

	function closeZen() {
		zenVisible = false;
		zenMode = false;
	}

	function handleZenKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			closeZen();
		}
	}

	$effect(() => {
		if (zenMode && zenTextareaEl) {
			zenTextareaEl.focus();
			// Move cursor to end
			zenTextareaEl.selectionStart = zenTextareaEl.value.length;
			zenTextareaEl.selectionEnd = zenTextareaEl.value.length;
		}
	});

	$effect(() => {
		if (!zenMode) {
			textareaEl?.focus();
		}
	});
</script>

<div class="setup">
	<div class="top-bar">
		<button class="info-toggle" onclick={() => showInfo = true} aria-label="How it works">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"/>
				<line x1="12" y1="16" x2="12" y2="12"/>
				<line x1="12" y1="8" x2="12.01" y2="8"/>
			</svg>
		</button>
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

	<header class="setup-header">
		<h1 class="title">Speed Reader</h1>
		<p class="subtitle">Paste your text and read at your own pace</p>
	</header>

	{#if showInfo}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-backdrop" onclick={(e) => { if (e.target === e.currentTarget) showInfo = false; }} onkeydown={(e) => { if (e.key === 'Escape') showInfo = false; }}>
			<div class="modal" role="dialog" aria-label="How it works">
				<div class="modal-header">
					<h2 class="modal-title">How it works</h2>
					<button class="modal-close" onclick={() => showInfo = false} aria-label="Close">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"/>
							<line x1="6" y1="6" x2="18" y2="18"/>
						</svg>
					</button>
				</div>
				<div class="modal-body">
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
			</div>
		</div>
	{/if}

	<div class="config-bar">
		<span class="config-bar-label">wpm</span>
		{#each SPEED_PRESETS as preset}
			<button
				class="config-opt"
				class:active={appState.wpm === preset}
				onclick={() => (appState.wpm = preset)}
			>
				{preset}
			</button>
		{/each}
		<span class="config-sep"></span>
		<span class="config-bar-label">font</span>
		{#each FONT_OPTIONS as opt}
			<button
				class="config-opt"
				class:active={appState.font === opt.value}
				onclick={() => (appState.font = opt.value)}
			>
				{opt.label.toLowerCase()}
			</button>
		{/each}
	</div>

	<div class="input-section">
		<textarea
			bind:this={textareaEl}
			bind:value={appState.rawText}
			placeholder="Paste your article or text here..."
			class="text-input"
			rows="6"
		></textarea>

		{#if hasText}
			<div class="input-meta">
				<div class="stats-line">
					<span>{words} words</span>
					<span class="stats-dot"></span>
					<span>{chars} chars</span>
					<span class="stats-dot"></span>
					<span>{formatTime(readTime)}</span>
					{#if saved > 0}
						<span class="stats-dot"></span>
						<span class="stats-highlight">{formatTime(saved)} saved</span>
					{/if}
				</div>
				<button class="edit-toggle" onclick={openZen}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="15 3 21 3 21 9"/>
						<polyline points="9 21 3 21 3 15"/>
						<line x1="21" y1="3" x2="14" y2="10"/>
						<line x1="3" y1="21" x2="10" y2="14"/>
					</svg>
					edit
				</button>
			</div>
		{/if}
	</div>

	{#if zenMounted}
		<div
			class="zen-overlay"
			class:zen-active={zenVisible}
			ontransitionend={(e) => {
				if (e.propertyName === 'opacity' && !zenVisible) {
					zenMounted = false;
				}
			}}
		>
			<div class="zen-topbar">
				<button class="zen-close" onclick={closeZen}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"/>
						<line x1="6" y1="6" x2="18" y2="18"/>
					</svg>
					esc
				</button>
				<span class="zen-stats">{words.toLocaleString()} words · {chars.toLocaleString()} chars</span>
			</div>
			<textarea
				bind:this={zenTextareaEl}
				bind:value={appState.rawText}
				class="zen-textarea"
				placeholder="Paste or type your text..."
				onkeydown={handleZenKeydown}
			></textarea>
		</div>
	{/if}

	<div class="bottom-section">
		<button class="start-btn" disabled={!hasText} onclick={startReading}>
			Start Reading
		</button>
		<p class="keyboard-hint">space pause · arrows speed · esc exit</p>
		<a class="built-by" href="https://www.ekchinhui.com/" target="_blank" rel="noopener noreferrer">built by ek chin hui</a>
	</div>
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

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-toggle {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: border-color 0.2s, color 0.2s;
	}

	.info-toggle:hover {
		border-color: var(--border-hover);
		color: var(--text-secondary);
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		animation: backdropFadeIn 200ms ease both;
		padding: 1rem;
	}

	@keyframes backdropFadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 16px;
		max-width: 480px;
		width: 100%;
		padding: 1.5rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: modalSlideIn 250ms ease both;
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.modal-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
	}

	.modal-close {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: none;
		background: transparent;
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.15s, background 0.15s;
	}

	.modal-close:hover {
		color: var(--text-primary);
		background: var(--surface-raised);
	}

	.modal-body p {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.6;
		margin: 0 0 1rem;
	}

	.modal-body strong {
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
		font-size: 0.9rem;
		font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
		line-height: 1.7;
		resize: none;
		min-height: 120px;
		transition: border-color 0.2s, box-shadow 0.2s, background-color 200ms, color 200ms, min-height 350ms ease;
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

	.input-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.edit-toggle {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		background: none;
		border: none;
		color: var(--text-muted);
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		transition: color 0.15s;
		flex-shrink: 0;
	}

	.edit-toggle:hover {
		color: var(--text-secondary);
	}

	/* Zen mode overlay */
	.zen-overlay {
		position: fixed;
		inset: 0;
		background: var(--bg);
		z-index: 50;
		display: flex;
		flex-direction: column;
		padding: 3rem 2rem;
		opacity: 0;
		transform: scale(1.03);
		transition: opacity 300ms ease, transform 300ms ease;
		pointer-events: none;
	}

	.zen-overlay.zen-active {
		opacity: 1;
		transform: scale(1);
		pointer-events: auto;
	}

	.zen-topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		flex-shrink: 0;
	}

	.zen-close {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		background: none;
		border: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		transition: color 0.15s, border-color 0.15s;
	}

	.zen-close:hover {
		color: var(--text-secondary);
		border-color: var(--border-hover);
	}

	.zen-stats {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.zen-textarea {
		flex: 1;
		width: 100%;
		max-width: 700px;
		margin: 0 auto;
		background: transparent;
		border: none;
		outline: none;
		color: var(--text-primary);
		font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
		font-size: 0.9rem;
		line-height: 1.8;
		resize: none;
		caret-color: var(--accent);
	}

	.zen-textarea::placeholder {
		color: var(--text-muted);
	}

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

	.config-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.15rem;
		padding: 0.4rem 0.6rem;
		background: var(--surface-raised);
		border-radius: 8px;
		flex-wrap: wrap;
	}

	.config-bar-label {
		font-size: 0.65rem;
		color: var(--text-muted);
		text-transform: lowercase;
		letter-spacing: 0.04em;
		padding: 0 0.25rem;
		user-select: none;
	}

	.config-sep {
		width: 1px;
		height: 14px;
		background: var(--border);
		margin: 0 0.35rem;
	}

	.config-opt {
		font-size: 0.8rem;
		color: var(--text-muted);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		cursor: pointer;
		transition: color 0.15s;
		border: none;
		background: none;
		font-family: inherit;
	}

	.config-opt:hover {
		color: var(--text-secondary);
	}

	.config-opt.active {
		color: var(--accent);
	}

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
		opacity: 0.5;
		cursor: not-allowed;
		box-shadow: none;
		background: var(--surface-raised);
		color: var(--text-muted);
	}

	.bottom-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.keyboard-hint {
		font-size: 0.7rem;
		color: var(--text-muted);
		letter-spacing: 0.03em;
	}

	.built-by {
		font-size: 0.65rem;
		color: var(--text-muted);
		text-decoration: none;
		opacity: 0.6;
		transition: opacity 0.2s;
		letter-spacing: 0.02em;
	}

	.built-by:hover {
		opacity: 1;
		color: var(--accent);
	}
</style>
