import { CodeCompletionCore } from "antlr4-c3";
import { CharStreams, CommonTokenStream, ParserRuleContext } from "antlr4ts";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { UriComponents } from "monaco-editor";
import { AnaplanMetaData, EntityType } from "../Anaplan/AnaplanMetaData";
import { AnaplanFormulaLexer } from "../Anaplan/antlrclasses/AnaplanFormulaLexer";
import { AnaplanFormulaParser, DotQualifiedEntityContext, DotQualifiedEntityIncompleteContext, DotQualifiedEntityLeftPartContext, DotQualifiedEntityRightPartEmptyContext, ExpressionContext, FuncParameterisedContext, FuncSquareBracketsContext } from "../Anaplan/antlrclasses/AnaplanFormulaParser";
import { CompletionItem } from "./CompletionItem";
import { findAncestor, tryGetChild } from "../Anaplan/AnaplanHelpers";
import { FunctionsInfo } from "../Anaplan/FunctionInfo";
import { deserialisedAggregateFunctions, deserialisedFunctions } from "../Anaplan/.generateAnaplanData/FunctionInfo";
import { AnaplanDataTypeStrings } from "../Anaplan/AnaplanDataTypeStrings";

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
    triggerCharacters?: string[] = ['.', ':', '[', ','];
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

        let entityNames: CompletionItem[] = [];

        let tokenPosition = computeTokenIndex(tree, position.lineNumber, position.column - 1)!;

        let parameterisedFuncCtx = findAncestor(tokenPosition.context, FuncParameterisedContext);

        let foundKeyword = false;

        let targetTypes: string[] | undefined;

        if (parameterisedFuncCtx != undefined) {
            let functionName = parameterisedFuncCtx.functionname().text.toUpperCase();

            if (FunctionsInfo.has(functionName)) {
                let funcInfo = deserialisedFunctions.get(functionName);
                // We have function info for this function, so work out which parameter we're within then whether that has keywords
                let params = parameterisedFuncCtx.expression();

                let possibleParamExpression: ParseTree | undefined = tokenPosition.context;
                while (possibleParamExpression != undefined && params.indexOf(possibleParamExpression as ExpressionContext) === -1) {
                    possibleParamExpression = possibleParamExpression.parent;
                }

                if (possibleParamExpression != undefined) {
                    if (funcInfo != undefined) {
                        for (let i = 0; i < funcInfo.length; i++) {
                            let param = funcInfo[i].paramInfo[params.indexOf(possibleParamExpression as ExpressionContext)];
                            if (param != undefined) {
                                targetTypes = param.format;

                                let keywords = param.format?.filter(f => f.startsWith("KEYWORD:"));

                                if (param.format?.includes("BOOLEAN")) {
                                    keywords?.push("KEYWORD:TRUE");
                                    keywords?.push("KEYWORD:FALSE");
                                    if (keywords == undefined) {
                                        keywords = ["KEYWORD:TRUE", "KEYWORD:FALSE"];
                                    }
                                }

                                if (keywords != undefined && keywords.length != 0) {
                                    for (let i = 0; i < keywords.length; i++) {
                                        entityNames.push(new CompletionItem(
                                            keywords[i].substring("KEYWORD:".length),
                                            keywords[i].substring("KEYWORD:".length),
                                            monaco.languages.CompletionItemKind.Keyword,
                                            [',', ')']));
                                    }
                                    if (!param.format?.includes("BOOLEAN")) {
                                        // If the keywords we added are because the parameter is a boolean calculate code completion as normal, in addition to TRUE and FALSE
                                        foundKeyword = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (!foundKeyword) {
            let candidates = core.collectCandidates(tokenPosition.index, tokenPosition.context instanceof ParserRuleContext ? tokenPosition.context : undefined);
            // TODO: Don't autocomplete invalid entity types (e.g. a hierarchy when we don't expect one and anything other than a hiearchy when we do)
            for (let candidate of candidates.rules) {
                switch (candidate[0]) {
                    case AnaplanFormulaParser.RULE_dotQualifiedEntityLeftPart: {
                        // TODO: Prefer line items that match missing dimension types when after a selector (e.g. LOOKUP: ....)
                        // anything that could be before a qualifying dot, i.e. modules, list names, subsets
                        for (let e of this._anaplanMetaData!.getAutoCompleteQualifiedLeftPart()) {
                            entityNames.push(e);
                        }
                        break;
                    }
                    case AnaplanFormulaParser.RULE_dotQualifiedEntityRightPart:
                    case AnaplanFormulaParser.RULE_dotQualifiedEntityRightPartEmpty: {
                        // anything that could be after a qualifying dot, i.e. line items, list properties, subset properties etc (filtered according to before the qualifying dot)
                        let node = findAncestor(tokenPosition.context, DotQualifiedEntityContext) ?? findAncestor(tokenPosition.context, DotQualifiedEntityIncompleteContext);
                        if (node != undefined) {
                            let leftPartText = tryGetChild(node, DotQualifiedEntityLeftPartContext)?.text;
                            if (leftPartText != undefined) {
                                // See whether this is within a dimension mapping selector, and if so prefer entities that resolve missing dimensions
                                let referenceContext = findAncestor(tokenPosition.context, FuncSquareBracketsContext);
                                let extraSelectorStrings: string[] = [];
                                if (referenceContext != undefined) {
                                    extraSelectorStrings = this._anaplanMetaData!.GetMissingDimensionsAutoCompletion(referenceContext);
                                }

                                for (let e of this._anaplanMetaData!.getAutoCompleteQualifiedRightPart(leftPartText)) {
                                    if (extraSelectorStrings.find(ess => ess.includes(`${leftPartText}.${e.insertText}`)) != undefined) {
                                        e.sortText = "*" + e.sortText;
                                    }
                                    entityNames.push(e);
                                }
                            }
                        }
                        break;
                    }
                    case AnaplanFormulaParser.RULE_wordsEntityRule: {
                        // TODO: Prefer line items that match missing dimension types when after a selector (e.g. LOOKUP: ....)
                        // Any entity that doesn't need to be qualified (e.g. line items of the current module)
                        for (let e of this._anaplanMetaData!.getAutoCompleteWords()) {
                            entityNames.push(e);
                        }
                        break;
                    }
                    case AnaplanFormulaParser.RULE_dimensionmappingselector: {
                        // Try and autocomplete the whole thing. The general form is for a missing dimension is:
                        // "LOOKUP: source.target" or "SUM: target.source", where before the dot is the module matching the line item's dimension and the target is an entity type matching the other dimension
                        // for example SUM: PROP C10.P6 when the line item is P6 and the source is C10, or LOOKUP: PROP C10.P6 when the line item is C10 and the source is P6. We know which way around it is based on what mapping modules are available (C10.P6 exists, but no P6.C10)

                        // Find the dimensions we're missing, then for each one look for modules without type that are either dimensioned based on the target and have a line item of type source, or visa-versa. If just one of these is found, autocomplete that.

                        let referenceContext = findAncestor(tokenPosition.context, FuncSquareBracketsContext);
                        if (referenceContext != undefined) {
                            let extraSelectorStrings = this._anaplanMetaData!.GetMissingDimensionsAutoCompletion(referenceContext);

                            if (extraSelectorStrings.length != 0) {
                                entityNames.push(new CompletionItem(extraSelectorStrings.join(', ').replace("'", ""), extraSelectorStrings.join(', '), monaco.languages.CompletionItemKind.Function, [']'], 'Missing dimensions', new MarkdownString('```\r\n' + extraSelectorStrings.join('  \r\n') + '\r\n```'), '**' + extraSelectorStrings.join(', '), true));
                            }
                        }

                        let deserialisedAggregateFunctionsToAdd: string[];

                        if (referenceContext != undefined) {
                            let referencedEntityFormat = this._anaplanMetaData?.getEntityType(referenceContext.entity());
                            let overwroteFunctionsToAdd = true;

                            switch (referencedEntityFormat?.dataType) {
                                // Filter this according to line item type (e.g. ANY etc if the source line item is a boolean)
                                case AnaplanDataTypeStrings.BOOLEAN.dataType: {
                                    deserialisedAggregateFunctionsToAdd = ["ALL", "ANY"]; break;
                                }
                                case AnaplanDataTypeStrings.DATE.dataType: {
                                    deserialisedAggregateFunctionsToAdd = ["MAX", "MIN"]; break;
                                }
                                case AnaplanDataTypeStrings.NUMBER.dataType: {
                                    deserialisedAggregateFunctionsToAdd = ["AVERAGE", "MAX", "MIN", "SUM"]; break;
                                }
                                case AnaplanDataTypeStrings.TEXT.dataType: {
                                    deserialisedAggregateFunctionsToAdd = ["TEXTLIST"]; break;
                                }
                                case AnaplanDataTypeStrings.TIME_ENTITY.dataType: {
                                    deserialisedAggregateFunctionsToAdd = ["MAX", "MIN"]; break;
                                }
                                default: {
                                    overwroteFunctionsToAdd = false;
                                    deserialisedAggregateFunctionsToAdd = Array.from(deserialisedAggregateFunctions.keys());
                                    break;
                                }
                            }

                            if (overwroteFunctionsToAdd) {
                                deserialisedAggregateFunctionsToAdd.push("FIRSTNONBLANK", "LASTNONBLANK", "LOOKUP", "SELECT");
                            }
                        }
                        else {
                            deserialisedAggregateFunctionsToAdd = Array.from(deserialisedAggregateFunctions.keys());
                        }

                        for (let e of deserialisedAggregateFunctionsToAdd) {
                            entityNames.push(new CompletionItem(e, e, monaco.languages.CompletionItemKind.Function, [':'], deserialisedAggregateFunctions.get(e)!.type, new MarkdownString(deserialisedAggregateFunctions.get(e)!.description + "  \r\n[Anaplan Documentation](" + deserialisedAggregateFunctions.get(e)!.htmlPageName + ")")));
                        }
                        break;
                    }
                    case AnaplanFormulaParser.RULE_functionname: {
                        for (let e of FunctionsInfo) {
                            let functions = deserialisedFunctions.get(e[0])!;
                            for (let i = 0; i < functions.length; i++) {
                                entityNames.push(new CompletionItem(e[0], e[0], monaco.languages.CompletionItemKind.Function, ['('], functions[i].type, new MarkdownString(functions[i].description + "  \r\n[Anaplan Documentation](" + functions[i]!.htmlPageName + ")")));
                            }
                        }
                        break;
                    }
                }
            }

            if (targetTypes != undefined) {
                // If the target type is an entity then sort it first
                if (targetTypes.length === 1 && targetTypes[0] === "ENTITY") {
                    for (let i = 0; i < entityNames.length; i++) {
                        if (entityNames[i].detail === EntityType[EntityType.Hierarchy]) {
                            entityNames[i].sortText = "*" + entityNames[i].sortText;
                        }
                    }
                }
            }
        }

        let range = this.getRange(model, position, tokenPosition);

        for (let i = 0; i < entityNames.length; i++) {
            entityNames[i].range = range;
        }

        return {
            suggestions: entityNames
        };
    }

    private getRange(model: monaco.editor.ITextModel, position: monaco.Position, tokenPosition: TokenPosition) {
        const word = model.getWordUntilPosition(position);

        let range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        };

        let currentContext: ParseTree | undefined = tokenPosition.context;

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
                };
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
        return range;
    }
}

