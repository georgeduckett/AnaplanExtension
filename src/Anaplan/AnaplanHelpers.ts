import { CharStreams, CommonTokenStream, ConsoleErrorListener, ParserRuleContext } from "antlr4ts";
import { Interval } from "antlr4ts/misc/Interval";
import { hoverProvider } from "../content-script-main";
import { AnaplanFormulaTypeEvaluatorVisitor } from "./AnaplanFormulaTypeEvaluatorVisitor";
import { AnaplanMetaData } from "./AnaplanMetaData";
import { AnaplanFormulaLexer } from "./antlrclasses/AnaplanFormulaLexer";
import { AnaplanFormulaParser } from './antlrclasses/AnaplanFormulaParser';
import { CollectorErrorListener } from "./CollectorErrorListener";
import { FormulaError } from "./FormulaError";

export function getOriginalText(ctx: ParserRuleContext): string {
    if (ctx.start.inputStream != undefined && ctx.stop != undefined) {
        return ctx.start.inputStream.getText(new Interval(ctx.start.startIndex, ctx.stop.stopIndex));
    }
    else {
        return "";
    }
}

export function unQuoteEntity(entity: string | null): string {
    if (entity === null) {
        return '';
    }
    if (entity[0] == "'") {
        return entity.slice(1, -1)
    }
    else {
        return entity;
    }
}

export const anaplanTimeEntityBaseId: number = 20000000000;

export class Format {
    hierarchyEntityLongId?: number;
    entityFormatFilter?: any;
    selectiveAccessApplied?: boolean;
    showAll?: boolean;
    dataType: string;
    constructor(dataType: string) { this.dataType = dataType; }
}

export class AnaplanDataTypeStrings {
    static BOOLEAN: Format = new Format("BOOLEAN");
    static TEXT: Format = new Format("TEXT");
    static NUMBER: Format = new Format("NUMBER");
    static NONE: Format = new Format("NONE");
    static ENTITY: Format = new Format("ENTITY");
    static TIME_ENTITY: Format = new Format("TIME_ENTITY");
    static DATE: Format = new Format("DATE"); // TODO: Maybe separate time formats (day/month/year etc)?

    static UNKNOWN: Format = new Format("UNKNOWN");
}

export function formatFromFunctionName(functionName: string): Format {
    switch (functionName) {
        case "ABS": return AnaplanDataTypeStrings.NUMBER;
        case "ADDMONTHS": return AnaplanDataTypeStrings.DATE;
        case "ADDYEARS": return AnaplanDataTypeStrings.DATE;
        case "AGENTS": return AnaplanDataTypeStrings.NUMBER;
        case "AGENTSSB": return AnaplanDataTypeStrings.NUMBER;
        case "ANSWERTIME": return AnaplanDataTypeStrings.NUMBER;
        case "ARRIVALRATE": return AnaplanDataTypeStrings.NUMBER;
        case "AVGDURATION": return AnaplanDataTypeStrings.NUMBER;
        case "AVGWAIT": return AnaplanDataTypeStrings.NUMBER;
        case "CODE": return AnaplanDataTypeStrings.TEXT;
        case "COLLECT": return AnaplanDataTypeStrings.NUMBER;
        case "COMPARE": return AnaplanDataTypeStrings.NUMBER;
        case "COUPDAYS": return AnaplanDataTypeStrings.NUMBER;
        case "COUPDAYSBS": return AnaplanDataTypeStrings.NUMBER;
        case "COUPDAYSNC": return AnaplanDataTypeStrings.NUMBER;
        case "COUPNCD": return AnaplanDataTypeStrings.DATE;
        case "COUPNUM": return AnaplanDataTypeStrings.NUMBER;
        case "COUPPDC": return AnaplanDataTypeStrings.DATE;
        case "CUMIPMT": return AnaplanDataTypeStrings.NUMBER;
        case "CUMPRINC": return AnaplanDataTypeStrings.NUMBER;
        case "CUMULATE": return AnaplanDataTypeStrings.NUMBER;
        case "CURRENTPERIODEND": return AnaplanDataTypeStrings.DATE;
        case "CURRENTPERIODSTART": return AnaplanDataTypeStrings.DATE;
        case "DATE": return AnaplanDataTypeStrings.DATE;
        case "DAY": return AnaplanDataTypeStrings.NUMBER;
        case "DAYS": return AnaplanDataTypeStrings.NUMBER;
        case "DAYSINMONTH": return AnaplanDataTypeStrings.NUMBER;
        case "DAYSINYEAR": return AnaplanDataTypeStrings.NUMBER;
        case "DECUMULATE": return AnaplanDataTypeStrings.NUMBER;
        case "DIVIDE": return AnaplanDataTypeStrings.NUMBER;
        case "DURATION": return AnaplanDataTypeStrings.NUMBER;
        case "END": return AnaplanDataTypeStrings.DATE;
        case "EXP": return AnaplanDataTypeStrings.NUMBER;
        case "FIND": return AnaplanDataTypeStrings.NUMBER;
        case "FIRSTNONZERO": return AnaplanDataTypeStrings.NUMBER;
        case "FV": return AnaplanDataTypeStrings.NUMBER;
        case "HALFYEARTODATE": return AnaplanDataTypeStrings.NUMBER;
        case "INPERIOD": return AnaplanDataTypeStrings.BOOLEAN;
        case "ISNOTBLANK": return AnaplanDataTypeStrings.BOOLEAN;
        case "ISBLANK": return AnaplanDataTypeStrings.BOOLEAN;
        case "NOT": return AnaplanDataTypeStrings.BOOLEAN;
        case "INPERIOD": return AnaplanDataTypeStrings.BOOLEAN;
        case "IPMT": return AnaplanDataTypeStrings.NUMBER;
        case "IRR": return AnaplanDataTypeStrings.NUMBER;
        case "ISACTUALVERSION": return AnaplanDataTypeStrings.BOOLEAN;
        case "ISANCESTOR": return AnaplanDataTypeStrings.BOOLEAN;
        case "ISCURRENTVERISON": return AnaplanDataTypeStrings.BOOLEAN;
        case "ISFIRSTOCCURRENCE": return AnaplanDataTypeStrings.BOOLEAN;
        case "LEFT": return AnaplanDataTypeStrings.TEXT;
        case "LEN": return AnaplanDataTypeStrings.NUMBER;
        case "LN": return AnaplanDataTypeStrings.NUMBER;
        case "LOG": return AnaplanDataTypeStrings.NUMBER;
        case "LOWER": return AnaplanDataTypeStrings.TEXT;
        case "MAILTO": return AnaplanDataTypeStrings.TEXT;
        case "MAKELINK": return AnaplanDataTypeStrings.TEXT;
        case "MDURATION": return AnaplanDataTypeStrings.NUMBER;
        case "MID": return AnaplanDataTypeStrings.TEXT;
        case "MOD": return AnaplanDataTypeStrings.NUMBER;
        case "MONTH": return AnaplanDataTypeStrings.NUMBER;
        case "MROUND": return AnaplanDataTypeStrings.NUMBER;
        case "NAME": return AnaplanDataTypeStrings.TEXT;
        case "NOT": return AnaplanDataTypeStrings.BOOLEAN;
        case "NPER": return AnaplanDataTypeStrings.NUMBER;
        case "NPV": return AnaplanDataTypeStrings.NUMBER;
        case "OR": return AnaplanDataTypeStrings.BOOLEAN;
        case "PERIOD": return AnaplanDataTypeStrings.TIME_ENTITY;
        case "PMT": return AnaplanDataTypeStrings.NUMBER;
        case "POST": return AnaplanDataTypeStrings.NUMBER;
        case "POWER": return AnaplanDataTypeStrings.NUMBER;
        case "PPMT": return AnaplanDataTypeStrings.NUMBER;
        case "PRICE": return AnaplanDataTypeStrings.NUMBER;
        case "PROFILE": return AnaplanDataTypeStrings.NUMBER;
        case "PV": return AnaplanDataTypeStrings.NUMBER;
        case "QUARTERTODATE": return AnaplanDataTypeStrings.NUMBER;
        case "RANK": return AnaplanDataTypeStrings.NUMBER;
        case "RANKCUMULATE": return AnaplanDataTypeStrings.NUMBER;
        case "RATE": return AnaplanDataTypeStrings.NUMBER;
        case "RIGHT": return AnaplanDataTypeStrings.TEXT;
        case "ROUND": return AnaplanDataTypeStrings.NUMBER;
        case "SIGN": return AnaplanDataTypeStrings.NUMBER;
        case "SLA": return AnaplanDataTypeStrings.NUMBER;
        case "SPREAD": return AnaplanDataTypeStrings.NUMBER;
        case "SQRT": return AnaplanDataTypeStrings.NUMBER;
        case "START": return AnaplanDataTypeStrings.DATE;
        case "SUBSTITUTE": return AnaplanDataTypeStrings.TEXT;
        case "TEXT": return AnaplanDataTypeStrings.TEXT;
        case "TEXTLIST": return AnaplanDataTypeStrings.TEXT;
        case "TIMESUM": return AnaplanDataTypeStrings.NUMBER;
        case "TRIM": return AnaplanDataTypeStrings.TEXT;
        case "UPPER": return AnaplanDataTypeStrings.TEXT;
        case "VALUE": return AnaplanDataTypeStrings.NUMBER;
        case "WEEKDAY": return AnaplanDataTypeStrings.NUMBER;
        case "WEEKTODATE": return AnaplanDataTypeStrings.NUMBER;
        case "YEAR": return AnaplanDataTypeStrings.NUMBER;
        case "YEARFRAC": return AnaplanDataTypeStrings.NUMBER;
        case "YEARTODATE": return AnaplanDataTypeStrings.NUMBER;
        case "YIELD": return AnaplanDataTypeStrings.NUMBER;

        default: return AnaplanDataTypeStrings.UNKNOWN;
    }
}

export function getAnaplanMetaData(currentModule: string | number, lineItemName: string) {
    let currentModuleName = "";
    let currentModuleId = 0;

    if (typeof currentModule === "string") {
        currentModuleName = currentModule;
        for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0].length; i++) {
            if (anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i] === currentModuleName) {
                currentModuleId = anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0][i];
            }
        }
    }
    else if (typeof currentModule === "number") {
        currentModuleId = currentModule;
        for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0].length; i++) {
            if (anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0][i] === currentModuleId) {
                currentModuleName = anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i];
            }
        }
    }

    let currentLineItemName = currentModuleName + "." + lineItemName;

    let moduleLineItems = new Map<string, LineItemInfo>();

    for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.moduleInfos.length; i++) {
        for (var j = 0; j < anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0].length; j++) {
            var entityName = anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i] + "." + anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0][j];
            var dataTypeString = anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos[j].format.dataType;
            if (dataTypeString != AnaplanDataTypeStrings.NONE.dataType) {
                moduleLineItems.set(entityName, anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos[j]);

                if (dataTypeString === AnaplanDataTypeStrings.TIME_ENTITY.dataType) {

                }
            }
        }
    }

    let entityNames = new Map<number, string>();
    let entityIds = new Map<string, number>();
    let hierarchyParents = new Map<number, number>();

    for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0].length; i++) {
        entityNames.set(
            anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i]);
        entityIds.set(
            anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i],
            anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0][i]);
    }

    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0].length; i++) {
        entityNames.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.entityLongIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i]);
        entityIds.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i],
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.entityLongIds[0][i]);
        hierarchyParents.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].entityLongId,
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].parentHierarchyEntityLongId);
    }

    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.labels[0].length; i++) {
        entityNames.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.entityLongIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.labels[0][i]);
        entityIds.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.labels[0][i],
            anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.entityLongIds[0][i]);
    }

    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0].length; i++) {
        entityNames.set(
            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.entityLongIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0][i]);
        entityIds.set(
            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0][i],
            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.entityLongIds[0][i]);
    }

    // Add in the special time dimensions
    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes.length; i++) {
        entityNames.set(anaplanTimeEntityBaseId + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityIndex,
            'Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityLabel);
        entityIds.set('Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityLabel,
            anaplanTimeEntityBaseId + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityIndex);
    }

    // Add in special entity names
    entityNames.set(20000000020, 'Version');
    entityIds.set('Version', 20000000020);



    let subsetParentDimensionId = new Map<number, SubsetInfo>();
    // Regular subsets (of hierarchies)
    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos.length; i++) {
        subsetParentDimensionId.set(anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos[i].entityLongId,
            anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos[i]);
    }

    // Line item subsets (of measures)
    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetInfos.length; i++) {
        subsetParentDimensionId.set(anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetInfos[i].entityLongId,
            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetInfos[i]);
    }


    return new AnaplanMetaData(moduleLineItems, subsetParentDimensionId, entityNames, entityIds, hierarchyParents, currentModuleName, moduleLineItems.get(currentLineItemName)!);
}
export function setModelErrors(model: monaco.editor.ITextModel, currentModuleId: number, lineItemName: string) {
    let code = model.getValue();

    if (code.length === 0) {
        return;
    }

    let anaplanMetaData = getAnaplanMetaData(currentModuleId, lineItemName);

    hoverProvider.updateMetaData(anaplanMetaData);

    let targetFormat = anaplanMetaData.getCurrentItem().format;

    let formulaEvaluator = new AnaplanFormulaTypeEvaluatorVisitor(anaplanMetaData);
    const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(code));
    let errors: FormulaError[] = [];
    mylexer.removeErrorListeners();
    // TODO: add error listener to mylexer?
    const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
    myparser.removeErrorListeners();
    myparser.addErrorListener(new CollectorErrorListener(errors));

    let monacoErrors = [];

    try {
        const myresult = formulaEvaluator.visit(myparser.formula());
        // TODO: Use https://www.npmjs.com/package/antlr4-c3 for code completion?

        // Add the errors with the whole formula if needed
        if (myresult.dataType != AnaplanDataTypeStrings.UNKNOWN.dataType &&
            myresult.dataType != anaplanMetaData.getCurrentItem().format.dataType) {
            // Ensure the data type is the same if we did actually work out what it is
            monacoErrors.push({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: model.getLineCount(),
                endColumn: model.getLineMaxColumn(model.getLineCount()),
                message: `Formula evaluates to ${myresult.dataType} but the line item type is ${targetFormat.dataType}`,
                severity: monaco.MarkerSeverity.Error
            });
        } else if (myresult.dataType === AnaplanDataTypeStrings.ENTITY.dataType) {
            // Ensure the entity types is the same if the data types are entity
            if (myresult.hierarchyEntityLongId != targetFormat.hierarchyEntityLongId) {
                monacoErrors.push({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: model.getLineCount(),
                    endColumn: model.getLineMaxColumn(model.getLineCount()),
                    message: `Formula evaluates to ${anaplanMetaData.getEntityNameFromId(myresult.hierarchyEntityLongId!)} but the line item type is ${anaplanMetaData.getEntityNameFromId(targetFormat.hierarchyEntityLongId!)}`,
                    severity: monaco.MarkerSeverity.Error
                });
            }
        }
    }
    catch { } // There was an error parsing the formula, but that should be ok since we pick up the errors as part of the parsing

    for (let e of errors) {
        monacoErrors.push({
            startLineNumber: e.startLine,
            startColumn: e.startCol,
            endLineNumber: e.endLine,
            endColumn: e.endCol,
            message: e.message,
            severity: monaco.MarkerSeverity.Error
        });
    };
    for (let e of formulaEvaluator.formulaErrors) {
        monacoErrors.push({
            startLineNumber: e.startLine,
            startColumn: e.startCol,
            endLineNumber: e.endLine,
            endColumn: e.endCol,
            message: e.message,
            severity: monaco.MarkerSeverity.Error
        });
    };
    monaco.editor.setModelMarkers(model, "owner", monacoErrors);
}