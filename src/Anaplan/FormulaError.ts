export class FormulaError {
  startLine: number;
  endLine: number;
  startCol: number;
  endCol: number;
  message: string;
  errorCode: string;
  constructor(startLine: number, endLine: number, startCol: number, endCol: number, message: string, errorCode: string) {
    this.startLine = startLine;
    this.endLine = endLine;
    this.startCol = startCol;
    this.endCol = endCol;
    this.message = message;
    this.errorCode = errorCode;
  }
}