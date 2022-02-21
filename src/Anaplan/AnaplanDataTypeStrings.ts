import { Format } from "./Format";

export class AnaplanDataTypeStrings {
    static BOOLEAN: Format = new Format("BOOLEAN");
    static TEXT: Format = new Format("TEXT");
    static NUMBER: Format = new Format("NUMBER");
    static NONE: Format = new Format("NONE");
    static ENTITY(entityId: number | undefined): Format { return new Format("ENTITY", entityId); }
    static TIME_ENTITY: Format = new Format("TIME_ENTITY");
    static DATE: Format = new Format("DATE");
    static KEYWORD: Format = new Format("KEYWORD");

    static UNKNOWN: Format = new Format("UNKNOWN");
}