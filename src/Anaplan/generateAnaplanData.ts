import fs = require('fs');
import path = require('path');
import TurndownService = require('turndown');
var turndownPluginGfm = require('turndown-plugin-gfm')
var request = require('sync-request');

import cheerio = require('cheerio');
import { GeneratedParameterInfo } from "./GeneratedParameterInfo"
import { GeneratedFunctionInfo } from './GeneratedFunctionInfo';


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


var gfm = turndownPluginGfm.gfm;
var turndownService = new TurndownService({ hr: '---', bulletListMarker: '-' });
turndownService.use(gfm);

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

        // Make relative urls absolute, and url-encode spaces so markdown accepts them
        detailPage('a').each(function (_, element) {
            var oldHref = detailPage(element).attr('href');
            if (oldHref != undefined && oldHref[0] === '/') {
                detailPage(element).attr('href', 'https://help.anaplan.com' + oldHref.replace(/ /g, '%20'));
            }
        });

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

                let firstFunctionParamIndex = paramInfo.length;

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
                        let paramIndex = rowIndex - 1;

                        if (argIndex === undefined) {
                            throw Error('ArgIndex for parameter table undefined');
                        }
                        if (descIndex === undefined) {
                            throw Error('DescIndex for parameter table undefined');
                        }

                        let arg = detailPage(cells[argIndex]).text().trim();
                        // Add a horizontal rule after the parameter description, so the function description is separated from it
                        let desc = turndownService.turndown(detailPage(cells[descIndex]).html()! + '<hr>');

                        let required: boolean | undefined;

                        if (arg.includes('(required)')) {
                            required = true;
                            arg = arg.replace('(required)', '').trim()
                        }
                        if (arg.includes('(optional)')) {
                            required = false;
                            arg = arg.replace('(optional)', '').trim()
                        }

                        let formatArr: string[] | undefined;
                        if (formatIndex != undefined) {
                            formatArr = [];

                            if (functionName === "NAME") {
                                // Documentation for this function isn't correct
                                formatArr.push("ENTITY");
                                formatArr.push("TIME_ENTITY");
                            }
                            else if (functionName === "RIGHT" || functionName === "LEFT") {
                                // Documentation isn't a simple data type
                                if (paramIndex === 0) {
                                    formatArr.push("TEXT");
                                }
                                else {
                                    formatArr.push("NUMBER");
                                }
                            }
                            else {
                                if ((functionName === "LEAD" || functionName === "LAG" || functionName === "OFFSET") && paramIndex === 2) {
                                    // Param index 2 should be same as index 0. We don't enforce that, but at least restrict the types to be same as the first param
                                    formatArr = paramInfo[firstFunctionParamIndex + 0].format;
                                }
                                else if (functionName === "CUMULATE" && paramIndex === 2) {
                                    formatArr.push("ENTITY");
                                }
                                else if (functionName === "LN" && paramIndex === 0) {
                                    formatArr.push("NUMBER");
                                }
                                else if (functionName === "POST" && paramIndex === 1) {
                                    formatArr.push("NUMBER");
                                }
                                else if (functionName === "LAG" && paramIndex === 3) {
                                    formatArr.push("KEYWORD:NONSTRICT");
                                    formatArr.push("KEYWORD:SEMISTRICT");
                                    formatArr.push("KEYWORD:STRICT");
                                }
                                else if ((functionName === "MONTH" || functionName === "YEAR") && paramIndex === 1) {
                                    formatArr.push("KEYWORD:START");
                                    formatArr.push("KEYWORD:MID");
                                    formatArr.push("KEYWORD:END");
                                }
                                else if (functionName === "TEXTLIST" && paramIndex === 3) {
                                    // Param index 3 doesn't have keywords we're able to parse
                                    formatArr.push("KEYWORD:ALL");
                                    formatArr.push("KEYWORD:UNIQUE");
                                }
                                else if (functionName === "MOVINGSUM" && paramIndex === 2) {
                                    // Incorrect docs
                                    formatArr.push("NUMBER");
                                }
                                else if (functionName === "TIMESUM" && paramIndex === 3) {
                                    // Param index 3 doesn't have keywords we're able to parse
                                    formatArr.push("KEYWORD:SUM");
                                    formatArr.push("KEYWORD:AVERAGE");
                                    formatArr.push("KEYWORD:MIN");
                                    formatArr.push("KEYWORD:MAX");
                                    formatArr.push("KEYWORD:ANY");
                                    formatArr.push("KEYWORD:ALL");
                                    formatArr.push("KEYWORD:FIRSTNONBLANK");
                                    formatArr.push("KEYWORD:LASTNONBLANK");
                                    formatArr.push("KEYWORD:TEXTLIST");
                                }
                                else {
                                    let formatText = detailPage(cells[formatIndex]).text().trim().toUpperCase().replace(" OR ", ",");
                                    if (formatText.indexOf('CAN BE ') != -1) {
                                        let trimmedFormatText = formatText.substring(0, formatText.indexOf('CAN BE ')).trim();

                                        if (trimmedFormatText.length != 0) {
                                            formatText = trimmedFormatText;
                                        }
                                    }
                                    let format = formatText.split(',').map(f => {
                                        if (f.trim().startsWith("OR ")) {
                                            return f.substring("OR ".length);
                                        }
                                        return f.trim().replace('.', '');
                                    });

                                    if (arg.toLowerCase() === "locale") {
                                        const languageCodes = ["ab", "aa", "af", "ak", "sq", "am", "ar", "an", "hy", "as", "av", "ae", "ay", "az", "bm", "ba", "eu", "be", "bn", "bi", "bs", "br", "bg", "my", "ca", "km", "ch", "ce", "ny", "zh", "cu", "cv", "kw", "co", "cr", "hr", "cs", "da", "dv", "nl", "dz", "en", "eo", "et", "ee", "fo", "fj", "fi", "fr", "ff", "gd", "gl", "lg", "ka", "de", "el", "gn", "gu", "ht", "ha", "he", "hz", "hi", "ho", "hu", "is", "io", "ig", "id", "ia", "ie", "iu", "ik", "ga", "it", "ja", "jv", "kl", "kn", "kr", "ks", "kk", "ki", "rw", "ky", "kv", "kg", "ko", "kj", "ku", "lo", "la", "lv", "li", "ln", "lt", "lu", "lb", "mk", "mg", "ms", "ml", "mt", "gv", "mi", "mr", "mh", "mn", "na", "nv", "ng", "ne", "nd", "se", "no", "nb", "nn", "oc", "oj", "or", "om", "os", "pi", "ps", "fa", "pl", "pt", "pa", "qu", "ro", "rm", "rn", "ru", "sm", "sg", "sa", "sc", "sr", "sn", "ii", "sd", "si", "sk", "sl", "so", "nr", "st", "es", "su", "sw", "ss", "sv", "tl", "ty", "tg", "ta", "tt", "te", "th", "bo", "ti", "to", "ts", "tn", "tr", "tk", "tw", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "cy", "fy", "wo", "xh", "yi", "yo", "za", "zu"];
                                        const countryCodes = ["AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ", "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR", "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC", "CO", "KM", "CD", "CG", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO", "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF", "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY", "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM", "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY", "LI", "LT", "LU", "MO", "MK", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI", "NE", "NG", "NU", "NF", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH", "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC", "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS", "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK", "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "UM", "US", "UY", "UZ", "VU", "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW"];
                                        for (let i = 0; i < languageCodes.length; i++) {
                                            formatArr.push("KEYWORD:" + languageCodes[i].toUpperCase());
                                            for (let j = 0; j < countryCodes.length; j++) {
                                                formatArr.push("KEYWORD:" + languageCodes[i].toUpperCase() + "_" + countryCodes[j].toUpperCase());
                                            }
                                        }
                                    }
                                    else {
                                        // Parse the format properly into proper Format.DataType strings
                                        for (let i = 0; i < format.length; i++) {
                                            if (format[i] === "LIST") {
                                                formatArr.push("ENTITY");
                                            }
                                            else if (format[i] === "TIME PERIOD") {
                                                formatArr.push("TIME_ENTITY");
                                            }
                                            else if (format[i] === "KEYWORD") {
                                                // Find any capatilised words and have them as keywords
                                                let capatilisedWords = Array.from(desc.matchAll(/\b[A-Z]+\b/g)).flat();
                                                if (capatilisedWords.length === 0) {
                                                    throw new Error("No keywords where able to be parsed");
                                                }
                                                for (let i = 0; i < capatilisedWords.length; i++) {
                                                    if (capatilisedWords[i] != functionName) {
                                                        formatArr.push("KEYWORD:" + capatilisedWords[i]);
                                                    }
                                                }
                                            }
                                            else if (format[i] === "NUMERIC LINE ITEM") {
                                                formatArr.push("NUMBER");
                                            }
                                            else if (format[i] === "NUMBER (PERCENTAGE)") {
                                                formatArr.push("NUMBER");
                                            }
                                            else if (format[i] === "TEXT LINE ITEM") {
                                                formatArr.push("TEXT");
                                            }
                                            else if (format[i] === "TEXT LINE ITEM") {
                                                formatArr.push("TEXT");
                                            }
                                            else if (format[i] === "PERCENTAGE") {
                                                formatArr.push("NUMBER");
                                            }
                                            else if (format[i] != "") {
                                                formatArr.push(format[i]);
                                            }
                                        }
                                    }
                                }
                            }
                        }


                        paramInfo.push(new GeneratedParameterInfo(paramsFromSyntax[rowIndex - 1].name, desc, formatArr, required ?? (rowIndex - 1 < paramsFromSyntax.length ? paramsFromSyntax[rowIndex - 1].required : undefined)));
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
export let deserialisedAggregateFunctions: Map<string, GeneratedFunctionInfo> = new Map<string, GeneratedFunctionInfo>(${serialisedAggregateFunctions});

export let deserialisedKeywords = [...new Set(Array.from(Array.from(deserialisedFunctions).flatMap(f => f[1].paramInfo).filter(p => p.format != undefined)).flatMap(p => p.format!.filter(f => f.startsWith("KEYWORD:")).map(f => f.substring("KEYWORD:".length))))];`

fs.writeFileSync(outputFile, output);
