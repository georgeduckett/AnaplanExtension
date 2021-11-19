/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import { CharStreams } from 'antlr4ts/CharStreams';
import { AnaplanFormulaLexer } from '../Anaplan/antlrclasses/AnaplanFormulaLexer';
import { AnaplanMetaData } from '../Anaplan/AnaplanMetaData';
import ILineTokens = monaco.languages.ILineTokens;
import IToken = monaco.languages.IToken;
import { CommonTokenStream, ParserRuleContext } from 'antlr4ts';
import { AnaplanFormulaParser, EntityContext } from '../Anaplan/antlrclasses/AnaplanFormulaParser';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import { TerminalNode } from 'antlr4ts/tree/TerminalNode';
import { RuleContext } from 'antlr4ts/RuleContext';

export class FormulaState implements monaco.languages.IState {
    clone(): monaco.languages.IState {
        return new FormulaState();
    }

    equals(other: monaco.languages.IState): boolean {
        return true;
    }

}

export class FormulaTokensProvider implements monaco.languages.TokensProvider {
    getInitialState(): monaco.languages.IState {
        return new FormulaState();
    }

    tokenize(line: string, state: monaco.languages.IState): monaco.languages.ILineTokens {
        // So far we ignore the state, which is not great for performance reasons
        return tokensForLine(line);
    }
}

const EOF = -1;

class FormulaToken implements IToken {
    scopes: string;
    startIndex: number;

    constructor(ruleName: String, startIndex: number) {
        this.scopes = ruleName.toLowerCase() + ".calc";
        this.startIndex = startIndex;
    }
}

class FormulaLineTokens implements ILineTokens {
    endState: monaco.languages.IState;
    tokens: monaco.languages.IToken[];

    constructor(tokens: monaco.languages.IToken[]) {
        this.endState = new FormulaState();
        this.tokens = tokens;
    }
}

export function tokensForLine(input: string): monaco.languages.ILineTokens {
    const lexer = new AnaplanFormulaLexer(CharStreams.fromString(input));
    let done = false;
    let myTokens: monaco.languages.IToken[] = [];
    let priorTokenType: string | undefined = undefined;
    let priorTokenStartIndex = 0;
    do {
        let token = lexer.nextToken();
        if (token == null) {
            done = true
        } else {
            // We exclude EOF
            if (token.type == EOF) {
                done = true;
            } else {
                let tokenTypeName = lexer.ruleNames[token.type];
                if (tokenTypeName != priorTokenType) {

                    myTokens.push(new FormulaToken(tokenTypeName, priorTokenStartIndex));
                    priorTokenType = tokenTypeName;
                    priorTokenStartIndex = token.startIndex;
                }

            }
        }
    } while (!done);

    if (priorTokenType != undefined) {
        myTokens.push(new FormulaToken(priorTokenType, priorTokenStartIndex));
    }

    return new FormulaLineTokens(myTokens);
}