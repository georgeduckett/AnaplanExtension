declare let __webpack_public_path__: string;
__webpack_public_path__ = document.head.dataset
	.hedietMonacoEditorPublicPath as string;

import type { MonacoOptions } from "../settings";

import { loadMonaco } from "../monaco-loader";
import {
	EditorWrapper,
	editorWrapperDivClassName,
	isMonacoNode,
} from "./EditorWrapper";
import { CharStreams, CommonTokenStream } from "antlr4ts";
import { AnaplanFormulaLexer } from "../Anaplan/AnaplanFormulaLexer";
import { AnaplanFormulaParser } from "../Anaplan/AnaplanFormulaParser";
import { AnaplanExpressionType, AnaplanFormulaTypeEvaluatorVisitor } from "../Anaplan/AnaplanFormulaTypeEvaluatorVisitor";

async function main() {
	const settings = JSON.parse(
		document.head.dataset.hedietMonacoEditorSettings!
	) as MonacoOptions;

	const monaco = await loadMonaco();

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




			const myinput: string = textArea.value as string;

			const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(myinput));
			const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
			const myresult = new AnaplanFormulaTypeEvaluatorVisitor().visit(myparser.formula());
			alert(AnaplanExpressionType[myresult]);









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
