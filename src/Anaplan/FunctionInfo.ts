import { AnaplanDataTypeStrings } from "./AnaplanDataTypeStrings";
import { AnaplanFormulaTypeEvaluatorVisitor } from "./AnaplanFormulaTypeEvaluatorVisitor";
import { getOriginalText, unQuoteEntity } from "./AnaplanHelpers";
import { FuncParameterisedContext } from "./antlrclasses/AnaplanFormulaParser";

export class FunctionInfo {
    public returnType: ((visitor: AnaplanFormulaTypeEvaluatorVisitor, ctx: FuncParameterisedContext) => Format) | Format;
    constructor(returnType: ((visitor: AnaplanFormulaTypeEvaluatorVisitor, ctx: FuncParameterisedContext) => Format) | Format) {
        this.returnType = returnType;
    }
}

let itemFunc = (visitor: AnaplanFormulaTypeEvaluatorVisitor, ctx: FuncParameterisedContext) => {
    if (ctx.expression()[0] === undefined) {
        return AnaplanDataTypeStrings.ENTITY(undefined);
    }
    let itemName = unQuoteEntity(getOriginalText(ctx.expression()[0]));
    if (itemName === "Time") {
        return AnaplanDataTypeStrings.TIME_ENTITY;
    }
    else {
        return visitor._anaplanMetaData.getItemInfoFromEntityName(itemName)?.lineItemInfo.format ?? AnaplanDataTypeStrings.ENTITY(visitor._anaplanMetaData.getEntityIdFromName(itemName));
    }
}
let parentFunc = (visitor: AnaplanFormulaTypeEvaluatorVisitor, ctx: FuncParameterisedContext) => {
    let entityFormat = visitor.visit(ctx.expression()[0]);

    if (entityFormat.dataType == AnaplanDataTypeStrings.TIME_ENTITY.dataType) {
        if (entityFormat.periodType != undefined) {
            // We have a period type, so we can move up one level
            let timeRangeLabel = visitor._anaplanMetaData.getCurrentItem().timeRangeLabel;
            if (timeRangeLabel != undefined) {
                if (timeRangeLabel === 'Time') {
                    // Model calendar
                    let newIndex = entityFormat.periodType.entityIndex + 1;
                    let newPeriodType = anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes.find(x => x.entityIndex === newIndex);
                    if (newPeriodType === undefined) {
                        visitor.addFormulaError(ctx, `This is a top level time entity. Did you mean to get its parent?`, 4); // 4 = warning, as anaplan does allow it
                    }
                    else {
                        entityFormat.periodType = newPeriodType;
                    }
                }
                else {
                    // Time range
                    // anaplan.data.ModelContentCache._modelInfo.timeRangesInfo.timeRangeInfos just has an entityId, not info about the time range so we can't use it
                    entityFormat.periodType = undefined; // We don't know the period type, since we don't know the time range info
                }
            }
            else {
                entityFormat.periodType = undefined; // We don't know the period type, since we don't know the time range info
            }
        }
        return entityFormat;
    }
    else {
        let entityId = entityFormat.hierarchyEntityLongId!;

        if (entityId === undefined) {
            visitor.addFormulaError(ctx.functionname(), `Can't get parent of unknown entity.`);
            return AnaplanDataTypeStrings.UNKNOWN;

        } else {

            let parentEntityId = visitor._anaplanMetaData.getEntityParentId(entityId);

            if (parentEntityId === undefined) {
                visitor.addFormulaError(ctx.functionname(), `There is no parent of entity ${visitor._anaplanMetaData.getEntityNameFromId(entityId)}.`);
                return AnaplanDataTypeStrings.UNKNOWN;
            }

            return visitor._anaplanMetaData.getItemInfoFromEntityName(visitor._anaplanMetaData.getEntityNameFromId(parentEntityId))?.lineItemInfo.format ?? AnaplanDataTypeStrings.ENTITY(parentEntityId);
        }

    }
}

export let FunctionsInfo = new Map([
    ['ABS', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['ADDMONTHS', new FunctionInfo(AnaplanDataTypeStrings.DATE)],
    ['ADDYEARS', new FunctionInfo(AnaplanDataTypeStrings.DATE)],
    ['AGENTS', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['AGENTSB', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['ANSWERTIME', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['ARRIVALRATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['AVGDURATION', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['AVGWAIT', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['CODE', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['COLLECT', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['COMPARE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['COUPDAYS', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['COUPDAYBS', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['COUPDAYSNC', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['COUPNCD', new FunctionInfo(AnaplanDataTypeStrings.DATE)],
    ['COUPNUM', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['COUPPCD', new FunctionInfo(AnaplanDataTypeStrings.DATE)],
    ['CUMIPMT', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['CUMPRINC', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['CUMULATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['CURRENTPERIODEND', new FunctionInfo(AnaplanDataTypeStrings.DATE)],
    ['CURRENTPERIODSTART', new FunctionInfo(AnaplanDataTypeStrings.DATE)],
    ['CURRENTVERSION', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['DATE', new FunctionInfo(AnaplanDataTypeStrings.DATE)],
    ['DAY', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['DAYS', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['DAYSINMONTH', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['DAYSINYEAR', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['DECUMULATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['DIVIDE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['DURATION', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['END', new FunctionInfo(AnaplanDataTypeStrings.DATE)],
    ['ERLANGB', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['ERLANGC', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['EXP', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['FIND', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['FINDITEM', new FunctionInfo(itemFunc)],
    ['FIRSTNONZERO', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['FV', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['HALFYEARTODATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['HALFYEARVALUE', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['INPERIOD', new FunctionInfo(AnaplanDataTypeStrings.BOOLEAN)],
    ['IPMT', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['IRR', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['ISACTUALVERSION', new FunctionInfo(AnaplanDataTypeStrings.BOOLEAN)],
    ['ISANCESTOR', new FunctionInfo(AnaplanDataTypeStrings.BOOLEAN)],
    ['ISBLANK', new FunctionInfo(AnaplanDataTypeStrings.BOOLEAN)],
    ['ISCURRENTVERSION', new FunctionInfo(AnaplanDataTypeStrings.BOOLEAN)],
    ['ISFIRSTOCCURRENCE', new FunctionInfo(AnaplanDataTypeStrings.BOOLEAN)],
    ['ISNOTBLANK', new FunctionInfo(AnaplanDataTypeStrings.BOOLEAN)],
    ['ITEM', new FunctionInfo(itemFunc)],
    ['LAG', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['LEAD', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['LEFT', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['LENGTH', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['LN', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['LOG', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['LOWER', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['MAILTO', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['MAKELINK', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['MAX', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['MDURATION', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['MID', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['MIN', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['MOD', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['MONTH', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['MONTHTODATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['MONTHVALUE', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['MOVINGSUM', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['MROUND', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['NAME', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['NEXT', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['NEXTVERSION', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['NPER', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['NPV', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['OFFSET', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['PARENT', new FunctionInfo(parentFunc)],
    ['PERIOD', new FunctionInfo(AnaplanDataTypeStrings.TIME_ENTITY)],
    ['PMT', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['POST', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['POWER', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['PPMT', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['PREVIOUS', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['PREVIOUSVERSION', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['PRICE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['PROFILE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['PV', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['QUARTERTODATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['QUARTERVALUE', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['RANK', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['RANKCUMULATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['RATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['RIGHT', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['ROUND', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['SIGN', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['SLA', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['SPREAD', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['SQRT', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['START', new FunctionInfo(AnaplanDataTypeStrings.DATE)],
    ['SUBSTITUTE', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['TEXT', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['TEXTLIST', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['TIMESUM', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['TRIM', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['UPPER', new FunctionInfo(AnaplanDataTypeStrings.TEXT)],
    ['VALUE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['WEEKDAY', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['WEEKTODATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['WEEKVALUE', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['YEAR', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['YEARFRAC', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['YEARTODATE', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
    ['YEARVALUE', new FunctionInfo((visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['YIELD', new FunctionInfo(AnaplanDataTypeStrings.NUMBER)],
]);