import { AnaplanFormulaVisitor } from './antlrclasses/AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, AtomExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, ExpressionAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext, EntityContext } from './antlrclasses/AnaplanFormulaParser';
import { getEntityName, AnaplanDataTypeStrings, Format, formatFromFunctionName, getOriginalText, anaplanTimeEntityBaseId } from './AnaplanHelpers';
import { join } from 'antlr4ts/misc/Utils';
import { FormulaError } from './FormulaError';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';

export class AnaplanFormulaTypeEvaluatorVisitor extends AbstractParseTreeVisitor<Format> implements AnaplanFormulaVisitor<Format> {
  private readonly _moduleName: string;
  private readonly _moduleInfo: ModuleInfo;
  private readonly _lineItemInfo: Map<string, LineItemInfo>;
  private readonly _hierarchyParents: Map<number, number>;
  private readonly _hierarchyNames: Map<number, string>;
  private readonly _hierarchyIds: Map<string, number>;
  private readonly _currentLineItem: LineItemInfo;

  public readonly formulaErrors: Array<FormulaError> = new Array<FormulaError>();

  constructor(lineItemInfo: Map<string, LineItemInfo>, hierarchyNames: Map<number, string>, hierarchyIds: Map<string, number>, hierarchyParents: Map<number, number>, moduleName: string, moduleInfo: ModuleInfo, currentLineItem: LineItemInfo) {
    super();
    this._moduleName = moduleName;
    this._lineItemInfo = lineItemInfo;
    this._hierarchyParents = hierarchyParents;
    this._hierarchyNames = hierarchyNames;
    this._hierarchyIds = hierarchyIds;
    this._moduleInfo = moduleInfo;
    this._currentLineItem = currentLineItem;
  }

  defaultResult(): Format {
    throw new Error("Shouldn't get an unknown expression type");
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
    return this.aggregateResult(this.visit(ctx._thenExpression), this.visit(ctx._elseExpression));
  }

  visitBinaryoperationExp(ctx: BinaryoperationExpContext): Format {
    return this.aggregateResult(this.visit(ctx._left), this.visit(ctx._right));
  }

  visitMuldivExp(ctx: MuldivExpContext): Format {
    return this.aggregateResult(this.visit(ctx._left), this.visit(ctx._right));
  }

  visitAddsubtractExp(ctx: AddsubtractExpContext): Format {
    return this.aggregateResult(this.visit(ctx._left), this.visit(ctx._right));
  }

  visitComparisonExp(ctx: ComparisonExpContext): Format {
    if (this.visit(ctx._left) != this.visit(ctx._right)) {
      throw new Error("Tried to compare two different types");
    }
    return AnaplanDataTypeStrings.BOOLEAN;
  }

  visitConcatenateExp(ctx: ConcatenateExpContext): Format {
    let left = this.visit(ctx._left);
    if (left.dataType != AnaplanDataTypeStrings.TEXT.dataType ||
      this.visit(ctx._right).dataType != AnaplanDataTypeStrings.TEXT.dataType) {
      throw new Error("Tried to concatenate something other than text");
    }
    return this.visit(ctx._left);
  }

  visitNotExp(ctx: NotExpContext): Format {
    let format = this.visit(ctx.NOT());
    if (format.dataType != AnaplanDataTypeStrings.BOOLEAN.dataType) {
      throw new Error("Tried to negate something other than a boolean");

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
        let itemFormat = AnaplanDataTypeStrings.ENTITY;
        itemFormat.hierarchyEntityLongId = this._hierarchyIds.get(itemName);
        return itemFormat;
      case "PARENT":
        let entityId = this.visit(ctx.expression()[0]).hierarchyEntityLongId!;


        let parentEntityId = this._hierarchyParents.get(entityId);

        if (parentEntityId === undefined) {
          // TODO: Report a proper error; the entity we want to get the parent of doesn't have a parent
          return AnaplanDataTypeStrings.UNKNOWN;
        }

        let parentFormat = AnaplanDataTypeStrings.ENTITY;
        parentFormat.hierarchyEntityLongId = parentEntityId;

        return parentFormat;
      default:
        let format = formatFromFunctionName(functionName);

        if (format.dataType == "UNKNOWN") {
          console.log('Found unknown function: ' + functionName) // TODO: Use proper error capturing here
        }

        return format;
    }
  }
  //https://betterprogramming.pub/create-a-custom-web-editor-using-typescript-react-antlr-and-monaco-editor-bcfc7554e446
  addFormulaError(ctx: ParserRuleContext, message: string) {
    this.formulaErrors.push(new FormulaError(
      ctx.start.line,
      ctx.stop?.line ?? ctx.start.line,
      ctx.start.charPositionInLine + 1,
      (ctx.stop?.charPositionInLine ?? ctx.start.charPositionInLine) + 1,
      message,
      "2"));
  }

  visitFuncSquareBrackets(ctx: FuncSquareBracketsContext): Format {
    // Check the entity and line item dimensions match, if not we'll need to check for SELECT/SUM/LOOKUP
    let missingEntityDimensions = this.getMissingDimensions(ctx);

    let dimensionMappings = ctx.dimensionmapping();
    for (let i = 0; i < dimensionMappings.length; i++) {
      let dimensionMapping = dimensionMappings[i];
      let selectorType = dimensionMapping.WORD().text;
      let selector = getEntityName(this._moduleName, dimensionMapping.entity());

      switch (selectorType.toUpperCase()) {
        case "SELECT": // TODO: Handle this (work out what entity dimension is selected and remove that from the missing list)

        case "LOOKUP": // In this case the selector is a line item, so we check the type of that line item and remove the missing dimension if there is one
        default: // It's an aggregate function, so we do the same check as above
          let lineitem = this._lineItemInfo.get(selector)!;


          missingEntityDimensions = missingEntityDimensions.filter(e => e != this.getLineItemEntityId(lineitem));
      }
    }

    if (missingEntityDimensions.length > 0) {
      this.addMissingDimensionsFormulaError(ctx, missingEntityDimensions);
    }

    return this.visit(ctx.entity());
  }

  getLineItemEntityId(lineItem: LineItemInfo): number {
    return lineItem.format.hierarchyEntityLongId ?? (anaplanTimeEntityBaseId + lineItem.format.periodType.entityIndex);
  }

  addMissingDimensionsFormulaError(ctx: EntityContext, missingEntityIds: number[]) { // TODO: Show all, not just the first one
    this.addFormulaError(ctx, "Missing dimensions: " + (this._hierarchyNames.get(missingEntityIds[0]) ?? missingEntityIds[0]));
  }

  visitDimensionmapping(ctx: DimensionmappingContext): Format {
    throw new Error("This should never get visited. This is a coding error");

  }

  visitFunctionname(ctx: FunctionnameContext): Format {
    throw new Error("This should never get visited. This is a coding error");

  }

  getEntityType(ctx: EntityContext): Format {
    let entityName = getEntityName(this._moduleName, ctx);
    if (!this._lineItemInfo.has(entityName)) {
      return AnaplanDataTypeStrings.UNKNOWN; // Unrecognised entity, so we don't know

    } else {
      return this._lineItemInfo.get(entityName)!.format;
    }
  }

  getMissingDimensions(ctx: EntityContext) {
    let entityName = getEntityName(this._moduleName, ctx);
    let entityDimensions = this._lineItemInfo.get(entityName)?.fullAppliesTo?.sort();

    if (entityDimensions === undefined) {
      return [];
    }

    let currentLineItemDimensions = this._currentLineItem.fullAppliesTo.sort();

    // Check the entity and line item dimensions match
    // TODO: Don't count ones that have a parent top level item, as Anaplan allows that
    return currentLineItemDimensions.filter(e => !entityDimensions!.includes(e));
  }

  visitQuotedEntity(ctx: QuotedEntityContext): Format {
    let missingDimensions = this.getMissingDimensions(ctx);
    if (missingDimensions.length > 0) {
      this.addMissingDimensionsFormulaError(ctx, missingDimensions);
    }
    return this.getEntityType(ctx);
  }

  visitWordsEntity(ctx: WordsEntityContext): Format {
    if (!(ctx.parent instanceof FuncSquareBracketsContext)) {
      // If the parent context has the square brackets qualifier, then we've already checked for missing dimensions
      let missingDimensions = this.getMissingDimensions(ctx);
      if (missingDimensions.length > 0) {
        alert('here');
        this.addMissingDimensionsFormulaError(ctx, missingDimensions);
      }
    }
    return this.getEntityType(ctx);
  }

  visitDotQualifiedEntity(ctx: DotQualifiedEntityContext): Format {
    if (!(ctx.parent instanceof FuncSquareBracketsContext)) {
      // If the parent context has the square brackets qualifier, then we've already checked for missing dimensions
      let missingDimensions = this.getMissingDimensions(ctx);
      if (missingDimensions.length > 0) {
        this.addMissingDimensionsFormulaError(ctx, missingDimensions);
      }
    }
    return this.getEntityType(ctx);
  }
}