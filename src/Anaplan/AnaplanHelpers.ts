import { CharStreams, CommonTokenStream, ParserRuleContext } from "antlr4ts";
import { Interval } from "antlr4ts/misc/Interval";
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { hoverProvider } from "../content-script-main";
import { AnaplanDataTypeStrings } from "./AnaplanDataTypeStrings";
import { AnaplanFormulaTypeEvaluatorVisitor } from "./AnaplanFormulaTypeEvaluatorVisitor";
import { AnaplanMetaData, EntityMetaData, EntityType } from "./AnaplanMetaData";
import { AnaplanFormulaLexer } from "./antlrclasses/AnaplanFormulaLexer";
import { AnaplanFormulaParser } from './antlrclasses/AnaplanFormulaParser';
import { CollectorErrorListener } from "./CollectorErrorListener";
import { Format } from "./Format";
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

type Constructor<T> = { new(...args: any[]): T };

export function findAncestor<T extends ParseTree>(node: ParseTree | undefined, TName: Constructor<T>): T | undefined {
    if (node === undefined || node instanceof TName) { return node as T; }

    return findAncestor(node.parent, TName);
}
export function tryGetChild<T extends ParseTree>(node: ParseTree | undefined, TName: Constructor<T>): T | undefined {
    if (node === undefined) return undefined;

    for (let i = 0; i < node?.childCount; i++) {
        if (node.getChild(i) instanceof TName) { return node.getChild(i) as T; }
    }

    return undefined;
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

    let moduleLineItems = new Map<string, EntityMetaData>();

    for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.moduleInfos.length; i++) {
        for (var j = 0; j < anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0].length; j++) {
            var entityName = anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i] + "." + anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0][j];
            var dataTypeString = anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos[j].format.dataType;
            if (dataTypeString != AnaplanDataTypeStrings.NONE.dataType) {
                moduleLineItems.set(entityName, new EntityMetaData(
                    anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos[j],
                    EntityType.LineItem,
                    anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i],
                    anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0][j]));

                if (dataTypeString === AnaplanDataTypeStrings.TIME_ENTITY.dataType) {

                }
            }
        }
    }

    let entityNames = new Map<number, string>();
    let entityIds = new Map<string, { id: number, type: string }>();
    let hierarchyParents = new Map<number, number>();

    for (var i = 0; i < anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0].length; i++) {
        entityNames.set(
            anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i]);
        entityIds.set(
            anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i],
            {
                id: anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityLongIds[0][i],
                type: 'entity'
            });
    }

    let subsetMainHierachyMap = new Map<number, number>();

    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0].length; i++) {
        entityNames.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.entityLongIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i]);
        entityIds.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i],
            {
                id: anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.entityLongIds[0][i],
                type: 'hierarchy'
            });
        hierarchyParents.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].entityLongId,
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].parentHierarchyEntityLongId);

        for (let j = 0; j < anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].subsetEntityLongIds.length; j++) {
            subsetMainHierachyMap.set(anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].subsetEntityLongIds[j],
                anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.entityLongIds[0][i]);
        }

        // Add in the hierarchy properties as an entity
        for (let j = 0; j < anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].propertiesInfo.length; j++) {
            let entityName = anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i] + '.' + anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].propertiesLabelPage.labels[j];
            moduleLineItems.set(entityName, new EntityMetaData({
                parentLineItemEntityLongId: -1,
                fullAppliesTo: [],
                formulaScope: '',
                isSummary: false,
                format: anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].propertiesInfo[j].format,
            },
                EntityType.HierarchyProperty,
                anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i],
                anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].propertiesLabelPage.labels[j]));
        }

        // Add in the hierarchy itself as an entity
        let format = AnaplanDataTypeStrings.ENTITY(anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].entityLongId);

        moduleLineItems.set(anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i], new EntityMetaData({
            parentLineItemEntityLongId: -1,
            fullAppliesTo: [anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].entityLongId],
            formulaScope: '',
            isSummary: false,
            format: format,
        },
            EntityType.Hierarchy,
            undefined,
            anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchiesLabelPage.labels[0][i]));
    }

    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.labels[0].length; i++) {
        entityNames.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.entityLongIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.labels[0][i]);
        entityIds.set(
            anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.labels[0][i],
            {
                id: anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetsLabelPage.entityLongIds[0][i],
                type: 'hierarchysubset'
            });
    }

    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0].length; i++) {
        entityNames.set(
            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.entityLongIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0][i]);
        entityIds.set(
            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0][i],
            {
                id: anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.entityLongIds[0][i],
                type: 'lineitemsubset'
            });

        // Find the module this applies to and add it's measures as entities
        for (let j = 0; j < anaplan.data.ModelContentCache._modelInfo.moduleInfos.length; j++) {
            for (let k = 0; k < anaplan.data.ModelContentCache._modelInfo.moduleInfos[j].lineItemSubsetEntityLongIds.length; k++) {
                if (anaplan.data.ModelContentCache._modelInfo.moduleInfos[j].lineItemSubsetEntityLongIds[k] ===
                    anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.entityLongIds[0][i]) {
                    // We found the module this line item subset relates to. We can't know which line items are in the subset, so we just add them all
                    for (let l = 0; l < anaplan.data.ModelContentCache._modelInfo.moduleInfos[j].lineItemsLabelPage.labels[0].length; l++) {
                        let name = `${anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0][i]}.${anaplan.data.ModelContentCache._modelInfo.moduleInfos[j].lineItemsLabelPage.labels[0][l]}`;
                        moduleLineItems.set(name, new EntityMetaData({
                            parentLineItemEntityLongId: -1,
                            fullAppliesTo: [anaplan.data.ModelContentCache._modelInfo.hierarchiesInfo.hierarchyInfos[i].entityLongId],
                            formulaScope: '',
                            isSummary: false,
                            format: anaplan.data.ModelContentCache._modelInfo.moduleInfos[j].lineItemInfos[l].format,
                        },
                            EntityType.LineItemSubSet,
                            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetsLabelPage.labels[0][i],
                            anaplan.data.ModelContentCache._modelInfo.moduleInfos[j].lineItemsLabelPage.labels[0][l]));
                    }
                    break;
                }
            }
        }
    }

    // Add the versions
    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.versionsLabelPage.count; i++) {
        let name = 'VERSIONS.' + anaplan.data.ModelContentCache._modelInfo.versionsLabelPage.labels[0][i];
        entityNames.set(
            // Don't use the actual version entity id for each individual version here, we want to use the 'version' entity id
            //anaplan.data.ModelContentCache._modelInfo.versionsLabelPage.entityLongIds[0][i],
            20000000020,
            name);
        entityIds.set(
            name,
            {
                id: 20000000020, //anaplan.data.ModelContentCache._modelInfo.versionsLabelPage.entityLongIds[0][i],
                type: 'version'
            });

        moduleLineItems.set(name, new EntityMetaData({
            parentLineItemEntityLongId: -1,
            fullAppliesTo: [anaplan.data.ModelContentCache._modelInfo.versionsLabelPage.entityLongIds[0][i]],
            formulaScope: '',
            isSummary: false,
            format: AnaplanDataTypeStrings.ENTITY(anaplan.data.ModelContentCache._modelInfo.versionsLabelPage.entityLongIds[0][i]),
        },
            EntityType.Version,
            "VERSIONS",
            anaplan.data.ModelContentCache._modelInfo.versionsLabelPage.labels[0][i]));
    }

    // Add in the different time periods
    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypeLabelPages.length; i++) {
        for (let j = 0; j < anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypeLabelPages.length; j++) {
            entityNames.set(anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypeLabelPages[i].entityLongIds[0][j],
                'Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypeLabelPages[i].labels[0][j]);
            entityIds.set('Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypeLabelPages[i].labels[0][j],
                {
                    id: anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypeLabelPages[i].entityLongIds[0][j],
                    type: 'time'
                });
        }
    }

    // Add in the different time periods (supersets)
    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.timeScaleSupersetInfo.allowedTimeEntityPeriodTypeLabelPages.length; i++) {
        for (let j = 0; j < anaplan.data.ModelContentCache._modelInfo.timeScaleSupersetInfo.allowedTimeEntityPeriodTypeLabelPages.length; j++) {
            entityNames.set(anaplan.data.ModelContentCache._modelInfo.timeScaleSupersetInfo.allowedTimeEntityPeriodTypeLabelPages[i].entityLongIds[0][j],
                'Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleSupersetInfo.allowedTimeEntityPeriodTypeLabelPages[i].labels[0][j]);
            entityIds.set('Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleSupersetInfo.allowedTimeEntityPeriodTypeLabelPages[i].labels[0][j],
                {
                    id: anaplan.data.ModelContentCache._modelInfo.timeScaleSupersetInfo.allowedTimeEntityPeriodTypeLabelPages[i].entityLongIds[0][j],
                    type: 'time'
                });
        }
    }

    // Add in TIME.All Periods
    entityIds.set('TIME.All Periods',
        {
            id: -1, // TODO: What should this be?
            type: 'time'
        });
    entityNames.set(-1, 'TIME.All Periods');

    let allPeriodsFormat = new Format(AnaplanDataTypeStrings.TIME_ENTITY.dataType, undefined);
    allPeriodsFormat.periodType = { entityIndex: -1 };// TODO: What should this be?

    moduleLineItems.set('TIME.All Periods', new EntityMetaData({
        parentLineItemEntityLongId: -1,
        fullAppliesTo: [],
        formulaScope: '',
        isSummary: false,
        format: allPeriodsFormat,
    },
        EntityType.HierarchyListItem,
        "TIME",
        "All Periods"));

    // Add in the special time period types
    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes.length; i++) {
        entityNames.set(anaplanTimeEntityBaseId + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityIndex,
            'Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityLabel);
        entityIds.set('Time.' + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityLabel,
            {
                id: anaplanTimeEntityBaseId + anaplan.data.ModelContentCache._modelInfo.timeScaleInfo.allowedTimeEntityPeriodTypes[i].entityIndex,
                type: 'time'
            });
    }

    // Add in special entity names
    entityNames.set(20000000020, 'Version');
    entityIds.set('Version', { id: 20000000020, type: 'version' });


    let subsetParentDimensionId = new Map<number, SubsetInfo>();
    // Regular subsets (of hierarchies)
    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos.length; i++) {
        subsetParentDimensionId.set(anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos[i].entityLongId,
            {
                entityLongId: anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos[i].entityLongId,
                parentHierarchyEntityLongId: subsetMainHierachyMap.get(anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos[i].entityLongId)!,
                topLevelMainHierarchyEntityLongId: subsetMainHierachyMap.get(anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos[i].entityLongId)!,
                applicableModuleEntityLongIds: anaplan.data.ModelContentCache._modelInfo.hierarchySubsetsInfo.hierarchySubsetInfos[i].applicableModuleEntityLongIds
            }
        );
    }

    // Line item subsets (of measures)
    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetInfos.length; i++) {
        subsetParentDimensionId.set(anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetInfos[i].entityLongId,
            anaplan.data.ModelContentCache._modelInfo.lineItemSubsetsInfo.lineItemSubsetInfos[i]);
    }


    return new AnaplanMetaData(moduleLineItems, subsetParentDimensionId, entityNames, entityIds, hierarchyParents, currentModuleName, moduleLineItems.get(currentLineItemName)!.lineItemInfo);
}

export function getFormulaErrors(formula: string, anaplanMetaData: AnaplanMetaData,
    modelLineCount: number, modelLineMaxColumn: number): monaco.editor.IMarkerData[] {
    if (formula.length === 0) {
        return [];
    }

    let targetFormat = anaplanMetaData.getCurrentItem().format;

    let formulaEvaluator = new AnaplanFormulaTypeEvaluatorVisitor(anaplanMetaData);
    const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(formula));
    let errors: FormulaError[] = [];
    mylexer.removeErrorListeners();
    const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
    myparser.removeErrorListeners();
    myparser.addErrorListener(new CollectorErrorListener(errors));

    let formulaContext = myparser.formula();

    let monacoErrors = [];

    if (errors.length === 0) {
        const myresult = formulaEvaluator.visit(formulaContext);

        // Add the errors with the whole formula if needed
        if (myresult.dataType != AnaplanDataTypeStrings.UNKNOWN.dataType &&
            myresult.dataType != anaplanMetaData.getCurrentItem().format.dataType) {
            // Ensure the data type is the same if we did actually work out what it is
            monacoErrors.push({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: modelLineCount,
                endColumn: modelLineMaxColumn,
                message: `Formula evaluates to ${myresult.dataType} but the line item type is ${targetFormat.dataType}`,
                severity: 8 //monaco.MarkerSeverity.Error (don't use enum so we can test)
            });
        } else if (myresult.dataType === AnaplanDataTypeStrings.ENTITY(undefined).dataType) {
            // Ensure the entity types is the same if the data types are entity
            if (myresult.hierarchyEntityLongId != targetFormat.hierarchyEntityLongId) {
                monacoErrors.push({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: modelLineCount,
                    endColumn: modelLineMaxColumn,
                    message: `Formula evaluates to ${myresult.hierarchyEntityLongId === undefined ? "an invalid entity" : anaplanMetaData.getEntityNameFromId(myresult.hierarchyEntityLongId)} but the line item type is ${anaplanMetaData.getEntityNameFromId(targetFormat.hierarchyEntityLongId!)}`,
                    severity: 8 //monaco.MarkerSeverity.Error (don't use enum so we can test)
                });
            }
        }
    }

    if (errors.length != 0) {
        // If we have parser errors, then we only care about those, not whether or not the formula evaluates to what we need (since if there are errors the evaluation could easily be wrong anyway)
        monacoErrors = [];
        for (let e of errors) {
            monacoErrors.push({
                startLineNumber: e.startLine,
                startColumn: e.startCol,
                endLineNumber: e.endLine,
                endColumn: e.endCol,
                message: e.message,
                severity: 8 //monaco.MarkerSeverity.Error (don't use enum so we can test)
            });
        };
    }
    else {
        // We don't have parser errors, so add the formula errors in
        for (let e of formulaEvaluator.formulaErrors) {
            monacoErrors.push({
                startLineNumber: e.startLine,
                startColumn: e.startCol,
                endLineNumber: e.endLine,
                endColumn: e.endCol,
                message: e.message,
                severity: 8 //monaco.MarkerSeverity.Error
            });
        };
    }

    for (let i = 0; i < monacoErrors.length; i++) {
        if (monacoErrors[i].message.startsWith("no viable alternative at input")) {
            monacoErrors[i].message = "syntax error; found unexpected character" + (monacoErrors[i].endColumn === monacoErrors[i].startColumn + 1 ? "" : "(s)");
        }
    }

    return monacoErrors;
}

export function setModelErrors(model: monaco.editor.ITextModel, currentModuleId: number, lineItemName: string) {
    let anaplanMetaData = getAnaplanMetaData(currentModuleId, lineItemName);

    hoverProvider.updateMetaData(anaplanMetaData);

    let modelLineCount = model.getLineCount();
    monaco.editor.setModelMarkers(model, "owner", getFormulaErrors(model.getValue(), anaplanMetaData, modelLineCount, model.getLineMaxColumn(modelLineCount)));
}