declare let __webpack_public_path__: string;
__webpack_public_path__ = document.head.dataset
	.hedietMonacoEditorPublicPath as string;

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

export let hoverProvider: FormulaHoverProvider;

hoverProvider = new FormulaHoverProvider();

async function main() {
	const settings = JSON.parse(
		document.head.dataset.hedietMonacoEditorSettings!
	) as MonacoOptions;

	const monaco = await loadMonaco();
	console.debug('monaco loaded manually');

	monaco.languages.register({ id: 'anaplanformula' });
	monaco.languages.setTokensProvider('anaplanformula', new FormulaTokensProvider());
	monaco.languages.registerHoverProvider('anaplanformula', hoverProvider);

	function updateDocument() {
		// Add any monaco editors as needed
		for (const textArea of [
			...(document.getElementsByClassName(
				"formulaEditorText"
			) as any),
		]) {
			console.debug('Created editor wrapper for TextArea.formulaEditorText')
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
			timeout = setTimeout(() => {
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
	// Problem is that this code won't run in the context of the first iFrame because it was created dynamically.
	// Solution is to use <all_urls> in the manifest, however that's not ideal, as we don't really want to inject it everywhere.
	// TODO: Look at better solutions to the <all_urls> issue.


	window.addEventListener('message', event => {
		if (event.data.data != undefined && event.data.data.ModelContentCache != undefined) {
			console.log('set anaplan from event.data using ' + window.location.href + ' message from ' + event.origin);
			window.anaplan = event.data;
			console.log(window.anaplan);
		}
	});

	const XHR = XMLHttpRequest.prototype

	const send = XHR.send
	XHR.send = function (body?: Document | BodyInit | null | undefined): void {

		if (body?.toString().includes('"fetchAllModelSummaries":true')) {
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
							// This works as long as the url is consistent (for eu customers change us1a to eu1a) if this is an issue look at using the commented code below, however that still needs proper testing
							try {
								(parent as any).parent.anaplan = (parent as any).anaplan = anaplan = { data: { ModelContentCache: { _modelInfo: responseBody.result.modelInfo } } };
							} catch (err) {
								anaplan = { data: { ModelContentCache: { _modelInfo: responseBody.result.modelInfo } } };
								parent.postMessage(anaplan, 'https://us1a.app.anaplan.com');
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

			let currentModuleName = headerText[0];
			let currentLineItemName = headerText[1];


			// anaplan not defined because we're in the context of the iFrame. We need to access (copy) the anaplan variable into the current anaplan variable within this iFrame if we can
			// TODO: Not sure we need this line as we've set the anaplan variable using a postMessage
			//(window as any).anaplan = (parent as any).anaplan;
			hoverProvider.updateMetaData(getAnaplanMetaData(currentModuleName, currentLineItemName));

			monaco.languages.registerHoverProvider('anaplanguage', hoverProvider);

			let handle: any;
			let model = monaco.editor.getModels()[0];

			// TODO: Use the below to update the errors (don't forget to set the current module name and line item new; don't use the variables above)
			model.onDidChangeContent(function (e) {
				clearTimeout(handle);
				// TODO: Test this
				handle = setTimeout(() => {
					let headerText = document.querySelectorAll(".formula-editor__header")[0].innerHTML.split('—').map(s => s.trim());

					let currentModuleName = headerText[0];
					let currentLineItemName = headerText[1];

					console.log(currentModuleName);
					console.log(currentLineItemName);

					let metadata = getAnaplanMetaData(currentModuleName, currentLineItemName);
					setModelErrors(model, metadata.getEntityIdFromName(currentModuleName)!, currentLineItemName);
				}, 250);
			});

			console.debug('Registered hover to existing monaco editor');
		}
	}
}

let formulaTimeout: NodeJS.Timeout | undefined = undefined;
const mutationObserver = new MutationObserver(() => {
	if (!formulaTimeout) {
		formulaTimeout = setTimeout(() => {
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