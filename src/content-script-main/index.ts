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

// TODO: If we're using the new editor, capture the (one of several) call to https://eu1a.app.anaplan.com/eu-core50153/anaplan/jsonrpc to get result.modelInfo and set that to anaplan
// Use https://stackoverflow.com/questions/6831916/is-it-possible-to-monitor-http-traffic-in-chrome-using-an-extension/67390377#67390377 to capture the web request
