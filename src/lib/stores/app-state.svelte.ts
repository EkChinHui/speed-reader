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

class AppState {
	phase = $state<Phase>('setup');
	rawText = $state('');
	wpm = $state(DEFAULT_WPM);
	font = $state<FontFamily>('Inter');

	reset() {
		this.phase = 'setup';
		this.rawText = '';
		this.wpm = DEFAULT_WPM;
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
