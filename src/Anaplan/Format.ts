export class Format {
    hierarchyEntityLongId?: number;
    entityFormatFilter?: any;
    selectiveAccessApplied?: boolean;
    showAll?: boolean;
    dataType: string;
    periodType: any;
    constructor(dataType: string, hierarchyEntityLongId?: number) { this.dataType = dataType; this.hierarchyEntityLongId = hierarchyEntityLongId; }
}