import { CodeCompletionCore, Symbol, SymbolTable, VariableSymbol } from "antlr4-c3";
import { CharStreams, CommonTokenStream, DefaultErrorStrategy, ParserRuleContext } from "antlr4ts";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Position } from "monaco-editor";
import { AnaplanMetaData, AutoCompleteInfo } from "../Anaplan/AnaplanMetaData";
import { AnaplanFormulaLexer } from "../Anaplan/antlrclasses/AnaplanFormulaLexer";
import { AnaplanFormulaParser, DotQualifiedEntityContext, DotQualifiedEntityIncompleteContext, DotQualifiedEntityLeftPartContext } from "../Anaplan/antlrclasses/AnaplanFormulaParser";
import { CompletionItem } from "./CompletionItem";
import { findAncestor, tryGetChild } from "../Anaplan/AnaplanHelpers";

type TokenPosition = { index: number, context: ParseTree };

function computeTokenIndex(parseTree: ParseTree, caretLine: number, caretIndex: number): TokenPosition | undefined {
    if (parseTree instanceof TerminalNode) {
        return computeTokenIndexOfTerminalNode(parseTree, caretLine, caretIndex);
    } else {
        return computeTokenIndexOfChildNode(parseTree, caretLine, caretIndex);
    }
}

function computeTokenIndexOfTerminalNode(parseTree: TerminalNode, caretLine: number, caretIndex: number): TokenPosition | undefined {
    let start = parseTree.symbol.charPositionInLine;
    let stop = parseTree.symbol.charPositionInLine + parseTree.text.length;
    if (parseTree.symbol.line == caretLine && start <= caretIndex && stop >= caretIndex) {
        return { index: parseTree.symbol.tokenIndex, context: parseTree };
    } else {
        return undefined;
    }
}

function computeTokenIndexOfChildNode(parseTree: ParseTree, caretLine: number, caretIndex: number) {
    let bestMatch: TokenPosition | undefined = undefined;
    if (parseTree.childCount === 0) {
        return { index: -1, context: parseTree };
    }

    for (let i = 0; i < parseTree.childCount; i++) {
        let index = computeTokenIndex(parseTree.getChild(i), caretLine, caretIndex);
        if (index !== undefined) {
            if (bestMatch === undefined) {
                // We don't have a best match yet
                bestMatch = index;
            }
            if (!(index.context instanceof TerminalNode)) {
                // If the match isn't a terminal node, then use that

                if (index.index === -1) {
                    index.index = bestMatch.index;
                }

                return index;
            }
        }
    }
    return bestMatch;
}

export class FormulaCompletionItemProvider implements monaco.languages.CompletionItemProvider {
    triggerCharacters?: string[] = ['.'];
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
        // TODO: Somehow make the parser create missing rules/tokens as needed where possible (to enable things like suggestions directly after a dot qualifier)

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
            AnaplanFormulaParser.RULE_dotQualifiedEntityRightPart,
            AnaplanFormulaParser.RULE_dotQualifiedEntityRightPartEmpty,
            AnaplanFormulaParser.RULE_dotQualifiedEntityLeftPart,
            AnaplanFormulaParser.RULE_wordsEntityRule, // We don't include QuotedEntityRule here, as Words seems to cover it
            AnaplanFormulaParser.RULE_dimensionmappingselector,
        ]);

        let tokenPosition = computeTokenIndex(tree, position.lineNumber, position.column - 1)!;

        let candidates = core.collectCandidates(tokenPosition.index, tokenPosition.context instanceof ParserRuleContext ? tokenPosition.context : undefined);

        let keywords: string[] = [];
        for (let candidate of candidates.tokens) {
            keywords.push(myparser.vocabulary.getDisplayName(candidate[0]));
        }

        let entityNames: AutoCompleteInfo[] = [];
        for (let candidate of candidates.rules) {
            switch (candidate[0]) {
                case AnaplanFormulaParser.RULE_dotQualifiedEntityLeftPart: {
                    // anything that could be before a qualifying dot, i.e. modules, list names, subsets
                    for (let e of this._anaplanMetaData!.getAutoCompleteQualifiedLeftPart()) {
                        entityNames.push(e);
                    }
                    break;
                }
                case AnaplanFormulaParser.RULE_dotQualifiedEntityRightPart:
                case AnaplanFormulaParser.RULE_dotQualifiedEntityRightPartEmpty: {
                    // anything that could be after a qualifying dot, i.e. line items, list properties, subset properties etc (filtered acording to before the qualifying dot)
                    let node = findAncestor(tokenPosition.context, DotQualifiedEntityContext) ?? findAncestor(tokenPosition.context, DotQualifiedEntityIncompleteContext);
                    if (node != undefined) {
                        let leftPartText = tryGetChild(node, DotQualifiedEntityLeftPartContext)?.text;
                        if (leftPartText != undefined) {
                            for (let e of this._anaplanMetaData!.getAutoCompleteQualifiedRightPart(leftPartText)) {
                                entityNames.push(e);
                            }
                        }
                    }
                    break;
                }
                case AnaplanFormulaParser.RULE_wordsEntityRule: {
                    // Any entity that doesn't need to be qualified (e.g. line items of the current module)
                    for (let e of this._anaplanMetaData!.getAutoCompleteWords()) {
                        entityNames.push(e);
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
                    break;
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
        suggestions.push(...entityNames.map(s => {
            let result = new CompletionItem(s.label, s.kind, s.text, range);
            result.commitCharacters = s.autoInsertChars;
            return result;
        }));

        return {
            suggestions: suggestions
        };
    }

}

