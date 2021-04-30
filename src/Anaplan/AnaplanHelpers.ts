import { Interval } from "antlr4ts/misc/Interval";
import { DotQualifiedEntityContext, EntityContext, QuotedEntityContext, WordsEntityContext } from "./antlrclasses/AnaplanFormulaParser";

export function getOriginalText(ctx: EntityContext): string {
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

export function getEntityName(ctx: QuotedEntityContext | WordsEntityContext | DotQualifiedEntityContext): string {
    if (ctx instanceof QuotedEntityContext) {
        return unQuoteEntity(ctx.QUOTELITERAL().text);
    } else if (ctx instanceof WordsEntityContext) {
        return getOriginalText(ctx);
    } else {
        return `${unQuoteEntity(getOriginalText(ctx._left))}.${unQuoteEntity(getOriginalText(ctx._right))}`
    }
}

export class AnaplanDataTypeStrings {
    static BOOLEAN: string = "BOOLEAN";
    static TEXT: string = "TEXT";
    static NUMERIC: string = "NUMERIC";
    static NONE: string = "NONE";
    static ENTITY: string = "ENTITY";
}