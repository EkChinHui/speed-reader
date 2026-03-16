import { type Word, tokenize, cleanText } from './text-processor';

export type EngineState = 'idle' | 'playing' | 'paused' | 'finished';

const REWIND_WORDS = 4;

export interface RSVPCallbacks {
	onWord: (word: Word, index: number, total: number) => void;
	onStateChange: (state: EngineState) => void;
	onProgress: (progress: number) => void;
	onFinished: () => void;
}

export class RSVPEngine {
	private words: Word[] = [];
	private currentIndex = 0;
	private wpm = 300;
	private state: EngineState = 'idle';
	private timeoutId: ReturnType<typeof setTimeout> | null = null;
	private callbacks: RSVPCallbacks;

	constructor(callbacks: RSVPCallbacks) {
		this.callbacks = callbacks;
	}

	load(rawText: string): Word[] {
		const cleaned = cleanText(rawText);
		this.words = tokenize(cleaned);
		this.currentIndex = 0;
		this.setState('idle');
		return this.words;
	}

	get wordList(): Word[] {
		return this.words;
	}

	get totalWords(): number {
		return this.words.length;
	}

	get currentWordIndex(): number {
		return this.currentIndex;
	}

	get currentState(): EngineState {
		return this.state;
	}

	get currentWPM(): number {
		return this.wpm;
	}

	setWPM(wpm: number) {
		this.wpm = Math.max(50, Math.min(1200, wpm));
	}

	play() {
		if (this.words.length === 0) return;
		if (this.state === 'finished') {
			this.currentIndex = 0;
		}
		this.setState('playing');
		this.showNextWord();
	}

	pause() {
		if (this.state !== 'playing') return;
		this.clearTimeout();
		this.setState('paused');
	}

	resume() {
		if (this.state !== 'paused') return;
		// Rewind a few words for flow re-entry
		this.currentIndex = Math.max(0, this.currentIndex - REWIND_WORDS);
		this.setState('playing');
		this.showNextWord();
	}

	toggle() {
		switch (this.state) {
			case 'idle':
			case 'finished':
				this.play();
				break;
			case 'playing':
				this.pause();
				break;
			case 'paused':
				this.resume();
				break;
		}
	}

	seekTo(index: number) {
		this.currentIndex = Math.max(0, Math.min(this.words.length - 1, index));
		if (this.state === 'paused' || this.state === 'idle') {
			const word = this.words[this.currentIndex];
			this.callbacks.onWord(word, this.currentIndex, this.words.length);
			this.callbacks.onProgress(this.currentIndex / this.words.length);
		}
	}

	reset() {
		this.clearTimeout();
		this.currentIndex = 0;
		this.setState('idle');
	}

	destroy() {
		this.clearTimeout();
	}

	/** Get surrounding context words for pause display */
	getContext(radius: number = 8): { before: Word[]; current: Word | null; after: Word[] } {
		if (this.words.length === 0 || this.currentIndex >= this.words.length) {
			return { before: [], current: null, after: [] };
		}
		const start = Math.max(0, this.currentIndex - radius);
		const end = Math.min(this.words.length, this.currentIndex + radius + 1);
		return {
			before: this.words.slice(start, this.currentIndex),
			current: this.words[this.currentIndex],
			after: this.words.slice(this.currentIndex + 1, end)
		};
	}

	private showNextWord() {
		if (this.state !== 'playing') return;
		if (this.currentIndex >= this.words.length) {
			this.setState('finished');
			this.callbacks.onFinished();
			return;
		}

		const word = this.words[this.currentIndex];
		this.callbacks.onWord(word, this.currentIndex, this.words.length);
		this.callbacks.onProgress(this.currentIndex / Math.max(1, this.words.length - 1));

		const baseDelay = 60000 / this.wpm;
		const delay = baseDelay * word.delayMultiplier;

		this.currentIndex++;
		this.timeoutId = setTimeout(() => this.showNextWord(), delay);
	}

	private setState(state: EngineState) {
		this.state = state;
		this.callbacks.onStateChange(state);
	}

	private clearTimeout() {
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}
}
