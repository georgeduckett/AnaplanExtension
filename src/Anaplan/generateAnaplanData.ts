import fs = require('fs');
import path = require('path');
var request = require('sync-request');
import cheerio = require('cheerio');
import { GeneratedParameterInfo } from "./GeneratedParameterInfo"
import { GeneratedFunctionInfo } from './GeneratedFunctionInfo';



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


let functions: Map<string, GeneratedFunctionInfo> = new Map<string, GeneratedFunctionInfo>();
let aggregateFunctions: Map<string, GeneratedFunctionInfo> = new Map<string, GeneratedFunctionInfo>();

const $ = cheerio.load(request('GET', 'https://help.anaplan.com/186d3858-241b-4b78-8aa5-006fc4260546-All-Functions').getBody());
const trs = $("table tr");
trs.each((_, tr) => {
    let tr2 = cheerio.load(tr);
    let tds = cheerio.load(tr)("td");
    let aElement = tds.first().find("a:not(:empty)");
    if (aElement.length != 0) {
        let functionName = aElement.text().trim();

        // We have a row with a link in the first cell
        console.log(functionName);

        let briefDescription = tr2(tds.get(1)).text().trim();
        let type = tr2(tds.get(2)).text().trim();

        let linkHref = 'https://help.anaplan.com' + aElement.attr('href');

        if (linkHref.endsWith('LEN')) {
            linkHref += 'GTH'; // LEN and LENGTH are the same
        }

        let detailPageBody = request('GET', linkHref).getBody();

        let detailPage = cheerio.load(detailPageBody); // Why is this so slow, can anything be done to speed up the parsing?

        let isAggregateFunction = detailPage('.anapedia-breadcrumb__link:contains("Aggregation Functions")').length != 0 || ["SELECT", "LOOKUP"].includes(functionName);

        if (isAggregateFunction) {
            if (functionName.includes(":")) {
                functionName = functionName.match(/x\[(.*): ?y\]/)![1];
            }
        }

        let syntax: string | undefined = undefined;

        let paramInfo: GeneratedParameterInfo[] = [];

        let titleText = detailPage('h1').text();

        if (titleText.includes(":")) {
            titleText = titleText.match(/x\[(.*): ?y\]/)![1];
        }

        switch (functionName) {
            case 'IF ISNOTBLANK':
            case 'IF ISBLANK':
            case 'IF AND':
            case 'IF NOT':
            case 'IF OR':
            case 'IF THEN ELSE':
            case 'NOT':
            case 'AND':
            case 'OR':
            case 'SELECT & LOOKUP':
            case 'SUM & LOOKUP':
            case 'BLANK':
            case 'SUM & SELECT': console.log('Generic page or not a function, not needed'); return;
        }

        if (!functionName.includes(titleText) && !["COUPDAYBS", 'LENGTH'].includes(titleText)) {
            // If the linked page doesn't have a header matching the name function, skip it

            switch (functionName) {
                case 'AND': syntax = 'x AND y'; break;
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
                let matchedText = matches.first().text().trim();
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

        if (syntax === "DAYINYEAR(Year)") {
            syntax = "DAYSINYEAR(Year)";
        } else if (syntax === "CUMULATE (Values to add, Boolean, List)") {
            syntax = "CUMULATE(Values to add, Boolean, List)";
        }

        if (syntax.includes('(')) {
            functionName = syntax.substr(0, syntax.indexOf('('));
        }

        // Now try and get the arguments
        if (syntax.includes('(') && !syntax.includes('()')) {
            let paramsFromSyntax: { name: string, required: boolean }[] = [];

            let start = syntax.indexOf('(') + 1;
            while (start < syntax.length - 1) {
                let nextCommaOrEnd = syntax.indexOf(',', start);
                if (nextCommaOrEnd === -1) {
                    nextCommaOrEnd = syntax.indexOf(')', start);
                }

                let nextParamName = syntax.substring(start, nextCommaOrEnd).trim();
                let required = true;
                if (nextParamName.endsWith('[')) {
                    nextParamName = nextParamName.substring(0, nextParamName.length - 1).trim();
                }
                if (nextParamName.startsWith('[')) {
                    nextParamName = nextParamName.substring(1).trim();
                    required = false;
                }
                if (nextParamName.endsWith(']')) {
                    nextParamName = nextParamName.substring(0, nextParamName.length - 1).trim();
                    required = false;
                }

                console.log(nextParamName);
                console.log(required);

                paramsFromSyntax.push({ name: nextParamName, required: required });
                start = nextCommaOrEnd + 1;
            }

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

                        let format: string | undefined;
                        if (formatIndex != undefined) {
                            format = detailPage(cells[formatIndex]).text().trim();
                        }

                        paramInfo.push(new GeneratedParameterInfo(paramsFromSyntax[rowIndex - 1].name, desc, format, required ?? (rowIndex - 1 < paramsFromSyntax.length ? paramsFromSyntax[rowIndex - 1].required : undefined)));
                    }
                }
            }

            function addParamInfo(paramIndex: number, text: string, paramInfo: GeneratedParameterInfo[]) {
                console.log(text);
                let required: boolean | undefined = undefined;
                if (text.includes('(optional)')) required = false;
                if (text.includes('(required)')) required = true;

                let paramName = text.substring(0, text.indexOf(':')).trim();
                let paramDesc = text.substring(text.indexOf(':') + 1).trim();


                if (paramIndex >= paramsFromSyntax.length) {
                    throw Error('Found more paramters than could be parsed from syntax');
                }

                paramInfo.push(
                    new GeneratedParameterInfo(
                        paramsFromSyntax[paramIndex].name, // use the parsed parameter name
                        paramDesc,
                        undefined,
                        required ?? (paramIndex < paramsFromSyntax.length ? paramsFromSyntax[paramIndex].required : undefined)));
            }

            let syntaxArgumentsList = detailPage('h2:contains("Syntax") + * + p:contains("where:") + ul, h2:contains("Syntax") + p:contains("where:") + ul');
            if (paramInfo.length === 0 && syntaxArgumentsList.length === 1) {
                console.log('Found syntax arguments ul.');
                let rows = syntaxArgumentsList.find('> li');
                for (let i = 0; i < rows.length; i++) {
                    addParamInfo(i, detailPage(rows[i]).text(), paramInfo);
                }
            }

            let syntaxArgumentsPSpanList = detailPage(' h2:contains("Syntax") + * + p:contains("where:") + p:has(span), h2:contains("Syntax") + p:contains("where:") + p:has(span)');
            if (paramInfo.length === 0 && syntaxArgumentsPSpanList.length === 1) {
                console.log('Found syntax arguments p span list.');
                let ps = syntaxArgumentsPSpanList.prev().nextUntil(':not(p:has(span))');

                for (let i = 0; i < ps.length; i++) {
                    addParamInfo(i, detailPage(ps[i]).text(), paramInfo);
                }
            }

            let argumentsList = detailPage('h2:contains("Arguments") + p + ul');
            if (paramInfo.length === 0 && argumentsList.length === 1) {
                console.log('Found arguments ul.');
                let rows = syntaxArgumentsList.find('> li');
                for (let i = 0; i < rows.length; i++) {
                    addParamInfo(i, detailPage(rows[i]).text(), paramInfo);
                }
            }

            if (paramInfo.length === 0) {
                throw Error('Could not work out arguments table for ' + functionName);
            }
        }

        if (isAggregateFunction) {
            aggregateFunctions.set(functionName, new GeneratedFunctionInfo(functionName, briefDescription, syntax, type, linkHref, paramInfo));
        } else {
            functions.set(functionName, new GeneratedFunctionInfo(functionName, briefDescription, syntax, type, linkHref, paramInfo));
        }
    }
});

// Replace undefined with '__undefined' then back again for stringify s otherwise it's removed.
let serialisedFunctions = JSON.stringify(Array.from(functions.entries()), (k, v) => (v === undefined) ? '__undefined' : v).replace(/"__undefined"/g, 'undefined');

// Sort out invalid characters
serialisedFunctions = serialisedFunctions.replace(/\\n/g, "\\n")
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f");
// remove non-printable and other non-valid JSON chars
serialisedFunctions = serialisedFunctions.replace(/[\u0000-\u0019]+/g, "");

// Replace undefined with '__undefined' then back again for stringify s otherwise it's removed.
let serialisedAggregateFunctions = JSON.stringify(Array.from(aggregateFunctions.entries()), (k, v) => (v === undefined) ? '__undefined' : v).replace(/"__undefined"/g, 'undefined');

// Sort out invalid characters
serialisedAggregateFunctions = serialisedAggregateFunctions.replace(/\\n/g, "\\n")
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f");
// remove non-printable and other non-valid JSON chars
serialisedAggregateFunctions = serialisedAggregateFunctions.replace(/[\u0000-\u0019]+/g, "");


//de-serialise JSON to Map:
let output = `import { GeneratedFunctionInfo } from "../GeneratedFunctionInfo"
export let deserialisedFunctions: Map<string, GeneratedFunctionInfo> = new Map<string, GeneratedFunctionInfo>(${serialisedFunctions});
export let deserialisedAggregateFunctions: Map<string, GeneratedFunctionInfo> = new Map<string, GeneratedFunctionInfo>(${serialisedAggregateFunctions});`

fs.writeFileSync(outputFile, output);
