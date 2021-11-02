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

declare interface PeriodType {
    entityIndex: number;
}

declare interface Format {
    hierarchyEntityLongId?: number;
    entityFormatFilter?: any;
    selectiveAccessApplied?: boolean;
    showAll?: boolean;
    dataType: string;
    periodType: PeriodType;
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
    periodType?: any;
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
    periodType?: any;
}

declare interface FunctionalAreasInfo {
    functionalAreaInfos: any[];
}

declare interface PropertiesLabelPage {
    start: number;
    guid?: any;
    nestingCount: number;
    count: number;
    entityIds: any[];
    entityCodes: any[];
    entityLongIds: any[];
    parentEntityLongIds: any[];
    isEditable: any[];
    isAggregate: any[];
    labels: any[];
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
    periodType?: any;
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
    entityLongId: any;
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
    periodType?: any;
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
    periodType?: any;
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
    periodType?: any;
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
    periodType?: any;
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
    periodType?: any;
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
    periodType?: any;
}

declare interface LineItemSubsetsInfo {
    lineItemSubsetInfos: SubsetInfo[];
    lineItemSubsetsLabelPage: LineItemSubsetsLabelPage;
}

declare interface ModelProperties {
    nonSyncableModelProperties: string;
    syncableModelProperties?: any;
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

declare interface LeafPeriodType2 {
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
    //leafPeriodType: LeafPeriodType2;
    appliesTo?: number;
    format: Format;
    formula?: string;
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
    leafPeriodType: LeafPeriodType;
    timeRangeLabel: string;
    lineItemInfos: LineItemInfo[];
    lineItemSubsetEntityLongIds: any[];
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
    periodType?: any;
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
    periodType?: any;
}

declare interface TimeRangesInfo {
    timeRangeInfos: any[];
    timeRangesLabelPage: TimeRangesLabelPage;
}

declare interface AllowedTimeEntityPeriodType {
    entityId: string;
    entityIndex: number;
    entityLabel: string;
    entityGuid?: any;
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
    periodType?: any;
}

declare interface TimeScaleSupersetInfo {
    calendarTypeEntityIndex: number;
    allowedTimeEntityPeriodTypes: AllowedTimeEntityPeriodType[];
    allowedTimeEntityPeriodTypeLabelPages: AllowedTimeEntityPeriodTypeLabelPage[];
}

declare interface AllowedTimeEntityPeriodType2 {
    entityId: string;
    entityIndex: number;
    entityLabel: string;
    entityGuid?: any;
}

declare interface AllowedTimeEntityPeriodTypeLabelPage2 {
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

declare interface TimeScaleInfo {
    calendarTypeEntityIndex: number;
    allowedTimeEntityPeriodTypes: AllowedTimeEntityPeriodType2[];
    allowedTimeEntityPeriodTypeLabelPages: AllowedTimeEntityPeriodTypeLabelPage2[];
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
    periodType?: any;
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
    periodType?: any;
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
    periodType?: any;
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
    periodType?: any;
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