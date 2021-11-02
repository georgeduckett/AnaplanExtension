import { AnaplanFormulaVisitor } from './antlrclasses/AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, AtomExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, ExpressionAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext, EntityContext } from './antlrclasses/AnaplanFormulaParser';
import { AnaplanDataTypeStrings, Format, formatFromFunctionName, getOriginalText } from './AnaplanHelpers';
import { FormulaError } from './FormulaError';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { AnaplanMetaData } from './AnaplanMetaData';

export class AnaplanFormulaTypeEvaluatorVisitor extends AbstractParseTreeVisitor<Format> implements AnaplanFormulaVisitor<Format> {
  private readonly _anaplanMetaData: AnaplanMetaData;

  public readonly formulaErrors: Array<FormulaError> = new Array<FormulaError>();

  constructor(anaplanMetaData: AnaplanMetaData) {
    super();
    this._anaplanMetaData = anaplanMetaData;
  }

  defaultResult(): Format {
    throw new Error("Shouldn't get an unknown expression type; this is a coding error");
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
    if (aggregate.dataType != nextResult.dataType) { // TODO: compare this properly
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

  visitIfExp(ctx: IfExpContext): Format {
    var thenExpressionResult = this.visit(ctx._thenExpression);
    var elseExpressionResult = this.visit(ctx._elseExpression);

    if (thenExpressionResult.dataType != elseExpressionResult.dataType) { // TODO: compare this properly
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

    if (leftResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType) {
      this.addFormulaError(ctx._left, `Expected a Number, but found ${leftResult.dataType}.`);
    }

    if (rightResult.dataType != AnaplanDataTypeStrings.NUMBER.dataType) {
      this.addFormulaError(ctx._right, `Expected a Number, but found ${rightResult.dataType}.`);
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
    let format = this.visit(ctx.NOT());
    if (format.dataType != AnaplanDataTypeStrings.BOOLEAN.dataType) {
      this.addFormulaError(ctx, `Expected a Boolean, but found ${format.dataType}.`);
    }
    return format;
  }

  visitStringliteralExp(ctx: StringliteralExpContext): Format {
    return AnaplanDataTypeStrings.TEXT;
  }

  visitAtomExp(ctx: AtomExpContext): Format {
    return this.visit(ctx.signedAtom());
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

  visitExpressionAtom(ctx: ExpressionAtomContext): Format {
    return this.visit(ctx.expression());
  }

  visitNumberAtom(ctx: NumberAtomContext): Format {
    return AnaplanDataTypeStrings.NUMBER;
  }

  visitFuncParameterised(ctx: FuncParameterisedContext): Format {
    // TODO: Somewhere check that the parameters of the function are the correct type (or not, since Anaplan does that anyway)
    let functionName = ctx.functionname().text.toUpperCase();
    switch (functionName) {
      case "CURRENTVERSION":
      case "HALFYEARVALUE":
      case "LAG":
      case "LEAD":
      case "MAX":
      case "MIN":
      case "MONTHTODATE":
      case "MONTHVALUE":
      case "NEXT":
      case "NEXTVERSION":
      case "OFFSET":
      case "PREVIOUS":
      case "PREVIOUSVERSION":
      case "QUARTERVALUE":
      case "WEEKVALUE":
      case "YEARVALUE": return this.visit(ctx.expression()[0]);
      case "FINDITEM":
      case "ITEM":
        let itemName = getOriginalText(ctx.expression()[0]);
        if (itemName === "Time") {
          return AnaplanDataTypeStrings.TIME_ENTITY;
        }
        else {
          let itemFormat = AnaplanDataTypeStrings.ENTITY;
          itemFormat.hierarchyEntityLongId = this._anaplanMetaData.getEntityIdFromName(itemName);

          return itemFormat;
        }
      case "PARENT":
        let entityId = this.visit(ctx.expression()[0]).hierarchyEntityLongId!;


        let parentEntityId = this._anaplanMetaData.getEntityParentId(entityId);

        if (parentEntityId === undefined) {
          this.addFormulaError(ctx.functionname(), `There is no parent of entity ${this._anaplanMetaData.getEntityNameFromId(entityId)}.`);
          return AnaplanDataTypeStrings.UNKNOWN;
        }

        let parentFormat = AnaplanDataTypeStrings.ENTITY;
        parentFormat.hierarchyEntityLongId = parentEntityId;

        return parentFormat;
      default:
        let format = formatFromFunctionName(functionName);

        if (format.dataType == "UNKNOWN") {
          this.addFormulaError(ctx.functionname(), `Unknown function ${functionName}.`);
        }

        return format;
    }
  }

  visitFuncSquareBrackets(ctx: FuncSquareBracketsContext): Format {
    // Check the entity and line item dimensions match, if not we'll need to check for SELECT/SUM/LOOKUP
    let { extraSourceEntityMappings, extraTargetEntityMappings } =
      this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo());

    let dimensionMappings = ctx.dimensionmapping();
    for (let i = 0; i < dimensionMappings.length; i++) {
      let dimensionMapping = dimensionMappings[i];
      let selectorType = dimensionMapping.WORD().text;
      let selector = this._anaplanMetaData.getEntityName(dimensionMapping.entity());
      let lineitem = this._anaplanMetaData.getLineItemInfoFromEntityName(selector)!;
      var lineItemEntityId = this._anaplanMetaData.getLineItemEntityId(lineitem);

      switch (selectorType.toUpperCase()) {
        case "SELECT":
          let entityName = selector.replace(new RegExp("'", 'g'), "");
          entityName = entityName.substring(0, entityName.indexOf('.'));
          extraSourceEntityMappings = extraSourceEntityMappings.filter(e => !this._anaplanMetaData.areCompatibleDimensions(e, this._anaplanMetaData.getEntityIdFromName(entityName)!));
        case "LOOKUP": // In this case the selector is a line item, so we check the type of that line item and remove the missing dimension if there is one
          extraSourceEntityMappings = extraSourceEntityMappings.filter(e => !this._anaplanMetaData.areCompatibleDimensions(e, lineItemEntityId));
          break;
        default: // If it's an aggregation we check the target entity mappings
          extraTargetEntityMappings = extraTargetEntityMappings.filter(e => !this._anaplanMetaData.areCompatibleDimensions(e, lineItemEntityId));
      }
    }

    if (extraSourceEntityMappings.length != 0 && extraTargetEntityMappings.length != 0) {
      this.addMissingDimensionsFormulaError(ctx, extraSourceEntityMappings, extraTargetEntityMappings);
    }

    return this.visit(ctx.entity());
  }

  visitDimensionmapping(ctx: DimensionmappingContext): Format {
    throw new Error("This should never get visited. This is a coding error");
  }

  visitFunctionname(ctx: FunctionnameContext): Format {
    throw new Error("This should never get visited. This is a coding error");
  }

  visitQuotedEntity(ctx: QuotedEntityContext): Format {
    // Check whether the entity is known
    if (!this._anaplanMetaData.isKnownEntity(ctx)) {
      this.addFormulaError(ctx, `Cannot find entity \'${getOriginalText(ctx)}\'`);
    }

    let missingDimensions = this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo());
    if (missingDimensions.extraSourceEntityMappings.length != 0 && missingDimensions.extraTargetEntityMappings.length != 0) {
      this.addMissingDimensionsFormulaError(ctx, missingDimensions.extraSourceEntityMappings, missingDimensions.extraTargetEntityMappings);
    }
    return this._anaplanMetaData.getEntityType(ctx);
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

    // Check whether the entity is known
    if (!this._anaplanMetaData.isKnownEntity(ctx)) {
      this.addFormulaError(ctx, `Cannot find entity \'${getOriginalText(ctx)}\'`);
    }

    if (ctx.text.match('[^A-z\s%£\?]') != null && !(ctx.text.endsWith("'") && ctx.text.startsWith("'"))) {
      this.addFormulaError(ctx, `Entities containing certain characters must be be enclosed in single quotes.`);
    }

    if (!(ctx.parent instanceof FuncSquareBracketsContext)) {
      // If the parent context has the square brackets qualifier, then we've already checked for missing dimensions
      let missingDimensions = this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo());
      if (missingDimensions.extraSourceEntityMappings.length != 0 && missingDimensions.extraTargetEntityMappings.length != 0) {
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

    if ((ctx._left.text.match('[^A-z\s%£\?]') != null && !(ctx._left.text.endsWith("'") && ctx._left.text.startsWith("'"))) ||
      (ctx._right.text.match('[^A-z\s%£\?]') != null) && !(ctx._right.text.endsWith("'") && ctx._right.text.startsWith("'"))) {
      this.addFormulaError(ctx, `Entities containing certain characters must be be enclosed in single quotes.`);
    }

    if (!(ctx.parent instanceof FuncSquareBracketsContext)) {
      // If the parent context has the square brackets qualifier, then we've already checked for missing dimensions
      let missingDimensions = this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo());
      if (missingDimensions.extraSourceEntityMappings.length != 0 && missingDimensions.extraTargetEntityMappings.length != 0) {
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
    this.formulaErrors.push(new FormulaError(
      ctx.start.line,
      ctx.stop?.line ?? ctx.start.line,
      ctx.start.charPositionInLine + 1,
      ctx.stop === undefined ? ctx.start.charPositionInLine + 1 + (ctx.start.stopIndex - ctx.start.startIndex) + 1 : ctx.stop.charPositionInLine + 1 + (ctx.stop.stopIndex - ctx.stop.startIndex) + 1,
      message,
      "2"));
  }
}