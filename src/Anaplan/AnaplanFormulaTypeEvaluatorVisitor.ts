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
        itemFormat.hierarchyEntityLongId = this._anaplanMetaData.getEntityIdFromName(itemName);
        return itemFormat;
      case "PARENT":
        let entityId = this.visit(ctx.expression()[0]).hierarchyEntityLongId!;


        let parentEntityId = this._anaplanMetaData.getEntityParentId(entityId);

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
      this.addMissingDimensionsFormulaError(ctx, extraSourceEntityMappings);
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
    let missingDimensions = this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo()).extraSourceEntityMappings;
    if (missingDimensions.length > 0) {
      this.addMissingDimensionsFormulaError(ctx, missingDimensions);
    }
    return this._anaplanMetaData.getEntityType(ctx);
  }

  visitWordsEntity(ctx: WordsEntityContext): Format {
    if (!(ctx.parent instanceof FuncSquareBracketsContext)) {
      // If the parent context has the square brackets qualifier, then we've already checked for missing dimensions
      let missingDimensions = this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo()).extraSourceEntityMappings;
      if (missingDimensions.length > 0) {
        this.addMissingDimensionsFormulaError(ctx, missingDimensions);
      }
    }
    return this._anaplanMetaData.getEntityType(ctx);
  }

  visitDotQualifiedEntity(ctx: DotQualifiedEntityContext): Format {
    if (!(ctx.parent instanceof FuncSquareBracketsContext)) {
      // If the parent context has the square brackets qualifier, then we've already checked for missing dimensions
      let missingDimensions = this._anaplanMetaData.getMissingDimensions(this._anaplanMetaData.getEntityDimensions(ctx), this._anaplanMetaData.getCurrentItemFullAppliesTo()).extraSourceEntityMappings;
      if (missingDimensions.length > 0) {
        this.addMissingDimensionsFormulaError(ctx, missingDimensions);
      }
    }
    return this._anaplanMetaData.getEntityType(ctx);
  }


  addMissingDimensionsFormulaError(ctx: EntityContext, missingEntityIds: number[]) {
    this.addFormulaError(ctx, "Missing dimensions: " + (missingEntityIds.map(this._anaplanMetaData.getEntityNameFromId, this._anaplanMetaData).join(', ')));
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
}