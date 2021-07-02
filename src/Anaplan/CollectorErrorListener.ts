import { FormulaError } from "./FormulaError";
import { ANTLRErrorListener, RecognitionException, Recognizer } from "antlr4ts";

export class CollectorErrorListener implements ANTLRErrorListener<any> {

    private errors: FormulaError[] = []

    constructor(errors: FormulaError[]) {
        this.errors = errors;
    }
    syntaxError(recognizer: Recognizer<any, any>, offendingSymbol: any, line: number, charPositionInLine: number, message: string, e: RecognitionException | undefined): void {

        this.errors.push(
            new FormulaError(
                line,
                line,
                charPositionInLine,
                charPositionInLine + 1,//Let's suppose the length of the error is only 1 char for simplicity
                message,
                "1" // This the error code you can customize them as you want
            )
        )
    }

}