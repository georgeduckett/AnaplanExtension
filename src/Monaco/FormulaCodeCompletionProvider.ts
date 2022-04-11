import { CodeCompletionCore, Symbol, SymbolTable, VariableSymbol } from "antlr4-c3";
import { CharStreams, CommonTokenStream, ConsoleErrorListener, DefaultErrorStrategy, ParserRuleContext } from "antlr4ts";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { UriComponents } from "monaco-editor";
import { AnaplanMetaData, AutoCompleteInfo, EntityMetaData } from "../Anaplan/AnaplanMetaData";
import { AnaplanFormulaLexer } from "../Anaplan/antlrclasses/AnaplanFormulaLexer";
import { AnaplanFormulaParser, DimensionmappingContext, DotQualifiedEntityContext, DotQualifiedEntityIncompleteContext, DotQualifiedEntityLeftPartContext, DotQualifiedEntityRightPartContext, DotQualifiedEntityRightPartEmptyContext, ExpressionContext, FuncParameterisedContext, FuncSquareBracketsContext } from "../Anaplan/antlrclasses/AnaplanFormulaParser";
import { CompletionItem } from "./CompletionItem";
import { findAncestor, findDescendents, tryGetChild } from "../Anaplan/AnaplanHelpers";
import { FunctionsInfo } from "../Anaplan/FunctionInfo";
import { deserialisedAggregateFunctions, deserialisedFunctions } from "../Anaplan/.generateAnaplanData/FunctionInfo";
import { DefaultCodeCompleteAggregation, Format } from "../Anaplan/Format";

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

        let entityNames: AutoCompleteInfo[] = [];

        let tokenPosition = computeTokenIndex(tree, position.lineNumber, position.column - 1)!;

        let parameterisedFuncCtx = findAncestor(tokenPosition.context, FuncParameterisedContext);

        let foundKeyword = false;

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
                                let keywords = param.format?.filter(f => f.startsWith("KEYWORD:"));

                                if (keywords != undefined && keywords.length != 0) {
                                    for (let i = 0; i < keywords.length; i++) {
                                        entityNames.push(new AutoCompleteInfo(
                                            keywords[i].substring("KEYWORD:".length),
                                            keywords[i].substring("KEYWORD:".length),
                                            monaco.languages.CompletionItemKind.Keyword,
                                            [',', ')']));
                                    }
                                    foundKeyword = true;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (!foundKeyword) {
            let candidates = core.collectCandidates(tokenPosition.index, tokenPosition.context instanceof ParserRuleContext ? tokenPosition.context : undefined);

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
                        // Try and autocomplete the whole thing. The general form is for a missing dimension is:
                        // "LOOKUP: source.target" or "SUM: target.source", where before the dot is the module matching the line item's dimension and the target is an entity type matching the other dimension
                        // for example SUM: PROP C10.P6 when the line item is P6 and the source is C10, or LOOKUP: PROP C10.P6 when the line item is C10 and the source is P6. We know which way around it is based on what mapping modules are available (C10.P6 exists, but no P6.C10)

                        // Find the dimensions we're missing, then for each one look for modules without type that are either dimensioned based on the target and have a line item of type source, or visa-versa. If just one of these is found, autocomplete that.

                        let referenceContext = findAncestor(tokenPosition.context, FuncSquareBracketsContext);
                        if (referenceContext != undefined) {
                            let entityDimensions = this._anaplanMetaData?.getEntityDimensions(referenceContext.entity());
                            let currentLineItemDimensions = this._anaplanMetaData?.getCurrentItemFullAppliesTo()!;
                            let missingDimensions = this._anaplanMetaData?.getMissingDimensions(referenceContext, undefined);

                            if (missingDimensions != undefined) {
                                let extraSelectorStrings: string[] = [];

                                for (let i = 0; i < missingDimensions.extraTargetEntityMappings.length; i++) {
                                    let possibleEntities: { entityMetaData: EntityMetaData, aggregateFunction: string }[] = [];
                                    this._anaplanMetaData?.getAllLineItems().forEach(li => {
                                        // Don't consider line items with more than one dimension unless the dimensions match the current line item
                                        if (li.lineItemInfo.fullAppliesTo.length != 1 && !li.lineItemInfo.fullAppliesTo.every(d => entityDimensions?.includes(d))) {
                                            return;
                                        }

                                        if (this._anaplanMetaData?.getSubsetNormalisedEntityId(li.lineItemInfo.format.hierarchyEntityLongId!) == this._anaplanMetaData?.getSubsetNormalisedEntityId(missingDimensions?.extraTargetEntityMappings[i]!)) {
                                            // Found a line item referring to an entity that exists in the target mapping, but not the source
                                            let entityDimensionsIntersection = entityDimensions?.filter(ed => li.lineItemInfo.fullAppliesTo.map(f => this._anaplanMetaData?.getSubsetNormalisedEntityId(f)).includes(this._anaplanMetaData?.getSubsetNormalisedEntityId(ed)!));
                                            if ((entityDimensionsIntersection?.length ?? 0) != 0) {
                                                // This line item's dimensionality overlaps with the target line item

                                                // Ideally we would take the aggregation method from the aggregation of the current line item, but that data is not available, so we just have defaults depending on the line item format's data type
                                                possibleEntities.push({ entityMetaData: li, aggregateFunction: DefaultCodeCompleteAggregation(this._anaplanMetaData!.getCurrentItem().format) });
                                            }
                                        }
                                    });

                                    // for existing possible entries, filter the existing entries with possible ones, not the other way around. This way we use an existing aggregation function
                                    this.TryAddPossibleEntry(possibleEntities, extraSelectorStrings);
                                }

                                for (let i = 0; i < missingDimensions.extraSourceEntityMappings.length; i++) {
                                    let possibleEntities: { entityMetaData: EntityMetaData, aggregateFunction: string }[] = [];
                                    this._anaplanMetaData?.getAllLineItems().forEach(li => {
                                        // Don't consider line items with more than one dimension unless the dimensions match the current line item
                                        if (li.lineItemInfo.fullAppliesTo.length != 1 && !li.lineItemInfo.fullAppliesTo.every(d => entityDimensions?.includes(d))) {
                                            return;
                                        }

                                        if (this._anaplanMetaData?.getSubsetNormalisedEntityId(li.lineItemInfo.format.hierarchyEntityLongId!) == this._anaplanMetaData?.getSubsetNormalisedEntityId(missingDimensions!.extraSourceEntityMappings[i])) {
                                            // Found a line item referring to an entity that exists in the source mapping, but not the target
                                            let currentLineItemDimensionsIntersection = currentLineItemDimensions?.filter(ed => li.lineItemInfo.fullAppliesTo.map(d => this._anaplanMetaData?.getSubsetNormalisedEntityId(d)).includes(this._anaplanMetaData?.getSubsetNormalisedEntityId(ed)!));
                                            if ((currentLineItemDimensionsIntersection?.length ?? 0) != 0) {
                                                // This line item's dimensionality overlaps with the target line item

                                                // Ideally we would take the aggregation method from the aggregation of the current line item, but that data is not available, so we just have defaults depending on the line item format's data type
                                                possibleEntities.push({ entityMetaData: li, aggregateFunction: "LOOKUP" });
                                            }
                                        }
                                    });

                                    this.TryAddPossibleEntry(possibleEntities, extraSelectorStrings);
                                }

                                if (extraSelectorStrings.length != 0) {
                                    entityNames.push(new AutoCompleteInfo(extraSelectorStrings.join(', ').replace("'", ""), extraSelectorStrings.join(', '), monaco.languages.CompletionItemKind.Function, [']'], 'Missing dimensions', new MarkdownString('```\r\n' + extraSelectorStrings.join('  \r\n') + '\r\n```'), '*' + extraSelectorStrings.join(', ')));
                                }
                            }
                        }

                        for (let e of deserialisedAggregateFunctions.keys()) {
                            entityNames.push(new AutoCompleteInfo(e, e, monaco.languages.CompletionItemKind.Function, [':'], deserialisedAggregateFunctions.get(e)!.type, new MarkdownString(deserialisedAggregateFunctions.get(e)!.description + "  \r\n[Anaplan Documentation](" + deserialisedAggregateFunctions.get(e)!.htmlPageName + ")")));
                        }
                        break;
                    }
                    case AnaplanFormulaParser.RULE_functionname: {
                        for (let e of FunctionsInfo) {
                            let functions = deserialisedFunctions.get(e[0])!;
                            for (let i = 0; i < functions.length; i++) {
                                entityNames.push(new AutoCompleteInfo(e[0], e[0], monaco.languages.CompletionItemKind.Function, ['('], functions[i].type, new MarkdownString(functions[i].description + "  \r\n[Anaplan Documentation](" + functions[i]!.htmlPageName + ")")));
                            }
                            break;
                        }
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
                result.sortText = s.sortText;
                return result;
            }));

            return {
                suggestions: suggestions
            };
        }
    }

    private TryAddPossibleEntry(possibleEntities: { entityMetaData: EntityMetaData; aggregateFunction: string; }[], extraSelectorStrings: string[]) {
        let possibleEntitiesExisting = this._anaplanMetaData!.getAggregateEntries().filter(ee => possibleEntities.filter(pe => ee.aggregateFunction.startsWith('LOOKUP') === pe.aggregateFunction.startsWith('LOOKUP') && ee.entityMetaData.qualifier === pe.entityMetaData.qualifier && ee.entityMetaData.name === pe.entityMetaData.name).length != 0);
        let possibleEntitiesPropOnly = possibleEntities.filter(pe => pe.entityMetaData.qualifier?.startsWith('PROP ') ?? false);

        // Use an existing mapping if available since that would have the correct aggregation function
        if (possibleEntitiesExisting.length === 1) {
            extraSelectorStrings.push(`${possibleEntitiesExisting[0].aggregateFunction}: ${this._anaplanMetaData?.getNameFromComponents(possibleEntitiesExisting[0].entityMetaData)}`);
        } // If not, then use the single valid one
        else if (possibleEntities.length === 1) {
            extraSelectorStrings.push(`${possibleEntities[0].aggregateFunction}: ${this._anaplanMetaData?.getNameFromComponents(possibleEntities[0].entityMetaData)}`);
        } // If not, then use a single PROP... one
        else if (possibleEntitiesPropOnly.length === 1) {
            extraSelectorStrings.push(`${possibleEntitiesPropOnly[0].aggregateFunction}: ${this._anaplanMetaData?.getNameFromComponents(possibleEntitiesPropOnly[0].entityMetaData)}`);
        }
    }
}

