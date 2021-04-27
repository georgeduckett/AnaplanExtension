var anaplan: Anaplan;

declare interface Anaplan {
    data: Data;
}
declare interface Data {
    ModelContentCache: ModelContentCache
}
declare interface ModelInfo {
    modulesLabelPage: ModulesLabelPage;
    moduleInfos: ModuleInfo[];
}
declare interface ModulesLabelPage {
    entityLongIds: number[][]
    labels: string[][]
}
declare interface ModelContentCache {
    getModuleInfo(a: number): ModuleInfo
    _modelInfo: ModelInfo;
}
declare interface LeafPeriodType {
    entityId: string;
    entityIndex: number;
    entityLabel: string;
    entityGuid?: any;
}

declare interface VersionSelection {
    entityId: string;
    entityIndex: number;
    entityLabel: string;
    entityGuid?: any;
}

declare interface Format {
    minimumSignificantDigits: number;
    decimalPlaces: number;
    decimalSeparator: string;
    groupingSeparator: string;
    negativeNumberNotation: string;
    unitsType: string;
    unitsDisplayType: string;
    currencyCode?: any;
    customUnits?: any;
    zeroFormat: string;
    comparisonIncrease: string;
    dataType: string;
    textType: string;
}

declare interface LineItemInfo {
    versionSelection: VersionSelection;
    formulaScope: string;
    resolvedFormulae?: any;
    resolvedFormulaTargets?: any;
    parentLineItemEntityLongId: number;
    fullAppliesTo: any[];
    appliesTo?: any;
    leafPeriodType: LeafPeriodType;
    format: Format;
    formula: string;
    isSummary: boolean;
}

declare interface LineItemsLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: string[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: number[][];
    isEditable: boolean[][];
    isAggregate: boolean[][];
    labels: string[][];
    treeLineSequences: any[][];
    canDelete: boolean[][];
    canInsertSibling: boolean[][];
    isItemEditable: boolean[][];
    span: number[][];
    showLabel?: any;
    periodType?: any;
}

declare interface ModuleInfo {
    appliesTo?: any;
    fullAppliesTo: number[];
    formulaInfos: any[];
    leafPeriodType: LeafPeriodType;
    timeRangeLabel: string;
    lineItemInfos: LineItemInfo[];
    lineItemSubsetEntityLongIds: any[];
    lineItemsLabelPage: LineItemsLabelPage;
    versionSelection: VersionSelection;
    functionalAreaEntityLongId: number;
    showInContents: boolean;
}