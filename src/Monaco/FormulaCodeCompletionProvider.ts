import { CodeCompletionCore, Symbol, SymbolTable, VariableSymbol } from "antlr4-c3";
import { CharStreams, CommonTokenStream } from "antlr4ts";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Position } from "monaco-editor";
import { AnaplanMetaData } from "../Anaplan/AnaplanMetaData";
import { AnaplanFormulaLexer } from "../Anaplan/antlrclasses/AnaplanFormulaLexer";
import { AnaplanFormulaParser } from "../Anaplan/antlrclasses/AnaplanFormulaParser";
import { CompletionItem } from "./CompletionItem";

function computeTokenIndex(parseTree: ParseTree, caretPosition: Position): number | undefined {
    if (parseTree instanceof TerminalNode) {
        return computeTokenIndexOfTerminalNode(parseTree, caretPosition);
    } else {
        return computeTokenIndexOfChildNode(parseTree, caretPosition);
    }
}

function computeTokenIndexOfTerminalNode(parseTree: TerminalNode, caretPosition: Position) {
    let start = parseTree.symbol.charPositionInLine;
    let stop = parseTree.symbol.charPositionInLine + parseTree.text.length;
    if (parseTree.symbol.line == caretPosition.lineNumber && start <= caretPosition.column && stop >= caretPosition.column) {
        return parseTree.symbol.tokenIndex;
    } else {
        return undefined;
    }
}

function computeTokenIndexOfChildNode(parseTree: ParseTree, caretPosition: Position) {
    for (let i = 0; i < parseTree.childCount; i++) {
        let index = computeTokenIndex(parseTree.getChild(i), caretPosition);
        if (index !== undefined) {
            return index;
        }
    }
    return undefined;
}

export class FormulaCompletionItemProvider implements monaco.languages.CompletionItemProvider {
    triggerCharacters?: string[] = undefined;
    _anaplanMetaData: AnaplanMetaData | undefined;

    updateMetaData(newMetaData: AnaplanMetaData) { this._anaplanMetaData = newMetaData; }

    provideCompletionItems(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        context: monaco.languages.CompletionContext,
        token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
        const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(model.getValue()));
        mylexer.removeErrorListeners();
        const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
        myparser.removeErrorListeners();

        let tree = myparser.formula();
        // TODO: Make sure we have successfully parsed the input

        // TODO: Do we want to add any tokens at all?
        let core = new CodeCompletionCore(myparser);
        core.ignoredTokens = new Set([
            AnaplanFormulaLexer.LPAREN, AnaplanFormulaLexer.RPAREN,
            AnaplanFormulaLexer.AMPERSAND, AnaplanFormulaLexer.BINARYOPERATOR,
            AnaplanFormulaLexer.COLON, AnaplanFormulaLexer.DOT,
            AnaplanFormulaLexer.DOUBLEQUOTES,
            AnaplanFormulaLexer.EOF,
            AnaplanFormulaLexer.EQUALS, AnaplanFormulaLexer.NOTEQUALS, AnaplanFormulaLexer.GT, AnaplanFormulaLexer.GTEQUALS,
            AnaplanFormulaLexer.LT, AnaplanFormulaLexer.LTEQUALS,
            AnaplanFormulaLexer.LSQUARE, AnaplanFormulaLexer.RSQUARE,
            AnaplanFormulaLexer.SCIENTIFIC_NUMBER,
            AnaplanFormulaLexer.STRINGLITERAL,
            AnaplanFormulaLexer.TIMES, AnaplanFormulaLexer.DIV,
            AnaplanFormulaLexer.UNDERSCORE,
            AnaplanFormulaLexer.WORD,
            AnaplanFormulaLexer.PLUS, AnaplanFormulaLexer.MINUS,
            AnaplanFormulaLexer.QUOTELITERAL,
            AnaplanFormulaLexer.IF,
        ]);

        core.preferredRules = new Set([
            AnaplanFormulaParser.RULE_entity,
            AnaplanFormulaParser.RULE_dimensionmappingselector,
        ]);

        core.showResult = true;

        let candidates = core.collectCandidates(computeTokenIndex(tree, position)!);

        let keywords: string[] = [];
        for (let candidate of candidates.tokens) {
            keywords.push(myparser.vocabulary.getDisplayName(candidate[0]));
        }

        let entityNames: string[] = [];
        for (let candidate of candidates.rules) {
            switch (candidate[0]) {
                case AnaplanFormulaParser.RULE_entity: {
                    for (let e of this._anaplanMetaData!.getAutoCompleteItems()) {
                        if (!e.name.startsWith('<<') && !e.name.startsWith('--')) {
                            entityNames.push(e.name);
                        }
                    }
                    break;
                }
                case AnaplanFormulaParser.RULE_dimensionmappingselector: {
                    keywords.push('SELECT');
                    keywords.push('LOOKUP');
                    keywords.push('SUM');
                    keywords.push('AVERAGE');
                    keywords.push('MIN');
                    keywords.push('MAX');
                    keywords.push('ANY');
                    keywords.push('ALL');
                }
            }
        }

        // Finally combine all found lists into one for the UI.
        // We do that in separate steps so that you can apply some ordering to each of your sub lists.
        // Then you also can order symbols groups as a whole depending their importance.

        const word = model.getWordUntilPosition(position)
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        }

        let suggestions: CompletionItem[] = [];
        // TODO: Display entites without enclosing quotes
        suggestions.push(...keywords.map(s => new CompletionItem(s, monaco.languages.CompletionItemKind.Keyword, s, range)));
        suggestions.push(...entityNames.map(s => new CompletionItem(s, monaco.languages.CompletionItemKind.Variable, s, range)));

        return {
            suggestions: suggestions
        };
    }

}

