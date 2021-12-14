import { CodeCompletionCore, Symbol, SymbolTable, VariableSymbol } from "antlr4-c3";
import { CharStreams, CommonTokenStream, DefaultErrorStrategy, ParserRuleContext } from "antlr4ts";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { UriComponents } from "monaco-editor";
import { AnaplanMetaData, AutoCompleteInfo } from "../Anaplan/AnaplanMetaData";
import { AnaplanFormulaLexer } from "../Anaplan/antlrclasses/AnaplanFormulaLexer";
import { AnaplanFormulaParser, DotQualifiedEntityContext, DotQualifiedEntityIncompleteContext, DotQualifiedEntityLeftPartContext, DotQualifiedEntityRightPartContext, DotQualifiedEntityRightPartEmptyContext } from "../Anaplan/antlrclasses/AnaplanFormulaParser";
import { CompletionItem } from "./CompletionItem";
import { findAncestor, tryGetChild } from "../Anaplan/AnaplanHelpers";
import { FunctionsInfo } from "../Anaplan/FunctionInfo";
import { deserialisedAggregateFunctions, deserialisedFunctions } from "../Anaplan/.generateAnaplanData/FunctionInfo";

type TokenPosition = { index: number, context: ParseTree };

class MarkdownString {
    readonly value: string;
    readonly isTrusted?: boolean;
    readonly supportThemeIcons?: boolean;
    uris?: { [href: string]: UriComponents; };
    constructor(value: string) {
        this.value = value;
    }
}

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
    triggerCharacters?: string[] = ['.', ':', ',', '['];
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

        let core = new CodeCompletionCore(myparser);

        core.preferredRules = new Set([
            AnaplanFormulaParser.RULE_dotQualifiedEntityRightPart,
            AnaplanFormulaParser.RULE_dotQualifiedEntityRightPartEmpty,
            AnaplanFormulaParser.RULE_dotQualifiedEntityLeftPart,
            AnaplanFormulaParser.RULE_wordsEntityRule, // We don't include QuotedEntityRule here, as Words seems to cover it
            AnaplanFormulaParser.RULE_dimensionmappingselector,
            AnaplanFormulaParser.RULE_functionname,
        ]);

        let tokenPosition = computeTokenIndex(tree, position.lineNumber, position.column - 1)!;

        let candidates = core.collectCandidates(tokenPosition.index, tokenPosition.context instanceof ParserRuleContext ? tokenPosition.context : undefined);

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
                    for (let e of deserialisedAggregateFunctions.keys()) {
                        entityNames.push(new AutoCompleteInfo(e, e, monaco.languages.CompletionItemKind.Function, [':'], deserialisedAggregateFunctions.get(e)!.type, new MarkdownString(deserialisedAggregateFunctions.get(e)!.description + "  \r\n[Anaplan Documentation](" + deserialisedAggregateFunctions.get(e)!.htmlPageName + ")")));
                    }
                    break;
                }
                case AnaplanFormulaParser.RULE_functionname: {
                    for (let e of FunctionsInfo) {
                        entityNames.push(new AutoCompleteInfo(e[0], e[0], monaco.languages.CompletionItemKind.Function, ['('], deserialisedFunctions.get(e[0])!.type, new MarkdownString(deserialisedFunctions.get(e[0])!.description + "  \r\n[Anaplan Documentation](" + deserialisedFunctions.get(e[0])!.htmlPageName + ")")));
                    }
                    break;
                }
            }
        }

        // Finally combine all found lists into one for the UI.
        // We do that in separate steps so that you can apply some ordering to each of your sub lists.
        // Then you also can order symbols groups as a whole depending their importance.
        const word = model.getWordUntilPosition(position);

        let range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        };

        let currentContext: ParseTree | undefined = tokenPosition.context

        while (currentContext != undefined && !(currentContext instanceof ParserRuleContext)) {
            currentContext = currentContext.parent;
        }

        if (currentContext instanceof DotQualifiedEntityRightPartEmptyContext) {
            // The parser treated this as incomplete, so we want everything from the prior dot
            let dotIndex = model.getValue().lastIndexOf('.', (currentContext.stop ?? currentContext.start).stopIndex);

            if (dotIndex != -1) {
                dotIndex++;
                range = {
                    startLineNumber: model.getPositionAt(dotIndex).lineNumber,
                    startColumn: model.getPositionAt(dotIndex).column,
                    endLineNumber: model.getPositionAt((currentContext.stop ?? currentContext.start).stopIndex).lineNumber,
                    endColumn: model.getPositionAt((currentContext.stop ?? currentContext.start).stopIndex).column,
                }
            }
        }
        else if (currentContext != undefined && currentContext instanceof ParserRuleContext) {
            range = {
                startLineNumber: model.getPositionAt(currentContext.start.startIndex).lineNumber,
                startColumn: model.getPositionAt(currentContext.start.startIndex).column,
                endLineNumber: model.getPositionAt((currentContext.stop ?? currentContext.start).stopIndex).lineNumber,
                endColumn: model.getPositionAt((currentContext.stop ?? currentContext.start).stopIndex).column,
            };
        }

        let suggestions: CompletionItem[] = [];
        suggestions.push(...entityNames.map(s => {
            let result = new CompletionItem(s.label, s.kind, s.text, range);
            result.commitCharacters = s.autoInsertChars;
            result.detail = s.detail;
            result.documentation = s.documentation;
            result.filterText = s.text;
            return result;
        }));

        return {
            suggestions: suggestions
        };
    }

}

