import { getAnaplanMetaData, getFormulaErrors } from '../Anaplan/AnaplanHelpers';
import { Random } from '../Random';
import { modelInfoJson } from './AnaplanModelString';
describe("Check no program errors are produced with an incorrect formula", () => {
    global.anaplan = { data: { ModelContentCache: { _modelInfo: JSON.parse(modelInfoJson) } } };
    let cases: any[][] = [];

    let rnd = new Random(1);

    for (let i = 0; i < anaplan.data.ModelContentCache._modelInfo.moduleInfos.length; i++) {
        for (let j = 0; j < anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos.length; j++) {

            let formula = anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemInfos[j].formula;
            if (formula != undefined) {
                let charToRemove = rnd.nextInt32([0, formula.length]);
                // psudo-randomly remove a character from the formula
                let alteredformula = formula.slice(0, charToRemove) + formula.slice(charToRemove + 1);

                cases.push([
                    i,
                    j,
                    "'" + anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i] +
                    "'.'" +
                    anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0][j] +
                    "'",
                    alteredformula,
                    formula]);

                if (j % 15 === 0) {
                    for (let k = 0; k < formula.length; k += 5) {
                        cases.push([
                            i,
                            j,
                            "'" + anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.labels[0][i] +
                            "'.'" +
                            anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.labels[0][j] +
                            "'",
                            formula.substring(0, k),
                            formula]);
                    }
                }
            }
        }
    }

    it.each(cases)('%i, %i, Check formula for %s: %s. ORIGINAL WAS: %s', (i, j, _, formula, __) => {
        let metaData = getAnaplanMetaData(anaplan.data.ModelContentCache._modelInfo.modulesLabelPage.entityIds[0][i],
            anaplan.data.ModelContentCache._modelInfo.moduleInfos[i].lineItemsLabelPage.entityIds[0][j]);

        if (formula != undefined) {
            let errors = getFormulaErrors(formula, metaData, 1, formula.length);
            expect(errors).toBeDefined();
        }
    });
});