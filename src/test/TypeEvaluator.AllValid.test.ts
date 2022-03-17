import { getAnaplanMetaData, getFormulaErrors } from '../Anaplan/AnaplanHelpers';
import { modelInfoJson } from './AnaplanModelString';
describe('Check anaplan formulas are all considered valid', () => {
    global.anaplan = { data: { ModelContentCache: { _modelInfo: JSON.parse(modelInfoJson) } } };
    let cases: any[][] = [];

    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.moduleInfos.length; i++) {
        for (let j = 0; j < anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos.length; j++) {

            let formula = anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos[j].formula;

            if (formula != undefined) {
                cases.push([
                    i,
                    j,
                    "'" + anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i] +
                    "'.'" +
                    anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0][j] +
                    "'",
                    formula]);
            }
        }
    }

    it.each(cases)('%i, %i, Check formula for %s: %s', (i, j, _, formula) => {
        let metaData = getAnaplanMetaData(anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.entityIds[0][j]);

        if (formula != undefined) {
            let errors = getFormulaErrors(formula, metaData, 1, formula.length);
            expect(errors).toHaveLength(0);
        }
    });
});