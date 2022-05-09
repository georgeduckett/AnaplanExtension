import { FormulaError } from "./FormulaError";
import { ANTLRErrorListener, RecognitionException, Recognizer, Token } from "antlr4ts";

export class CollectorErrorListener implements ANTLRErrorListener<Token> {

    private errors: FormulaError[] = []

    constructor(errors: FormulaError[]) {
        this.errors = errors;
    }
    syntaxError(recognizer: Recognizer<any, any>, offendingSymbol: Token | undefined, line: number, charPositionInLine: number, message: string, e: RecognitionException | undefined): void {
        let length = ((offendingSymbol?.stopIndex ?? 0) - (offendingSymbol?.startIndex ?? 0));
        if (length === 0) {
            length = 1;
        }
        else {
            length++;
        }
        this.errors.push(
            new FormulaError(
                line,
                line,
                charPositionInLine + 1,
                charPositionInLine + 1 + length,
                message,
            )
        )
    }

}