grammar AnaplanFormula;

formula: expression EOF;

expression:
	signedAtom											# atomExp
	| STRINGLITERAL										# stringliteralExp
	| NOT expression									# notExp
	| left = expression AMPERSAND right = expression	# concatenateExp
	| left = expression op = (
		EQUALS
		| NOTEQUALS
		| GTEQUALS
		| LTEQUALS
		| LT
		| GT
	) right = expression																			# comparisonExp
	| left = expression op = (PLUS | MINUS) right = expression										# addsubtractExp
	| left = expression op = (TIMES | DIV) right = expression										# muldivExp
	| left = expression BINARYOPERATOR right = expression											# binaryoperationExp
	| IF condition = expression THEN thenExpression = expression ELSE elseExpression = expression	#
		ifExp
	| LPAREN expression RPAREN # parenthesisExp;

signedAtom:
	PLUS signedAtom		# plusSignedAtom
	| MINUS signedAtom	# minusSignedAtom
	| func_				# funcAtom
	| atom				# atomAtom;

atom:
	entity						# entityAtom
	| LPAREN expression RPAREN	# expressionAtom // Do we need this?
	| SCIENTIFIC_NUMBER			# numberAtom;

func_:
	functionname LPAREN (expression (',' expression)*)? RPAREN			# funcParameterised
	| entity LSQUARE dimensionmapping (',' dimensionmapping)* RSQUARE	# funcSquareBrackets;

dimensionmapping:
	WORD COLON entity; // Could make WORD more specific here

functionname: WORD; // Could make WORD more specific here

entity:
	QUOTELITERAL						# quotedEntity
	| WORD+								# wordsEntity
	| left = entity DOT right = entity	# dotQualifiedEntity;

WS: [ \r\n\t]+ -> skip;

/////////////////
// Fragments // ///////////////

fragment NUMBER: DIGIT+ (DOT DIGIT+)?;

fragment DIGIT: [0-9];
fragment LOWERCASE: [a-z];
fragment UPPERCASE: [A-Z];
fragment WORDSYMBOL: [#?_£%];

//////////////////
// Tokens // ////////////////

IF: 'IF' | 'if';
THEN: 'THEN' | 'then';
ELSE: 'ELSE' | 'else';
BINARYOPERATOR: 'AND' | 'and' | 'OR' | 'or';
NOT: 'NOT' | 'not';

WORD: (DIGIT* (LOWERCASE | UPPERCASE | WORDSYMBOL)) (
		LOWERCASE
		| UPPERCASE
		| DIGIT
		| WORDSYMBOL
	)*;

STRINGLITERAL: DOUBLEQUOTES (~'"' | ('""'))* DOUBLEQUOTES;

QUOTELITERAL: '\'' (~'\'' | ('\'\''))* '\'';

LSQUARE: '[';
RSQUARE: ']';
LPAREN: '(';
RPAREN: ')';
PLUS: '+';
MINUS: '-';
TIMES: '*';
DIV: '/';
COLON: ':';
EQUALS: '=';
NOTEQUALS: LT GT;
GTEQUALS: GT EQUALS;
LTEQUALS: LT EQUALS;
LT: '<';
GT: '>';
AMPERSAND: '&';
DOUBLEQUOTES: '"';
UNDERSCORE: '_';
QUESTIONMARK: '?';
HASH: '#';
POUND: '£';
PERCENT: '%';
DOT: '.';
PIPE: '|';

SCIENTIFIC_NUMBER: NUMBER (('e' | 'E') (PLUS | MINUS)? NUMBER)?;