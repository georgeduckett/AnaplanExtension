export class FormulaError implements monaco.editor.IMarkerData {
  startLineNumber: number;
  endLineNumber: number;
  startColumn: number;
  endColumn: number;
  message: string;
  severity: number;
  constructor(startLine: number, endLine: number, startCol: number, endCol: number, message: string, severity: number = 8) { //8 = monaco.MarkerSeverity.Error
    this.startLineNumber = startLine;
    this.endLineNumber = endLine;
    this.startColumn = startCol;
    this.endColumn = endCol;
    this.message = message;
    this.severity = severity;
  }
}