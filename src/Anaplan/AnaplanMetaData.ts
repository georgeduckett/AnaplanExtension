import { IMarkdownString } from "monaco-editor";
import { entitySpecialCharSelector } from "./AnaplanFormulaTypeEvaluatorVisitor";
import { unQuoteEntity, getOriginalText, anaplanTimeEntityBaseId } from "./AnaplanHelpers";
import { EntityContext, QuotedEntityContext, WordsEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext, DimensionmappingContext } from "./antlrclasses/AnaplanFormulaParser";
import { AnaplanDataTypeStrings } from "./FunctionInfo";

export class AutoCompleteInfo {
    public label: string;
    public text: string;
    public kind: monaco.languages.CompletionItemKind;
    public autoInsertChars: string[] | undefined;
    public detail: string | undefined;
    public documentation: IMarkdownString | undefined;

    constructor(label: string, text: string, kind: monaco.languages.CompletionItemKind, autoInsertChars: string[] | undefined, detail: string | undefined, documentation: IMarkdownString | undefined) {
        this.label = label;
        this.text = text;
        this.kind = kind;
        this.autoInsertChars = autoInsertChars;
        this.detail = detail
        this.documentation = documentation;
    }
}

function assertUnreachable(x: never): never {
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
        let keys = new Set<string>();
        let result = new Set<AutoCompleteInfo>();

        for (let lineItem of this._lineItemInfo) {
            if (lineItem[1].qualifier != undefined) {
                // If this line item is dot-qualified, show just the first part, unless it's a hierarchy property
                let itemKey = lineItem[1].qualifier + '|' + EntityType[lineItem[1].entityType];
                if (!keys.has(itemKey)) {
                    result.add(new AutoCompleteInfo(
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
    getAutoCompleteQualifiedRightPart(leftPartText: string): Set<AutoCompleteInfo> {
        let result = new Set<AutoCompleteInfo>();
        // Add anything that needs to be qualified
        for (let lineItem of this._lineItemInfo) {
            if (lineItem[1].qualifier != undefined) {
                if (this.quoteIfNeeded(lineItem[1].qualifier) === leftPartText) {
                    // If this line item is dot-qualified, show just the last part
                    result.add(new AutoCompleteInfo(
                        lineItem[1].name,
                        this.quoteIfNeeded(lineItem[1].name),
                        monaco.languages.CompletionItemKind.Constant,
                        [' ', '[', ']', '+', '-', '*', '/'],
                        EntityType[lineItem[1].entityType],
                        undefined));
                }
            }
        }

        return result;
    }

    getAutoCompleteWords(): Set<AutoCompleteInfo> {
        let result = new Set<AutoCompleteInfo>();
        // Add anything that doesn't need to be qualified
        for (let lineItem of this._lineItemInfo) {
            if ((lineItem[1].qualifier === undefined || lineItem[1].qualifier === this._moduleName) && !lineItem[0].startsWith('<<') && !lineItem[0].startsWith('--')) {
                result.add(new AutoCompleteInfo(lineItem[1].name,
                    this.quoteIfNeeded(lineItem[1].name),
                    monaco.languages.CompletionItemKind.Constant,
                    [',', ']', '+', '-', '*', '/'],
                    EntityType[lineItem[1].entityType],
                    undefined));
            }
        }

        return result;
    }
    getEntityType(ctx: EntityContext): Format {
        let entityName = this.getEntityName(ctx);
        return this.getItemInfoFromEntityName(entityName)?.lineItemInfo?.format ?? AnaplanDataTypeStrings.UNKNOWN;
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

    areCompatibleDimensions(entityIdA: number, entityIdB: number | undefined) {
        if (entityIdB === undefined) return false;

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