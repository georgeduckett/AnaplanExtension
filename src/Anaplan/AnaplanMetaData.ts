import { CharStreams, CommonTokenStream } from "antlr4ts";
import { IMarkdownString } from "monaco-editor";
import { CompletionItem } from "../Monaco/CompletionItem";
import { AnaplanDataTypeStrings } from "./AnaplanDataTypeStrings";
import { entitySpecialCharSelector } from "./AnaplanFormulaTypeEvaluatorVisitor";
import { unQuoteEntity, getOriginalText, anaplanTimeEntityBaseId, findDescendents } from "./AnaplanHelpers";
import { AnaplanFormulaLexer } from "./antlrclasses/AnaplanFormulaLexer";
import { EntityContext, QuotedEntityContext, WordsEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext, DimensionmappingContext, AnaplanFormulaParser, DotQualifiedEntityIncompleteContext } from "./antlrclasses/AnaplanFormulaParser";
import { DefaultCodeCompleteAggregation } from "./Format";

export function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

export enum EntityType { Module, Hierarchy, LineItem, LineItemSubSet, Version, HierarchyListItem, HierarchyProperty }

export class EntityMetaData {
    public lineItemInfo: LineItemInfo;
    public entityType: EntityType;
    public qualifier: string | undefined;
    public name: string;

    constructor(lineItemInfo: LineItemInfo, entityType: EntityType, qualifier: string | undefined, name: string) {
        this.lineItemInfo = lineItemInfo;
        this.entityType = entityType;
        this.qualifier = qualifier;
        this.name = name;
    }

    public getMonacoAutoCompleteKind(): monaco.languages.CompletionItemKind {
        return EntityMetaData.getMonacoAutoCompleteKind(this.entityType);
    }
    public static getMonacoAutoCompleteKind(entityType: EntityType): monaco.languages.CompletionItemKind {
        switch (entityType) {
            case EntityType.Module: return monaco.languages.CompletionItemKind.Folder;
            case EntityType.LineItem: return monaco.languages.CompletionItemKind.Value;
            case EntityType.Hierarchy: return monaco.languages.CompletionItemKind.Constant;
            case EntityType.LineItemSubSet: return monaco.languages.CompletionItemKind.Value;
            case EntityType.Version: return monaco.languages.CompletionItemKind.Value;
            case EntityType.HierarchyListItem: return monaco.languages.CompletionItemKind.Value;
            case EntityType.HierarchyProperty: return monaco.languages.CompletionItemKind.Value;
            default: return assertUnreachable(entityType);
        }
    }
}

export class AnaplanMetaData {
    private readonly _moduleName: string;
    private readonly _lineItemInfo: Map<string, EntityMetaData>;
    private readonly _hierarchyParents: Map<number, number>;
    private readonly _entityNames: Map<number, string>;
    private readonly _entityIds: Map<string, { id: number, type: string }>;
    private readonly _currentLineItem: LineItemInfo;
    private readonly _subsetInfo: Map<number, SubsetInfo>;


    private readonly _aggregateEntries: { entityMetaData: EntityMetaData, aggregateFunction: string }[] = [];

    constructor(lineItemInfo: Map<string, EntityMetaData>, subsetInfo: Map<number, SubsetInfo>, entityNames: Map<number, string>, entityIds: Map<string, { id: number, type: string }>, hierarchyParents: Map<number, number>, moduleName: string, currentLineItem: LineItemInfo) {
        this._moduleName = moduleName;
        this._subsetInfo = subsetInfo;
        this._lineItemInfo = lineItemInfo;
        this._hierarchyParents = hierarchyParents;
        this._entityNames = entityNames;
        this._entityIds = entityIds;
        this._currentLineItem = currentLineItem;

        this?.getAllLineItems().forEach(li => {
            if (li.lineItemInfo.formula === undefined || li.lineItemInfo.formula === null || !li.lineItemInfo.formula.includes(':')) {
                return;
            }

            const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(li.lineItemInfo.formula));
            mylexer.removeErrorListeners();
            const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
            myparser.removeErrorListeners();

            let dimensionMappings = findDescendents(myparser.formula(), DimensionmappingContext);
            for (let j = 0; j < dimensionMappings.length; j++) {
                let aggregateFunction = dimensionMappings[j].dimensionmappingselector().text;
                let entityLineItem = this.getItemInfoFromEntityContext(dimensionMappings[j].entity(), li.qualifier);

                if (entityLineItem === undefined) {
                    throw new Error("Could not find entity: " + dimensionMappings[j].entity().text + " in formula: " + li.lineItemInfo.formula);
                }
                else {
                    if (this._aggregateEntries.find(ae => ae.aggregateFunction === aggregateFunction &&
                        entityLineItem!.name === ae.entityMetaData.name &&
                        entityLineItem!.qualifier === ae.entityMetaData.qualifier) === undefined) {
                        // If it's not already in there, add it in
                        this._aggregateEntries.push({ entityMetaData: entityLineItem, aggregateFunction: aggregateFunction });
                    }
                }
            }
        });
    }

    getAggregateEntries(): { entityMetaData: EntityMetaData, aggregateFunction: string }[] {
        return this._aggregateEntries;
    }

    quoteIfNeeded(entityName: string): string {
        if (entityName.match(entitySpecialCharSelector)) {
            return "'" + entityName + "'";
        }
        else {
            return entityName;
        }
    }

    getNameFromComponents(entityMetaData: EntityMetaData) {
        // Don't include the qualifier if it's from the same module as the current line item
        if (entityMetaData.qualifier === undefined || entityMetaData.qualifier === this._moduleName) {
            return this.quoteIfNeeded(entityMetaData.name);
        }
        else {
            return `${this.quoteIfNeeded(entityMetaData.qualifier)}.${this.quoteIfNeeded(entityMetaData.name)}`;
        }
    }

    getAllLineItems(): Set<EntityMetaData> {
        let result = new Set<EntityMetaData>();
        for (let lineItem of this._lineItemInfo) {
            if (lineItem[1].entityType === EntityType.LineItem) {
                result.add(lineItem[1]);
            }
        }
        return result;
    }

    getAutoCompleteQualifiedLeftPart(): Set<CompletionItem> {
        let keys = new Set<string>();
        let result = new Set<CompletionItem>();

        for (let lineItem of this._lineItemInfo) {
            if (lineItem[1].qualifier != undefined) {
                // If this line item is dot-qualified, show just the first part, unless it's a hierarchy property
                let itemKey = lineItem[1].qualifier + '|' + EntityType[lineItem[1].entityType];
                if (!keys.has(itemKey)) {
                    result.add(new CompletionItem(
                        lineItem[1].qualifier + (lineItem[1].entityType === EntityType.HierarchyProperty ? '.' + lineItem[1].name : ''),
                        this.quoteIfNeeded(lineItem[1].qualifier) + (lineItem[1].entityType === EntityType.HierarchyProperty ? '.' + this.quoteIfNeeded(lineItem[1].name) : ''),
                        EntityMetaData.getMonacoAutoCompleteKind(lineItem[1].entityType === EntityType.LineItem ? EntityType.Module : lineItem[1].entityType),
                        ['.'],
                        lineItem[1].entityType === EntityType.LineItem ? 'Module' : EntityType[lineItem[1].entityType],
                        undefined));
                    keys.add(itemKey);
                }
            }
        }

        return result;
    }
    getAutoCompleteQualifiedRightPart(leftPartText: string): Set<CompletionItem> {
        let result = new Set<CompletionItem>();
        // Add anything that needs to be qualified
        for (let lineItem of this._lineItemInfo) {
            if (lineItem[1].qualifier != undefined) {
                if (this.quoteIfNeeded(lineItem[1].qualifier) === leftPartText) {
                    // If this line item is dot-qualified, show just the last part
                    result.add(new CompletionItem(
                        lineItem[1].name,
                        this.quoteIfNeeded(lineItem[1].name),
                        monaco.languages.CompletionItemKind.Constant,
                        ['[', ']', '+', '-', '*', '/'],
                        EntityType[lineItem[1].entityType],
                        undefined));
                }
            }
        }

        return result;
    }

    getAutoCompleteWords(): Set<CompletionItem> {
        let result = new Set<CompletionItem>();
        // Add anything that doesn't need to be qualified
        for (let lineItem of this._lineItemInfo) {
            if ((lineItem[1].qualifier === undefined || lineItem[1].qualifier === this._moduleName) && !lineItem[0].startsWith('<<') && !lineItem[0].startsWith('--')) {
                result.add(new CompletionItem(lineItem[1].name,
                    this.quoteIfNeeded(lineItem[1].name),
                    monaco.languages.CompletionItemKind.Constant,
                    [',', ']', '+', '-', '*', '/', '.'],
                    EntityType[lineItem[1].entityType],
                    undefined));
            }
        }

        return result;
    }
    getEntityType(ctx: EntityContext): Format {
        let entityName = this.getEntityName(ctx);

        let wholeStringEntityType = this.getItemInfoFromEntityName(entityName)?.lineItemInfo?.format;

        if (wholeStringEntityType === undefined && entityName.includes('.')) {
            // If the entity name is like <Hierarchy>.<something> then assume the <something> is an item in that hierarchy
            if (this.getItemInfoFromEntityName(entityName.substring(0, entityName.indexOf('.')))?.entityType === EntityType.Hierarchy) {
                return this.getItemInfoFromEntityName(entityName.substring(0, entityName.indexOf('.')))?.lineItemInfo?.format ?? AnaplanDataTypeStrings.UNKNOWN;
            }
        }

        return wholeStringEntityType ?? AnaplanDataTypeStrings.UNKNOWN;
    }
    getEntityDimensions(ctx: EntityContext): number[] {
        let entityName = this.getEntityName(ctx);
        let entityDimensions = this.getItemInfoFromEntityName(entityName)?.lineItemInfo.fullAppliesTo?.sort();

        if (entityDimensions === undefined) {
            return [];
        }
        return entityDimensions;
    }

    isKnownEntity(ctx: EntityContext): boolean {
        let entityName = this.getEntityName(ctx);
        if (entityName.includes('.')) {
            // If the entity name is like <Hierarchy>.<something> then assume the <something> is an item in that hierarchy
            if (this.getItemInfoFromEntityName(entityName.substring(0, entityName.indexOf('.')))?.entityType === EntityType.Hierarchy) {
                return true;
            }
        }

        return this.getItemInfoFromEntityName(entityName) != undefined;
    }

    getEntityIdFromName(entityName: string): number | undefined {
        return this._entityIds.get(entityName)?.id;
    }

    getEntityTypeFromName(entityName: string): string | undefined {
        return this._entityIds.get(entityName)?.type;
    }

    getEntityParentId(entityId: number): number | undefined {
        return this._hierarchyParents.get(entityId);
    }

    getLineItemEntityId(lineItem: { format: Format, fullAppliesTo: number[] }): number | undefined { // We assume that if it's not a hierarchy entity, then it's a time entity
        return lineItem.format.hierarchyEntityLongId ?? (lineItem.format.periodType === undefined ? undefined : anaplanTimeEntityBaseId + lineItem.format.periodType.entityIndex);
    }

    entityIsAncestorOfEntity(possibleAncestorEntity: number, possibleDescendantEntity: number | undefined) {
        while (true) {
            if (possibleAncestorEntity === possibleDescendantEntity) return true;
            if (possibleDescendantEntity === undefined) return false;
            possibleDescendantEntity = this.getEntityParentId(possibleDescendantEntity);
        }
    }

    // Gets the entity id for non-subset entities, or the entity of the hierarchy they're a subset of for subset ids
    getSubsetNormalisedEntityId(entityId: number): number {
        return this._subsetInfo.get(entityId)?.topLevelMainHierarchyEntityLongId ?? entityId;
    }

    getSubsetModules(entityId: number): number[] {
        return this._subsetInfo.get(entityId)?.applicableModuleEntityLongIds ?? [];
    }

    getCurrentItemFullAppliesTo(): number[] {
        return this._currentLineItem.fullAppliesTo.sort();
    }
    getCurrentItem(): LineItemInfo {
        return this._currentLineItem;
    }

    getItemInfoFromEntityName(entityName: string): EntityMetaData | undefined {
        return this._lineItemInfo.get(entityName);
    }
    getItemInfoFromEntityContext(entityContext: EntityContext, currentModuleName: string | undefined = undefined): EntityMetaData | undefined {
        return this._lineItemInfo.get(this.getEntityName(entityContext, currentModuleName));
    }

    getEntityNameFromId(entityId: number): string {
        return this._entityNames.get(entityId) ?? entityId.toString();
    }

    getEntityName(ctx: EntityContext, currentModuleName: string | undefined = undefined): string {
        if (ctx instanceof QuotedEntityContext) {
            if (this.getItemInfoFromEntityName(unQuoteEntity(ctx.quotedEntityRule().text)) != undefined) {
                return unQuoteEntity(ctx.quotedEntityRule().text);
            }
            return (currentModuleName ?? this._moduleName) + "." + unQuoteEntity(ctx.quotedEntityRule().text);
        } else if (ctx instanceof WordsEntityContext) {
            if (this.getItemInfoFromEntityName(getOriginalText(ctx)) != undefined) {
                return getOriginalText(ctx);
            }
            return (currentModuleName ?? this._moduleName) + "." + getOriginalText(ctx);
        } else if (ctx instanceof DotQualifiedEntityContext) {
            let fullUnquotedEntityName = `${unQuoteEntity(getOriginalText(ctx._left))}.${unQuoteEntity(getOriginalText(ctx._right))}`;
            // If the dot qualified thing matches, use that
            if (this._entityIds.has(fullUnquotedEntityName)) return fullUnquotedEntityName;
            if (this._lineItemInfo.has(fullUnquotedEntityName)) return fullUnquotedEntityName;

            // In the case of a dot-qualified entity, the name could be a hierarchyname.listitem, in which case we just want the hierarchyname
            if (ctx.parent instanceof DimensionmappingContext) {
                // This is within a dimension mapping, then 'anything' on the righthand side is ok, since we can't know what the list items all are
                let unquotedLeft = unQuoteEntity(getOriginalText(ctx._left));
                if (this._entityIds.has(unquotedLeft) && this._entityIds.get(unquotedLeft)?.type === 'hierarchy') {
                    return unquotedLeft;
                }
            }

            return fullUnquotedEntityName;
        } else if (ctx instanceof FuncSquareBracketsContext) {
            return this.getEntityName(ctx.entity(), currentModuleName);
        }

        throw new Error("Unknown EntityContext type. Has the grammar file been altered?     " + ctx.text);
    }

    areCompatibleDimensions(entityIdA: number, entityIdB: number | undefined) {
        if (entityIdB === undefined) return false;

        let entityAName = this.getEntityNameFromId(entityIdA);
        let entityBName = this.getEntityNameFromId(entityIdB);

        // If the subset normalised values are the same, then that's a match
        if (this.getSubsetNormalisedEntityId(entityIdA) === this.getSubsetNormalisedEntityId(entityIdB)) {
            return true;
        }

        // If one is a parent of the other then that's ok
        if (this.entityIsAncestorOfEntity(
            this.getSubsetNormalisedEntityId(entityIdB),
            this.getSubsetNormalisedEntityId(entityIdA))) {
            return true;
        }

        // If both are time dimensions that's ok
        if (this.getEntityNameFromId(entityIdA).toUpperCase().startsWith("TIME.") &&
            this.getEntityNameFromId(entityIdB).toUpperCase().startsWith("TIME.")) {
            return true;
        }

        // Handle list subsets
        let entityAModules = this.getSubsetModules(entityIdA);
        let entityBModules = this.getSubsetModules(entityIdB);

        if (entityAModules != undefined && entityBModules != undefined) {
            // If there's an intersection of modules used for these line item subsets, then that's ok
            return entityAModules.filter(value => entityBModules!.includes(value)).length != 0;
        }


        return false;
    }

    getMissingDimensions(sourceDimensions: number[] | FuncSquareBracketsContext, targetDimensions: number[] | undefined = undefined): { extraSourceEntityMappings: number[], extraTargetEntityMappings: number[] } {
        if (sourceDimensions instanceof FuncSquareBracketsContext) {
            // Check the entity and line item dimensions match, if not we'll need to check for SELECT/SUM/LOOKUP
            let { extraSourceEntityMappings, extraTargetEntityMappings } =
                this.getMissingDimensions(this.getEntityDimensions(sourceDimensions), this.getCurrentItemFullAppliesTo());

            let dimensionMappings = sourceDimensions.dimensionmapping();

            for (let i = 0; i < dimensionMappings.length; i++) {
                let dimensionMapping = dimensionMappings[i];

                if (dimensionMapping.childCount < 2) continue;

                let selectorType = dimensionMapping.dimensionmappingselector().text;
                let entity = dimensionMapping.entity();

                if (entity instanceof DotQualifiedEntityIncompleteContext) {
                    continue;
                }

                let selector = this.getEntityName(entity);
                let lineitem = this.getItemInfoFromEntityName(selector)!;


                if (lineitem === undefined) {
                    continue;
                }

                switch (selectorType.toUpperCase()) {
                    case "SELECT":
                        extraSourceEntityMappings = extraSourceEntityMappings.filter(e => !this.areCompatibleDimensions(e, this.getEntityIdFromName(lineitem.qualifier + '.' + lineitem.name) ?? this.getEntityIdFromName(lineitem.qualifier ?? lineitem.name)!));
                        break;
                    case "LOOKUP": // In this case the selector is a line item, so we check the type of that line item and remove the missing dimension if there is one
                        var lineItemEntityId = this.getLineItemEntityId(lineitem.lineItemInfo);
                        extraSourceEntityMappings = extraSourceEntityMappings.filter(e => !this.areCompatibleDimensions(e, lineItemEntityId));
                        break;
                    default: // If it's an aggregation we check the target entity mappings


                        var lineItemEntityId = this.getLineItemEntityId(lineitem.lineItemInfo);
                        extraTargetEntityMappings = extraTargetEntityMappings.filter(e => !this.areCompatibleDimensions(e, lineItemEntityId));
                        // We also remove any of this line item's dimensions from the source
                        for (let j = 0; j < lineitem.lineItemInfo.fullAppliesTo.length; j++) {
                            extraSourceEntityMappings = extraSourceEntityMappings.filter(e => !this.areCompatibleDimensions(e, lineitem.lineItemInfo.fullAppliesTo[j]));
                        }
                }
            }

            return { extraSourceEntityMappings, extraTargetEntityMappings };

        }
        else if (targetDimensions === undefined) {
            throw new Error('getMissingDimensions called with invalid parameters');
        }
        else {
            let sourceDimensionNames = sourceDimensions.map(n => this.getEntityNameFromId(n));
            let targetDimensionNames = targetDimensions.map(n => this.getEntityNameFromId(n));

            let extraSourceEntityMappings = sourceDimensions.slice();
            for (let i = 0; i < targetDimensions.length; i++) {
                extraSourceEntityMappings = extraSourceEntityMappings.filter(e => !this.areCompatibleDimensions(e, targetDimensions[i]));
            }

            let extraTargetEntityMappings = targetDimensions.slice();
            for (let i = 0; i < sourceDimensions.length; i++) {
                extraTargetEntityMappings = extraTargetEntityMappings.filter(e => !this.areCompatibleDimensions(e, sourceDimensions[i]));
            }

            extraSourceEntityMappings = extraSourceEntityMappings.filter(e => e != 121000000021);
            extraTargetEntityMappings = extraTargetEntityMappings.filter(e => e != 121000000021);

            extraSourceEntityMappings = extraSourceEntityMappings.filter(e => e != 20000000020); // Version in source is never an extra, as that's fine

            return { extraSourceEntityMappings, extraTargetEntityMappings };
        }
    }
    GetMissingDimensionsAutoCompletion(referenceContext: FuncSquareBracketsContext | EntityContext): string[] {
        let entityDimensions = this.getEntityDimensions(referenceContext instanceof FuncSquareBracketsContext ? referenceContext.entity() : referenceContext);
        let currentLineItemDimensions = this.getCurrentItemFullAppliesTo()!;
        let missingDimensions = referenceContext instanceof FuncSquareBracketsContext ? this.getMissingDimensions(referenceContext) : this.getMissingDimensions(entityDimensions, currentLineItemDimensions);

        if (missingDimensions != undefined) {
            let extraSelectorStrings: string[] = [];

            for (let i = 0; i < missingDimensions.extraTargetEntityMappings.length; i++) {
                let possibleEntities: { entityMetaData: EntityMetaData; aggregateFunction: string; }[] = [];
                this.getAllLineItems().forEach(li => {
                    // Don't consider line items with more than one dimension unless the dimensions match the current line item
                    if (li.lineItemInfo.fullAppliesTo.length != 1 && !li.lineItemInfo.fullAppliesTo.every(d => entityDimensions?.includes(d))) {
                        return;
                    }

                    if (this.getSubsetNormalisedEntityId(li.lineItemInfo.format.hierarchyEntityLongId!) == this.getSubsetNormalisedEntityId(missingDimensions?.extraTargetEntityMappings[i]!)) {
                        // Found a line item referring to an entity that exists in the target mapping, but not the source
                        let entityDimensionsIntersection = entityDimensions?.filter(ed => li.lineItemInfo.fullAppliesTo.map(f => this.getSubsetNormalisedEntityId(f)).includes(this.getSubsetNormalisedEntityId(ed)!));
                        if ((entityDimensionsIntersection?.length ?? 0) != 0) {
                            // This line item's dimensionality overlaps with the target line item
                            // Ideally we would take the aggregation method from the aggregation of the current line item, but that data is not available, so we just have defaults depending on the line item format's data type
                            possibleEntities.push({ entityMetaData: li, aggregateFunction: DefaultCodeCompleteAggregation(this.getCurrentItem().format) });
                        }
                    }
                });

                // for existing possible entries, filter the existing entries with possible ones, not the other way around. This way we use an existing aggregation function
                this.TryAddPossibleEntry(possibleEntities, extraSelectorStrings);
            }

            for (let i = 0; i < missingDimensions.extraSourceEntityMappings.length; i++) {
                let possibleEntities: { entityMetaData: EntityMetaData; aggregateFunction: string; }[] = [];
                this.getAllLineItems().forEach(li => {
                    // Don't consider line items with more than one dimension unless the dimensions match the current line item
                    if (li.lineItemInfo.fullAppliesTo.length != 1 && !li.lineItemInfo.fullAppliesTo.every(d => entityDimensions?.includes(d))) {
                        return;
                    }

                    if (this.getSubsetNormalisedEntityId(li.lineItemInfo.format.hierarchyEntityLongId!) == this.getSubsetNormalisedEntityId(missingDimensions!.extraSourceEntityMappings[i])) {
                        // Found a line item referring to an entity that exists in the source mapping, but not the target
                        let currentLineItemDimensionsIntersection = currentLineItemDimensions?.filter(ed => li.lineItemInfo.fullAppliesTo.map(d => this.getSubsetNormalisedEntityId(d)).includes(this.getSubsetNormalisedEntityId(ed)!));
                        if ((currentLineItemDimensionsIntersection?.length ?? 0) != 0) {
                            // This line item's dimensionality overlaps with the target line item
                            // Ideally we would take the aggregation method from the aggregation of the current line item, but that data is not available, so we just have defaults depending on the line item format's data type
                            possibleEntities.push({ entityMetaData: li, aggregateFunction: "LOOKUP" });
                        }
                    }
                });

                this.TryAddPossibleEntry(possibleEntities, extraSelectorStrings);
            }

            return extraSelectorStrings;
        }
        return [];
    }

    private TryAddPossibleEntry(possibleEntities: { entityMetaData: EntityMetaData; aggregateFunction: string; }[], extraSelectorStrings: string[]) {
        let possibleEntitiesExisting = this.getAggregateEntries().filter(ee => possibleEntities.filter(pe => ee.aggregateFunction.startsWith('LOOKUP') === pe.aggregateFunction.startsWith('LOOKUP') && ee.entityMetaData.qualifier === pe.entityMetaData.qualifier && ee.entityMetaData.name === pe.entityMetaData.name).length != 0);
        let possibleEntitiesPropOnly = possibleEntities.filter(pe => pe.entityMetaData.qualifier?.startsWith('PROP ') ?? false);
        // Use an existing mapping if available since that would have the correct aggregation function
        if (possibleEntitiesExisting.length === 1) {
            extraSelectorStrings.push(`${possibleEntitiesExisting[0].aggregateFunction}: ${this.getNameFromComponents(possibleEntitiesExisting[0].entityMetaData)}`);
        } // If not, then use the single valid one
        else if (possibleEntities.length === 1) {
            extraSelectorStrings.push(`${possibleEntities[0].aggregateFunction}: ${this.getNameFromComponents(possibleEntities[0].entityMetaData)}`);
        } // If not, then use a single PROP... one
        else if (possibleEntitiesPropOnly.length === 1) {
            extraSelectorStrings.push(`${possibleEntitiesPropOnly[0].aggregateFunction}: ${this.getNameFromComponents(possibleEntitiesPropOnly[0].entityMetaData)}`);
        }
    }
}