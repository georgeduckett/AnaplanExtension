import type * as monaco from "monaco-editor";

export type MonacoOptions = monaco.editor.IStandaloneEditorConstructionOptions;

export const defaultSettings: MonacoOptions = {
	scrollBeyondLastLine: false,
	wordWrap: "on",
	// When wordWrap is "wordWrapColumn" or "bounded", the following also applies:
	wordWrapColumn: 80,
	theme: undefined,
	acceptSuggestionOnCommitCharacter: true,
	acceptSuggestionOnEnter: "on",
	accessibilityPageSize: 10,
	accessibilitySupport: "auto",
	autoClosingBrackets: "languageDefined",
	autoClosingOvertype: "auto",
	autoClosingQuotes: "languageDefined",
	autoIndent: "advanced",
	autoSurround: "languageDefined",
	automaticLayout: true,
	comments: {
		insertSpace: true,
	},
	contextmenu: true,
	copyWithSyntaxHighlighting: true,
	cursorBlinking: "blink",
	cursorSmoothCaretAnimation: false,
	cursorStyle: "line",
	// If cursorStyle is "line", the next one also applies:
	cursorWidth: 0,
	cursorSurroundingLines: 0,
	cursorSurroundingLinesStyle: "default",
	detectIndentation: true,
	dragAndDrop: true, // The docs says the default is `false`, but this is wrong
	emptySelectionClipboard: true,
	fastScrollSensitivity: 5,
	find: {
		addExtraSpaceOnTop: true,
		autoFindInSelection: "never",
		seedSearchStringFromSelection: true,
	},
	folding: true,
	foldingHighlight: true,
	foldingStrategy: "auto",
	fontFamily: undefined,
	fontLigatures: false,
	fontSize: undefined,
	fontWeight: "normal",
	glyphMargin: false,
	hideCursorInOverviewRuler: true,
	highlightActiveIndentGuide: true,
	insertSpaces: true,
	letterSpacing: 0,
	lineDecorationsWidth: 10,
	lineHeight: 0,
	lineNumbers: "off",
	links: true,
	matchBrackets: "always",
	minimap: { enabled: false },
	mouseStyle: "text",
	mouseWheelScrollSensitivity: 1,
	mouseWheelZoom: false,
	multiCursorMergeOverlapping: true,
	multiCursorModifier: "alt",
	multiCursorPaste: "spread",
	occurrencesHighlight: true,
	overviewRulerBorder: false,
	overviewRulerLanes: 0,
	quickSuggestions: true,
	quickSuggestionsDelay: 10,
	renderControlCharacters: false,
	renderFinalNewline: true,
	renderIndentGuides: true,
	renderLineHighlight: "none", // The docs says the default is "all", but this is wrong
	renderWhitespace: "none",
	roundedSelection: true,
	rulers: [],
	scrollBeyondLastColumn: 5,
	selectOnLineNumbers: true,
	selectionHighlight: true,
	showFoldingControls: "always",
	smoothScrolling: false,
	suggestSelection: "recentlyUsed",
	suggest: {
		filterGraceful: true,
		insertMode: "insert",
		localityBonus: false,
		shareSuggestSelections: false,
	},
	suggestFontSize: undefined,
	suggestLineHeight: undefined,
	suggestOnTriggerCharacters: true,
	tabCompletion: "off",
	tabSize: 4,
	trimAutoWhitespace: true,
	useTabStops: true,
	wordBasedSuggestions: true,
	wordSeparators: "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?",
	wrappingIndent: "none",
	wrappingStrategy: "simple",
};

export function getSettings() {
	return { settings: defaultSettings };
}
