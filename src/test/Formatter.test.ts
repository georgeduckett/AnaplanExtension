import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { AnaplanFormulaFormatterVisitor } from '../Anaplan/AnaplanFormulaFormatterVisitor';
import { AnaplanFormulaLexer } from '../Anaplan/antlrclasses/AnaplanFormulaLexer';
import { AnaplanFormulaParser } from '../Anaplan/antlrclasses/AnaplanFormulaParser';
import { modelInfoJson } from './AnaplanModelString';

describe("Check formatting a formula only results in whitespace changes", () => {
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

    it.each(cases)('%i, %i, Check formula for %s: %s.', (i, j, _, formula) => {
        const mylexer = new AnaplanFormulaLexer(CharStreams.fromString(formula));
        mylexer.removeErrorListeners();
        const myparser = new AnaplanFormulaParser(new CommonTokenStream(mylexer));
        myparser.removeErrorListeners();

        let formatter = new AnaplanFormulaFormatterVisitor(2);
        let formulaCtx = myparser.formula();
        let text = formula;

        if (myparser.numberOfSyntaxErrors === 0) {
            text = formatter.visit(formulaCtx);
        }

        expect(text.replace(/\s/g, '')).toBe(formula.replace(/ /g, ''));
    });
});