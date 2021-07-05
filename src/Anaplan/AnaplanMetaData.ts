import { unQuoteEntity, getOriginalText } from "./AnaplanHelpers";
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

    getEntityIdFromName(entityName: string): number | undefined {
        return this._hierarchyIds.get(entityName);
    }

    getEntityParentId(entityId: number): number | undefined {
        return this._hierarchyParents.get(entityId);
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
}