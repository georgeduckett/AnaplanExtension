grammar AnaplanFormula;

formula: expression EOF;

expression:
	signedAtom													# atomExp
	| STRINGLITERAL												# stringliteralExp
	| NOT expression											# notExp
	| left = expression op = (TIMES | DIV) right = expression	# muldivExp
	| left = expression op = (PLUS | MINUS) right = expression	# addsubtractExp
	| left = expression AMPERSAND right = expression			# concatenateExp
	| left = expression op = (
		GTEQUALS
		| LTEQUALS
		| LT
		| GT
		| EQUALS
		| NOTEQUALS
	) right = expression																			# comparisonExp
	| left = expression BINARYOPERATOR right = expression											# binaryoperationExp
	| IF condition = expression THEN thenExpression = expression ELSE elseExpression = expression	#
		ifExp
	| LPAREN expression RPAREN # parenthesisExp;

signedAtom:
	PLUS signedAtom		# plusSignedAtom
	| MINUS signedAtom	# minusSignedAtom
	| func_				# funcAtom
	| atom				# atomAtom;

atom: entity # entityAtom | SCIENTIFIC_NUMBER # numberAtom;

func_:
	functionname LPAREN (expression (',' expression)*)? RPAREN			# funcParameterised
	| entity LSQUARE dimensionmapping (',' dimensionmapping)* RSQUARE	# funcSquareBrackets;

dimensionmapping: dimensionmappingselector COLON entity;

dimensionmappingselector:
	WORD; // Could make WORD more specific here

functionname: WORD; // Could make WORD more specific here

entity:
	quotedEntityRule																	# quotedEntity
	| wordsEntityRule																	# wordsEntity
	| left = dotQualifiedEntityLeftPart DOT right = dotQualifiedEntityRightPart			# dotQualifiedEntity
	| left = dotQualifiedEntityLeftPart DOT right = dotQualifiedEntityRightPartEmpty	#
		dotQualifiedEntityIncomplete;

quotedEntityRule: QUOTELITERAL;
wordsEntityRule: WORD+;

dotQualifiedEntityLeftPart: dotQualifiedEntityPart;
dotQualifiedEntityRightPart: dotQualifiedEntityPart;
dotQualifiedEntityRightPartEmpty:
	/* This is a placeholder for code completion */;

dotQualifiedEntityPart:
	QUOTELITERAL	# quotedEntityPart
	| WORD+			# wordsEntityPart;

WS: [ \r\n\t]+ -> channel(HIDDEN);

/////////////////
// Fragments // ///////////////

fragment NUMBER: DIGIT+ (DOT DIGIT+)?;

fragment DIGIT: [0-9];
fragment LOWERCASE: [a-z];
fragment UPPERCASE: [A-Z];
fragment WORDSYMBOL: [%#£$?_];

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