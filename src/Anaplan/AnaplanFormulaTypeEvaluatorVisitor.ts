import { AnaplanFormulaVisitor } from './antlrclasses/AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, AtomExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, ExpressionAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext } from './antlrclasses/AnaplanFormulaParser';
import { getEntityName } from './AnaplanHelpers';

// TODO: Probably remove 'entity' and work out the actual type of it
export enum AnaplanExpressionType { unknown, text, numeric, boolean, entity }

export class AnaplanFormulaTypeEvaluatorVisitor extends AbstractParseTreeVisitor<AnaplanExpressionType> implements AnaplanFormulaVisitor<AnaplanExpressionType> {
  private readonly _moduleName: string;

  constructor(moduleName: string) {
    super();
    this._moduleName = moduleName;
  }

  defaultResult(): AnaplanExpressionType {
    throw new Error("Shouldn't get an unknown expression type");
  }

  aggregateResult(aggregate: AnaplanExpressionType, nextResult: AnaplanExpressionType): AnaplanExpressionType {
    // Ensure both are the same, if they aren't produce an error
    if (aggregate != nextResult) {
      throw new Error(`Tried to combine different expression types, ${AnaplanExpressionType[aggregate]} and ${AnaplanExpressionType[nextResult]}`);
    }
    return nextResult
  }

  visitFormula(ctx: FormulaContext): AnaplanExpressionType {
    return this.visit(ctx.expression());
  }

  visitParenthesisExp(ctx: ParenthesisExpContext): AnaplanExpressionType {
    return this.visit(ctx.expression());
  }

  visitIfExp(ctx: IfExpContext): AnaplanExpressionType {
    return this.aggregateResult(this.visit(ctx._thenExpression), this.visit(ctx._elseExpression));
  }

  visitBinaryoperationExp(ctx: BinaryoperationExpContext): AnaplanExpressionType {
    return this.aggregateResult(this.visit(ctx._left), this.visit(ctx._right));
  }

  visitMuldivExp(ctx: MuldivExpContext): AnaplanExpressionType {
    return this.aggregateResult(this.visit(ctx._left), this.visit(ctx._right));
  }

  visitAddsubtractExp(ctx: AddsubtractExpContext): AnaplanExpressionType {
    return this.aggregateResult(this.visit(ctx._left), this.visit(ctx._right));
  }

  visitComparisonExp(ctx: ComparisonExpContext): AnaplanExpressionType {
    if (this.visit(ctx._left) != this.visit(ctx._right)) {
      throw new Error("Tried to compare two different types");
    }
    return AnaplanExpressionType.boolean;
  }

  visitConcatenateExp(ctx: ConcatenateExpContext): AnaplanExpressionType {
    if (this.visit(ctx._left) != AnaplanExpressionType.text ||
      this.visit(ctx._right) != AnaplanExpressionType.text) {
      throw new Error("Tried to concatenate something other than text");
    }
    return AnaplanExpressionType.text;
  }

  visitNotExp(ctx: NotExpContext): AnaplanExpressionType {
    if (this.visit(ctx.NOT()) != AnaplanExpressionType.boolean) {
      throw new Error("Tried to negate something other than a boolean");

    }
    return AnaplanExpressionType.boolean;
  }

  visitStringliteralExp(ctx: StringliteralExpContext): AnaplanExpressionType {
    return AnaplanExpressionType.text;
  }

  visitAtomExp(ctx: AtomExpContext): AnaplanExpressionType {
    return this.visit(ctx.signedAtom());
  }

  visitPlusSignedAtom(ctx: PlusSignedAtomContext): AnaplanExpressionType {
    return this.visit(ctx.signedAtom());
  }

  visitMinusSignedAtom(ctx: MinusSignedAtomContext): AnaplanExpressionType {
    return this.visit(ctx.signedAtom());
  }
  visitFuncAtom(ctx: FuncAtomContext): AnaplanExpressionType {
    return this.visit(ctx.func_());
  }

  visitAtomAtom(ctx: AtomAtomContext): AnaplanExpressionType {
    return this.visit(ctx.atom());
  }

  visitEntityAtom(ctx: EntityAtomContext): AnaplanExpressionType {
    return this.visit(ctx.entity());
  }

  visitExpressionAtom(ctx: ExpressionAtomContext): AnaplanExpressionType {
    return this.visit(ctx.expression());
  }

  visitNumberAtom(ctx: NumberAtomContext): AnaplanExpressionType {
    return AnaplanExpressionType.numeric;
  }

  visitFuncParameterised(ctx: FuncParameterisedContext): AnaplanExpressionType {
    // TODO: This changes based on the function name, for now assume it's the same type as gthe first parameter
    switch (ctx.functionname().text) {
      default: return this.visit(ctx.expression()[0]);
    }
  }

  visitFuncSquareBrackets(ctx: FuncSquareBracketsContext): AnaplanExpressionType {
    return this.visit(ctx.entity());
  }

  visitDimensionmapping(ctx: DimensionmappingContext): AnaplanExpressionType {
    throw new Error("This should never get visited. This is a coding error");

  }

  visitFunctionname(ctx: FunctionnameContext): AnaplanExpressionType {
    throw new Error("This should never get visited. This is a coding error");

  }

  visitQuotedEntity(ctx: QuotedEntityContext): AnaplanExpressionType {
    let entityName = this._moduleName + "." + getEntityName(ctx);
    return AnaplanExpressionType.entity; // TODO: Instead of this replace it with the actual type of the entity

  }

  visitWordsEntity(ctx: WordsEntityContext): AnaplanExpressionType {
    let entityName = this._moduleName + "." + getEntityName(ctx);
    return AnaplanExpressionType.entity;
  }

  visitDotQualifiedEntity(ctx: DotQualifiedEntityContext): AnaplanExpressionType {
    let entityName = getEntityName(ctx);
    return AnaplanExpressionType.entity;
  }
}