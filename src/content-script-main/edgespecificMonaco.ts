import { hoverProvider, completionItemProvider, signatureHelpProvider, formulaQuickFixesCodeActionProvider } from ".";
import { loadMonaco } from "../monaco-loader";
import { FormulaTokensProvider } from "../Monaco/FormulaTokensProvider";
import { MonacoOptions } from "../settings";
import { EditorWrapper, editorWrapperDivClassName, isMonacoNode } from "./EditorWrapper";

export async function main() {
    const settings = JSON.parse(
        document.head.dataset.hedietMonacoEditorSettings!
    ) as MonacoOptions;

    const monaco = await loadMonaco();
    console.debug('monaco loaded manually');

    monaco.languages.register({ id: 'anaplanformula' });
    monaco.languages.setTokensProvider('anaplanformula', new FormulaTokensProvider());
    monaco.languages.registerHoverProvider('anaplanformula', hoverProvider);
    monaco.languages.registerCompletionItemProvider('anaplanformula', completionItemProvider);
    monaco.languages.registerCodeActionProvider('anaplanformula', formulaQuickFixesCodeActionProvider);
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
