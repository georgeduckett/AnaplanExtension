import type { MonacoOptions } from '../settings';

import { editor, KeyCode } from "monaco-editor";
import { Monaco } from "../monaco-loader";
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { AnaplanFormulaLexer } from '../Anaplan/antlrclasses/AnaplanFormulaLexer';
import { AnaplanFormulaParser } from '../Anaplan/antlrclasses/AnaplanFormulaParser';
import { AnaplanFormulaTypeEvaluatorVisitor } from '../Anaplan/AnaplanFormulaTypeEvaluatorVisitor';
import { AnaplanDataTypeStrings, anaplanTimeEntityBaseId } from '../Anaplan/AnaplanHelpers';
import { FormulaTokensProvider } from '../Monaco/FormulaTokensProvider';
import { CollectorErrorListener } from '../Anaplan/CollectorErrorListener';
import { FormulaError } from '../Anaplan/FormulaError';
import { AnaplanMetaData } from '../Anaplan/AnaplanMetaData';

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

	private constructor(
		private readonly textArea: HTMLTextAreaElement,
		monaco: Monaco,
		settings: MonacoOptions,
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

		monaco.languages.register({ id: 'anaplanformula' });

		monaco.languages.setTokensProvider('anaplanformula', new FormulaTokensProvider());

		const model = monaco.editor.createModel(this.textArea.value, "anaplanformula");

		this.editor = monaco.editor.create(this.monacoDiv, {
			...settings,
			model,
			automaticLayout: true,
			minimap: { enabled: false },
		});

		let editor = this.editor;

		let handle: any;
		editor.onDidChangeModelContent(function (e) {


			clearTimeout(handle);

			handle = setTimeout(() => {

				let code = editor.getValue();

				if (code.length === 0) {
					return;
				}

				let anaplanMetaData = getAnaplanMetaData(parseInt(textArea.closest(".managedTab")?.id.substring(1)!));

				let targetFormat = anaplanMetaData.getCurrentItem().format;

				let formulaEvaluator = new AnaplanFormulaTypeEvaluatorVisitor(anaplanMetaData);
				const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(code));
				let errors: FormulaError[] = [];
				mylexer.removeErrorListeners();
				const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
				myparser.removeErrorListeners();
				myparser.addErrorListener(new CollectorErrorListener(errors));

				const myresult = formulaEvaluator.visit(myparser.formula());

				// TODO: Use https://www.npmjs.com/package/antlr4-c3 for code completion?

				// TODO: https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-hover-provider-example
				// Hover over entities to get their dimensions

				let monacoErrors = [];
				let lines = code.split('\n');
				// Add the errors with the whole formula if needed
				if (myresult.dataType != anaplanMetaData.getCurrentItem().format.dataType) {
					// Ensure the data type is the same
					monacoErrors.push({
						startLineNumber: 1,
						startColumn: 1,
						endLineNumber: lines.length,
						endColumn: lines[lines.length - 1].length,
						message: `Formula evaluates to ${myresult.dataType} but the line item type is ${targetFormat.dataType}`,
						severity: monaco.MarkerSeverity.Error
					});
				} else if (myresult.dataType === AnaplanDataTypeStrings.ENTITY.dataType) {
					// Ensure the entity types is the same if the data types are entity
					if (myresult.hierarchyEntityLongId != targetFormat.hierarchyEntityLongId) {
						monacoErrors.push({
							startLineNumber: 1,
							startColumn: 1,
							endLineNumber: lines.length,
							endColumn: lines[lines.length - 1].length,
							message: `Formula evaluates to ${anaplanMetaData.getEntityNameFromId(myresult.hierarchyEntityLongId!)} but the line item type is ${anaplanMetaData.getEntityNameFromId(targetFormat.hierarchyEntityLongId!)}`,
							severity: monaco.MarkerSeverity.Error
						});
					}
				}
				for (let e of errors) {
					monacoErrors.push({
						startLineNumber: e.startLine,
						startColumn: e.startCol,
						endLineNumber: e.endLine,
						endColumn: e.endCol,
						message: e.message,
						severity: monaco.MarkerSeverity.Error
					});
				};
				for (let e of formulaEvaluator.formulaErrors) {
					monacoErrors.push({
						startLineNumber: e.startLine,
						startColumn: e.startCol,
						endLineNumber: e.endLine,
						endColumn: e.endCol,
						message: e.message,
						severity: monaco.MarkerSeverity.Error
					});
				};
				let model = monaco.editor.getModels()[0];
				monaco.editor.setModelMarkers(model, "owner", monacoErrors);
			}, 250);
		});

		// TODO: Do this as part of the above?
		const interval = setInterval(() => {
			if (model.getValue() !== this.textArea.value) {
				model.setValue(this.textArea.value);
			}
			if (!document.body.contains(this.textArea)) {
				this.dispose();
			}
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
			id: "github.submit",
			label: "Submit",
			run: () => {
				const ctrlEnterEvent = new KeyboardEvent("keydown", {
					key: "Enter",
					code: "Enter",
					ctrlKey: true,
				});
				this.textArea.dispatchEvent(ctrlEnterEvent);
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

		this.editor.onKeyDown((e) => {
			// TODO: capture keys like enter to save & stop editing the formula

			if (e.keyCode == KeyCode.Enter && this.textArea.value.length != 0) {

			}
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
function getAnaplanMetaData(currentModuleId: number) {
	let currentModuleName = "";
	for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0].length; i++) {
		if (anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0][i] === currentModuleId) {
			currentModuleName = anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i]
		}
	}

	let currentLineItemName = currentModuleName + "." + document.querySelectorAll(".dijitVisible .formulaEditorRowLabelCell")[0].getAttribute("title");

	let moduleLineItems = new Map<string, LineItemInfo>();

	for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.moduleInfos.length; i++) {
		for (var j = 0; j < anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0].length; j++) {
			var entityName = anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i] + "." + anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0][j];
			var dataTypeString = anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos[j].format.dataType;
			if (dataTypeString != AnaplanDataTypeStrings.NONE) {
				moduleLineItems.set(entityName, anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos[j]);

				if (dataTypeString === AnaplanDataTypeStrings.TIME_ENTITY) {

				}
			}
		}
	}

	let hierarchyNames = new Map<number, string>();
	let hierarchyIds = new Map<string, number>();
	let hierarchyParents = new Map<number, number>();

	for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0].length; i++) {
		hierarchyNames.set(
			anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.entityLongIds[0][i],
			anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i]);
		hierarchyIds.set(
			anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i],
			anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.entityLongIds[0][i]);
		hierarchyParents.set(
			anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].entityLongId,
			anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].parentHierarchyEntityLongId);
	}

	for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.labels[0].length; i++) {
		hierarchyNames.set(
			anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.entityLongIds[0][i],
			anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.labels[0][i]);
		hierarchyIds.set(
			anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.labels[0][i],
			anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.entityLongIds[0][i]);
	}

	for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0].length; i++) {
		hierarchyNames.set(
			anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.entityLongIds[0][i],
			anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0][i]);
		hierarchyIds.set(
			anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0][i],
			anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.entityLongIds[0][i]);
	}

	// Add in the special time dimensions
	for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes.length; i++) {
		hierarchyNames.set(anaplanTimeEntityBaseId + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityIndex,
			'Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityLabel);
		hierarchyIds.set('Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityLabel,
			anaplanTimeEntityBaseId + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityIndex);
	}

	let subsetParentDimensionId = new Map<number, SubsetInfo>();
	// Regular subsets (of hierarchies)
	for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos.length; i++) {
		subsetParentDimensionId.set(anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos[i].entityLongId,
			anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos[i]);
	}

	// Line item subsets (of measures)
	for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetInfos.length; i++) {
		subsetParentDimensionId.set(anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetInfos[i].entityLongId,
			anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetInfos[i]);
	}


	return new AnaplanMetaData(moduleLineItems, subsetParentDimensionId, hierarchyNames, hierarchyIds, hierarchyParents, currentModuleName, moduleLineItems.get(currentLineItemName)!);
}

