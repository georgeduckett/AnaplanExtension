import { AnaplanDataTypeStrings } from "./AnaplanDataTypeStrings";

export class Format {
    hierarchyEntityLongId?: number;
    entityFormatFilter?: any;
    selectiveAccessApplied?: boolean;
    showAll?: boolean;
    dataType: string;
    periodType?: EntityInfo;
    isNumberedList?: boolean;
    constructor(dataType: string, hierarchyEntityLongId?: number, isNumberedList?: boolean) { this.dataType = dataType; this.hierarchyEntityLongId = hierarchyEntityLongId; this.isNumberedList = isNumberedList; }
}

export function DefaultCodeCompleteAggregation(format: Format): string {
    switch (format.dataType) {
        case AnaplanDataTypeStrings.BOOLEAN.dataType: return "ANY";
        case AnaplanDataTypeStrings.DATE.dataType: return "MAX";
        case AnaplanDataTypeStrings.TIME_ENTITY.dataType:
        case AnaplanDataTypeStrings.ENTITY(undefined).dataType: return "FIRSTNONBLANK";
        case AnaplanDataTypeStrings.NUMBER.dataType: return "SUM";
        case AnaplanDataTypeStrings.TEXT.dataType: return "TEXTLIST";
        default: return "SUM"
    };
}