export type Phase = 'setup' | 'reading';
export type FontFamily = 'Inter' | 'Lora' | 'Space Grotesk';

export const FONT_OPTIONS: { label: string; value: FontFamily }[] = [
	{ label: 'Inter', value: 'Inter' },
	{ label: 'Lora', value: 'Lora' },
	{ label: 'Space Grotesk', value: 'Space Grotesk' }
];

export const SPEED_PRESETS = [200, 300, 400, 500, 600];
export const DEFAULT_WPM = 300;
export const WPM_STEP = 25;
export const WPM_MIN = 100;
export const WPM_MAX = 1000;

const STORAGE_KEY = 'rsvp-settings';

interface PersistedSettings {
	wpm: number;
	font: FontFamily;
}

function loadSettings(): PersistedSettings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				wpm: typeof parsed.wpm === 'number' ? parsed.wpm : DEFAULT_WPM,
				font: FONT_OPTIONS.some((o) => o.value === parsed.font) ? parsed.font : 'Inter'
			};
		}
	} catch {
		// ignore
	}
	return { wpm: DEFAULT_WPM, font: 'Inter' };
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

	constructor() {
		const saved = loadSettings();
		this.wpm = saved.wpm;
		this.font = saved.font;

		$effect.root(() => {
			$effect(() => {
				saveSettings({ wpm: this.wpm, font: this.font });
			});
		});
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
