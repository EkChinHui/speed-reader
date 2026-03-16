/**
 * Processes raw pasted text into clean, tokenized words ready for RSVP display.
 */

const HTML_TAG_RE = /<[^>]*>/g;
const MULTIPLE_SPACES_RE = /\s+/g;
const MULTIPLE_NEWLINES_RE = /\n{3,}/g;

export function cleanText(raw: string): string {
	return raw
		.replace(HTML_TAG_RE, ' ')
		.replace(MULTIPLE_NEWLINES_RE, '\n\n')
		.replace(MULTIPLE_SPACES_RE, ' ')
		.trim();
}

export interface Word {
	text: string;
	index: number;
	orpIndex: number;
	delayMultiplier: number;
	isParagraphEnd: boolean;
}

/** Calculate the Optimal Recognition Point for a word */
export function calculateORP(word: string): number {
	const len = word.length;
	if (len <= 1) return 0;
	if (len <= 3) return 0;
	if (len <= 5) return 1;
	if (len <= 9) return 2;
	if (len <= 13) return 3;
	return 4;
}

const LONG_PAUSE_RE = /[.!?]$/;
const SHORT_PAUSE_RE = /[,;:—]$/;
const EXTRA_LONG_CHAR_THRESHOLD = 6;

/** Calculate adaptive delay multiplier based on word length and punctuation */
function calculateDelayMultiplier(word: string): number {
	let multiplier = 1.0;

	// Longer words need more time
	if (word.length > EXTRA_LONG_CHAR_THRESHOLD) {
		multiplier += (word.length - EXTRA_LONG_CHAR_THRESHOLD) * 0.1;
	}

	// Punctuation pauses
	if (LONG_PAUSE_RE.test(word)) {
		multiplier += 0.8;
	} else if (SHORT_PAUSE_RE.test(word)) {
		multiplier += 0.4;
	}

	return multiplier;
}

/** Tokenize cleaned text into Word objects */
export function tokenize(text: string): Word[] {
	const words: Word[] = [];
	const paragraphs = text.split(/\n\n+/);

	for (const paragraph of paragraphs) {
		const tokens = paragraph.split(/\s+/).filter(Boolean);
		for (let i = 0; i < tokens.length; i++) {
			const token = tokens[i];
			const isLastInParagraph = i === tokens.length - 1;
			words.push({
				text: token,
				index: words.length,
				orpIndex: calculateORP(token),
				delayMultiplier: calculateDelayMultiplier(token) + (isLastInParagraph ? 0.5 : 0),
				isParagraphEnd: isLastInParagraph
			});
		}
	}

	return words;
}

export function wordCount(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

export function charCount(text: string): number {
	return text.length;
}

/** Estimate reading time in seconds */
export function estimateReadTime(words: number, wpm: number): number {
	return (words / wpm) * 60;
}

const AVG_READING_WPM = 238;

/** Calculate seconds saved compared to average reading speed */
export function timeSaved(words: number, wpm: number): number {
	const avgTime = estimateReadTime(words, AVG_READING_WPM);
	const rsvpTime = estimateReadTime(words, wpm);
	return Math.max(0, avgTime - rsvpTime);
}

export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.round(seconds % 60);
	if (mins === 0) return `${secs}s`;
	return `${mins}m ${secs}s`;
}
