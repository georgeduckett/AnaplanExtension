import { AnaplanFormulaVisitor } from './antlrclasses/AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext, EntityContext, SignedAtomContext, DotQualifiedEntityIncompleteContext, AtomExpContext } from './antlrclasses/AnaplanFormulaParser';
import { AddFormatConversionQuickFixes, AddTextSurroundQuickFix, findAncestor, getOriginalText, getRangeFromContext } from './AnaplanHelpers';
import { FormulaError } from './FormulaError';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { AnaplanMetaData, EntityType } from './AnaplanMetaData';
import { ErrorNode } from 'antlr4ts/tree/ErrorNode';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { FunctionsInfo } from './FunctionInfo';
import { AnaplanDataTypeStrings } from './AnaplanDataTypeStrings';
import { Format } from './Format';
import { deserialisedAggregateFunctions, deserialisedFunctions, deserialisedKeywords } from './.generateAnaplanData/FunctionInfo';
import { FormulaQuickFixesCodeActionProvider } from '../Monaco/FormulaQuickFixesCodeActionProvider';
import { levenshteinDistance } from './LevenshteinDistance';

export let entitySpecialCharSelector = '[^A-z\\s%#£$\\?_]';

export class AnaplanFormulaTypeEvaluatorVisitor extends AbstractParseTreeVisitor<Format> implements AnaplanFormulaVisitor<Format> {
  public readonly _anaplanMetaData: AnaplanMetaData;

  public readonly formulaErrors: Array<FormulaError> = new Array<FormulaError>();

  constructor(anaplanMetaData: AnaplanMetaData) {
    super();
    this._anaplanMetaData = anaplanMetaData;
  }


  defaultResult(): Format {
    return AnaplanDataTypeStrings.UNKNOWN;
  }

  aggregateResult(aggregate: Format, nextResult: Format): Format {
    // If one is unknown then use the other one
    if (aggregate.dataType === AnaplanDataTypeStrings.UNKNOWN.dataType) {
      return nextResult;
    }
    else if (nextResult.dataType === AnaplanDataTypeStrings.UNKNOWN.dataType) {
      return aggregate;
    }
    // Ensure both are the same, if they aren't produce an error
    if (aggregate.dataType != nextResult.dataType) {
      throw new Error(`Tried to combine different expression types, ${JSON.stringify(aggregate)} and ${JSON.stringify(nextResult)}`);
    }
    return nextResult
  }

  visitFormula(ctx: FormulaContext): Format {
    this.formulaErrors.length = 0;
    return this.visit(ctx.expression());
    // TODO: Check the type of entity we're referring to is the correct one (i.e. not a hierarchy when we're not expecting one and vice versa)
  }

  visitParenthesisExp(ctx: ParenthesisExpContext): Format {
    return this.visit(ctx.expression());
  }

  visit(tree: ParseTree): Format {
    if (tree != undefined) {
      return tree.accept(this);
    }
    return this.defaultResult();
  }

  visitIfExp(ctx: IfExpContext): Format {
    var thenExpressionResult = this.visit(ctx._thenExpression);
    var elseExpressionResult = this.visit(ctx._elseExpression);

    if (thenExpressionResult.dataType != elseExpressionResult.dataType) {
      let err = this.addFormulaError(ctx, `Data types for each result must be the same. 'Then' is ${thenExpressionResult.dataType}, 'Else' is ${elseExpressionResult.dataType}.`);
      AddFormatConversionQuickFixes(this._anaplanMetaData, thenExpressionResult, elseExpressionResult, err, ctx._elseExpression, "Change the 'ELSE'; ");
      AddFormatConversionQuickFixes(this._anaplanMetaData, elseExpressionResult, thenExpressionResult, err, ctx._thenExpression, "Change the 'THEN'; ");
      return AnaplanDataTypeStrings.UNKNOWN;
    }

    return this.aggregateResult(thenExpressionResult, elseExpressionResult);
  }

  visitBinaryoperationExp(ctx: BinaryoperationExpContext): Format {
    let leftResult = this.visit(ctx._left);
    let rightResult = this.visit(ctx._right);

    if (leftResult.dataType != AnaplanDataTypeStrings.BOOLEAN.dataType) {
      let err = this.addFormulaError(ctx._left, `Expected a Boolean, but found ${leftResult.dataType}.`);
      AddFormatConversionQuickFixes(this._anaplanMetaData, AnaplanDataTypeStrings.BOOLEAN, leftResult, err);
    }

    if (rightResult.dataType != AnaplanDataTypeStrings.BOOLEAN.dataType) {
      let err = this.addFormulaError(ctx._right, `Expected a Boolean, but found ${rightResult.dataType}.`);
      AddFormatConversionQuickFixes(this._anaplanMetaData, AnaplanDataTypeStrings.BOOLEAN, rightResult, err);
    }

    return AnaplanDataTypeStrings.BOOLEAN;
  }

  visitMuldivExp(ctx: MuldivExpContext): Format {
    let leftResult = this.visit(ctx._left);
    let rightResult = this.visit(ctx._right);

    if (leftResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType) {
      let err = this.addFormulaError(ctx._left, `Expected a Number, but found ${leftResult.dataType}.`);
      AddFormatConversionQuickFixes(this._anaplanMetaData, AnaplanDataTypeStrings.NUMBER, leftResult, err);
    }

    if (rightResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType) {
      let err = this.addFormulaError(ctx._right, `Expected a Number, but found ${rightResult.dataType}.`);
      AddFormatConversionQuickFixes(this._anaplanMetaData, AnaplanDataTypeStrings.NUMBER, rightResult, err);
    }
    return AnaplanDataTypeStrings.NUMBER;
  }

  visitAddsubtractExp(ctx: AddsubtractExpContext): Format {
    let leftResult = this.visit(ctx._left);
    let rightResult = this.visit(ctx._right);

    let leftIsDateType = leftResult.dataType === AnaplanDataTypeStrings.DATE.dataType || leftResult.dataType === AnaplanDataTypeStrings.TIME_ENTITY.dataType;
    let rightIsDateType = rightResult.dataType === AnaplanDataTypeStrings.DATE.dataType || rightResult.dataType === AnaplanDataTypeStrings.TIME_ENTITY.dataType;

    // Special case both left and right being strings. Suggest a fix of using concatenation
    if (leftResult.dataType === AnaplanDataTypeStrings.TEXT.dataType &&
      rightResult.dataType === AnaplanDataTypeStrings.TEXT.dataType &&
      ctx._op.text === '+') {
      let err = this.addFormulaError(ctx, `Cannot use '+' to concatenate text, use '&' instead.`);
      let range = getRangeFromContext(ctx._op)!;
      FormulaQuickFixesCodeActionProvider.setMarkerQuickFix(err,
        [{
          title: `Use an ampersand to concatenate the text`,
          diagnostics: [],
          kind: "quickfix",
          edit: {
            edits: [
              {
                resource: {} as any,
                edit: {
                  range: {
                    startLineNumber: range.startLineNumber,
                    startColumn: range.startColumn,
                    endLineNumber: range.endLineNumber,
                    endColumn: range.endColumn
                  },
                  text: '&'
                }
              }
            ]
          },
          isPreferred: true,
        }]);
    }
    else {
      // Left isn't a number or a date
      if (leftResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType && !leftIsDateType) {
        let err = this.addFormulaError(ctx._left, `Expected a Number, but found ${leftResult.dataType}.`);
        AddFormatConversionQuickFixes(this._anaplanMetaData, AnaplanDataTypeStrings.NUMBER, leftResult, err);
      }
      // Right isn't a number or a date
      if (rightResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType && !rightIsDateType) {
        let err = this.addFormulaError(ctx._right, `Expected a Number, but found ${rightResult.dataType}.`);
        AddFormatConversionQuickFixes(this._anaplanMetaData, AnaplanDataTypeStrings.NUMBER, rightResult, err);
      }
    }

    // If the left is a date and not the right, then use the left result
    if (leftIsDateType && !rightIsDateType) {
      return leftResult;
    }
    // If the right is a date and not the left, then use the right result
    if (rightIsDateType && leftIsDateType) {
      return rightResult;
    }

    return AnaplanDataTypeStrings.NUMBER;
  }

  visitComparisonExp(ctx: ComparisonExpContext): Format {
    let leftResult = this.visit(ctx._left);
    let rightResult = this.visit(ctx._right);

    if (leftResult.dataType != rightResult.dataType) {
      this.addFormulaError(ctx, `Data types for the comparison must be the same. Found ${leftResult.dataType} on the left and ${rightResult.dataType} on the right.`);
    }
    return AnaplanDataTypeStrings.BOOLEAN;
  }

  visitConcatenateExp(ctx: ConcatenateExpContext): Format {
    let leftResult = this.visit(ctx._left);
    let rightResult = this.visit(ctx._right);

    if (leftResult.dataType != AnaplanDataTypeStrings.TEXT.dataType) {
      let err = this.addFormulaError(ctx._left, `Expected Text, but found ${leftResult.dataType}.`);
      AddFormatConversionQuickFixes(this._anaplanMetaData, AnaplanDataTypeStrings.TEXT, leftResult, err);
    }

    if (rightResult.dataType != AnaplanDataTypeStrings.TEXT.dataType) {
      let err = this.addFormulaError(ctx._right, `Expected Text, but found ${rightResult.dataType}.`);
      AddFormatConversionQuickFixes(this._anaplanMetaData, AnaplanDataTypeStrings.TEXT, rightResult, err);
    }
    return AnaplanDataTypeStrings.TEXT;
  }

  visitNotExp(ctx: NotExpContext): Format {
    let format = this.visit(ctx.expression());
    if (format.dataType != AnaplanDataTypeStrings.BOOLEAN.dataType) {
      let err = this.addFormulaError(ctx, `Expected a Boolean, but found ${format.dataType}.`);
      AddFormatConversionQuickFixes(this._anaplanMetaData, AnaplanDataTypeStrings.BOOLEAN, format, err);
    }
    return format;
  }

  visitStringliteralExp(ctx: StringliteralExpContext): Format {
    return AnaplanDataTypeStrings.TEXT;
  }

  visitErrorNode(ctx: ErrorNode): Format {
    return AnaplanDataTypeStrings.UNKNOWN;
  }

  visitPlusSignedAtom(ctx: PlusSignedAtomContext): Format {
    return this.visit(ctx.signedAtom());
  }

  visitMinusSignedAtom(ctx: MinusSignedAtomContext): Format {
    return this.visit(ctx.signedAtom());
  }
  visitFuncAtom(ctx: FuncAtomContext): Format {
    return this.visit(ctx.func_());
  }

  visitAtomAtom(ctx: AtomAtomContext): Format {
    return this.visit(ctx.atom());
  }

  visitEntityAtom(ctx: EntityAtomContext): Format {
    return this.visit(ctx.entity());
  }

  visitNumberAtom(ctx: NumberAtomContext): Format {
    return AnaplanDataTypeStrings.NUMBER;
  }

  visitFuncParameterised(ctx: FuncParameterisedContext): Format {
    let functionName = ctx.functionname().text.toUpperCase();

    if (FunctionsInfo.has(functionName)) {
      let funcInfo = deserialisedFunctions.get(functionName);
      if (funcInfo != undefined) {
        // Check function parameters
        let actualParams = ctx.expression();
        let actualFormats = actualParams.map(param => this.visit(param)); // We still get the actual format even if we don't have one to check against as we want to get any errors in the params

        // Warn that it is unlikely they want to get the NAME of a numbered list
        if (functionName === 'NAME' && actualFormats.length === 1 && actualFormats[0].dataType === AnaplanDataTypeStrings.ENTITY(undefined).dataType) {
          if (actualFormats[0].isNumberedList) {
            let err = this.addFormulaError(ctx, `The NAME of a numbered list item is just the number, did you mean to get the CODE or a DisplayName property instead?`, 4); // 4 = warning
            FormulaQuickFixesCodeActionProvider.setMarkerQuickFix(err,
              [{
                title: 'Change to CODE',
                diagnostics: [],
                kind: "quickfix",
                edit: {
                  edits: [
                    {
                      resource: {} as any,
                      edit: {
                        range: getRangeFromContext(ctx.functionname())!,
                        text: 'CODE'
                      }
                    },
                  ]
                },
                isPreferred: false,
              }]);
            // Suggest an alternate quickfix to get the displayname of the numbered list if there is a displayname property and the code is of the form NAME(ITEM(NumberedList))
            if (actualParams[0] instanceof AtomExpContext) {
              if (actualParams[0].signedAtom() instanceof FuncAtomContext) {
                if ((actualParams[0].signedAtom() as FuncAtomContext).func_() instanceof FuncParameterisedContext) {
                  let innerFunc = (actualParams[0].signedAtom() as FuncAtomContext).func_() as FuncParameterisedContext;
                  if (innerFunc.functionname().text === 'ITEM' && innerFunc.expression().length === 1) {
                    let innerExpression = innerFunc.expression()[0]
                    let itemInfo = this._anaplanMetaData.getItemInfoFromEntityContext(innerExpression);
                    if (itemInfo?.entityType === 1) {
                      // We are referring to a hierarchy within the inner ITEM function
                      // We need to determine whether this hierarchy has a displayname property
                      if (itemInfo.hierarchyInfo != undefined) {
                        if (itemInfo.hierarchyInfo.displayNamePropertyEntityIndex != -1) {
                          let propertyName = itemInfo.hierarchyInfo.propertiesLabelPage.labels[itemInfo.hierarchyInfo.displayNamePropertyEntityIndex - 1];
                          FormulaQuickFixesCodeActionProvider.setMarkerQuickFix(err,
                            [{
                              title: `Change to use ${itemInfo.name}.${propertyName}`,
                              diagnostics: [],
                              kind: "quickfix",
                              edit: {
                                edits: [
                                  {
                                    resource: {} as any,
                                    edit: {
                                      range: getRangeFromContext(ctx)!,
                                      text: `${this._anaplanMetaData.quoteIfNeeded(itemInfo.name)}.${this._anaplanMetaData.quoteIfNeeded(propertyName)}`
                                    }
                                  },
                                ]
                              },
                              isPreferred: true,
                            }]);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        for (let funcIndex = 0; funcIndex < funcInfo?.length; funcIndex++) {
          let signatureParams = funcInfo[funcIndex]?.paramInfo ?? [];
          for (let i = 0; i < actualParams.length; i++) {
            if (signatureParams.length <= i) {
              break;
            }

            let requiredFormat = signatureParams[i].format;
            let actualFormat = actualFormats[i];
            if (requiredFormat != undefined) {
              if (actualFormat.dataType === AnaplanDataTypeStrings.KEYWORD.dataType) {
                if (!requiredFormat.some(s => s === "KEYWORD:" + actualParams[i].text.toUpperCase())) {
                  // It's a keyword but the text of this param doesn't match an allowed keyword for this function
                  this.addFormulaError(actualParams[i], `Invalid keyword for parameter in function ${functionName} for parameter ${signatureParams[i].name}.Expected(${requiredFormat.filter(s => s.startsWith("KEYWORD:")).map(s => s.substring("KEYWORD:".length))}), found(${actualParams[i].text}).`);
                }
              }
              else if (actualFormat.dataType != AnaplanDataTypeStrings.UNKNOWN.dataType &&
                requiredFormat.indexOf(actualFormat.dataType) === -1) {
                // The format of this param doesn't match one of the required formats
                let err = this.addFormulaError(actualParams[i], `Invalid parameter type in function ${functionName} for parameter ${signatureParams[i].name}.Expected(${requiredFormat}), found(${actualFormat.dataType}).`);
                requiredFormat.forEach(f => AddFormatConversionQuickFixes(this._anaplanMetaData, f, actualFormat, err));
              }
            }
          }
        }
      }

      let func = FunctionsInfo.get(functionName)?.returnType;
      if (func instanceof Format) {
        return func;
      }
      else if (func instanceof Function) {
        return func(this, ctx);
      }
    }

    let err = this.addFormulaError(ctx.functionname(), `Unknown function ${functionName}.`);
    // find any close function names and suggest the closest ones that start with the same letter
    let closeFunctionNames = Array.from(FunctionsInfo.keys()).filter(f => f[0] === functionName[0] && levenshteinDistance(f, functionName) <= (functionName.length >>> 1));
    if (closeFunctionNames.length > 0) {

      FormulaQuickFixesCodeActionProvider.setMarkerQuickFix(err!, closeFunctionNames.flatMap(f => [{
        title: `Change to ${f} `,
        diagnostics: [],
        kind: "quickfix",
        edit: {
          edits: [
            {
              resource: {} as any,
              edit: {
                range: err,
                text: f
              }
            }
          ]
        },
        isPreferred: false,
      }]));
    }

    return AnaplanDataTypeStrings.UNKNOWN;
  }

  visitFuncSquareBrackets(ctx: FuncSquareBracketsContext): Format {
    // Check the entity and line item dimensions match, if not we'll need to check for SELECT/SUM/LOOKUP
    let { extraSourceEntityMappings, extraTargetEntityMappings } =
      this._anaplanMetaData.getMissingDimensions(ctx, undefined);

    let dimensionMappings = ctx.dimensionmapping();

    let visitEntityResult = this.visit(ctx.entity());
    let foundUnknownAggregation = false;

    for (let i = 0; i < dimensionMappings.length; i++) {
      let dimensionMapping = dimensionMappings[i];

      this.visit(dimensionMapping);

      let selectorType = dimensionMapping.dimensionmappingselector().text;
      let entity = dimensionMapping.entity();

      if (entity instanceof DotQualifiedEntityIncompleteContext) {
        continue;
      }

      let selector = this._anaplanMetaData.getEntityName(entity);
      let lineitem = this._anaplanMetaData.getItemInfoFromEntityName(selector)!;


      if (lineitem === undefined) {
        continue;
      }

      switch (selectorType.toUpperCase()) {
        default: // If it's an aggregation we check the target entity mappings
          if (!deserialisedAggregateFunctions.has(selectorType.toUpperCase())) {
            foundUnknownAggregation = true;
            let err = this.addFormulaError(dimensionMapping.dimensionmappingselector(), `Unknown aggregation function '${selectorType}'`);
            // Suggest similarly spelt aggregation functions
            let closeFunctionNames = Array.from(deserialisedAggregateFunctions.keys()).filter(f => f[0] === selectorType[0] && levenshteinDistance(f, selectorType) <= (selectorType.length >>> 1));
            if (closeFunctionNames.length > 0) {
              FormulaQuickFixesCodeActionProvider.setMarkerQuickFix(err!, closeFunctionNames.flatMap(f => [{
                title: `Change to ${f} `,
                diagnostics: [],
                kind: "quickfix",
                edit: {
                  edits: [
                    {
                      resource: {} as any,
                      edit: {
                        range: err,
                        text: f
                      }
                    }
                  ]
                },
                isPreferred: false,
              }]));
            }
          }

          if (["ANY", "ALL"].includes(selectorType.toUpperCase()) && visitEntityResult.dataType != AnaplanDataTypeStrings.BOOLEAN.dataType) {
            this.addFormulaError(dimensionMapping.dimensionmappingselector(), `'${selectorType}' must be used with a BOOLEAN entity`);
          }
          if (["MIN", "MAX", "SUM", "AVERAGE"].includes(selectorType.toUpperCase()) && visitEntityResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType) {
            this.addFormulaError(dimensionMapping.dimensionmappingselector(), `'${selectorType}' must be used with a NUMBER entity`);
          }
          if (["TEXTLIST"].includes(selectorType.toUpperCase()) && visitEntityResult.dataType != AnaplanDataTypeStrings.TEXT.dataType) {
            this.addFormulaError(dimensionMapping.dimensionmappingselector(), `'${selectorType}' must be used with a TEXT entity`);
          }
      }
    }

    if (!foundUnknownAggregation && extraSourceEntityMappings.length != 0) { //&& extraTargetEntityMappings.length != 0) {
      this.addMissingDimensionsFormulaError(ctx, extraSourceEntityMappings, extraTargetEntityMappings);
    }

    return visitEntityResult;
  }

  visitDimensionmapping(ctx: DimensionmappingContext): Format {
    return this.visit(ctx.entity());
  }

  visitFunctionname(ctx: FunctionnameContext): Format {
    throw new Error("This should never get visited. This is a coding error");
  }

  visitQuotedEntity(ctx: QuotedEntityContext): Format {
    // Check whether the entity is known
    if (!this._anaplanMetaData.isKnownEntity(ctx)) {
      if (ctx.parent?.parent?.parent?.parent instanceof FuncParameterisedContext) {
        this.addFormulaError(ctx, `Unrecognised entity or keyword \'${getOriginalText(ctx)}\'`);
      }
      else {
        this.addFormulaError(ctx, `Cannot find entity \'${getOriginalText(ctx)}\'`);
      }
    }

    if (!(ctx.parent instanceof FuncSquareBracketsContext || ctx.parent instanceof DimensionmappingContext) &&
      !(ctx.parent instanceof FuncParameterisedContext && ctx.parent.functionname().text === "YEARVALUE")) {
      // If the parent context has the square brackets qualifier, then we've already checked for missing dimensions
      // Also, if we're in a YEARVALUE function we assume it's ok since we can't SELECT a top level item within this function
      let missingDimensions = this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo());
      if (missingDimensions.extraSourceEntityMappings.length != 0) {// && missingDimensions.extraTargetEntityMappings.length != 0) {
        this.addMissingDimensionsFormulaError(ctx, missingDimensions.extraSourceEntityMappings, missingDimensions.extraTargetEntityMappings);
      }
    }

    return this._anaplanMetaData.getEntityType(ctx);
  }

  visitDotQualifiedEntityIncomplete(ctx: DotQualifiedEntityIncompleteContext): Format {

    this.addFormulaError(ctx, `You must complete this dot-qualified entity`);
    return AnaplanDataTypeStrings.UNKNOWN;
  }

  visitWordsEntity(ctx: WordsEntityContext): Format {
    if (getOriginalText(ctx).toUpperCase() === "TRUE" ||
      getOriginalText(ctx).toUpperCase() === "FALSE") {
      return AnaplanDataTypeStrings.BOOLEAN;
    }
    if (getOriginalText(ctx).toUpperCase() === "BLANK" ||
      getOriginalText(ctx).toUpperCase() === "BLANK") {
      return this._anaplanMetaData.getCurrentItem().format;
    }

    if (deserialisedKeywords.some(k => k === getOriginalText(ctx).toUpperCase()) &&
      ctx.parent?.parent?.parent?.parent instanceof FuncParameterisedContext) {
      return AnaplanDataTypeStrings.KEYWORD; // Keywords are only valid as a function parameter
    }

    // Check whether the entity is known
    if (!this._anaplanMetaData.isKnownEntity(ctx)) {
      // If we're in the context where we need a keyword complain about that instead.
      if (ctx.parent?.parent?.parent?.parent instanceof FuncParameterisedContext) {
        this.addFormulaError(ctx, `Unrecognised keyword or entity \'${getOriginalText(ctx)}\'`);
      }
      else {
        this.addFormulaError(ctx, `Cannot find entity \'${getOriginalText(ctx)}\'`);
      }
    }

    if (ctx.text.match(entitySpecialCharSelector) != null && !(ctx.text.endsWith("'") && ctx.text.startsWith("'"))) {
      let err = this.addFormulaError(ctx, `Entities containing certain characters must be be enclosed in single quotes.`);
      AddTextSurroundQuickFix(this._anaplanMetaData, "'", "'", err, ctx, "Add single quotes", true);
    }

    if (!(ctx.parent instanceof FuncSquareBracketsContext || ctx.parent instanceof DimensionmappingContext) &&
      !(ctx.parent instanceof FuncParameterisedContext && ["YEARVALUE", "FINDITEM"].includes(ctx.parent.functionname().text)) &&
      (this._anaplanMetaData.getItemInfoFromEntityName(this._anaplanMetaData.getEntityName(ctx))?.entityType != EntityType.Hierarchy)) {
      // If the parent context has the square brackets qualifier, then we've already checked for missing dimensions
      // Also, if we're in a YEARVALUE function we assume it's ok since we can't SELECT a top level item within this function
      // If we're in FINDITEM then that's ok
      // If we're a hierarchy list item that's ok too

      let missingDimensions = this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo());
      if (missingDimensions.extraSourceEntityMappings.length != 0) {// && missingDimensions.extraTargetEntityMappings.length != 0) {
        this.addMissingDimensionsFormulaError(ctx, missingDimensions.extraSourceEntityMappings, missingDimensions.extraTargetEntityMappings);
      }
    }
    return this._anaplanMetaData.getEntityType(ctx);
  }

  visitDotQualifiedEntity(ctx: DotQualifiedEntityContext): Format {
    // Check whether the entity is known
    if (!this._anaplanMetaData.isKnownEntity(ctx)) {
      this.addFormulaError(ctx, `Cannot find entity \'${getOriginalText(ctx)}\'`);
    }

    if ((ctx._left.text.match(entitySpecialCharSelector) != null && !(ctx._left.text.endsWith("'") && ctx._left.text.startsWith("'"))) ||
      (ctx._right.text.match(entitySpecialCharSelector) != null) && !(ctx._right.text.endsWith("'") && ctx._right.text.startsWith("'"))) {
      let err = this.addFormulaError(ctx, `Entities containing certain characters must be be enclosed in single quotes.`);
      // Add quick fix to surround with single quotes as appropriate
      let edits = [];

      if (ctx._left.text.match(entitySpecialCharSelector) != null && !(ctx._left.text.endsWith("'") && ctx._left.text.startsWith("'"))) {
        let targetRange = getRangeFromContext(ctx._left)!;

        edits.push({
          resource: {} as any,
          edit: {
            range: {
              startLineNumber: targetRange.startLineNumber,
              startColumn: targetRange.startColumn,
              endLineNumber: targetRange.startLineNumber,
              endColumn: targetRange.startColumn
            },
            text: "'"
          }
        });
        edits.push({
          resource: {} as any,
          edit: {
            range: {
              startLineNumber: targetRange.endLineNumber,
              startColumn: targetRange.endColumn,
              endLineNumber: targetRange.endLineNumber,
              endColumn: targetRange.endColumn
            },
            text: "'"
          }
        });
      }
      if (ctx._right.text.match(entitySpecialCharSelector) != null && !(ctx._right.text.endsWith("'") && ctx._right.text.startsWith("'"))) {
        let targetRange = getRangeFromContext(ctx._right)!;

        edits.push({
          resource: {} as any,
          edit: {
            range: {
              startLineNumber: targetRange.startLineNumber,
              startColumn: targetRange.startColumn,
              endLineNumber: targetRange.startLineNumber,
              endColumn: targetRange.startColumn
            },
            text: "'"
          }
        });
        edits.push({
          resource: {} as any,
          edit: {
            range: {
              startLineNumber: targetRange.endLineNumber,
              startColumn: targetRange.endColumn,
              endLineNumber: targetRange.endLineNumber,
              endColumn: targetRange.endColumn
            },
            text: "'"
          }
        });
      }

      FormulaQuickFixesCodeActionProvider.setMarkerQuickFix(err!,
        [{
          title: 'Add surrounding single quotes',
          diagnostics: [],
          kind: "quickfix",
          edit: {
            edits: edits
          },
          isPreferred: true,
        }]);
    }

    if (!(ctx.parent instanceof FuncSquareBracketsContext || ctx.parent instanceof DimensionmappingContext) &&
      !(findAncestor(ctx, FuncParameterisedContext)?.functionname()?.text === "YEARVALUE")) {
      // If the parent context has the square brackets qualifier, then we've already checked for missing dimensions
      // Also, if we're in a YEARVALUE function we assume it's ok since we can't SELECT a top level item within this function
      let missingDimensions = this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo());

      if (missingDimensions.extraSourceEntityMappings.length != 0) {// && missingDimensions.extraTargetEntityMappings.length != 0) {
        this.addMissingDimensionsFormulaError(ctx, missingDimensions.extraSourceEntityMappings, missingDimensions.extraTargetEntityMappings);
      }
    }
    return this._anaplanMetaData.getEntityType(ctx);
  }


  addMissingDimensionsFormulaError(ctx: EntityContext, sourceMissingEntityIds: number[], targetMissingEntityIds: number[]) {
    let sourceMissingEntityIdsString = (sourceMissingEntityIds.map(this._anaplanMetaData.getEntityNameFromId, this._anaplanMetaData).join(', '));
    let targetMissingEntityIdsString = (targetMissingEntityIds.map(this._anaplanMetaData.getEntityNameFromId, this._anaplanMetaData).join(', '));

    if (sourceMissingEntityIdsString === "") {
      sourceMissingEntityIdsString = "<None>";
    }
    if (targetMissingEntityIdsString === "") {
      targetMissingEntityIdsString = "<None>";
    }

    let err = this.addFormulaError(ctx, "Missing mappings from " + targetMissingEntityIdsString + " to " + sourceMissingEntityIdsString + ".");
    if (err != undefined) {
      // Add in quick fix to add missing mappings
      let missingDimenisonsAutoCompleteStrings = this._anaplanMetaData.GetMissingDimensionsAutoCompletion(ctx);

      if (missingDimenisonsAutoCompleteStrings.length != 0) {
        let rangeStart = err.endColumn;
        let startText = '[';
        if (ctx.text.endsWith(']')) {
          // Replace any existing square brackets
          rangeStart -= 1;
          startText = ', ';
        }
        FormulaQuickFixesCodeActionProvider.setMarkerQuickFix(err,
          [{
            title: `Add in the missing mappings`,
            diagnostics: [],
            kind: "quickfix",
            edit: {
              edits: [
                {
                  resource: {} as any,
                  edit: {
                    range: {
                      startLineNumber: err.endLineNumber,
                      startColumn: rangeStart,
                      endLineNumber: err.endLineNumber,
                      endColumn: err.endColumn
                    },
                    text: startText + missingDimenisonsAutoCompleteStrings.join(", ") + "]"
                  }
                }
              ]
            },
            isPreferred: true,
          }]);
      }
    }
  }
  addFormulaError(ctx: ParserRuleContext, message: string, severity: number = 8): FormulaError {
    let error;
    let range = getRangeFromContext(ctx)!;
    error = new FormulaError(
      range.startLineNumber,
      range.endLineNumber,
      range.startColumn,
      range.endColumn,
      message,
      severity)
    this.formulaErrors.push(error);
    return error;
  }
}