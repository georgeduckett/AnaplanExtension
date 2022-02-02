import type { MonacoOptions } from "../settings";

import { loadMonaco } from "../monaco-loader";

import { FormulaTokensProvider } from '../Monaco/FormulaTokensProvider';
import {
	EditorWrapper,
	editorWrapperDivClassName,
	isMonacoNode,
} from "./EditorWrapper";
import { FormulaHoverProvider } from "../Monaco/FormulaHoverProvider";
import { getAnaplanMetaData, setModelErrors } from "../Anaplan/AnaplanHelpers";
import he = require("he");
import { FormulaCompletionItemProvider } from "../Monaco/FormulaCodeCompletionProvider";
import { FormulaSignatureHelpProvider } from "../Monaco/FormulaSignatureHelpProvider";
import FormulaFormattingProvider from "../Monaco/FormulaFormattingProvider";

export let hoverProvider: FormulaHoverProvider;
export let completionItemProvider: FormulaCompletionItemProvider;
export let signatureHelpProvider: FormulaSignatureHelpProvider;

hoverProvider = new FormulaHoverProvider();
completionItemProvider = new FormulaCompletionItemProvider();
signatureHelpProvider = new FormulaSignatureHelpProvider();

async function main() {
	const settings = JSON.parse(
		document.head.dataset.hedietMonacoEditorSettings!
	) as MonacoOptions;

	const monaco = await loadMonaco();
	console.debug('monaco loaded manually');

	monaco.languages.register({ id: 'anaplanformula' });
	monaco.languages.setTokensProvider('anaplanformula', new FormulaTokensProvider());
	monaco.languages.registerHoverProvider('anaplanformula', hoverProvider);
	monaco.languages.registerCompletionItemProvider('anaplanformula', completionItemProvider);
	monaco.languages.registerSignatureHelpProvider('anaplanformula', signatureHelpProvider);

	function updateDocument() {
		// Add any monaco editors as needed
		for (const textArea of [
			...(document.getElementsByClassName(
				"formulaEditorText"
			) as any),
		]) {
			EditorWrapper.wrap(
				textArea,
				monaco,
				settings
			);
		}

		// Prevent sites that copy the edtior around from causing issues
		for (const div of [
			...(document.getElementsByClassName(
				editorWrapperDivClassName
			) as any),
		]) {
			if (!isMonacoNode(div)) {
				div.remove();
			}
		}
	}

	let timeout: NodeJS.Timeout | undefined = undefined;
	const mutationObserver = new MutationObserver(() => {
		if (!timeout) {
			timeout = global.setTimeout(() => {
				updateDocument();
				timeout = undefined;
			}, 50);
		}
	});

	mutationObserver.observe(document.body, {
		subtree: true,
		childList: true,
	});

	updateDocument();
}

if (!window.location.href.includes("embedded") && /https:\/\/.*\.app\.anaplan\.com\/.*\/anaplan\/framework\.jsp.*/.test(window.location.href)) {
	main();
}
else if (window.location.hostname.includes('app.anaplan.com')) {
	window.addEventListener('message', event => {
		if (event.data.data != undefined && event.data.data.ModelContentCache != undefined) {
			console.log('set anaplan from event.data using ' + window.location.href + ' message from ' + event.origin);
			window.anaplan = event.data;
		}
	});

	const XHR = XMLHttpRequest.prototype

	const send = XHR.send
	XHR.send = function (body?: any): void {
		if (body?.toString().includes('"fetchAllModelSummaries":true') || body?.toString().includes('modelChanges')) {
			this.addEventListener('load', function () {
				try {
					if (this.responseType != 'blob') {
						let responseBody
						if (this.responseType === '' || this.responseType === 'text') {
							responseBody = JSON.parse(this.responseText)
						} else {
							responseBody = this.response
						}

						if (this.responseText.includes("modelInfo") && !this.responseText.includes('"modelInfo": null')) {
							// Set the local anaplan variable, but also that of the parent, and the parent's parent

							if (anaplan === undefined) {
								anaplan = { data: { ModelContentCache: { _modelInfo: responseBody.result.modelInfo } } }
							}

							let failedToSetParent = false;
							try {
								if ((parent as any).anaplan === undefined) {
									(parent as any).anaplan = anaplan;
								}
							} catch (err) {
								failedToSetParent = true;
							}
							try {
								if ((parent as any).parent.anaplan === undefined) {
									(parent as any).parent.anaplan = anaplan;
								}
							} catch (err) {
								failedToSetParent = true;
							}

							if (failedToSetParent) {
								// If that didn't work, then post that message to all (since we have to do it cross origin (us1a to eu1a etc)) given the above errored),
								let anaplanPostMessage = { data: { ModelContentCache: { _modelInfo: responseBody.result.modelInfo } } };

								try {
									parent.postMessage(anaplanPostMessage, '*');
								}
								catch (err) {
									console.debug(err);
								}
							}
						}
					}
				} catch (err) {
					console.error("Error reading or processing response.");
					console.error(err);
				}
			});
		}

		return send.apply(this, [body]);
	}

	let monacoChecker = setInterval(monacoCheck, 500);
	function monacoCheck() {
		let monacoInited = false;
		try {
			if ((window as any).monaco !== undefined) {
				if ((window as any).monaco.languages.getEncodedLanguageId('anaplanguage') != 0) {
					console.debug('Found anaplanguage');
					monacoInited = true;
				}
			}
		} catch (ex) {
			console.debug('Error checking for Monaco editor: ' + ex);
		}
		if (monacoInited) {
			clearInterval(monacoChecker);
			console.debug('Monaco initialised by anaplan page');

			let headerText = document.querySelectorAll(".formula-editor__header")[0].innerHTML.split('—').map(s => s.trim());

			let currentModuleName = he.decode(headerText[0]);
			let currentLineItemName = he.decode(headerText[1]);

			let metaData = getAnaplanMetaData(currentModuleName, currentLineItemName);
			hoverProvider.updateMetaData(metaData);
			completionItemProvider.updateMetaData(metaData);

			// Anaplan have their own token provider
			monaco.languages.registerHoverProvider('anaplanguage', hoverProvider);
			monaco.languages.registerCompletionItemProvider('anaplanguage', completionItemProvider);
			monaco.languages.registerSignatureHelpProvider('anaplanguage', signatureHelpProvider);
			monaco.languages.registerDocumentFormattingEditProvider('anaplanguage', new FormulaFormattingProvider())

			let models = monaco.editor.getModels();
			onCreateModel(models[0]);

			monaco.editor.onDidCreateModel(onCreateModel);

			function onCreateModel(model: monaco.editor.ITextModel) {
				let handle: any;

				let metaData = getEditorMetaData();
				hoverProvider.updateMetaData(metaData);
				completionItemProvider.updateMetaData(metaData);

				// Add custom logic to when the user clicks the "Edit" button, since before doing that they could add line items etc.
				let editButtonElement = document.querySelectorAll(".formula-editor__button-widget--edit")[0];

				if (editButtonElement != undefined) {
					editButtonElement.addEventListener("click", () => {
						let metaData = getEditorMetaData();
						hoverProvider.updateMetaData(metaData);
						completionItemProvider.updateMetaData(metaData);
					}, false);
				}

				// Make sure that if the suggest widget is up we don't submit the formula when pressing Enter
				let areaElement = document.querySelectorAll(".react-monaco-editor-container")[0];
				areaElement.addEventListener('keydown', (e: any) => {
					if (e.keyCode === 13 && !e.shiftKey) {
						if (areaElement.querySelectorAll(".editor-widget.suggest-widget.visible").length != 0) {
							// Only cancel when a menu is open
							e.stopImmediatePropagation();
							e.preventDefault();
							// Trigger a <tab> to select the completion item
							const tabEvent = new KeyboardEvent("keydown", {
								bubbles: true,
								cancelable: true,
								key: "Tab",
								shiftKey: false,
								keyCode: 9
							});
							areaElement.dispatchEvent(tabEvent);
							return false;
						}
					}
				}, true);

				// Make sure that if any widget is up we don't cancel editing the formula when pressing Escape
				areaElement.addEventListener('keydown', (e: any) => {
					if (e.keyCode === 27 && !e.shiftKey) {
						if (areaElement.querySelectorAll(".editor-widget.visible").length != 0) {
							// If a widget is visible stop the event bubbling up so we don't go back to readonly mode
							e.stopPropagation();

							// Send an escape key event with shift pressed since this prompts monaco to close the widget, but doesn't make the editor go to readonly mode 
							const escEvent = new KeyboardEvent("keydown", {
								bubbles: true,
								cancelable: true,
								key: "Escape",
								shiftKey: true,
								keyCode: 27
							});
							areaElement.dispatchEvent(escEvent);
						}
					}
				}, true);

				model.onDidChangeContent(function (e) {
					clearTimeout(handle);

					handle = setTimeout(() => {
						// When the formula changes, after a delay update the metadata.
						setModelErrors(model, getEditorMetaData());
					}, 250);
				});

				function getEditorMetaData() {
					let headerElement = document.querySelectorAll(".formula-editor__header")[0];

					let headerText: string;

					if (headerElement.innerHTML.startsWith("<button")) {
						headerText = headerElement.children[0].children[0].innerHTML;
					}
					else {
						headerText = headerElement.innerHTML;
					}

					let currentModuleName = he.decode(headerText.split('—').map(s => s.trim())[0]);
					let currentLineItemName = he.decode(headerText.split('—').map(s => s.trim())[1]);

					let metaData = getAnaplanMetaData(currentModuleName, currentLineItemName);
					return metaData;
				}
			}
		}
	}
}

let formulaTimeout: NodeJS.Timeout | undefined = undefined;
const mutationObserver = new MutationObserver(() => {
	if (!formulaTimeout) {
		formulaTimeout = global.setTimeout(() => {
			window.document.querySelectorAll('.formula-editor__body, .formula-editor__text-area, .formula-editor__monaco-wrapper').forEach(el => {
				(el as any).style.overflow = 'visible';
			});

			formulaTimeout = undefined;
		}, 50);
	}
});

mutationObserver.observe(document.body, {
	subtree: true,
	childList: true,
});
