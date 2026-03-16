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
		--bg: #0a0a0c;
		--surface: #141418;
		--border: #2a2a32;
		--text-primary: #e8e8ed;
		--text-secondary: #8888a0;
		--text-muted: #55556a;
		--accent: #7c6ff7;
		--accent-glow: rgba(124, 111, 247, 0.15);
	}

	:global(body) {
		background: var(--bg);
		color: var(--text-primary);
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		overflow: hidden;
		height: 100dvh;
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
