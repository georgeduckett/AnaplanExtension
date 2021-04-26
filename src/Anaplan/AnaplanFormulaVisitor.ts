// Generated from src/Anaplan/AnaplanFormula.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { PlusSignedAtomContext } from "./AnaplanFormulaParser";
import { MinusSignedAtomContext } from "./AnaplanFormulaParser";
import { FuncAtomContext } from "./AnaplanFormulaParser";
import { AtomAtomContext } from "./AnaplanFormulaParser";
import { AtomExpContext } from "./AnaplanFormulaParser";
import { StringliteralExpContext } from "./AnaplanFormulaParser";
import { NotExpContext } from "./AnaplanFormulaParser";
import { ConcatenateExpContext } from "./AnaplanFormulaParser";
import { ComparisonExpContext } from "./AnaplanFormulaParser";
import { AddsubtractExpContext } from "./AnaplanFormulaParser";
import { MuldivExpContext } from "./AnaplanFormulaParser";
import { BinaryoperationExpContext } from "./AnaplanFormulaParser";
import { IfExpContext } from "./AnaplanFormulaParser";
import { ParenthesisExpContext } from "./AnaplanFormulaParser";
import { EntityAtomContext } from "./AnaplanFormulaParser";
import { ExpressionAtomContext } from "./AnaplanFormulaParser";
import { NumberAtomContext } from "./AnaplanFormulaParser";
import { QuotedEntityContext } from "./AnaplanFormulaParser";
import { WordsEntityContext } from "./AnaplanFormulaParser";
import { DotQualifiedEntityContext } from "./AnaplanFormulaParser";
import { FuncParameterisedContext } from "./AnaplanFormulaParser";
import { FuncSquareBracketsContext } from "./AnaplanFormulaParser";
import { FormulaContext } from "./AnaplanFormulaParser";
import { ExpressionContext } from "./AnaplanFormulaParser";
import { SignedAtomContext } from "./AnaplanFormulaParser";
import { AtomContext } from "./AnaplanFormulaParser";
import { Func_Context } from "./AnaplanFormulaParser";
import { DimensionmappingContext } from "./AnaplanFormulaParser";
import { FunctionnameContext } from "./AnaplanFormulaParser";
import { EntityContext } from "./AnaplanFormulaParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `AnaplanFormulaParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface AnaplanFormulaVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by the `plusSignedAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitPlusSignedAtom?: (ctx: PlusSignedAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `minusSignedAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMinusSignedAtom?: (ctx: MinusSignedAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `funcAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFuncAtom?: (ctx: FuncAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `atomAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtomAtom?: (ctx: AtomAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `atomExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtomExp?: (ctx: AtomExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `stringliteralExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitStringliteralExp?: (ctx: StringliteralExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `notExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNotExp?: (ctx: NotExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `concatenateExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitConcatenateExp?: (ctx: ConcatenateExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `comparisonExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitComparisonExp?: (ctx: ComparisonExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `addsubtractExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAddsubtractExp?: (ctx: AddsubtractExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `muldivExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitMuldivExp?: (ctx: MuldivExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `binaryoperationExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitBinaryoperationExp?: (ctx: BinaryoperationExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `ifExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitIfExp?: (ctx: IfExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `parenthesisExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParenthesisExp?: (ctx: ParenthesisExpContext) => Result;

	/**
	 * Visit a parse tree produced by the `entityAtom`
	 * labeled alternative in `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEntityAtom?: (ctx: EntityAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `expressionAtom`
	 * labeled alternative in `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpressionAtom?: (ctx: ExpressionAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `numberAtom`
	 * labeled alternative in `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitNumberAtom?: (ctx: NumberAtomContext) => Result;

	/**
	 * Visit a parse tree produced by the `quotedEntity`
	 * labeled alternative in `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitQuotedEntity?: (ctx: QuotedEntityContext) => Result;

	/**
	 * Visit a parse tree produced by the `wordsEntity`
	 * labeled alternative in `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitWordsEntity?: (ctx: WordsEntityContext) => Result;

	/**
	 * Visit a parse tree produced by the `dotQualifiedEntity`
	 * labeled alternative in `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDotQualifiedEntity?: (ctx: DotQualifiedEntityContext) => Result;

	/**
	 * Visit a parse tree produced by the `funcParameterised`
	 * labeled alternative in `AnaplanFormulaParser.func_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFuncParameterised?: (ctx: FuncParameterisedContext) => Result;

	/**
	 * Visit a parse tree produced by the `funcSquareBrackets`
	 * labeled alternative in `AnaplanFormulaParser.func_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFuncSquareBrackets?: (ctx: FuncSquareBracketsContext) => Result;

	/**
	 * Visit a parse tree produced by `AnaplanFormulaParser.formula`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFormula?: (ctx: FormulaContext) => Result;

	/**
	 * Visit a parse tree produced by `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitExpression?: (ctx: ExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitSignedAtom?: (ctx: SignedAtomContext) => Result;

	/**
	 * Visit a parse tree produced by `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAtom?: (ctx: AtomContext) => Result;

	/**
	 * Visit a parse tree produced by `AnaplanFormulaParser.func_`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunc_?: (ctx: Func_Context) => Result;

	/**
	 * Visit a parse tree produced by `AnaplanFormulaParser.dimensionmapping`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDimensionmapping?: (ctx: DimensionmappingContext) => Result;

	/**
	 * Visit a parse tree produced by `AnaplanFormulaParser.functionname`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitFunctionname?: (ctx: FunctionnameContext) => Result;

	/**
	 * Visit a parse tree produced by `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitEntity?: (ctx: EntityContext) => Result;
}

