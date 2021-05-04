import { AnaplanFormulaVisitor } from './antlrclasses/AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, AtomExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, ExpressionAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext } from './antlrclasses/AnaplanFormulaParser';
import { getEntityName, AnaplanDataTypeStrings, Format } from './AnaplanHelpers';

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

  constructor(lineItemInfo: Map<string, LineItemInfo>, hierarchyParents: Map<number, number>, moduleName: string) {
    super();
    this._moduleName = moduleName;
    this._lineItemInfo = lineItemInfo;
    this._hierarchyParents = hierarchyParents;
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
    return new Format(AnaplanDataTypeStrings.BOOLEAN);
  }

  visitConcatenateExp(ctx: ConcatenateExpContext): Format {
    let left = this.visit(ctx._left);
    if (left.dataType != AnaplanDataTypeStrings.TEXT ||
      this.visit(ctx._right).dataType != AnaplanDataTypeStrings.TEXT) {
      throw new Error("Tried to concatenate something other than text");
    }
    return this.visit(ctx._left);
  }

  visitNotExp(ctx: NotExpContext): Format {
    let format = this.visit(ctx.NOT());
    if (format.dataType != AnaplanDataTypeStrings.BOOLEAN) {
      throw new Error("Tried to negate something other than a boolean");

    }
    return format;
  }

  visitStringliteralExp(ctx: StringliteralExpContext): Format {
    return new Format(AnaplanDataTypeStrings.TEXT);
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
    return new Format(AnaplanDataTypeStrings.NUMBER);
  }

  visitFuncParameterised(ctx: FuncParameterisedContext): Format {
    // TODO: Somewhere check that the parameters of the function are the correct type
    switch (ctx.functionname().text.toUpperCase()) {
      case "PARENT":
        let entityId = this.visit(ctx.expression()[0]).hierarchyEntityLongId;

        let parentEntityId = this._hierarchyParents.get(entityId);

        let parentFormat = new Format(AnaplanDataTypeStrings.ENTITY);
        parentFormat.hierarchyEntityLongId = parentEntityId;

        return parentFormat;
      default: return this.visit(ctx.expression()[0]);
    }
  }

  visitFuncSquareBrackets(ctx: FuncSquareBracketsContext): Format {
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