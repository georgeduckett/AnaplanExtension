export class FormulaError implements monaco.editor.IMarkerData {
  startLineNumber: number;
  endLineNumber: number;
  startColumn: number;
  endColumn: number;
  message: string;
  severity = 8; //monaco.MarkerSeverity.Error
  constructor(startLine: number, endLine: number, startCol: number, endCol: number, message: string) {
    this.startLineNumber = startLine;
    this.endLineNumber = endLine;
    this.startColumn = startCol;
    this.endColumn = endCol;
    this.message = message;
  }
}