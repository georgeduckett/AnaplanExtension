// Generated from src/Anaplan/AnaplanFormula.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { AnaplanFormulaListener } from "./AnaplanFormulaListener";
import { AnaplanFormulaVisitor } from "./AnaplanFormulaVisitor";


export class AnaplanFormulaParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly WS = 2;
	public static readonly IF = 3;
	public static readonly THEN = 4;
	public static readonly ELSE = 5;
	public static readonly BINARYOPERATOR = 6;
	public static readonly NOT = 7;
	public static readonly WORD = 8;
	public static readonly STRINGLITERAL = 9;
	public static readonly QUOTELITERAL = 10;
	public static readonly LSQUARE = 11;
	public static readonly RSQUARE = 12;
	public static readonly LPAREN = 13;
	public static readonly RPAREN = 14;
	public static readonly PLUS = 15;
	public static readonly MINUS = 16;
	public static readonly TIMES = 17;
	public static readonly DIV = 18;
	public static readonly COLON = 19;
	public static readonly EQUALS = 20;
	public static readonly NOTEQUALS = 21;
	public static readonly LT = 22;
	public static readonly GT = 23;
	public static readonly AMPERSAND = 24;
	public static readonly DOUBLEQUOTES = 25;
	public static readonly UNDERSCORE = 26;
	public static readonly QUESTIONMARK = 27;
	public static readonly HASH = 28;
	public static readonly POUND = 29;
	public static readonly PERCENT = 30;
	public static readonly DOT = 31;
	public static readonly PIPE = 32;
	public static readonly SCIENTIFIC_NUMBER = 33;
	public static readonly RULE_formula = 0;
	public static readonly RULE_expression = 1;
	public static readonly RULE_signedAtom = 2;
	public static readonly RULE_atom = 3;
	public static readonly RULE_func_ = 4;
	public static readonly RULE_dimensionmapping = 5;
	public static readonly RULE_functionname = 6;
	public static readonly RULE_entity = 7;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"formula", "expression", "signedAtom", "atom", "func_", "dimensionmapping", 
		"functionname", "entity",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "','", undefined, undefined, undefined, undefined, undefined, 
		undefined, undefined, undefined, undefined, "'['", "']'", "'('", "')'", 
		"'+'", "'-'", "'*'", "'/'", "':'", "'='", undefined, "'<'", "'>'", "'&'", 
		"'\"'", "'_'", "'?'", "'#'", "'\u00A3'", "'%'", "'.'", "'|'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, "WS", "IF", "THEN", "ELSE", "BINARYOPERATOR", "NOT", 
		"WORD", "STRINGLITERAL", "QUOTELITERAL", "LSQUARE", "RSQUARE", "LPAREN", 
		"RPAREN", "PLUS", "MINUS", "TIMES", "DIV", "COLON", "EQUALS", "NOTEQUALS", 
		"LT", "GT", "AMPERSAND", "DOUBLEQUOTES", "UNDERSCORE", "QUESTIONMARK", 
		"HASH", "POUND", "PERCENT", "DOT", "PIPE", "SCIENTIFIC_NUMBER",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(AnaplanFormulaParser._LITERAL_NAMES, AnaplanFormulaParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return AnaplanFormulaParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "AnaplanFormula.g4"; }

	// @Override
	public get ruleNames(): string[] { return AnaplanFormulaParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return AnaplanFormulaParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(AnaplanFormulaParser._ATN, this);
	}
	// @RuleVersion(0)
	public formula(): FormulaContext {
		let _localctx: FormulaContext = new FormulaContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, AnaplanFormulaParser.RULE_formula);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 16;
			this.expression(0);
			this.state = 17;
			this.match(AnaplanFormulaParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public expression(): ExpressionContext;
	public expression(_p: number): ExpressionContext;
	// @RuleVersion(0)
	public expression(_p?: number): ExpressionContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: ExpressionContext = new ExpressionContext(this._ctx, _parentState);
		let _prevctx: ExpressionContext = _localctx;
		let _startState: number = 2;
		this.enterRecursionRule(_localctx, 2, AnaplanFormulaParser.RULE_expression, _p);
		let _la: number;
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 35;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 0, this._ctx) ) {
			case 1:
				{
				_localctx = new AtomExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 20;
				this.signedAtom();
				}
				break;

			case 2:
				{
				_localctx = new StringliteralExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 21;
				this.match(AnaplanFormulaParser.STRINGLITERAL);
				}
				break;

			case 3:
				{
				_localctx = new NotExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 22;
				this.match(AnaplanFormulaParser.NOT);
				this.state = 23;
				this.expression(8);
				}
				break;

			case 4:
				{
				_localctx = new IfExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 24;
				this.match(AnaplanFormulaParser.IF);
				this.state = 25;
				(_localctx as IfExpContext)._condition = this.expression(0);
				this.state = 26;
				this.match(AnaplanFormulaParser.THEN);
				this.state = 27;
				(_localctx as IfExpContext)._thenExpression = this.expression(0);
				this.state = 28;
				this.match(AnaplanFormulaParser.ELSE);
				this.state = 29;
				(_localctx as IfExpContext)._elseExpression = this.expression(2);
				}
				break;

			case 5:
				{
				_localctx = new ParenthesisExpContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 31;
				this.match(AnaplanFormulaParser.LPAREN);
				this.state = 32;
				this.expression(0);
				this.state = 33;
				this.match(AnaplanFormulaParser.RPAREN);
				}
				break;
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 54;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 2, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					this.state = 52;
					this._errHandler.sync(this);
					switch ( this.interpreter.adaptivePredict(this._input, 1, this._ctx) ) {
					case 1:
						{
						_localctx = new ConcatenateExpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as ConcatenateExpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, AnaplanFormulaParser.RULE_expression);
						this.state = 37;
						if (!(this.precpred(this._ctx, 7))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 7)");
						}
						this.state = 38;
						this.match(AnaplanFormulaParser.AMPERSAND);
						this.state = 39;
						(_localctx as ConcatenateExpContext)._right = this.expression(8);
						}
						break;

					case 2:
						{
						_localctx = new ComparisonExpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as ComparisonExpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, AnaplanFormulaParser.RULE_expression);
						this.state = 40;
						if (!(this.precpred(this._ctx, 6))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 6)");
						}
						this.state = 41;
						(_localctx as ComparisonExpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << AnaplanFormulaParser.EQUALS) | (1 << AnaplanFormulaParser.NOTEQUALS) | (1 << AnaplanFormulaParser.LT) | (1 << AnaplanFormulaParser.GT))) !== 0))) {
							(_localctx as ComparisonExpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 42;
						(_localctx as ComparisonExpContext)._right = this.expression(7);
						}
						break;

					case 3:
						{
						_localctx = new AddsubtractExpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as AddsubtractExpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, AnaplanFormulaParser.RULE_expression);
						this.state = 43;
						if (!(this.precpred(this._ctx, 5))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 5)");
						}
						this.state = 44;
						(_localctx as AddsubtractExpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === AnaplanFormulaParser.PLUS || _la === AnaplanFormulaParser.MINUS)) {
							(_localctx as AddsubtractExpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 45;
						(_localctx as AddsubtractExpContext)._right = this.expression(6);
						}
						break;

					case 4:
						{
						_localctx = new MuldivExpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as MuldivExpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, AnaplanFormulaParser.RULE_expression);
						this.state = 46;
						if (!(this.precpred(this._ctx, 4))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 4)");
						}
						this.state = 47;
						(_localctx as MuldivExpContext)._op = this._input.LT(1);
						_la = this._input.LA(1);
						if (!(_la === AnaplanFormulaParser.TIMES || _la === AnaplanFormulaParser.DIV)) {
							(_localctx as MuldivExpContext)._op = this._errHandler.recoverInline(this);
						} else {
							if (this._input.LA(1) === Token.EOF) {
								this.matchedEOF = true;
							}

							this._errHandler.reportMatch(this);
							this.consume();
						}
						this.state = 48;
						(_localctx as MuldivExpContext)._right = this.expression(5);
						}
						break;

					case 5:
						{
						_localctx = new BinaryoperationExpContext(new ExpressionContext(_parentctx, _parentState));
						(_localctx as BinaryoperationExpContext)._left = _prevctx;
						this.pushNewRecursionContext(_localctx, _startState, AnaplanFormulaParser.RULE_expression);
						this.state = 49;
						if (!(this.precpred(this._ctx, 3))) {
							throw this.createFailedPredicateException("this.precpred(this._ctx, 3)");
						}
						this.state = 50;
						this.match(AnaplanFormulaParser.BINARYOPERATOR);
						this.state = 51;
						(_localctx as BinaryoperationExpContext)._right = this.expression(4);
						}
						break;
					}
					}
				}
				this.state = 56;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 2, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public signedAtom(): SignedAtomContext {
		let _localctx: SignedAtomContext = new SignedAtomContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, AnaplanFormulaParser.RULE_signedAtom);
		try {
			this.state = 63;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 3, this._ctx) ) {
			case 1:
				_localctx = new PlusSignedAtomContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 57;
				this.match(AnaplanFormulaParser.PLUS);
				this.state = 58;
				this.signedAtom();
				}
				break;

			case 2:
				_localctx = new MinusSignedAtomContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 59;
				this.match(AnaplanFormulaParser.MINUS);
				this.state = 60;
				this.signedAtom();
				}
				break;

			case 3:
				_localctx = new FuncAtomContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 61;
				this.func_();
				}
				break;

			case 4:
				_localctx = new AtomAtomContext(_localctx);
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 62;
				this.atom();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public atom(): AtomContext {
		let _localctx: AtomContext = new AtomContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, AnaplanFormulaParser.RULE_atom);
		try {
			this.state = 71;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AnaplanFormulaParser.WORD:
			case AnaplanFormulaParser.QUOTELITERAL:
				_localctx = new EntityAtomContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 65;
				this.entity(0);
				}
				break;
			case AnaplanFormulaParser.LPAREN:
				_localctx = new ExpressionAtomContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 66;
				this.match(AnaplanFormulaParser.LPAREN);
				this.state = 67;
				this.expression(0);
				this.state = 68;
				this.match(AnaplanFormulaParser.RPAREN);
				}
				break;
			case AnaplanFormulaParser.SCIENTIFIC_NUMBER:
				_localctx = new NumberAtomContext(_localctx);
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 70;
				this.match(AnaplanFormulaParser.SCIENTIFIC_NUMBER);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public func_(): Func_Context {
		let _localctx: Func_Context = new Func_Context(this._ctx, this.state);
		this.enterRule(_localctx, 8, AnaplanFormulaParser.RULE_func_);
		let _la: number;
		try {
			this.state = 99;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 8, this._ctx) ) {
			case 1:
				_localctx = new FuncParameterisedContext(_localctx);
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 73;
				this.functionname();
				this.state = 74;
				this.match(AnaplanFormulaParser.LPAREN);
				this.state = 83;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (((((_la - 3)) & ~0x1F) === 0 && ((1 << (_la - 3)) & ((1 << (AnaplanFormulaParser.IF - 3)) | (1 << (AnaplanFormulaParser.NOT - 3)) | (1 << (AnaplanFormulaParser.WORD - 3)) | (1 << (AnaplanFormulaParser.STRINGLITERAL - 3)) | (1 << (AnaplanFormulaParser.QUOTELITERAL - 3)) | (1 << (AnaplanFormulaParser.LPAREN - 3)) | (1 << (AnaplanFormulaParser.PLUS - 3)) | (1 << (AnaplanFormulaParser.MINUS - 3)) | (1 << (AnaplanFormulaParser.SCIENTIFIC_NUMBER - 3)))) !== 0)) {
					{
					this.state = 75;
					this.expression(0);
					this.state = 80;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
					while (_la === AnaplanFormulaParser.T__0) {
						{
						{
						this.state = 76;
						this.match(AnaplanFormulaParser.T__0);
						this.state = 77;
						this.expression(0);
						}
						}
						this.state = 82;
						this._errHandler.sync(this);
						_la = this._input.LA(1);
					}
					}
				}

				this.state = 85;
				this.match(AnaplanFormulaParser.RPAREN);
				}
				break;

			case 2:
				_localctx = new FuncSquareBracketsContext(_localctx);
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 87;
				this.entity(0);
				this.state = 88;
				this.match(AnaplanFormulaParser.LSQUARE);
				this.state = 89;
				this.dimensionmapping();
				this.state = 94;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === AnaplanFormulaParser.T__0) {
					{
					{
					this.state = 90;
					this.match(AnaplanFormulaParser.T__0);
					this.state = 91;
					this.dimensionmapping();
					}
					}
					this.state = 96;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 97;
				this.match(AnaplanFormulaParser.RSQUARE);
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public dimensionmapping(): DimensionmappingContext {
		let _localctx: DimensionmappingContext = new DimensionmappingContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, AnaplanFormulaParser.RULE_dimensionmapping);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 101;
			this.match(AnaplanFormulaParser.WORD);
			this.state = 102;
			this.match(AnaplanFormulaParser.COLON);
			this.state = 103;
			this.entity(0);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public functionname(): FunctionnameContext {
		let _localctx: FunctionnameContext = new FunctionnameContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, AnaplanFormulaParser.RULE_functionname);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 105;
			this.match(AnaplanFormulaParser.WORD);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public entity(): EntityContext;
	public entity(_p: number): EntityContext;
	// @RuleVersion(0)
	public entity(_p?: number): EntityContext {
		if (_p === undefined) {
			_p = 0;
		}

		let _parentctx: ParserRuleContext = this._ctx;
		let _parentState: number = this.state;
		let _localctx: EntityContext = new EntityContext(this._ctx, _parentState);
		let _prevctx: EntityContext = _localctx;
		let _startState: number = 14;
		this.enterRecursionRule(_localctx, 14, AnaplanFormulaParser.RULE_entity, _p);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 114;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case AnaplanFormulaParser.QUOTELITERAL:
				{
				_localctx = new QuotedEntityContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;

				this.state = 108;
				this.match(AnaplanFormulaParser.QUOTELITERAL);
				}
				break;
			case AnaplanFormulaParser.WORD:
				{
				_localctx = new WordsEntityContext(_localctx);
				this._ctx = _localctx;
				_prevctx = _localctx;
				this.state = 110;
				this._errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						this.state = 109;
						this.match(AnaplanFormulaParser.WORD);
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					this.state = 112;
					this._errHandler.sync(this);
					_alt = this.interpreter.adaptivePredict(this._input, 9, this._ctx);
				} while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			this._ctx._stop = this._input.tryLT(-1);
			this.state = 121;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 11, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					if (this._parseListeners != null) {
						this.triggerExitRuleEvent();
					}
					_prevctx = _localctx;
					{
					{
					_localctx = new DotQualifiedEntityContext(new EntityContext(_parentctx, _parentState));
					(_localctx as DotQualifiedEntityContext)._left = _prevctx;
					this.pushNewRecursionContext(_localctx, _startState, AnaplanFormulaParser.RULE_entity);
					this.state = 116;
					if (!(this.precpred(this._ctx, 1))) {
						throw this.createFailedPredicateException("this.precpred(this._ctx, 1)");
					}
					this.state = 117;
					this.match(AnaplanFormulaParser.DOT);
					this.state = 118;
					(_localctx as DotQualifiedEntityContext)._right = this.entity(2);
					}
					}
				}
				this.state = 123;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 11, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
		switch (ruleIndex) {
		case 1:
			return this.expression_sempred(_localctx as ExpressionContext, predIndex);

		case 7:
			return this.entity_sempred(_localctx as EntityContext, predIndex);
		}
		return true;
	}
	private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
		switch (predIndex) {
		case 0:
			return this.precpred(this._ctx, 7);

		case 1:
			return this.precpred(this._ctx, 6);

		case 2:
			return this.precpred(this._ctx, 5);

		case 3:
			return this.precpred(this._ctx, 4);

		case 4:
			return this.precpred(this._ctx, 3);
		}
		return true;
	}
	private entity_sempred(_localctx: EntityContext, predIndex: number): boolean {
		switch (predIndex) {
		case 5:
			return this.precpred(this._ctx, 1);
		}
		return true;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03#\x7F\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x03\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x05\x03&\n\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x03\x03\x03\x07\x037\n\x03\f\x03\x0E\x03:\v\x03\x03\x04" +
		"\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x05\x04B\n\x04\x03\x05\x03\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05J\n\x05\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x03\x06\x07\x06Q\n\x06\f\x06\x0E\x06T\v\x06\x05\x06V\n\x06\x03" +
		"\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x07\x06_\n\x06\f" +
		"\x06\x0E\x06b\v\x06\x03\x06\x03\x06\x05\x06f\n\x06\x03\x07\x03\x07\x03" +
		"\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\t\x06\tq\n\t\r\t\x0E\tr\x05\t" +
		"u\n\t\x03\t\x03\t\x03\t\x07\tz\n\t\f\t\x0E\t}\v\t\x03\t\x02\x02\x04\x04" +
		"\x10\n\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x02\x05" +
		"\x03\x02\x16\x19\x03\x02\x11\x12\x03\x02\x13\x14\x02\x8B\x02\x12\x03\x02" +
		"\x02\x02\x04%\x03\x02\x02\x02\x06A\x03\x02\x02\x02\bI\x03\x02\x02\x02" +
		"\ne\x03\x02\x02\x02\fg\x03\x02\x02\x02\x0Ek\x03\x02\x02\x02\x10t\x03\x02" +
		"\x02\x02\x12\x13\x05\x04\x03\x02\x13\x14\x07\x02\x02\x03\x14\x03\x03\x02" +
		"\x02\x02\x15\x16\b\x03\x01\x02\x16&\x05\x06\x04\x02\x17&\x07\v\x02\x02" +
		"\x18\x19\x07\t\x02\x02\x19&\x05\x04\x03\n\x1A\x1B\x07\x05\x02\x02\x1B" +
		"\x1C\x05\x04\x03\x02\x1C\x1D\x07\x06\x02\x02\x1D\x1E\x05\x04\x03\x02\x1E" +
		"\x1F\x07\x07\x02\x02\x1F \x05\x04\x03\x04 &\x03\x02\x02\x02!\"\x07\x0F" +
		"\x02\x02\"#\x05\x04\x03\x02#$\x07\x10\x02\x02$&\x03\x02\x02\x02%\x15\x03" +
		"\x02\x02\x02%\x17\x03\x02\x02\x02%\x18\x03\x02\x02\x02%\x1A\x03\x02\x02" +
		"\x02%!\x03\x02\x02\x02&8\x03\x02\x02\x02\'(\f\t\x02\x02()\x07\x1A\x02" +
		"\x02)7\x05\x04\x03\n*+\f\b\x02\x02+,\t\x02\x02\x02,7\x05\x04\x03\t-.\f" +
		"\x07\x02\x02./\t\x03\x02\x02/7\x05\x04\x03\b01\f\x06\x02\x0212\t\x04\x02" +
		"\x0227\x05\x04\x03\x0734\f\x05\x02\x0245\x07\b\x02\x0257\x05\x04\x03\x06" +
		"6\'\x03\x02\x02\x026*\x03\x02\x02\x026-\x03\x02\x02\x0260\x03\x02\x02" +
		"\x0263\x03\x02\x02\x027:\x03\x02\x02\x0286\x03\x02\x02\x0289\x03\x02\x02" +
		"\x029\x05\x03\x02\x02\x02:8\x03\x02\x02\x02;<\x07\x11\x02\x02<B\x05\x06" +
		"\x04\x02=>\x07\x12\x02\x02>B\x05\x06\x04\x02?B\x05\n\x06\x02@B\x05\b\x05" +
		"\x02A;\x03\x02\x02\x02A=\x03\x02\x02\x02A?\x03\x02\x02\x02A@\x03\x02\x02" +
		"\x02B\x07\x03\x02\x02\x02CJ\x05\x10\t\x02DE\x07\x0F\x02\x02EF\x05\x04" +
		"\x03\x02FG\x07\x10\x02\x02GJ\x03\x02\x02\x02HJ\x07#\x02\x02IC\x03\x02" +
		"\x02\x02ID\x03\x02\x02\x02IH\x03\x02\x02\x02J\t\x03\x02\x02\x02KL\x05" +
		"\x0E\b\x02LU\x07\x0F\x02\x02MR\x05\x04\x03\x02NO\x07\x03\x02\x02OQ\x05" +
		"\x04\x03\x02PN\x03\x02\x02\x02QT\x03\x02\x02\x02RP\x03\x02\x02\x02RS\x03" +
		"\x02\x02\x02SV\x03\x02\x02\x02TR\x03\x02\x02\x02UM\x03\x02\x02\x02UV\x03" +
		"\x02\x02\x02VW\x03\x02\x02\x02WX\x07\x10\x02\x02Xf\x03\x02\x02\x02YZ\x05" +
		"\x10\t\x02Z[\x07\r\x02\x02[`\x05\f\x07\x02\\]\x07\x03\x02\x02]_\x05\f" +
		"\x07\x02^\\\x03\x02\x02\x02_b\x03\x02\x02\x02`^\x03\x02\x02\x02`a\x03" +
		"\x02\x02\x02ac\x03\x02\x02\x02b`\x03\x02\x02\x02cd\x07\x0E\x02\x02df\x03" +
		"\x02\x02\x02eK\x03\x02\x02\x02eY\x03\x02\x02\x02f\v\x03\x02\x02\x02gh" +
		"\x07\n\x02\x02hi\x07\x15\x02\x02ij\x05\x10\t\x02j\r\x03\x02\x02\x02kl" +
		"\x07\n\x02\x02l\x0F\x03\x02\x02\x02mn\b\t\x01\x02nu\x07\f\x02\x02oq\x07" +
		"\n\x02\x02po\x03\x02\x02\x02qr\x03\x02\x02\x02rp\x03\x02\x02\x02rs\x03" +
		"\x02\x02\x02su\x03\x02\x02\x02tm\x03\x02\x02\x02tp\x03\x02\x02\x02u{\x03" +
		"\x02\x02\x02vw\f\x03\x02\x02wx\x07!\x02\x02xz\x05\x10\t\x04yv\x03\x02" +
		"\x02\x02z}\x03\x02\x02\x02{y\x03\x02\x02\x02{|\x03\x02\x02\x02|\x11\x03" +
		"\x02\x02\x02}{\x03\x02\x02\x02\x0E%68AIRU`ert{";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!AnaplanFormulaParser.__ATN) {
			AnaplanFormulaParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(AnaplanFormulaParser._serializedATN));
		}

		return AnaplanFormulaParser.__ATN;
	}

}

export class FormulaContext extends ParserRuleContext {
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public EOF(): TerminalNode { return this.getToken(AnaplanFormulaParser.EOF, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AnaplanFormulaParser.RULE_formula; }
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterFormula) {
			listener.enterFormula(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitFormula) {
			listener.exitFormula(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitFormula) {
			return visitor.visitFormula(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExpressionContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AnaplanFormulaParser.RULE_expression; }
	public copyFrom(ctx: ExpressionContext): void {
		super.copyFrom(ctx);
	}
}
export class AtomExpContext extends ExpressionContext {
	public signedAtom(): SignedAtomContext {
		return this.getRuleContext(0, SignedAtomContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterAtomExp) {
			listener.enterAtomExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitAtomExp) {
			listener.exitAtomExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitAtomExp) {
			return visitor.visitAtomExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class StringliteralExpContext extends ExpressionContext {
	public STRINGLITERAL(): TerminalNode { return this.getToken(AnaplanFormulaParser.STRINGLITERAL, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterStringliteralExp) {
			listener.enterStringliteralExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitStringliteralExp) {
			listener.exitStringliteralExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitStringliteralExp) {
			return visitor.visitStringliteralExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NotExpContext extends ExpressionContext {
	public NOT(): TerminalNode { return this.getToken(AnaplanFormulaParser.NOT, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterNotExp) {
			listener.enterNotExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitNotExp) {
			listener.exitNotExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitNotExp) {
			return visitor.visitNotExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ConcatenateExpContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _right!: ExpressionContext;
	public AMPERSAND(): TerminalNode { return this.getToken(AnaplanFormulaParser.AMPERSAND, 0); }
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterConcatenateExp) {
			listener.enterConcatenateExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitConcatenateExp) {
			listener.exitConcatenateExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitConcatenateExp) {
			return visitor.visitConcatenateExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ComparisonExpContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _op!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public EQUALS(): TerminalNode | undefined { return this.tryGetToken(AnaplanFormulaParser.EQUALS, 0); }
	public NOTEQUALS(): TerminalNode | undefined { return this.tryGetToken(AnaplanFormulaParser.NOTEQUALS, 0); }
	public LT(): TerminalNode | undefined { return this.tryGetToken(AnaplanFormulaParser.LT, 0); }
	public GT(): TerminalNode | undefined { return this.tryGetToken(AnaplanFormulaParser.GT, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterComparisonExp) {
			listener.enterComparisonExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitComparisonExp) {
			listener.exitComparisonExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitComparisonExp) {
			return visitor.visitComparisonExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AddsubtractExpContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _op!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public PLUS(): TerminalNode | undefined { return this.tryGetToken(AnaplanFormulaParser.PLUS, 0); }
	public MINUS(): TerminalNode | undefined { return this.tryGetToken(AnaplanFormulaParser.MINUS, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterAddsubtractExp) {
			listener.enterAddsubtractExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitAddsubtractExp) {
			listener.exitAddsubtractExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitAddsubtractExp) {
			return visitor.visitAddsubtractExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MuldivExpContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _op!: Token;
	public _right!: ExpressionContext;
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	public TIMES(): TerminalNode | undefined { return this.tryGetToken(AnaplanFormulaParser.TIMES, 0); }
	public DIV(): TerminalNode | undefined { return this.tryGetToken(AnaplanFormulaParser.DIV, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterMuldivExp) {
			listener.enterMuldivExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitMuldivExp) {
			listener.exitMuldivExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitMuldivExp) {
			return visitor.visitMuldivExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class BinaryoperationExpContext extends ExpressionContext {
	public _left!: ExpressionContext;
	public _right!: ExpressionContext;
	public BINARYOPERATOR(): TerminalNode { return this.getToken(AnaplanFormulaParser.BINARYOPERATOR, 0); }
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterBinaryoperationExp) {
			listener.enterBinaryoperationExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitBinaryoperationExp) {
			listener.exitBinaryoperationExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitBinaryoperationExp) {
			return visitor.visitBinaryoperationExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class IfExpContext extends ExpressionContext {
	public _condition!: ExpressionContext;
	public _thenExpression!: ExpressionContext;
	public _elseExpression!: ExpressionContext;
	public IF(): TerminalNode { return this.getToken(AnaplanFormulaParser.IF, 0); }
	public THEN(): TerminalNode { return this.getToken(AnaplanFormulaParser.THEN, 0); }
	public ELSE(): TerminalNode { return this.getToken(AnaplanFormulaParser.ELSE, 0); }
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterIfExp) {
			listener.enterIfExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitIfExp) {
			listener.exitIfExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitIfExp) {
			return visitor.visitIfExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ParenthesisExpContext extends ExpressionContext {
	public LPAREN(): TerminalNode { return this.getToken(AnaplanFormulaParser.LPAREN, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(AnaplanFormulaParser.RPAREN, 0); }
	constructor(ctx: ExpressionContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterParenthesisExp) {
			listener.enterParenthesisExp(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitParenthesisExp) {
			listener.exitParenthesisExp(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitParenthesisExp) {
			return visitor.visitParenthesisExp(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SignedAtomContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AnaplanFormulaParser.RULE_signedAtom; }
	public copyFrom(ctx: SignedAtomContext): void {
		super.copyFrom(ctx);
	}
}
export class PlusSignedAtomContext extends SignedAtomContext {
	public PLUS(): TerminalNode { return this.getToken(AnaplanFormulaParser.PLUS, 0); }
	public signedAtom(): SignedAtomContext {
		return this.getRuleContext(0, SignedAtomContext);
	}
	constructor(ctx: SignedAtomContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterPlusSignedAtom) {
			listener.enterPlusSignedAtom(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitPlusSignedAtom) {
			listener.exitPlusSignedAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitPlusSignedAtom) {
			return visitor.visitPlusSignedAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class MinusSignedAtomContext extends SignedAtomContext {
	public MINUS(): TerminalNode { return this.getToken(AnaplanFormulaParser.MINUS, 0); }
	public signedAtom(): SignedAtomContext {
		return this.getRuleContext(0, SignedAtomContext);
	}
	constructor(ctx: SignedAtomContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterMinusSignedAtom) {
			listener.enterMinusSignedAtom(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitMinusSignedAtom) {
			listener.exitMinusSignedAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitMinusSignedAtom) {
			return visitor.visitMinusSignedAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FuncAtomContext extends SignedAtomContext {
	public func_(): Func_Context {
		return this.getRuleContext(0, Func_Context);
	}
	constructor(ctx: SignedAtomContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterFuncAtom) {
			listener.enterFuncAtom(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitFuncAtom) {
			listener.exitFuncAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitFuncAtom) {
			return visitor.visitFuncAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class AtomAtomContext extends SignedAtomContext {
	public atom(): AtomContext {
		return this.getRuleContext(0, AtomContext);
	}
	constructor(ctx: SignedAtomContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterAtomAtom) {
			listener.enterAtomAtom(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitAtomAtom) {
			listener.exitAtomAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitAtomAtom) {
			return visitor.visitAtomAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class AtomContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AnaplanFormulaParser.RULE_atom; }
	public copyFrom(ctx: AtomContext): void {
		super.copyFrom(ctx);
	}
}
export class EntityAtomContext extends AtomContext {
	public entity(): EntityContext {
		return this.getRuleContext(0, EntityContext);
	}
	constructor(ctx: AtomContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterEntityAtom) {
			listener.enterEntityAtom(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitEntityAtom) {
			listener.exitEntityAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitEntityAtom) {
			return visitor.visitEntityAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class ExpressionAtomContext extends AtomContext {
	public LPAREN(): TerminalNode { return this.getToken(AnaplanFormulaParser.LPAREN, 0); }
	public expression(): ExpressionContext {
		return this.getRuleContext(0, ExpressionContext);
	}
	public RPAREN(): TerminalNode { return this.getToken(AnaplanFormulaParser.RPAREN, 0); }
	constructor(ctx: AtomContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterExpressionAtom) {
			listener.enterExpressionAtom(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitExpressionAtom) {
			listener.exitExpressionAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitExpressionAtom) {
			return visitor.visitExpressionAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class NumberAtomContext extends AtomContext {
	public SCIENTIFIC_NUMBER(): TerminalNode { return this.getToken(AnaplanFormulaParser.SCIENTIFIC_NUMBER, 0); }
	constructor(ctx: AtomContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterNumberAtom) {
			listener.enterNumberAtom(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitNumberAtom) {
			listener.exitNumberAtom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitNumberAtom) {
			return visitor.visitNumberAtom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class Func_Context extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AnaplanFormulaParser.RULE_func_; }
	public copyFrom(ctx: Func_Context): void {
		super.copyFrom(ctx);
	}
}
export class FuncParameterisedContext extends Func_Context {
	public functionname(): FunctionnameContext {
		return this.getRuleContext(0, FunctionnameContext);
	}
	public LPAREN(): TerminalNode { return this.getToken(AnaplanFormulaParser.LPAREN, 0); }
	public RPAREN(): TerminalNode { return this.getToken(AnaplanFormulaParser.RPAREN, 0); }
	public expression(): ExpressionContext[];
	public expression(i: number): ExpressionContext;
	public expression(i?: number): ExpressionContext | ExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExpressionContext);
		} else {
			return this.getRuleContext(i, ExpressionContext);
		}
	}
	constructor(ctx: Func_Context) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterFuncParameterised) {
			listener.enterFuncParameterised(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitFuncParameterised) {
			listener.exitFuncParameterised(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitFuncParameterised) {
			return visitor.visitFuncParameterised(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class FuncSquareBracketsContext extends Func_Context {
	public entity(): EntityContext {
		return this.getRuleContext(0, EntityContext);
	}
	public LSQUARE(): TerminalNode { return this.getToken(AnaplanFormulaParser.LSQUARE, 0); }
	public dimensionmapping(): DimensionmappingContext[];
	public dimensionmapping(i: number): DimensionmappingContext;
	public dimensionmapping(i?: number): DimensionmappingContext | DimensionmappingContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DimensionmappingContext);
		} else {
			return this.getRuleContext(i, DimensionmappingContext);
		}
	}
	public RSQUARE(): TerminalNode { return this.getToken(AnaplanFormulaParser.RSQUARE, 0); }
	constructor(ctx: Func_Context) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterFuncSquareBrackets) {
			listener.enterFuncSquareBrackets(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitFuncSquareBrackets) {
			listener.exitFuncSquareBrackets(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitFuncSquareBrackets) {
			return visitor.visitFuncSquareBrackets(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DimensionmappingContext extends ParserRuleContext {
	public WORD(): TerminalNode { return this.getToken(AnaplanFormulaParser.WORD, 0); }
	public COLON(): TerminalNode { return this.getToken(AnaplanFormulaParser.COLON, 0); }
	public entity(): EntityContext {
		return this.getRuleContext(0, EntityContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AnaplanFormulaParser.RULE_dimensionmapping; }
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterDimensionmapping) {
			listener.enterDimensionmapping(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitDimensionmapping) {
			listener.exitDimensionmapping(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitDimensionmapping) {
			return visitor.visitDimensionmapping(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FunctionnameContext extends ParserRuleContext {
	public WORD(): TerminalNode { return this.getToken(AnaplanFormulaParser.WORD, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AnaplanFormulaParser.RULE_functionname; }
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterFunctionname) {
			listener.enterFunctionname(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitFunctionname) {
			listener.exitFunctionname(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitFunctionname) {
			return visitor.visitFunctionname(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EntityContext extends ParserRuleContext {
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return AnaplanFormulaParser.RULE_entity; }
	public copyFrom(ctx: EntityContext): void {
		super.copyFrom(ctx);
	}
}
export class QuotedEntityContext extends EntityContext {
	public QUOTELITERAL(): TerminalNode { return this.getToken(AnaplanFormulaParser.QUOTELITERAL, 0); }
	constructor(ctx: EntityContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterQuotedEntity) {
			listener.enterQuotedEntity(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitQuotedEntity) {
			listener.exitQuotedEntity(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitQuotedEntity) {
			return visitor.visitQuotedEntity(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class WordsEntityContext extends EntityContext {
	public WORD(): TerminalNode[];
	public WORD(i: number): TerminalNode;
	public WORD(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(AnaplanFormulaParser.WORD);
		} else {
			return this.getToken(AnaplanFormulaParser.WORD, i);
		}
	}
	constructor(ctx: EntityContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterWordsEntity) {
			listener.enterWordsEntity(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitWordsEntity) {
			listener.exitWordsEntity(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitWordsEntity) {
			return visitor.visitWordsEntity(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}
export class DotQualifiedEntityContext extends EntityContext {
	public _left!: EntityContext;
	public _right!: EntityContext;
	public DOT(): TerminalNode { return this.getToken(AnaplanFormulaParser.DOT, 0); }
	public entity(): EntityContext[];
	public entity(i: number): EntityContext;
	public entity(i?: number): EntityContext | EntityContext[] {
		if (i === undefined) {
			return this.getRuleContexts(EntityContext);
		} else {
			return this.getRuleContext(i, EntityContext);
		}
	}
	constructor(ctx: EntityContext) {
		super(ctx.parent, ctx.invokingState);
		this.copyFrom(ctx);
	}
	// @Override
	public enterRule(listener: AnaplanFormulaListener): void {
		if (listener.enterDotQualifiedEntity) {
			listener.enterDotQualifiedEntity(this);
		}
	}
	// @Override
	public exitRule(listener: AnaplanFormulaListener): void {
		if (listener.exitDotQualifiedEntity) {
			listener.exitDotQualifiedEntity(this);
		}
	}
	// @Override
	public accept<Result>(visitor: AnaplanFormulaVisitor<Result>): Result {
		if (visitor.visitDotQualifiedEntity) {
			return visitor.visitDotQualifiedEntity(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


