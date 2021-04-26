import { AnaplanFormulaVisitor } from './AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, AtomExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, ExpressionAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext } from './AnaplanFormulaParser';

// TODO: Probably remove 'entity' and work out the actual type of it
export enum AnaplanExpressionType { unknown, text, numeric, boolean, entity }

export class AnaplanFormulaTypeEvaluatorVisitor extends AbstractParseTreeVisitor<AnaplanExpressionType> implements AnaplanFormulaVisitor<AnaplanExpressionType> {

  defaultResult(): AnaplanExpressionType {
    throw new Error("Shouldn't get an unknown expression type");

    return AnaplanExpressionType.unknown;
  }

  aggregateResult(aggregate: AnaplanExpressionType, nextResult: AnaplanExpressionType): AnaplanExpressionType {
    // Ensure both are the same, if they aren't produce an error
    if (aggregate != nextResult) {
      throw new Error("Tried to combine different expression types.");
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

  visitMinusSignedAtomSignedAtom(ctx: MinusSignedAtomContext): AnaplanExpressionType {
    return this.visit(ctx.signedAtom());
  }
  visitFuncAtom(ctx: FuncAtomContext): AnaplanExpressionType {
    return this.visit(ctx.func_());
  }

  visitAtomAtom(ctx: AtomAtomContext): AnaplanExpressionType {
    return this.visit(ctx.atom());
  }

  visitNumberAtom(ctx: NumberAtomContext): AnaplanExpressionType {
    return AnaplanExpressionType.numeric;
  }

  visitExpressionAtom(ctx: ExpressionAtomContext): AnaplanExpressionType {
    return this.visit(ctx.expression());
  }

  visitEntityAtom(ctx: EntityAtomContext): AnaplanExpressionType {
    return AnaplanExpressionType.entity;
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
    throw new Error("This should never get visited. This is a coding error");

  }

  visitWordsEntity(ctx: WordsEntityContext): AnaplanExpressionType {
    throw new Error("This should never get visited. This is a coding error");

  }

  visitDotQualifiedEntity(ctx: DotQualifiedEntityContext): AnaplanExpressionType {
    throw new Error("This might get visited, but need to work out what to put here");

  }
}