// Generated from src/Anaplan/AnaplanFormula.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
 * This interface defines a complete listener for a parse tree produced by
 * `AnaplanFormulaParser`.
 */
export interface AnaplanFormulaListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by the `plusSignedAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	enterPlusSignedAtom?: (ctx: PlusSignedAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `plusSignedAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	exitPlusSignedAtom?: (ctx: PlusSignedAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `minusSignedAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	enterMinusSignedAtom?: (ctx: MinusSignedAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `minusSignedAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	exitMinusSignedAtom?: (ctx: MinusSignedAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `funcAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	enterFuncAtom?: (ctx: FuncAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `funcAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	exitFuncAtom?: (ctx: FuncAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `atomAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	enterAtomAtom?: (ctx: AtomAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `atomAtom`
	 * labeled alternative in `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	exitAtomAtom?: (ctx: AtomAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `atomExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterAtomExp?: (ctx: AtomExpContext) => void;
	/**
	 * Exit a parse tree produced by the `atomExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitAtomExp?: (ctx: AtomExpContext) => void;

	/**
	 * Enter a parse tree produced by the `stringliteralExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterStringliteralExp?: (ctx: StringliteralExpContext) => void;
	/**
	 * Exit a parse tree produced by the `stringliteralExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitStringliteralExp?: (ctx: StringliteralExpContext) => void;

	/**
	 * Enter a parse tree produced by the `notExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterNotExp?: (ctx: NotExpContext) => void;
	/**
	 * Exit a parse tree produced by the `notExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitNotExp?: (ctx: NotExpContext) => void;

	/**
	 * Enter a parse tree produced by the `concatenateExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterConcatenateExp?: (ctx: ConcatenateExpContext) => void;
	/**
	 * Exit a parse tree produced by the `concatenateExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitConcatenateExp?: (ctx: ConcatenateExpContext) => void;

	/**
	 * Enter a parse tree produced by the `comparisonExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterComparisonExp?: (ctx: ComparisonExpContext) => void;
	/**
	 * Exit a parse tree produced by the `comparisonExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitComparisonExp?: (ctx: ComparisonExpContext) => void;

	/**
	 * Enter a parse tree produced by the `addsubtractExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterAddsubtractExp?: (ctx: AddsubtractExpContext) => void;
	/**
	 * Exit a parse tree produced by the `addsubtractExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitAddsubtractExp?: (ctx: AddsubtractExpContext) => void;

	/**
	 * Enter a parse tree produced by the `muldivExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterMuldivExp?: (ctx: MuldivExpContext) => void;
	/**
	 * Exit a parse tree produced by the `muldivExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitMuldivExp?: (ctx: MuldivExpContext) => void;

	/**
	 * Enter a parse tree produced by the `binaryoperationExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterBinaryoperationExp?: (ctx: BinaryoperationExpContext) => void;
	/**
	 * Exit a parse tree produced by the `binaryoperationExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitBinaryoperationExp?: (ctx: BinaryoperationExpContext) => void;

	/**
	 * Enter a parse tree produced by the `ifExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterIfExp?: (ctx: IfExpContext) => void;
	/**
	 * Exit a parse tree produced by the `ifExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitIfExp?: (ctx: IfExpContext) => void;

	/**
	 * Enter a parse tree produced by the `parenthesisExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterParenthesisExp?: (ctx: ParenthesisExpContext) => void;
	/**
	 * Exit a parse tree produced by the `parenthesisExp`
	 * labeled alternative in `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitParenthesisExp?: (ctx: ParenthesisExpContext) => void;

	/**
	 * Enter a parse tree produced by the `entityAtom`
	 * labeled alternative in `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 */
	enterEntityAtom?: (ctx: EntityAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `entityAtom`
	 * labeled alternative in `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 */
	exitEntityAtom?: (ctx: EntityAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `expressionAtom`
	 * labeled alternative in `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 */
	enterExpressionAtom?: (ctx: ExpressionAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `expressionAtom`
	 * labeled alternative in `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 */
	exitExpressionAtom?: (ctx: ExpressionAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `numberAtom`
	 * labeled alternative in `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 */
	enterNumberAtom?: (ctx: NumberAtomContext) => void;
	/**
	 * Exit a parse tree produced by the `numberAtom`
	 * labeled alternative in `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 */
	exitNumberAtom?: (ctx: NumberAtomContext) => void;

	/**
	 * Enter a parse tree produced by the `quotedEntity`
	 * labeled alternative in `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 */
	enterQuotedEntity?: (ctx: QuotedEntityContext) => void;
	/**
	 * Exit a parse tree produced by the `quotedEntity`
	 * labeled alternative in `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 */
	exitQuotedEntity?: (ctx: QuotedEntityContext) => void;

	/**
	 * Enter a parse tree produced by the `wordsEntity`
	 * labeled alternative in `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 */
	enterWordsEntity?: (ctx: WordsEntityContext) => void;
	/**
	 * Exit a parse tree produced by the `wordsEntity`
	 * labeled alternative in `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 */
	exitWordsEntity?: (ctx: WordsEntityContext) => void;

	/**
	 * Enter a parse tree produced by the `dotQualifiedEntity`
	 * labeled alternative in `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 */
	enterDotQualifiedEntity?: (ctx: DotQualifiedEntityContext) => void;
	/**
	 * Exit a parse tree produced by the `dotQualifiedEntity`
	 * labeled alternative in `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 */
	exitDotQualifiedEntity?: (ctx: DotQualifiedEntityContext) => void;

	/**
	 * Enter a parse tree produced by the `funcParameterised`
	 * labeled alternative in `AnaplanFormulaParser.func_`.
	 * @param ctx the parse tree
	 */
	enterFuncParameterised?: (ctx: FuncParameterisedContext) => void;
	/**
	 * Exit a parse tree produced by the `funcParameterised`
	 * labeled alternative in `AnaplanFormulaParser.func_`.
	 * @param ctx the parse tree
	 */
	exitFuncParameterised?: (ctx: FuncParameterisedContext) => void;

	/**
	 * Enter a parse tree produced by the `funcSquareBrackets`
	 * labeled alternative in `AnaplanFormulaParser.func_`.
	 * @param ctx the parse tree
	 */
	enterFuncSquareBrackets?: (ctx: FuncSquareBracketsContext) => void;
	/**
	 * Exit a parse tree produced by the `funcSquareBrackets`
	 * labeled alternative in `AnaplanFormulaParser.func_`.
	 * @param ctx the parse tree
	 */
	exitFuncSquareBrackets?: (ctx: FuncSquareBracketsContext) => void;

	/**
	 * Enter a parse tree produced by `AnaplanFormulaParser.formula`.
	 * @param ctx the parse tree
	 */
	enterFormula?: (ctx: FormulaContext) => void;
	/**
	 * Exit a parse tree produced by `AnaplanFormulaParser.formula`.
	 * @param ctx the parse tree
	 */
	exitFormula?: (ctx: FormulaContext) => void;

	/**
	 * Enter a parse tree produced by `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	enterExpression?: (ctx: ExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `AnaplanFormulaParser.expression`.
	 * @param ctx the parse tree
	 */
	exitExpression?: (ctx: ExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	enterSignedAtom?: (ctx: SignedAtomContext) => void;
	/**
	 * Exit a parse tree produced by `AnaplanFormulaParser.signedAtom`.
	 * @param ctx the parse tree
	 */
	exitSignedAtom?: (ctx: SignedAtomContext) => void;

	/**
	 * Enter a parse tree produced by `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 */
	enterAtom?: (ctx: AtomContext) => void;
	/**
	 * Exit a parse tree produced by `AnaplanFormulaParser.atom`.
	 * @param ctx the parse tree
	 */
	exitAtom?: (ctx: AtomContext) => void;

	/**
	 * Enter a parse tree produced by `AnaplanFormulaParser.func_`.
	 * @param ctx the parse tree
	 */
	enterFunc_?: (ctx: Func_Context) => void;
	/**
	 * Exit a parse tree produced by `AnaplanFormulaParser.func_`.
	 * @param ctx the parse tree
	 */
	exitFunc_?: (ctx: Func_Context) => void;

	/**
	 * Enter a parse tree produced by `AnaplanFormulaParser.dimensionmapping`.
	 * @param ctx the parse tree
	 */
	enterDimensionmapping?: (ctx: DimensionmappingContext) => void;
	/**
	 * Exit a parse tree produced by `AnaplanFormulaParser.dimensionmapping`.
	 * @param ctx the parse tree
	 */
	exitDimensionmapping?: (ctx: DimensionmappingContext) => void;

	/**
	 * Enter a parse tree produced by `AnaplanFormulaParser.functionname`.
	 * @param ctx the parse tree
	 */
	enterFunctionname?: (ctx: FunctionnameContext) => void;
	/**
	 * Exit a parse tree produced by `AnaplanFormulaParser.functionname`.
	 * @param ctx the parse tree
	 */
	exitFunctionname?: (ctx: FunctionnameContext) => void;

	/**
	 * Enter a parse tree produced by `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 */
	enterEntity?: (ctx: EntityContext) => void;
	/**
	 * Exit a parse tree produced by `AnaplanFormulaParser.entity`.
	 * @param ctx the parse tree
	 */
	exitEntity?: (ctx: EntityContext) => void;
}

