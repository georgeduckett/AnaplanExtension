declare var anaplan: Anaplan;

declare interface Anaplan {
    data: Data;
}
declare interface Data {
    ModelContentCache: ModelContentCache
}
declare interface ModelContentCache {
    //getModuleInfo(a: number): ModuleInfo // We don't use this, and don't want to have to replicate it
    _modelInfo: ModelInfo;
}

declare interface EntityInfo {
    entityGuid: any;
    entityId?: string;
    entityIndex: number;
    entityLabel?: string;
}

declare interface Format {
    hierarchyEntityLongId?: number;
    entityFormatFilter?: any;
    selectiveAccessApplied?: boolean;
    showAll?: boolean;
    dataType: string;
    periodType?: EntityInfo;
}

declare interface DashboardsLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}

declare interface DashboardsInfo {
    dashboardInfos: any[];
    dashboardsLabelPage: DashboardsLabelPage;
}

declare interface FunctionalAreasLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}

declare interface FunctionalAreasInfo {
    functionalAreaInfos: any[];
}

declare interface PropertiesLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: string[];
    entityCodes: any[];
    entityLongIds: any[];
    parentEntityLongIds: any[];
    isEditable: any[];
    isAggregate: any[];
    labels: string[];
    treeLineSequences: any[];
    canDelete: any[];
    canInsertSibling: any[];
    isItemEditable: any[];
    styles?: any;
    span: any[];
    showLabel?: any;
    heldRangeIndices?: any;
    isHeld?: any;
    isAggregateInHierarchy: any[];
    periodType?: EntityInfo;
}

declare interface HierarchyInfo {
    parentHierarchyEntityLongId: number;
    displayNamePropertyEntityIndex: number;
    subsetEntityLongIds: any[];
    isNumberedList: boolean;
    topLevelMainHierarchyEntityLongId: any;
    sortOrder: string;
    propertiesLabelPage: PropertiesLabelPage;
    propertiesInfo: PropertiesInfo[];
    isCustomHierarchy: boolean;
    hasSelectiveAccess: boolean;
    itemCount: number;
    entityLongId: number;
}

declare interface PropertiesInfo {
    format: Format;
    formula: string;
    formulascope: string;
}

declare interface HierarchiesLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: string[][];
    entityCodes: string[][];
    entityLongIds: number[][];
    parentEntityLongIds: number[][];
    isEditable: boolean[][];
    isAggregate: boolean[][];
    labels: string[][];
    treeLineSequences: any[][];
    canDelete: boolean[][];
    canInsertSibling: boolean[][];
    isItemEditable: boolean[][];
    span: number[][];
    showLabel?: boolean;
    periodType?: EntityInfo;
}

declare interface HierarchiesInfo {
    hasWorkflowEntityLongId: number;
    hierarchyInfos: HierarchyInfo[];
    hierarchiesLabelPage: HierarchiesLabelPage;
}

declare interface HierarchySubsetsLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}

declare interface SubsetInfo {
    entityLongId: number;
    parentHierarchyEntityLongId: number;
    topLevelMainHierarchyEntityLongId: number;
    applicableModuleEntityLongIds: number[]; // Applicable to line item subsets only
}

declare interface HierarchySubsetsInfo {
    hierarchySubsetInfos: SubsetInfo[];
    hierarchySubsetsLabelPage: HierarchySubsetsLabelPage;
}

declare interface ImportsLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}

declare interface ImportsInfo {
    importsLabelPage: ImportsLabelPage;
}

declare interface LineItemSubsetCategoriesLabelPage {
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
    periodType?: EntityInfo;
}

declare interface LineItemSubsets {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}

declare interface LineItemSubsetCategoryInfo {
    entityIndex: number;
    lineItemSubsets: LineItemSubsets;
}

declare interface LineItemSubsetsLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}

declare interface LineItemSubsetsInfo {
    lineItemSubsetInfos: SubsetInfo[];
    lineItemSubsetsLabelPage: LineItemSubsetsLabelPage;
}

declare interface ModelProperties {
    nonSyncableModelProperties: string;
    syncableModelProperties?: any;
}

declare interface VersionSelection {
    entityId: string;
    entityIndex: number;
    entityLabel: string;
    entityGuid?: any;
}

declare interface LineItemInfo {
    //versionSelection: VersionSelection;
    resolvedFormulae?: any;
    formulaScope: string;
    fullAppliesTo: number[];
    parentLineItemEntityLongId: number;
    resolvedFormulaTargets?: any;
    leafPeriodType?: EntityInfo
    appliesTo?: number;
    format: Format;
    formula?: string;
    isSummary: boolean;
    timeRangeLabel?: string;
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
    periodType?: EntityInfo;
}

declare interface VersionSelection2 {
    entityId: string;
    entityIndex: number;
    entityLabel: string;
    entityGuid?: any;
}

declare interface ModuleInfo {
    appliesTo?: any;
    fullAppliesTo: any[];
    formulaInfos: any[];
    leafPeriodType: EntityInfo;
    timeRangeLabel: string;
    lineItemInfos: LineItemInfo[];
    lineItemSubsetEntityLongIds: number[];
    lineItemsLabelPage: LineItemsLabelPage;
    versionSelection: VersionSelection2;
    functionalAreaEntityLongId: number;
    showInContents: boolean;
}

declare interface ModulesLabelPage {
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
    periodType?: EntityInfo;
}

declare interface TimeRangesLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}

declare interface TimeRangesInfo {
    timeRangeInfos: any[];
    timeRangesLabelPage: TimeRangesLabelPage;
}

declare interface AllowedTimeEntityPeriodTypeLabelPage {
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
    periodType?: EntityInfo;
}

declare interface TimeScaleSupersetInfo {
    calendarTypeEntityIndex: number;
    allowedTimeEntityPeriodTypes: EntityInfo[];
    allowedTimeEntityPeriodTypeLabelPages: AllowedTimeEntityPeriodTypeLabelPage[];
}

declare interface TimeScaleInfo {
    calendarTypeEntityIndex: number;
    allowedTimeEntityPeriodTypes: EntityInfo[];
    allowedTimeEntityPeriodTypeLabelPages: AllowedTimeEntityPeriodTypeLabelPage[];
}

declare interface VersionInfo {
    formula?: any;
}

declare interface VersionsLabelPage {
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
    periodType?: EntityInfo;
}

declare interface ViewsLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}

declare interface ViewsInfo {
    moduleEntityLongIds: any[];
    viewsLabelPage: ViewsLabelPage;
}

declare interface ActionsLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}

declare interface ActionsInfo {
    actionInfos: any[];
    actionsLabelPage: ActionsLabelPage;
}

declare interface TagsLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[][];
    entityCodes: any[][];
    entityLongIds: any[][];
    parentEntityLongIds: any[][];
    isEditable: any[][];
    isAggregate: any[][];
    labels: any[][];
    treeLineSequences: any[][];
    canDelete: any[][];
    canInsertSibling: any[][];
    isItemEditable: any[][];
    span: any[][];
    showLabel?: any;
    periodType?: EntityInfo;
}
declare interface ModelInfo {
    modelDefinitionSerialNumber: number;
    metadataId: string;
    baseCurrencyEntityLongId: number;
    cellCount: number;
    dashboardsInfo: DashboardsInfo;
    functionalAreasLabelPage: FunctionalAreasLabelPage;
    functionalAreasInfo: FunctionalAreasInfo;
    hierarchiesInfo: HierarchiesInfo;
    hierarchySubsetsInfo: HierarchySubsetsInfo;
    importsInfo: ImportsInfo;
    lineItemSubsetCategoriesLabelPage: LineItemSubsetCategoriesLabelPage;
    lineItemSubsetCategoryInfos: LineItemSubsetCategoryInfo[];
    lineItemSubsetsInfo: LineItemSubsetsInfo;
    memory: number;
    modelProperties: ModelProperties;
    moduleInfos: ModuleInfo[];
    modulesLabelPage: ModulesLabelPage;
    timeRangesInfo: TimeRangesInfo;
    timeScaleSupersetInfo: TimeScaleSupersetInfo;
    timeScaleInfo: TimeScaleInfo;
    versionInfos: VersionInfo[];
    versionsLabelPage: VersionsLabelPage;
    viewsInfo: ViewsInfo;
    actionsInfo: ActionsInfo;
    tagsLabelPage: TagsLabelPage;
    modelSerialNumber: number;
}