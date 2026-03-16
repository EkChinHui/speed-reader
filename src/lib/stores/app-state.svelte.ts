export type Phase = 'setup' | 'reading';
export type FontFamily = 'Inter' | 'Lora' | 'Space Grotesk';
export type Theme = 'light' | 'dark';

export const FONT_OPTIONS: { label: string; value: FontFamily }[] = [
	{ label: 'Inter', value: 'Inter' },
	{ label: 'Lora', value: 'Lora' },
	{ label: 'Space Grotesk', value: 'Space Grotesk' }
];

export const SPEED_PRESETS = [400, 500, 600, 700, 800];
export const DEFAULT_WPM = 500;
export const WPM_STEP = 25;
export const WPM_MIN = 400;
export const WPM_MAX = 1200;

const STORAGE_KEY = 'rsvp-settings';

interface PersistedSettings {
	wpm: number;
	font: FontFamily;
	theme: 'light' | 'dark';
	rawText: string;
}

function resolveSystemTheme(): Theme {
	if (typeof document !== 'undefined' && document.documentElement.dataset.theme) {
		return document.documentElement.dataset.theme as Theme;
	}
	if (typeof window !== 'undefined') {
		return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
	}
	return 'dark';
}

function loadSettings(): PersistedSettings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			const validThemes = ['light', 'dark'];
			return {
				wpm: typeof parsed.wpm === 'number' ? Math.max(WPM_MIN, Math.min(WPM_MAX, parsed.wpm)) : DEFAULT_WPM,
				font: FONT_OPTIONS.some((o) => o.value === parsed.font) ? parsed.font : 'Inter',
				theme: validThemes.includes(parsed.theme) ? parsed.theme : resolveSystemTheme(),
				rawText: typeof parsed.rawText === 'string' ? parsed.rawText : ''
			};
		}
	} catch {
		// ignore
	}
	return { wpm: DEFAULT_WPM, font: 'Inter', theme: resolveSystemTheme(), rawText: '' };
}

function saveSettings(settings: PersistedSettings) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		// ignore
	}
}

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
		this.rawText = saved.rawText;

		$effect.root(() => {
			$effect(() => {
				saveSettings({ wpm: this.wpm, font: this.font, theme: this.theme, rawText: this.rawText });
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

	reset() {
		this.phase = 'setup';
		this.rawText = '';
	}

	startReading() {
		if (this.rawText.trim().length === 0) return;
		this.phase = 'reading';
	}

	backToSetup() {
		this.phase = 'setup';
	}
}

export const appState = new AppState();
