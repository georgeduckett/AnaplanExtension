import { Position, Range } from "monaco-editor";
import { deserialisedFunctions } from "../Anaplan/.generateAnaplanData/FunctionInfo";

class SignatureHelpResultClass implements monaco.languages.SignatureHelpResult {
    value: monaco.languages.SignatureHelp;
    public constructor(value: monaco.languages.SignatureHelp) {
        this.value = value;
    }
    dispose(): void { }
}

export class FormulaSignatureHelpProvider implements monaco.languages.SignatureHelpProvider {
    signatureHelpTriggerCharacters = ['('];
    signatureHelpRetriggerCharacters = [','];
    provideSignatureHelp(model: monaco.editor.ITextModel, position: monaco.Position, token: monaco.CancellationToken, context: monaco.languages.SignatureHelpContext): monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult> {
        let textIndex = position.column - 2; // -1 as columns start at 1, -2 because if we're just before the closing bracket we don't want to count it
        let modelText = model.getValue();
        let commaCount = 0;
        // Loop backwards looking for an opening or closing bracket.
        while (textIndex != 0) {
            if (modelText[textIndex] === ')') {
                // If we find a closing one first, then we return nothing as we're not in a method.
                return null;
            }
            else if (modelText[textIndex] === '(') {
                break;
            }
            else if (modelText[textIndex] === ',') {
                commaCount++;
            }
            textIndex--;
        }
        if (textIndex <= 1) return null;

        // If we find an opening one, then find the word leading up to that
        let textUntilPosition = model.getWordUntilPosition(model.getPositionAt(textIndex)).word;

        if (textUntilPosition === undefined) return null;

        textUntilPosition = textUntilPosition.toUpperCase();



        if (deserialisedFunctions.has(textUntilPosition)) {
            let funcInfo = deserialisedFunctions.get(textUntilPosition)!;

            return new SignatureHelpResultClass({
                signatures: [{
                    label: funcInfo.syntax,
                    documentation: { value: funcInfo?.description + "  \r\n[Anaplan Documentation](" + funcInfo.htmlPageName + ")" },
                    parameters: funcInfo?.paramInfo.map(paramInfo => {
                        return {
                            label: paramInfo.name,
                            documentation: { value: paramInfo.details }, // TODO: Why aren't bulletpoints rendered as markdown?
                        };
                    })!,
                    activeParameter: commaCount,
                }],

                activeSignature: 0,
                activeParameter: commaCount
            }
            );
        }

        return null;
    };
}