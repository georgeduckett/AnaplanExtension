import { AnaplanFormulaVisitor } from './AnaplanFormulaVisitor'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor'
import { Stack } from 'stack-typescript'
import { FormulaContext, ParenthesisExpContext, BinaryoperationExpContext, IfExpContext, MuldivExpContext, AddsubtractExpContext, ComparisonExpContext, ConcatenateExpContext, NotExpContext, StringliteralExpContext, AtomExpContext, PlusSignedAtomContext, MinusSignedAtomContext, FuncAtomContext, AtomAtomContext, NumberAtomContext, ExpressionAtomContext, EntityAtomContext, FuncParameterisedContext, DimensionmappingContext, FunctionnameContext, WordsEntityContext, QuotedEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext } from './AnaplanFormulaParser';
import { ContextSensitivityInfo } from 'antlr4ts/atn/ContextSensitivityInfo';
import { Interval } from 'antlr4ts/misc/Interval';

export class AnaplanFormulaFormatterVisitor extends AbstractParseTreeVisitor<string> implements AnaplanFormulaVisitor<string> {
  readonly indentationStep: number = 2;
  readonly indentationLevels: Stack<number> = new Stack<number>();

  defaultResult(): string {
    return ''
  }

  aggregateResult(aggregate: string, nextResult: string): string {
    return aggregate + nextResult
  }

  indentationString(): string {
    return ' '.repeat(this.indentationLevels.top);
  }

  constructor(indentationStep: number) {
    super();
    this.indentationStep = indentationStep;
    this.indentationLevels.push(0);
  }

  addIndentationString(indentation: number | null = null): string {
    if (this.indentationStep == 0) return ' ';

    this.indentationLevels.push(this.indentationLevels.top + (indentation ?? this.indentationStep));
    return '\n' + ' '.repeat(this.indentationLevels.top);
  }

  removeIndentationString(addNewLine: boolean = false): string {
    if (this.indentationStep == 0) return ' ';

    this.indentationLevels.pop();

    return addNewLine ? '\n' + ' '.repeat(this.indentationLevels.top) : '';
  }

  visitFormula(ctx: FormulaContext): string {
    return this.visit(ctx.expression());
  }

  visitParenthesisExp(ctx: ParenthesisExpContext): string {
    return ctx.LPAREN().text + this.visit(ctx.expression()) + ctx.RPAREN().text;
  }

  visitIfExp(ctx: IfExpContext): string {
    return ctx.IF().text + this.addIndentationString() +
      this.visit(ctx._condition) + this.removeIndentationString(true) +
      ctx.THEN().text + this.addIndentationString() +
      this.visit(ctx._thenExpression) + this.removeIndentationString(true) +
      ctx.ELSE().text + this.addIndentationString() +
      this.visit(ctx._elseExpression) + this.removeIndentationString();
  }

  visitBinaryoperationExp(ctx: BinaryoperationExpContext): string {
    return `${this.visit(ctx._left)} ${ctx.BINARYOPERATOR().text} ${this.visit(ctx._right)}`;
  }

  visitMuldivExp(ctx: MuldivExpContext): string {
    return `${this.visit(ctx._left)} ${ctx._op.text} ${this.visit(ctx._right)}`;
  }

  visitAddsubtractExp(ctx: AddsubtractExpContext): string {
    return `${this.visit(ctx._left)} ${ctx._op.text} ${this.visit(ctx._right)}`;
  }

  visitComparisonExp(ctx: ComparisonExpContext): string {
    return `${this.visit(ctx._left)} ${ctx._op.text} ${this.visit(ctx._right)}`;
  }

  visitConcatenateExp(ctx: ConcatenateExpContext): string {
    return `${this.visit(ctx._left)} ${ctx.AMPERSAND().text} ${this.visit(ctx._right)}`;
  }

  visitNotExp(ctx: NotExpContext): string {
    return `${ctx.NOT().text} ${this.visit(ctx.expression())}`;
  }

  visitStringliteralExp(ctx: StringliteralExpContext): string {
    return ctx.STRINGLITERAL().text;
  }

  visitAtomExp(ctx: AtomExpContext): string {
    return this.visit(ctx.signedAtom());
  }

  visitPlusSignedAtom(ctx: PlusSignedAtomContext): string {
    return ctx.PLUS().text + this.visit(ctx.signedAtom());
  }

  visitMinusSignedAtomSignedAtom(ctx: MinusSignedAtomContext): string {
    return ctx.MINUS().text + this.visit(ctx.signedAtom());
  }
  visitFuncAtom(ctx: FuncAtomContext): string {
    return this.visit(ctx.func_());
  }

  visitAtomAtom(ctx: AtomAtomContext): string {
    return this.visit(ctx.atom());
  }

  visitNumberAtom(ctx: NumberAtomContext): string {
    return ctx.SCIENTIFIC_NUMBER().text;
  }

  visitExpressionAtom(ctx: ExpressionAtomContext): string {
    return ctx.LPAREN().text + this.visit(ctx.expression()) + ctx.RPAREN().text;
  }

  visitEntityAtom(ctx: EntityAtomContext): string {
    return this.visit(ctx.entity());
  }

  visitFuncParameterised(ctx: FuncParameterisedContext): string {
    return ctx.functionname().text +
      ctx.LPAREN().text +
      ctx.expression().map(this.visit, this).join(', ') +
      ctx.RPAREN().text;
  }

  visitFuncSquareBrackets(ctx: FuncSquareBracketsContext): string {
    let result = this.visit(ctx.entity());
    result += ctx.LSQUARE().text;

    let upToSquareLength = result.length;

    let addedIndent = false;
    for (let i = 0; i < ctx.dimensionmapping().length; i++) {
      if (i != 0) result += ', ';
      if (i == 1) {
        result += this.addIndentationString(upToSquareLength);
        addedIndent = true;
      }
      if (i > 1) {
        result += this.indentationString();
      }

      result += this.visit(ctx.dimensionmapping()[i]);
    }

    result += ctx.RSQUARE().text;

    if (addedIndent) result += this.removeIndentationString(true);

    return result;
  }
  /*public override string VisitFuncSquareBrackets([NotNull] AnaplanFormulaParser.FuncSquareBracketsContext context)
          {
              var sb = new StringBuilder();
              sb.Append(Visit(context.entity()));
              sb.Append(context.LSQUARE().GetText());
  
              var upToSquareLength = sb.Length;
  
              bool addedIndent = false;
  
              for (int i = 0; i < context.dimensionmapping().Length; i++)
              {
                  if (i != 0) sb.Append(", ");
                  if (i == 1)
                  {
                      sb.Append(AddIndentationString(upToSquareLength));
                      addedIndent = true;
                  }
                  if (i > 1)
                  {
                      sb.Append(IndentationString);
                  }
  
                  sb.Append(Visit(context.dimensionmapping()[i]));
              }
  
              sb.Append(context.RSQUARE().GetText());
  
              if (addedIndent) sb.Append(RemoveIndentationString(true));
  
              return sb.ToString();
          }*/












  visitDimensionmapping(ctx: DimensionmappingContext): string {
    return `${ctx.WORD().text}${ctx.COLON().text} ${this.visit(ctx.entity())}`;
  }

  visitFunctionname(ctx: FunctionnameContext): string {
    return ctx.WORD().text;
  }

  visitQuotedEntity(ctx: QuotedEntityContext): string {
    return ctx.QUOTELITERAL().text;
  }

  visitWordsEntity(ctx: WordsEntityContext): string {
    if (ctx.start.inputStream == undefined || ctx.stop == undefined) return '';

    return ctx.start.inputStream.getText(new Interval(ctx.start.startIndex, ctx.stop.stopIndex));
  }

  visitDotQualifiedEntity(ctx: DotQualifiedEntityContext): string {
    return this.visit(ctx._left) + ctx.DOT().text + this.visit(ctx._right);
  }
}