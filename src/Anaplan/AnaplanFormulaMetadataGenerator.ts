import { AnaplanFormulaVisitor } from './antlrclasses/AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, AtomExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, ExpressionAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext, EntityContext } from './antlrclasses/AnaplanFormulaParser';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { getEntityName, getOriginalText, unQuoteEntity } from './AnaplanHelpers';

export class AnaplanFormulaMetadataGenerator extends AbstractParseTreeVisitor<void> implements AnaplanFormulaVisitor<void> {
  private readonly entities = new Array<string>();

  GetMetaData(tree: ParseTree): Array<string> {
    this.visit(tree);
    return this.entities;
  }

  defaultResult(): void { }

  aggregateResult(aggregate: void, nextResult: void): void { }

  visitQuotedEntity(ctx: QuotedEntityContext): void {
    this.entities.push(getEntityName(ctx));
  }

  visitWordsEntity(ctx: WordsEntityContext): void {
    this.entities.push(getEntityName(ctx));
  }

  visitDotQualifiedEntity(ctx: DotQualifiedEntityContext): void {
    this.entities.push(getEntityName(ctx));
  }
}