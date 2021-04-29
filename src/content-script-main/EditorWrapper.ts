import type { MonacoOptions } from '../settings';

import { editor, KeyCode } from "monaco-editor";
import { Monaco } from "../monaco-loader";
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { AnaplanFormulaLexer } from '../Anaplan/antlrclasses/AnaplanFormulaLexer';
import { AnaplanFormulaParser } from '../Anaplan/antlrclasses/AnaplanFormulaParser';
import { AnaplanFormulaTypeEvaluatorVisitor, AnaplanExpressionType, LineItemInfo } from '../Anaplan/AnaplanFormulaTypeEvaluatorVisitor';

export interface MonacoNode extends HTMLDivElement {
	hedietEditorWrapper: EditorWrapper;
}

export function isMonacoNode(n: unknown): n is MonacoNode {
	const k: keyof MonacoNode = "hedietEditorWrapper";
	return typeof n === "object" && n !== null && k in n;
}

type Theme = "light" | "dark";

export const editorWrapperDivClassName = "hediet-editor-wrapper";
export const monacoDivClassName = "hediet-monaco-container";

export class EditorWrapper {
	public static wrap(
		textArea: HTMLTextAreaElement,
		monaco: Monaco,
		settings: MonacoOptions,
	) {
		if (textArea.hedietEditorWrapper) {
			return textArea.hedietEditorWrapper;
		}
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
	private editorHeight: number = 200;

	private dataTypeToAnaplanExpressionType(dataType: string): AnaplanExpressionType {
		switch (dataType) {
			case "TEXT": return AnaplanExpressionType.text;
			case "NUMBER": return AnaplanExpressionType.numeric;
			case "BOOLEAN": return AnaplanExpressionType.boolean;
			case "ENTITY": return AnaplanExpressionType.entity;
			case "TIME_ENTITY": return AnaplanExpressionType.timeEntity;
			case "DATE": return AnaplanExpressionType.date;
			default: throw new Error("Unknown data type " + dataType);
		}
	}

	private constructor(
		private readonly textArea: HTMLTextAreaElement,
		monaco: Monaco,
		settings: MonacoOptions,
	) {
		this.editorRoot = textArea.parentNode as HTMLElement;

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

		const model = monaco.editor.createModel(textArea.value, "markdown");

		this.editor = monaco.editor.create(this.monacoDiv, {
			...settings,
			model,
			automaticLayout: true,
			minimap: { enabled: false },
		});

		this.editor.addAction({
			id: "github.submit",
			label: "Submit",
			run: () => {
				const ctrlEnterEvent = new KeyboardEvent("keydown", {
					key: "Enter",
					code: "Enter",
					ctrlKey: true,
				});
				textArea.dispatchEvent(ctrlEnterEvent);
			},
			keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
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

		const interval = setInterval(() => {
			if (model.getValue() !== textArea.value) {
				model.setValue(textArea.value);
			}
			if (!document.body.contains(textArea)) {
				this.dispose();
			}
		}, 100);
		this.disposables.push(() => clearInterval(interval));

		textArea.addEventListener("change", () => {
			if (model.getValue() !== textArea.value) {
				model.setValue(textArea.value);
			}
		});
		textArea.addEventListener("input", () => {
			if (model.getValue() !== textArea.value) {
				model.setValue(textArea.value);
			}
		});

		this.editor.onDidChangeCursorSelection((e) => {
			const startOffset = model.getOffsetAt(
				e.selection.getStartPosition()
			);
			const endOffset = model.getOffsetAt(e.selection.getEndPosition());
			textArea.selectionStart = startOffset;
			textArea.selectionEnd = endOffset;
		});

		model.onDidChangeContent((e) => {
			if (e.changes.length === 1 && e.changes[0].text === " ") {
				this.editor.trigger("editor", "hideSuggestWidget", undefined);
			}
			const value = model.getValue();
			textArea.value = value;
			textArea.dispatchEvent(new Event("input"));
		});

		this.editor.onKeyDown((e) => {
			// TODO: capture keys like enter to save & stop editing the formula

			if (e.keyCode == KeyCode.Enter) {
				let currentModuleId = parseInt(textArea.closest(".managedTab")?.id.substring(1)!);
				let currentModuleName = "";
				for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0].length; i++) {
					if (anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0][i] === currentModuleId) {
						currentModuleName = anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i]
					}
				}

				let currentLineItemName = currentModuleName + "." + document.getElementsByClassName("formulaEditorRowLabelCell")[0].getAttribute("title");

				let moduleLineItems = new Map<string, LineItemInfo>();

				for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.moduleInfos.length; i++) {
					for (var j = 0; j < anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0].length; j++) {
						var entityName = anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i] + "." + anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0][j];
						var dataTypeString = anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos[j].format.dataType;
						if (dataTypeString != "NONE") {
							moduleLineItems.set(entityName, new LineItemInfo(entityName, this.dataTypeToAnaplanExpressionType(dataTypeString)));
						}
					}
				}

				const myinput: string = textArea.value;

				if (myinput.length != 0) {
					const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(myinput));
					const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
					const myresult = new AnaplanFormulaTypeEvaluatorVisitor(moduleLineItems, currentModuleName).visit(myparser.formula());

					if (myresult != moduleLineItems.get(currentLineItemName)?.DataType) {
						alert(`Formula evaluates to ${AnaplanExpressionType[myresult]} but the line item type is ${AnaplanExpressionType[moduleLineItems.get(currentLineItemName)!.DataType]}`);
					}
				}
			}
		});

		this.editor.onDidContentSizeChange((e) => {
			this.editorHeight = e.contentHeight;
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
