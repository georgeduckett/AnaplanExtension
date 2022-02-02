import { CharStreams, CommonTokenStream } from "antlr4ts";
import { AnaplanFormulaFormatterVisitor } from "../Anaplan/AnaplanFormulaFormatterVisitor";
import { AnaplanFormulaLexer } from "../Anaplan/antlrclasses/AnaplanFormulaLexer";
import { AnaplanFormulaParser } from "../Anaplan/antlrclasses/AnaplanFormulaParser";

export default class FormulaFormattingProvider implements monaco.languages.DocumentFormattingEditProvider {
    displayName?: string | undefined;
    provideDocumentFormattingEdits(model: monaco.editor.ITextModel, options: monaco.languages.FormattingOptions, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
        let text = model.getValue();
        try {
            const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(model.getValue()));
            mylexer.removeErrorListeners();
            const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
            myparser.removeErrorListeners();

            let formatter = new AnaplanFormulaFormatterVisitor(options.tabSize);
            let formulaCtx = myparser.formula();

            if (myparser.numberOfSyntaxErrors === 0) {
                text = formatter.visit(formulaCtx);
            }
        }
        catch { return null; }

        return [
            {
                range: model.getFullModelRange(),
                text,
            },
        ];
    }
}