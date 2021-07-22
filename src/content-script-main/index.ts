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

export let hoverProvider: FormulaHoverProvider;

async function main() {
	const settings = JSON.parse(
		document.head.dataset.hedietMonacoEditorSettings!
	) as MonacoOptions;

	const monaco = await loadMonaco();

	hoverProvider = new FormulaHoverProvider();

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

main();

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
						anaplan = { data: { ModelContentCache: { _modelInfo: responseBody.result.modelInfo } } };
					}
				}
			} catch (err) {
				console.debug("Error reading or processing response.", err)
			}
		});
	}

	return send.apply(this, [body]);
}