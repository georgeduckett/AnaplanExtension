import { getAnaplanMetaData, getFormulaErrors } from '../Anaplan/AnaplanHelpers';
import { modelInfoJson } from './AnaplanModelString';
it("Check incorrect keyword detected", () => {
    global.anaplan = { data: { ModelContentCache: { _modelInfo: JSON.parse(modelInfoJson) } } };
    let i = 10;
    let j = 0;
    let metaData = getAnaplanMetaData(anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityIds[0][i],
        anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.entityIds[0][j]);
    let formula = "RANK(1, asdlaksnd)";
    let errors = getFormulaErrors(formula, metaData, 1, formula.length);

    expect(errors).toHaveLength(1);
    let desiredErrorStart = "Unrecognised keyword ";
    expect(errors[0].message.substring(0, desiredErrorStart.length)).toEqual(desiredErrorStart);

});