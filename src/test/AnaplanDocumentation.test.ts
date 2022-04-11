import { deserialisedFunctions, deserialisedKeywords } from "../Anaplan/.generateAnaplanData/FunctionInfo";
import { AnaplanDataTypeStrings } from "../Anaplan/AnaplanDataTypeStrings";
import { FunctionsInfo } from "../Anaplan/FunctionInfo";

describe('Ensure anaplan function docs cover all known functions', () => {
    it.each(Array.from(FunctionsInfo.keys()))('%s', (key) => {
        expect(deserialisedFunctions.has(key)).toBeTruthy();
    });
});
describe('Ensure all known functions cover anaplan doc functions', () => {
    it.each(Array.from(deserialisedFunctions.keys()))('%s', (key) => {
        expect(FunctionsInfo.has(key)).toBeTruthy();
    });
});
describe('Ensure anaplan function parameter keywords have no spaces', () => {
    it.each(Array.from(deserialisedKeywords))('%s', (key) => {
        expect(key.indexOf(' ') === -1).toBeTruthy();
    });
});
describe('Ensure anaplan function parameter formats match known formats', () => {
    let cases: any[][] = [];

    deserialisedFunctions.forEach(val => {
        val.forEach(funcInfo => {
            if (funcInfo.paramInfo != undefined) {
                for (var j = 0; j < funcInfo!.paramInfo.length; j++) {
                    if (funcInfo!.paramInfo[j].format != undefined) {
                        for (var k = 0; k < funcInfo!.paramInfo[j].format!.length; k++) {
                            if (funcInfo!.paramInfo[j].name.toLocaleLowerCase() != "locale") {
                                cases.push([
                                    funcInfo!.name,
                                    funcInfo!.paramInfo[j].name,
                                    funcInfo!.paramInfo[j]!.format![k]]);
                            }
                        }
                    }
                }
            }
        }
        )
    });

    let possibleFormatStrings = ["ENTITY"];

    Object.values(AnaplanDataTypeStrings).forEach(value => {
        // This doesn't get methods
        possibleFormatStrings.push(value.dataType);
    });

    it.each(cases)('Function %s, param %s, format %s', (_functionName, _parameter, format) => {
        if (!format.startsWith('KEYWORD:')) {
            expect(possibleFormatStrings).toContain(format);
        }
    });
});