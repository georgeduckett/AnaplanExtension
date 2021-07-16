import { unQuoteEntity, getOriginalText, AnaplanDataTypeStrings, Format, anaplanTimeEntityBaseId } from "./AnaplanHelpers";
import { EntityContext, QuotedEntityContext, WordsEntityContext, DotQualifiedEntityContext, FuncSquareBracketsContext } from "./antlrclasses/AnaplanFormulaParser";

export class AnaplanMetaData {
    private readonly _moduleName: string;
    private readonly _lineItemInfo: Map<string, LineItemInfo>;
    private readonly _hierarchyParents: Map<number, number>;
    private readonly _hierarchyNames: Map<number, string>;
    private readonly _hierarchyIds: Map<string, number>;
    private readonly _currentLineItem: LineItemInfo;
    private readonly _subsetInfo: Map<number, SubsetInfo>;

    constructor(lineItemInfo: Map<string, LineItemInfo>, subsetInfo: Map<number, SubsetInfo>, hierarchyNames: Map<number, string>, hierarchyIds: Map<string, number>, hierarchyParents: Map<number, number>, moduleName: string, currentLineItem: LineItemInfo) {
        this._moduleName = moduleName;
        this._subsetInfo = subsetInfo;
        this._lineItemInfo = lineItemInfo;
        this._hierarchyParents = hierarchyParents;
        this._hierarchyNames = hierarchyNames;
        this._hierarchyIds = hierarchyIds;
        this._currentLineItem = currentLineItem;
    }

    getEntityType(ctx: EntityContext): Format {
        let entityName = this.getEntityName(ctx);
        return this.getLineItemInfoFromEntityName(entityName)?.format ?? AnaplanDataTypeStrings.UNKNOWN;
    }
    getEntityDimensions(ctx: EntityContext): number[] {
        let entityName = this.getEntityName(ctx);
        let entityDimensions = this.getLineItemInfoFromEntityName(entityName)?.fullAppliesTo?.sort();

        if (entityDimensions === undefined) {
            return [];
        }
        return entityDimensions;
    }

    getEntityIdFromName(entityName: string): number | undefined {
        return this._hierarchyIds.get(entityName);
    }

    getEntityParentId(entityId: number): number | undefined {
        return this._hierarchyParents.get(entityId);
    }

    getLineItemEntityId(lineItem: LineItemInfo): number { // We assume that if it's not a hierarchy entity, then it's a time entity
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

    getLineItemInfoFromEntityName(entityName: string): LineItemInfo | undefined {
        return this._lineItemInfo.get(entityName);
    }

    getEntityNameFromId(entityId: number): string {
        return this._hierarchyNames.get(entityId) ?? entityId.toString();
    }

    getEntityName(ctx: EntityContext): string {
        if (ctx instanceof QuotedEntityContext) {
            return this._moduleName + "." + unQuoteEntity(ctx.QUOTELITERAL().text);
        } else if (ctx instanceof WordsEntityContext) {
            return this._moduleName + "." + getOriginalText(ctx);
        } else if (ctx instanceof DotQualifiedEntityContext) {
            return `${unQuoteEntity(getOriginalText(ctx._left))}.${unQuoteEntity(getOriginalText(ctx._right))}`
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
        let entityBModules = this.getSubsetModules(entityIdA);

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