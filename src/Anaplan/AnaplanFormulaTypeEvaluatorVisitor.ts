import { AnaplanFormulaVisitor } from './antlrclasses/AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, AtomExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, ExpressionAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext } from './antlrclasses/AnaplanFormulaParser';
import { getEntityName, AnaplanDataTypeStrings, Format, formatFromFunctionName, getOriginalText } from './AnaplanHelpers';

export class LineItemInfo {
  public readonly Name: string;
  public readonly Format: Format;
  constructor(name: string, dataType: Format) {
    this.Name = name;
    this.Format = dataType;
  }
}

export class AnaplanFormulaTypeEvaluatorVisitor extends AbstractParseTreeVisitor<Format> implements AnaplanFormulaVisitor<Format> {
  private readonly _moduleName: string;
  private readonly _lineItemInfo: Map<string, LineItemInfo>;
  private readonly _hierarchyParents: Map<number, number>;
  private readonly _hierarchyIds: Map<string, number>;

  constructor(lineItemInfo: Map<string, LineItemInfo>, hierarchyIds: Map<string, number>, hierarchyParents: Map<number, number>, moduleName: string) {
    super();
    this._moduleName = moduleName;
    this._lineItemInfo = lineItemInfo;
    this._hierarchyParents = hierarchyParents;
    this._hierarchyIds = hierarchyIds;
  }

  defaultResult(): Format {
    throw new Error("Shouldn't get an unknown expression type");
  }

  aggregateResult(aggregate: Format, nextResult: Format): Format {
    // Ensure both are the same, if they aren't produce an error
    if (aggregate.dataType != nextResult.dataType) { // TODO: compare this properly
      throw new Error(`Tried to combine different expression types, ${JSON.stringify(aggregate)} and ${JSON.stringify(nextResult)}`);
    }
    return nextResult
  }

  visitFormula(ctx: FormulaContext): Format {
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

  visitFuncSquareBrackets(ctx: FuncSquareBracketsContext): Format {
    // TODO: Check dimension mappings and how they relate to this module's dimensions and the entity's dimensions
    return this.visit(ctx.entity());
  }

  visitDimensionmapping(ctx: DimensionmappingContext): Format {
    throw new Error("This should never get visited. This is a coding error");

  }

  visitFunctionname(ctx: FunctionnameContext): Format {
    throw new Error("This should never get visited. This is a coding error");

  }

  getEntityType(ctx: QuotedEntityContext | WordsEntityContext | DotQualifiedEntityContext): Format {
    let entityName = this._moduleName + "." + getEntityName(ctx);
    if (!this._lineItemInfo.has(entityName)) {
      throw new Error("Found unrecognised entity: " + entityName);

    } else {
      return this._lineItemInfo.get(entityName)!.Format;
    }
  }

  visitQuotedEntity(ctx: QuotedEntityContext): Format {
    return this.getEntityType(ctx);
  }

  visitWordsEntity(ctx: WordsEntityContext): Format {
    return this.getEntityType(ctx);
  }

  visitDotQualifiedEntity(ctx: DotQualifiedEntityContext): Format {
    return this.getEntityType(ctx);
  }
}