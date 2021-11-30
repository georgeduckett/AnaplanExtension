import fs = require('fs');
import path = require('path');
var request = require('sync-request');
import cheerio = require('cheerio');
import { ParameterInfo } from "./ParameterInfo"



// TODO: Use function signatures properly
/*monaco.languages.registerSignatureHelpProvider('csharp', {

   signatureHelpTriggerCharacters: ['('],
   signatureHelpRetriggerCharacters: [','],
   provideSignatureHelp: function(model, position) {

      var textUntilPosition = model.getValueInRange({
         startLineNumber: 1,
         startColumn: 1,
         endLineNumber: position.lineNumber,
         endColumn: position.column
      });

      var match = textUntilPosition.includes("(");

      if (match) {
         return {value:{
            signatures: [{
               label: "parameter1",
               documentation: " this method does blah",
               parameters: [{
                  label: "ParamInfo1",
                  documentation: "this param does blah"
               }],
               activeParameter: 0,
            }],

            activeSignature: 0,
            activeParameter: 0
         }};
      }
      return [];
   }
});

monaco.editor.create(document.getElementById("container"), {
   value: "",
   language: "csharp",
   parameterHints: true
});*/









let filePath = process.argv[1];
let outputFile = `${path.parse(filePath).dir}\\.${path.parse(filePath).name}\\FunctionInfo.ts`;
console.log(outputFile);

if (!fs.existsSync(path.parse(outputFile).dir)) {
    fs.mkdirSync(path.parse(outputFile).dir);
}


let output = `import { ParameterInfo } from "./ParameterInfo"
export let FunctionDescriptions = new Map([\r\n`;

const $ = cheerio.load(request('GET', 'https://help.anaplan.com/186d3858-241b-4b78-8aa5-006fc4260546-All-Functions').getBody());
const trs = $("table tr");

trs.each((_, tr) => {
    let tds = cheerio.load(tr)("td");
    let aElement = tds.first().find("a:not(:empty)");
    if (aElement.length != 0) {
        let functionName = aElement.text();
        // We have a row with a link in the first cell
        console.log(functionName);

        let briefDescription = tds.get(1).children[0].data;
        let type = tds.get(2).children[0].data;

        let linkHref = 'https://help.anaplan.com' + aElement.attr('href');

        if (linkHref.endsWith('LEN')) {
            linkHref += 'GTH'; // LEN and LENGTH are the same
        }

        let detailPageBody = request('GET', linkHref).getBody();

        let detailPage = cheerio.load(detailPageBody); // Why is this so slow, can anything be done to speed up the parsing?


        let syntax: string | undefined = undefined;
        let paramInfo: ParameterInfo[] = [];

        let titleText = detailPage('h1').text();

        if (!functionName.includes(titleText) && !["COUPDAYBS", 'LENGTH'].includes(titleText)) {
            // If the linked page doesn't have a header matching the name function, skip it

            switch (functionName) {
                case 'IF ISNOTBLANK':
                case 'IF ISBLANK':
                case 'IF AND':
                case 'IF NOT':
                case 'IF OR':
                case 'SELECT & LOOKUP':
                case 'SUM & LOOKUP':
                case 'SUM & SELECT': console.log('Generic page, not needed'); return;
                case 'AND': syntax = 'x AND y'; break;
                case 'BLANK': syntax = 'BLANK'; break;
                case 'NOT': syntax = 'NOT x'; break;
                case 'OR': syntax = 'x OR y'; break;
                default: throw Error(`Generic page detected for '${functionName}', title text: '${titleText}', 'href: ${linkHref}`);
            }

        }

        if (syntax === undefined) {
            let syntaxSelectors = [
                'h2:contains("SYNTAX") + p span',
                'h2:contains("Syntax") + p span',
                'h2:contains("Syntax") + p strong',
                'h2:contains("SYNTAX") + p strong',
                'h2:contains("Syntax") + p code',
                'h2:contains("SYNTAX") + p code',
                'h2:contains("Syntax") + p pre',
                'h2:contains("SYNTAX") + p pre',
                'h2:contains("Syntax") + pre',
                'h2:contains("SYNTAX") + pre',
                'h2:contains("Syntax") + code',
                'h2:contains("SYNTAX") + code',
                'code',
                'pre',
            ];



            for (let i = 0; i < syntaxSelectors.length; i++) {
                let matches = detailPage(syntaxSelectors[i]);
                let matchedText = matches.first().text();
                if (matchedText != '') {
                    syntax = matchedText;
                    break;
                }
            }

            if (syntax === undefined) {
                throw Error('Could not parse page for ' + functionName);
            }
        }

        console.log(syntax);

        // Now try and get the arguments
        if (syntax.includes('(') && !syntax.includes('()')) {
            let table = detailPage('table:has(tr td:contains("Argument")), table:has(tr td strong:contains("Argument")), table:has(tr th:contains("Argument")), table:has(tr th strong:contains("Argument"))')

            if (table.length === 1) {
                console.log('Found arguments table.');

                let rows = table.find('tr');

                let argIndex: number | undefined = undefined;
                let formatIndex: number | undefined = undefined;
                let descIndex: number | undefined = undefined;

                for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                    let cells = cheerio.load(rows[rowIndex])('td, th');
                    if (rowIndex === 0) {
                        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                            switch (detailPage(cells[cellIndex]).text().trim()) {
                                case 'Argument':
                                    argIndex = cellIndex;
                                    break;
                                case 'Data type':
                                case 'Data Type':
                                case 'Format':
                                    formatIndex = cellIndex;
                                    break;
                                case 'Description':
                                    descIndex = cellIndex;
                                    break;
                                case 'Available Sources':
                                    break;
                                default: throw Error(`Unknown table header: '${detailPage(cells[cellIndex]).text().trim()}'`)
                            }
                        }
                    }
                    else {
                        if (argIndex === undefined) {
                            throw Error('ArgIndex for parameter table undefined');
                        }
                        if (descIndex === undefined) {
                            throw Error('DescIndex for parameter table undefined');
                        }

                        let arg = detailPage(cells[argIndex]).text().trim();
                        let desc = detailPage(cells[descIndex]).text().trim();

                        let required: boolean | undefined;

                        if (arg.includes('(required)')) {
                            required = true;
                            arg = arg.replace('(required)', '').trim()
                        }
                        if (arg.includes('(optional)')) {
                            required = false;
                            arg = arg.replace('(optional)', '').trim()
                        }

                        if (arg === 'basis' && desc.startsWith('The basis determines how many days exist in a year.')) {
                            // TODO: Think up a good summary description for the basis since the standard one is very long
                        }

                        let format: string | undefined;
                        if (formatIndex != undefined) {
                            format = detailPage(cells[formatIndex]).text().trim();
                        }

                        console.log(`Param Name: ${arg}, Required: ${required}, Format: ${format}, Description: ${desc}`)
                    }
                }
                return; // TODO: Do something with this
            }

            let syntaxArgumentsList = detailPage('h2:contains("Syntax") + * + p:contains("where:") + ul, h2:contains("Syntax") + p:contains("where:") + ul');

            if (syntaxArgumentsList.length === 1) {
                console.log('Found syntax arguments ul.');
                return; // TODO: Do something with this
            }

            let syntaxArgumentsPSpanList = detailPage(' h2:contains("Syntax") + * + p:contains("where:") + p:has(span), h2:contains("Syntax") + p:contains("where:") + p:has(span)');

            if (syntaxArgumentsPSpanList.length === 1) {
                console.log('Found syntax arguments p span list.');
                return; // TODO: Do something with this
            }

            let argumentsList = detailPage('h2:contains("Arguments") + p + ul')

            if (argumentsList.length === 1) {
                console.log('Found arguments ul.');
                //return; // TODO: Do something with this
            }

            throw Error('Could not work out arguments table for ' + functionName);
        }
    }

});

output += `    ['SELECT', 'SELECT explanation')],\r\n`

output += `])`;

`export let AggregationFunctionsInfo = new Map([
        ['SELECT', new FunctionInfo('The SELECT function is used to identify a list item to use from one or more hierarchy lists to filter the source module data. This function works in conjunction with the other dimensions in the module to return dependent values.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
        ['LOOKUP', new FunctionInfo('The function looks up a number, Boolean, time period, list item, text, or date value in a list or a time period from a source module using one or more common mappings.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
        ['SUM', new FunctionInfo('The SUM aggregation function sums values in a result module based on mapping from a source module.', 'Aggregation', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xSUM_y')],
        ['AVERAGE', new FunctionInfo('Calculates the average for a range of values in a list.', 'Aggregation', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xAVERAGE_y')],
        ['MIN', new FunctionInfo('The MIN aggregation function returns the minimum value from a line item in a source module.', 'Aggregation', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xMIN_y')],
        ['MAX', new FunctionInfo('The MAX aggregation function returns the maximum value from a line item in a source module.', 'Aggregation', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xMAX_y')],
        ['ANY', new FunctionInfo('The ANY aggregation function returns a TRUE result for any value that matches specific Boolean criteria in a source module.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xANY_y')],
        ['ALL', new FunctionInfo('The ALL aggregation function returns a TRUE result for all values that match specific Boolean criteria in a source module.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xALL_y')],
    ])`

console.log(output);

//fs.writeFileSync(outputFile, output);
