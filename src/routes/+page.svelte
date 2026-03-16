<script lang="ts">
	import { appState } from '$lib/stores/app-state.svelte';
	import SetupPhase from '$lib/components/SetupPhase.svelte';
	import ReadingPhase from '$lib/components/ReadingPhase.svelte';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Speed Reader</title>
</svelte:head>

<div class="app">
	{#if appState.phase === 'setup'}
		<div class="phase" in:fade={{ duration: 400, delay: 300 }} out:fade={{ duration: 300 }}>
			<SetupPhase />
		</div>
	{:else}
		<div class="phase" in:fade={{ duration: 600, delay: 200 }} out:fade={{ duration: 200 }}>
			<ReadingPhase />
		</div>
	{/if}
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

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

	:global(body) {
		background: var(--bg);
		color: var(--text-primary);
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		overflow: hidden;
		height: 100dvh;
		transition: background-color 200ms, color 200ms;
	}

	.app {
		position: relative;
		width: 100%;
		height: 100dvh;
	}

	.phase {
		position: absolute;
		inset: 0;
	}
</style>
