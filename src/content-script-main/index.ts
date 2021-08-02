declare let __webpack_public_path__: string;
__webpack_public_path__ = document.head.dataset
	.hedietMonacoEditorPublicPath as string;

import type { MonacoOptions } from "../settings";

import { loadMonaco, Monaco } from "../monaco-loader";
import { FormulaTokensProvider } from '../Monaco/FormulaTokensProvider';
import {
	EditorWrapper,
	editorWrapperDivClassName,
	isMonacoNode,
} from "./EditorWrapper";
import { FormulaHoverProvider } from "../Monaco/FormulaHoverProvider";
import { getAnaplanMetaData } from "../Anaplan/AnaplanHelpers";

export let hoverProvider: FormulaHoverProvider;

hoverProvider = new FormulaHoverProvider();

async function main() {
	const settings = JSON.parse(
		document.head.dataset.hedietMonacoEditorSettings!
	) as MonacoOptions;

	const monaco = await loadMonaco();

	monaco.languages.register({ id: 'anaplanformula' });

	monaco.languages.setTokensProvider('anaplanformula', new FormulaTokensProvider());

	monaco.languages.registerHoverProvider('anaplanformula', hoverProvider);

	function updateDocument() {
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



		// Github seems to copy dom nodes around.
		// Github also copies the monaco editor which leads to problems.
		// We fix this by just removing all "dead" dom nodes.
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

//main();

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
						(parent as any).parent.anaplan = (parent as any).anaplan = anaplan = { data: { ModelContentCache: { _modelInfo: responseBody.result.modelInfo } } };
					}
				}
			} catch (err) {
				console.debug("Error reading or processing response.", err)
			}
		});
	}

	return send.apply(this, [body]);
}

function getMonaco(): Monaco | undefined {
	return (window as any).monaco;
}

// Problem is that this code won't run in the context of the first iFrame because I think it was created dynamically.
// Solution is to use <all_urls> in the manifest, however that's not ideal, as we don't really want to inject it everywhere.
// TODO: Look at better soltions to the <all_urls> issue.
let monacoChecker = setInterval(monacoCheck, 500);
function monacoCheck() {
	let monacoInited = false;
	try {
		if (getMonaco() !== undefined) {
			if ((window as any).monaco.languages.getEncodedLanguageId('anaplanguage') != 0) {
				console.log('Found anaplanguage');
				monacoInited = true;
			}
		}
	} catch (ex) {
		console.log('Error checking for Monaco editor: ' + ex);
	}
	if (monacoInited) {
		// inject the following into the styles:
		/*
				.formula-editor__body {
					overflow: visible !important;
				}
				
				.formula-editor__text-area {
					overflow: visible !important;
				}
				
				.formula-editor__monaco-wrapper {
					overflow: visible !important;
				}
		*/


		function injectHoverStyles() {
			console.log('test');
			window.document.querySelectorAll('.formula-editor__body').forEach(el => {
				console.log('test2');
				(el as any).style.overflow = 'visible';
			})
		}
		let timeout: NodeJS.Timeout | undefined = undefined;
		const mutationObserver = new MutationObserver(() => {
			console.log('test3'); // TODO: Why doesn't this work?
			if (!timeout) {
				timeout = setTimeout(() => {
					injectHoverStyles();
					timeout = undefined;
				}, 50);
			}
		});

		mutationObserver.observe(window.document.body, {
			subtree: true,
			childList: true,
		});


		console.log('Monaco initialised');
		clearInterval(monacoChecker);


		let headerText = document.querySelectorAll(".formula-editor__header")[0].innerHTML.split('—').map(s => s.trim());

		let currentModuleName = headerText[0];
		let currentLineItemName = headerText[1];


		// anaplan not defined because we're in the context of the iFrame. We need to access (copy) the anaplan variable into the current anaplan variable within this iFrame
		(window as any).anaplan = (parent as any).anaplan;
		hoverProvider.updateMetaData(getAnaplanMetaData(currentModuleName, currentLineItemName));

		monaco.languages.registerHoverProvider('anaplanguage', hoverProvider);


		console.log('Registered hover');
	}
}