import type { MonacoOptions } from '../settings';

import { editor } from "monaco-editor";
import { Monaco } from "../monaco-loader";
import { getAnaplanMetaData, setModelErrors } from '../Anaplan/AnaplanHelpers';
import { hoverProvider, completionItemProvider } from '.';
import he = require('he');

export interface MonacoNode extends HTMLDivElement {
	hedietEditorWrapper: EditorWrapper;
}

export function isMonacoNode(n: unknown): n is MonacoNode {
	const k: keyof MonacoNode = "hedietEditorWrapper";
	return typeof n === "object" && n !== null && k in n;
}

export const editorWrapperDivClassName = "hediet-editor-wrapper";
export const monacoDivClassName = "hediet-monaco-container";

export class EditorWrapper {
	public static wrap(
		textArea: HTMLTextAreaElement,
		monaco: Monaco,
		settings: MonacoOptions,
	) {
		let metaData = getAnaplanMetaData(parseInt(textArea.closest(".managedTab")?.id.substring(1)!), he.decode(document.querySelectorAll(".dijitVisible .formulaEditorRowLabelCell")[0].getAttribute("title")!));
		hoverProvider.updateMetaData(metaData);
		completionItemProvider.updateMetaData(metaData);
		if (textArea.hedietEditorWrapper) {
			return textArea.hedietEditorWrapper;
		}
		console.debug('Created editor wrapper for TextArea.formulaEditorText');
		return new EditorWrapper(
			textArea,
			monaco,
			settings,
		);
	}

	private disposed = false;
	private readonly disposables = new Array<() => any>();

	private readonly editorWrapperDiv = document.createElement("div");
	private readonly monacoDiv = document.createElement("div");
	private readonly previewDiv = document.createElement("div");
	private readonly editorRoot: HTMLElement;
	private readonly editor: editor.IStandaloneCodeEditor;

	private fullscreen = false;


	private constructor(
		private readonly textArea: HTMLTextAreaElement,
		monaco: Monaco,
		settings: MonacoOptions
	) {
		this.editorRoot = this.textArea.parentNode as HTMLElement;

		this.prepareTextArea();

		this.editorWrapperDiv.className = editorWrapperDivClassName;

		(this.editorWrapperDiv as MonacoNode).hedietEditorWrapper = this;
		this.editorRoot.appendChild(this.editorWrapperDiv);
		this.disposables.push(() => {
			this.editorWrapperDiv.remove();
		});

		this.handleEditorFocusChanged(false);

		this.monacoDiv.className = monacoDivClassName;
		this.editorWrapperDiv.appendChild(this.monacoDiv);
		this.editorWrapperDiv.addEventListener("click", (e) => {
			if (e.target == this.editorWrapperDiv && this.fullscreen) {
				this.setFullScreen(false);
			}
		});

		this.editorWrapperDiv.appendChild(this.previewDiv);

		const model = monaco.editor.createModel(this.textArea.value, "anaplanformula");

		this.editor = monaco.editor.create(this.monacoDiv, {
			...settings,
			model,
			automaticLayout: true,
			minimap: { enabled: false },
		});

		let handle: any;

		model.onDidChangeContent(function (e) {
			clearTimeout(handle);

			handle = setTimeout(() => {
				let metaData = getAnaplanMetaData(parseInt(textArea.closest(".managedTab")?.id.substring(1)!), he.decode(document.querySelectorAll(".dijitVisible .formulaEditorRowLabelCell")[0].getAttribute("title")!));
				hoverProvider.updateMetaData(metaData);
				completionItemProvider.updateMetaData(metaData);
				setModelErrors(model, metaData);
			}, 250);

			let metaData = getAnaplanMetaData(parseInt(textArea.closest(".managedTab")?.id.substring(1)!), he.decode(document.querySelectorAll(".dijitVisible .formulaEditorRowLabelCell")[0].getAttribute("title")!));
			setModelErrors(model, metaData);
		});

		const interval = setInterval(() => {
			if (model.getValue() !== this.textArea.value) {
				model.setValue(this.textArea.value);
			}
			if (!document.body.contains(this.textArea)) {
				this.dispose();
			}

			// Set read-only flag

			let isAcceptRejectVisible = document.querySelectorAll('.formulaEditorButtonsCell')[0].children[0].getAttribute('style') != 'visibility: hidden;';

			this.editor.updateOptions({ readOnly: !isAcceptRejectVisible });

		}, 100);
		this.disposables.push(() => clearInterval(interval));

		this.textArea.addEventListener("change", () => {
			if (model.getValue() !== this.textArea.value) {
				model.setValue(this.textArea.value);
			}
		});
		this.textArea.addEventListener("input", () => {
			if (model.getValue() !== this.textArea.value) {
				model.setValue(this.textArea.value);
			}
		});


		this.editor.addAction({
			id: "Submit",
			label: "Submit",
			run: () => {
				const enterDownEvent = new KeyboardEvent("keydown", {
					key: "Enter",
					code: "Enter",
					keyCode: 13, // Existing anaplan code looks for this property so we include it even if it's depreciated
				});
				this.textArea.dispatchEvent(enterDownEvent);
				const enterPressEvent = new KeyboardEvent("keypress", {
					key: "Enter",
					code: "Enter",
					keyCode: 13, // Existing anaplan code looks for this property so we include it even if it's depreciated
				});
				this.textArea.dispatchEvent(enterPressEvent);
				const enterUpEvent = new KeyboardEvent("keyup", {
					key: "Enter",
					code: "Enter",
					keyCode: 13, // Existing anaplan code looks for this property so we include it even if it's depreciated
				});
				this.textArea.dispatchEvent(enterUpEvent);
			},
			keybindings: [monaco.KeyCode.Enter],
		});
		this.editor.addAction({
			id: "Cancel",
			label: "Cancel",
			run: () => {
				const escapeDownEvent = new KeyboardEvent("keydown", {
					key: "Escape",
					code: "Escape",
					keyCode: 27, // Existing anaplan code looks for this property so we include it even if it's depreciated
				});
				this.textArea.dispatchEvent(escapeDownEvent);
				const escapePressEvent = new KeyboardEvent("keypress", {
					key: "Escape",
					code: "Escape",
					keyCode: 27, // Existing anaplan code looks for this property so we include it even if it's depreciated
				});
				this.textArea.dispatchEvent(escapePressEvent);
				const escapeUpEvent = new KeyboardEvent("keydown", {
					key: "Escape",
					code: "Escape",
					keyCode: 27, // Existing anaplan code looks for this property so we include it even if it's depreciated
				});
				this.textArea.dispatchEvent(escapeUpEvent);
			},
			keybindings: [monaco.KeyCode.Escape],
		});

		this.editor.addAction({
			id: "fullscreen.toggle",
			label: "Toggle Fullscreen",
			run: () => {
				this.setFullScreen(!this.fullscreen);
			},
			keybindings: [monaco.KeyCode.F11],
		});

		this.disposables.push(() => this.editor.dispose());
		this.disposables.push(() => model.dispose());

		this.editor.onDidFocusEditorText(() =>
			this.handleEditorFocusChanged(true)
		);
		this.editor.onDidFocusEditorWidget(() =>
			this.handleEditorFocusChanged(true)
		);
		this.editor.onDidBlurEditorText(() =>
			this.handleEditorFocusChanged(false)
		);
		this.editor.onDidBlurEditorWidget(() =>
			this.handleEditorFocusChanged(false)
		);

		this.editor.onDidChangeCursorSelection((e) => {
			const startOffset = model.getOffsetAt(
				e.selection.getStartPosition()
			);
			const endOffset = model.getOffsetAt(e.selection.getEndPosition());
			this.textArea.selectionStart = startOffset;
			this.textArea.selectionEnd = endOffset;
		});

		model.onDidChangeContent((e) => {
			if (e.changes.length === 1 && e.changes[0].text === " ") {
				this.editor.trigger("editor", "hideSuggestWidget", undefined);
			}
			const value = model.getValue();
			this.textArea.value = value;
			this.textArea.dispatchEvent(new Event("input"));
		});

		this.editor.onDidContentSizeChange((e) => {
			this.applyState();
		});

		const resizeObserver = new ResizeObserver(() => {
			if (this.editorRoot.offsetHeight > 0) {
				this.editor.layout();
			}
			//this.updatePreview();
		});
		resizeObserver.observe(this.editorRoot);
		resizeObserver.observe(this.editorWrapperDiv);

		this.disposables.push(() => resizeObserver.disconnect());

		const applyState = () => {
			this.applyState();
		};
		window.addEventListener("resize", applyState);
		this.disposables.push(() => {
			window.removeEventListener("resize", applyState);
		});

		this.applyState();
	}

	private handleEditorFocusChanged(isFocused: boolean): void {
		if (isFocused) {
			this.editorWrapperDiv.style.border = "1px solid #4a9eff";
			this.textArea.dispatchEvent(new Event("focus"));
		} else {
			this.editorWrapperDiv.style.border = "1px solid #c3c8cf";
			this.textArea.dispatchEvent(new Event("blur"));
		}
	}

	private prepareTextArea() {
		this.textArea.hedietEditorWrapper = this;
		this.textArea.style.display = "none";
	}

	private setFullScreen(fullscreen: boolean) {
		this.fullscreen = fullscreen;
		this.applyState();
	}

	private get previewVisible(): boolean {
		return this.fullscreen && this.editorWrapperDiv.offsetWidth > 1300;
	}

	private applyState() {
		//this.updatePreview();
		this.editorWrapperDiv.classList.toggle("fullscreen", this.fullscreen);
		/*
		this.monacoDiv.style.height = this.fullscreen
			? ""
			: `${ Math.min(300, Math.max(100, this.editorHeight + 2)) }px`;
		*/
		this.previewDiv.className = this.previewVisible
			? "hediet-preview-container active comment-body markdown-body js-preview-body"
			: "hediet-preview-container";
	}

	dispose() {
		if (this.disposed) {
			return;
		}
		this.disposed = true;
		for (const d of this.disposables) {
			d();
		}
	}
}