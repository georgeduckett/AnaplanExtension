import { entitySpecialCharSelector } from "./AnaplanFormulaTypeEvaluatorVisitor";
import { unQuoteEntity, getOriginalText, AnaplanDataTypeStrings, Format, anaplanTimeEntityBaseId } from "./AnaplanHelpers";
import { EntityContext, QuotedEntityContext, WordsEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext, DimensionmappingContext } from "./antlrclasses/AnaplanFormulaParser";

export class AutoCompleteInfo {
    public label: string;
    public text: string;
    public kind: monaco.languages.CompletionItemKind;
    public autoInsertChars: string[];

    constructor(label: string, text: string, kind: monaco.languages.CompletionItemKind, autoInsertChars: string[]) {
        this.label = label;
        this.text = text;
        this.kind = kind;
        this.autoInsertChars = autoInsertChars;
    }
}

function assertUnreachable(x: never): never {
    throw new Error("Didn't expect to get here");
}

export enum EntityType { Module, Hierarchy, LineItem, LineItemSubSet, Version, HierarchyListItem }

export class EntityMetaData {
    public lineItemInfo: LineItemInfo;
    public entityType: EntityType;
    public qualifier: string;
    public name: string | undefined;

    constructor(lineItemInfo: LineItemInfo, entityType: EntityType, qualifier: string, name: string | undefined) {
        this.lineItemInfo = lineItemInfo;
        this.entityType = entityType;
        this.qualifier = qualifier;
        this.name = name;
    }

    public getMonacoAutoCompleteKind(): monaco.languages.CompletionItemKind {
        switch (this.entityType) {
            case EntityType.Module: return monaco.languages.CompletionItemKind.Folder;
            case EntityType.LineItem: return monaco.languages.CompletionItemKind.Value;
            case EntityType.Hierarchy: return monaco.languages.CompletionItemKind.Constant;
            case EntityType.LineItemSubSet: return monaco.languages.CompletionItemKind.Value;
            case EntityType.Version: return monaco.languages.CompletionItemKind.Value;
            case EntityType.HierarchyListItem: return monaco.languages.CompletionItemKind.Value;
            default: return assertUnreachable(this.entityType);
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

    constructor(lineItemInfo: Map<string, EntityMetaData>, subsetInfo: Map<number, SubsetInfo>, entityNames: Map<number, string>, entityIds: Map<string, { id: number, type: string }>, hierarchyParents: Map<number, number>, moduleName: string, currentLineItem: LineItemInfo) {
        this._moduleName = moduleName;
        this._subsetInfo = subsetInfo;
        this._lineItemInfo = lineItemInfo;
        this._hierarchyParents = hierarchyParents;
        this._entityNames = entityNames;
        this._entityIds = entityIds;
        this._currentLineItem = currentLineItem;
    }

    quoteIfNeeded(entityName: string): string {
        if (entityName.match(entitySpecialCharSelector)) {
            return "'" + entityName + "'";
        }
        else {
            return entityName;
        }
    }

    getAutoCompleteQualifiedLeftPart(): Set<AutoCompleteInfo> {
        let result = new Set<string>();

        for (let lineItem of this._lineItemInfo) {
            if (lineItem[1].name != undefined) {
                // If this line item is dot-qualified, show just the first part
                result.add(lineItem[1].qualifier);
            }
        }

        return new Set(Array.from(result).map(e => new AutoCompleteInfo(e, this.quoteIfNeeded(e), monaco.languages.CompletionItemKind.Folder, ['.'])));
    }
    getAutoCompleteQualifiedRightPart(leftPartText: string): Set<AutoCompleteInfo> {
        let result = new Set<AutoCompleteInfo>();
        // Add anything that needs to be qualified
        for (let lineItem of this._lineItemInfo) {
            if (lineItem[1].name != undefined) {
                if (this.quoteIfNeeded(lineItem[1].qualifier) === leftPartText) {
                    // If this line item is dot-qualified, show just the first part
                    result.add(new AutoCompleteInfo(lineItem[1].name, this.quoteIfNeeded(lineItem[1].name), monaco.languages.CompletionItemKind.Constant, [' ', ']']));
                }
            }
        }

        return result;
    }

    getAutoCompleteWords(): Set<AutoCompleteInfo> {
        let result = new Set<AutoCompleteInfo>();
        // Add anything that doesn't need to be qualified
        for (let lineItem of this._lineItemInfo) {
            if (!lineItem[1].name != undefined && !lineItem[0].startsWith('<<') && !lineItem[0].startsWith('--')) {
                result.add(new AutoCompleteInfo(lineItem[0], this.quoteIfNeeded(lineItem[0]), monaco.languages.CompletionItemKind.Constant, []));
            }
        }

        return result;
    }
    getEntityType(ctx: EntityContext): Format {
        let entityName = this.getEntityName(ctx);
        return this.getItemInfoFromEntityName(entityName)?.format ?? AnaplanDataTypeStrings.UNKNOWN;
    }
    getEntityDimensions(ctx: EntityContext): number[] {
        let entityName = this.getEntityName(ctx);
        let entityDimensions = this.getItemInfoFromEntityName(entityName)?.fullAppliesTo?.sort();

        if (entityDimensions === undefined) {
            return [];
        }
        return entityDimensions;
    }

    isKnownEntity(ctx: EntityContext): boolean {
        let entityName = this.getEntityName(ctx);
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

    getLineItemEntityId(lineItem: { format: Format, fullAppliesTo: number[] }): number { // We assume that if it's not a hierarchy entity, then it's a time entity
        return lineItem.format.hierarchyEntityLongId ?? (anaplanTimeEntityBaseId + lineItem.format.periodType.entityIndex);
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

    getItemInfoFromEntityName(entityName: string): { format: Format, fullAppliesTo: number[] } | undefined {
        return this._lineItemInfo.get(entityName)?.lineItemInfo;
    }

    getEntityNameFromId(entityId: number): string {
        return this._entityNames.get(entityId) ?? entityId.toString();
    }

    getEntityName(ctx: EntityContext): string {
        if (ctx instanceof QuotedEntityContext) {
            return this._moduleName + "." + unQuoteEntity(ctx.quotedEntityRule().text);
        } else if (ctx instanceof WordsEntityContext) {
            return this._moduleName + "." + getOriginalText(ctx);
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
            return this.getEntityName(ctx.entity());
        }

        throw new Error("Unknown EntityContext type. Has the grammar file been altered?     " + ctx.text);
    }

    areCompatibleDimensions(entityIdA: number, entityIdB: number) {
        // If the subset normalised values are the same, then that's a match
        if (this.getSubsetNormalisedEntityId(entityIdA) === this.getSubsetNormalisedEntityId(entityIdB)) {
            return true;
        }

        // If one is a parent of the other (not sure which way round, or both) then that's ok (B is parent of A I think)
        if (this.entityIsAncestorOfEntity(
            this.getSubsetNormalisedEntityId(entityIdB),
            this.getSubsetNormalisedEntityId(entityIdA))) {
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

    getMissingDimensions(sourceDimensions: number[], targetDimensions: number[]) {
        let extraSourceEntityMappings = sourceDimensions.slice();
        for (let i = 0; i < targetDimensions.length; i++) {
            extraSourceEntityMappings = extraSourceEntityMappings.filter(e => !this.areCompatibleDimensions(e, targetDimensions[i]));
        }

        let extraTargetEntityMappings = targetDimensions.slice();
        for (let i = 0; i < sourceDimensions.length; i++) {
            extraTargetEntityMappings = extraTargetEntityMappings.filter(e => !this.areCompatibleDimensions(e, sourceDimensions[i]));
        }

        // TODO: Work out exactly what this special entity id (for subsets?) is. Seems to be other entities starting 121, possibly relating to subsets
        extraSourceEntityMappings = extraSourceEntityMappings.filter(e => e != 121000000021);
        extraTargetEntityMappings = extraTargetEntityMappings.filter(e => e != 121000000021);

        return { extraSourceEntityMappings, extraTargetEntityMappings };
    }
}