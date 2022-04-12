import { AnaplanFormulaVisitor } from './antlrclasses/AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext, EntityContext, SignedAtomContext, DotQualifiedEntityIncompleteContext } from './antlrclasses/AnaplanFormulaParser';
import { findAncestor, getOriginalText } from './AnaplanHelpers';
import { FormulaError } from './FormulaError';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { AnaplanMetaData, EntityType } from './AnaplanMetaData';
import { ErrorNode } from 'antlr4ts/tree/ErrorNode';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { FunctionsInfo } from './FunctionInfo';
import { AnaplanDataTypeStrings } from './AnaplanDataTypeStrings';
import { Format } from './Format';
import { deserialisedAggregateFunctions, deserialisedFunctions, deserialisedKeywords } from './.generateAnaplanData/FunctionInfo';

export let entitySpecialCharSelector = '[^A-z\s%#£\?]';

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
      this.addFormulaError(ctx, `Data types for each result must be the same. 'Then' is ${thenExpressionResult.dataType}, 'Else' is ${elseExpressionResult.dataType}.`);
      return AnaplanDataTypeStrings.UNKNOWN;
    }

    return this.aggregateResult(thenExpressionResult, elseExpressionResult);
  }

  visitBinaryoperationExp(ctx: BinaryoperationExpContext): Format {
    let leftResult = this.visit(ctx._left);
    let rightResult = this.visit(ctx._right);

    if (leftResult.dataType != AnaplanDataTypeStrings.BOOLEAN.dataType) {
      this.addFormulaError(ctx._left, `Expected a Boolean, but found ${leftResult.dataType}.`);
    }

    if (rightResult.dataType != AnaplanDataTypeStrings.BOOLEAN.dataType) {
      this.addFormulaError(ctx._right, `Expected a Boolean, but found ${rightResult.dataType}.`);
    }

    return AnaplanDataTypeStrings.BOOLEAN;
  }

  visitMuldivExp(ctx: MuldivExpContext): Format {
    let leftResult = this.visit(ctx._left);
    let rightResult = this.visit(ctx._right);

    if (leftResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType) {
      this.addFormulaError(ctx._left, `Expected a Number, but found ${leftResult.dataType}.`);
    }

    if (rightResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType) {
      this.addFormulaError(ctx._right, `Expected a Number, but found ${rightResult.dataType}.`);
    }
    return AnaplanDataTypeStrings.NUMBER;
  }

  visitAddsubtractExp(ctx: AddsubtractExpContext): Format {
    let leftResult = this.visit(ctx._left);
    let rightResult = this.visit(ctx._right);

    let leftIsDateType = leftResult.dataType === AnaplanDataTypeStrings.DATE.dataType || leftResult.dataType === AnaplanDataTypeStrings.TIME_ENTITY.dataType;
    let rightIsDateType = rightResult.dataType === AnaplanDataTypeStrings.DATE.dataType || rightResult.dataType === AnaplanDataTypeStrings.TIME_ENTITY.dataType;

    // Left isn't a number or a date
    if (leftResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType && !leftIsDateType) {
      this.addFormulaError(ctx._left, `Expected a Number, but found ${leftResult.dataType}.`);
    }
    // Right isn't a number or a date
    if (rightResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType && !rightIsDateType) {
      this.addFormulaError(ctx._right, `Expected a Number, but found ${rightResult.dataType}.`);
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
      this.addFormulaError(ctx._left, `Expected Text, but found ${leftResult.dataType}.`);
    }

    if (rightResult.dataType != AnaplanDataTypeStrings.TEXT.dataType) {
      this.addFormulaError(ctx._right, `Expected Text, but found ${rightResult.dataType}.`);
    }
    return AnaplanDataTypeStrings.TEXT;
  }

  visitNotExp(ctx: NotExpContext): Format {
    let format = this.visit(ctx.expression());
    if (format.dataType != AnaplanDataTypeStrings.BOOLEAN.dataType) {
      this.addFormulaError(ctx, `Expected a Boolean, but found ${format.dataType}.`);
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
        // TODO: Warn that it makes no sense to get the CODE of a non-numbered list or NAME of a numbered list
        // Check function parameters
        let actualParams = ctx.expression();
        let actualFormats = actualParams.map(param => this.visit(param)); // We still get the actual format even if we don't have one to check against as we want to get any errors in the params

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
                  this.addFormulaError(actualParams[i], `Invalid keyword for parameter in function ${functionName} for parameter ${signatureParams[i].name}. Expected (${requiredFormat.filter(s => s.startsWith("KEYWORD:")).map(s => s.substring("KEYWORD:".length))}), found (${actualParams[i].text}).`);
                }
              }
              else if (actualFormat.dataType != AnaplanDataTypeStrings.UNKNOWN.dataType &&
                requiredFormat.indexOf(actualFormat.dataType) === -1) {
                // The format of this param doesn't match one of the required formats
                this.addFormulaError(actualParams[i], `Invalid parameter type in function ${functionName} for parameter ${signatureParams[i].name}. Expected (${requiredFormat}), found (${actualFormat.dataType}).`);
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

    this.addFormulaError(ctx.functionname(), `Unknown function ${functionName}.`);
    return AnaplanDataTypeStrings.UNKNOWN;
  }

  visitFuncSquareBrackets(ctx: FuncSquareBracketsContext): Format {
    // Check the entity and line item dimensions match, if not we'll need to check for SELECT/SUM/LOOKUP
    let { extraSourceEntityMappings, extraTargetEntityMappings } =
      this._anaplanMetaData.getMissingDimensions(ctx, undefined);

    let dimensionMappings = ctx.dimensionmapping();

    let visitEntityResult = this.visit(ctx.entity());

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
            this.addFormulaError(dimensionMapping.dimensionmappingselector(), `Unknown aggregation function '${selectorType}'`);
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

    if (extraSourceEntityMappings.length != 0) { //&& extraTargetEntityMappings.length != 0) {
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
      this.addFormulaError(ctx, `Entities containing certain characters must be be enclosed in single quotes.`);
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
      this.addFormulaError(ctx, `Entities containing certain characters must be be enclosed in single quotes.`);
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

    this.addFormulaError(ctx, "Missing mappings from " + targetMissingEntityIdsString + " to " + sourceMissingEntityIdsString + ".");
  }
  //https://betterprogramming.pub/create-a-custom-web-editor-using-typescript-react-antlr-and-monaco-editor-bcfc7554e446
  addFormulaError(ctx: ParserRuleContext, message: string) {

    if (ctx instanceof ParserRuleContext) {
      this.formulaErrors.push(new FormulaError(
        ctx.start.line,
        ctx.stop?.line ?? ctx.start.line,
        ctx.start.charPositionInLine + 1,
        ctx.stop === undefined ? ctx.start.charPositionInLine + 1 + (ctx.start.stopIndex - ctx.start.startIndex) + 1 : ctx.stop.charPositionInLine + 1 + (ctx.stop.stopIndex - ctx.stop.startIndex) + 1,
        message,
        "2"));
    }
  }
}