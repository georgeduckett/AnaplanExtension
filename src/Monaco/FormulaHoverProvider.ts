import { CharStreams, CommonTokenStream, RuleContext, ParserRuleContext } from "antlr4ts";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { AnaplanMetaData } from "../Anaplan/AnaplanMetaData";
import { AnaplanFormulaLexer } from "../Anaplan/antlrclasses/AnaplanFormulaLexer";
import { AnaplanFormulaParser, EntityContext } from "../Anaplan/antlrclasses/AnaplanFormulaParser";


export class FormulaHoverProvider implements monaco.languages.HoverProvider {
    _anaplanMetaData: AnaplanMetaData | undefined;

    updateMetaData(newMetaData: AnaplanMetaData) { this._anaplanMetaData = newMetaData; }

    provideHover(model: monaco.editor.ITextModel, position: monaco.Position, token: monaco.CancellationToken): monaco.languages.ProviderResult<monaco.languages.Hover> {
        const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(model.getValue()));
        mylexer.removeErrorListeners();
        const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
        myparser.removeErrorListeners();

        let foundTree = this.parseTreeFromPosition(myparser.formula(), position.column, position.lineNumber);

        if (foundTree instanceof TerminalNode) {
            foundTree = foundTree.parent?.ruleContext;
        }

        if (foundTree instanceof RuleContext) {
            let foundEntity = false;

            let previousTree: ParseTree | undefined = undefined;

            while ((!foundEntity || (foundTree instanceof EntityContext)) && foundTree.parent != undefined) {
                if (foundTree instanceof EntityContext) {
                    foundEntity = true;
                }
                previousTree = foundTree;
                foundTree = foundTree?.parent;
            }

            if (previousTree instanceof EntityContext) {
                let entityName = this._anaplanMetaData!.getEntityName(previousTree).replace(new RegExp("'", 'g'), "");
                // Look up the dimensions of this entity
                let lineItemInfo = this._anaplanMetaData!.getItemInfoFromEntityName(entityName);

                if (lineItemInfo != undefined) {
                    let dimensions = lineItemInfo?.fullAppliesTo.map(this._anaplanMetaData!.getEntityNameFromId, this._anaplanMetaData).sort().join(', ');
                    if (dimensions === "") {
                        dimensions = "\\<None>";
                    }

                    let dataTypeDisplayString = lineItemInfo.format.dataType;
                    // TODO: Why is the data type a "User" for 'C1 Department'.All Customers
                    if (dataTypeDisplayString === "ENTITY") {
                        dataTypeDisplayString = this._anaplanMetaData?.getEntityNameFromId(lineItemInfo.format.hierarchyEntityLongId!)!;
                    } else {
                        dataTypeDisplayString = dataTypeDisplayString.toLowerCase().replace(/\b\S/g, t => t.toUpperCase());
                    }
                    return {
                        range: new monaco.Range(previousTree.start.line, previousTree.start.charPositionInLine + 1, previousTree.stop!.line, previousTree.stop!.charPositionInLine! + previousTree.stop!.text!.length + 1),
                        contents: [
                            { value: "Dimensions: " + dimensions },
                            { value: "Type: " + dataTypeDisplayString }
                        ]
                    }
                }
                else if (previousTree.parent?.children![0].text === "SELECT") {
                    // This is a select, so the entity name is actually just the first part, without quotes
                    return {
                        range: new monaco.Range(previousTree.start.line, previousTree.start.charPositionInLine + 1, previousTree.stop!.line, previousTree.stop!.charPositionInLine! + previousTree.stop!.text!.length + 1),
                        contents: [
                            { value: "Type: " + entityName.substring(0, entityName.indexOf('.')) }
                        ]
                    }
                }
            }
        }
        return null;
    }

    /**
    * Returns the parse tree which covers the given position or undefined if none could be found.
    * https://github.com/mike-lischke/vscode-antlr4/blob/master/src/backend/SourceContext.ts
    */
    parseTreeFromPosition(root: ParseTree, column: number, row: number): ParseTree | undefined {
        // Does the root node actually contain the position? If not we don't need to look further.
        if (root instanceof TerminalNode) {
            let terminal = (root as TerminalNode);
            let token = terminal.symbol;
            if (token.line != row)
                return undefined;

            let tokenStop = token.charPositionInLine + (token.stopIndex - token.startIndex + 1);
            if (token.charPositionInLine <= column && tokenStop >= column) {
                return terminal;
            }
            return undefined;
        } else {
            let context = (root as ParserRuleContext);
            if (!context.start || !context.stop) { // Invalid tree?
                return undefined;
            }

            if (context.start.line > row || (context.start.line == row && column < context.start.charPositionInLine)) {
                return undefined;
            }

            let tokenStop = context.stop.charPositionInLine + (context.stop.stopIndex - context.stop.startIndex + 1);
            if (context.stop.line < row || (context.stop.line == row && tokenStop < column)) {
                return undefined;
            }

            if (context.children) {
                for (let child of context.children) {
                    let result = this.parseTreeFromPosition(child, column, row);
                    if (result) {
                        return result;
                    }
                }
            }
            return context;

        }
    }
}