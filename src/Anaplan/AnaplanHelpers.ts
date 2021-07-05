import { ParserRuleContext } from "antlr4ts";
import { Interval } from "antlr4ts/misc/Interval";
import { DotQualifiedEntityContext, QuotedEntityContext, WordsEntityContext, EntityContext, FuncSquareBracketsContext } from './antlrclasses/AnaplanFormulaParser';

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