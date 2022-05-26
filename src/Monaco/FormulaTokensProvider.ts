/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />
import { CharStreams } from 'antlr4ts/CharStreams';
import { AnaplanFormulaLexer } from '../Anaplan/antlrclasses/AnaplanFormulaLexer';
import ILineTokens = monaco.languages.ILineTokens;
import IToken = monaco.languages.IToken;

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
        this.scopes = ruleName.toLowerCase() + ".formula";
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
                let myToken = new FormulaToken(tokenTypeName, token.startIndex);
                myTokens.push(myToken);
            }
        }
    } while (!done);

    return new FormulaLineTokens(myTokens);
}