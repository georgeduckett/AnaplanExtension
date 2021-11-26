import { AnaplanDataTypeStrings } from "./AnaplanDataTypeStrings";
import { AnaplanFormulaTypeEvaluatorVisitor } from "./AnaplanFormulaTypeEvaluatorVisitor";
import { getOriginalText, unQuoteEntity } from "./AnaplanHelpers";
import { FuncParameterisedContext } from "./antlrclasses/AnaplanFormulaParser";

export class FunctionInfo {
    public description: string;
    public type: string;
    public returnType: ((visitor: AnaplanFormulaTypeEvaluatorVisitor, ctx: FuncParameterisedContext) => Format) | Format;
    public htmlPageName: string | undefined;
    constructor(description: string, type: string, returnType: ((visitor: AnaplanFormulaTypeEvaluatorVisitor, ctx: FuncParameterisedContext) => Format) | Format, htmlPageName: string | undefined = undefined) {
        this.description = description;
        this.type = type;
        this.returnType = returnType;
        this.htmlPageName = htmlPageName;
    }
}

let itemFunc = (visitor: AnaplanFormulaTypeEvaluatorVisitor, ctx: FuncParameterisedContext) => {
    let itemName = unQuoteEntity(getOriginalText(ctx.expression()[0]));
    if (itemName === "Time") {
        return AnaplanDataTypeStrings.TIME_ENTITY;
    }
    else {
        return AnaplanDataTypeStrings.ENTITY(visitor._anaplanMetaData.getEntityIdFromName(itemName));
    }
}
let parentFunc = (visitor: AnaplanFormulaTypeEvaluatorVisitor, ctx: FuncParameterisedContext) => {
    let entityFormat = visitor.visit(ctx.expression()[0]);

    if (entityFormat.dataType == AnaplanDataTypeStrings.TIME_ENTITY.dataType) {
        // TODO: Check the level (year/month/etc) of the TIME_ENTITY and move it up one
        return AnaplanDataTypeStrings.TIME_ENTITY;
    }
    else {
        let entityId = entityFormat.hierarchyEntityLongId!;

        if (entityId === undefined) {
            visitor.addFormulaError(ctx.functionname(), `Can't get parent of unknown entity.`);
            return AnaplanDataTypeStrings.UNKNOWN;

        } else {

            let parentEntityId = visitor._anaplanMetaData.getEntityParentId(entityId);

            if (parentEntityId === undefined) {
                visitor.addFormulaError(ctx.functionname(), `There is no parent of entity ${visitor._anaplanMetaData.getEntityNameFromId(entityId)}.`);
                return AnaplanDataTypeStrings.UNKNOWN;
            }

            return AnaplanDataTypeStrings.ENTITY(parentEntityId);
        }

    }
}

export let AggregationFunctionsInfo = new Map([
    ['SELECT', new FunctionInfo('The SELECT function is used to identify a list item to use from one or more hierarchy lists to filter the source module data. This function works in conjunction with the other dimensions in the module to return dependent values.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['LOOKUP', new FunctionInfo('The function looks up a number, Boolean, time period, list item, text, or date value in a list or a time period from a source module using one or more common mappings.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['SUM', new FunctionInfo('The SUM aggregation function sums values in a result module based on mapping from a source module.', 'Aggregation', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xSUM_y')],
    ['AVERAGE', new FunctionInfo('Calculates the average for a range of values in a list.', 'Aggregation', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xAVERAGE_y')],
    ['MIN', new FunctionInfo('The MIN aggregation function returns the minimum value from a line item in a source module.', 'Aggregation', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xMIN_y')],
    ['MAX', new FunctionInfo('The MAX aggregation function returns the maximum value from a line item in a source module.', 'Aggregation', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xMAX_y')],
    ['ANY', new FunctionInfo('The ANY aggregation function returns a TRUE result for any value that matches specific Boolean criteria in a source module.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xANY_y')],
    ['ALL', new FunctionInfo('The ALL aggregation function returns a TRUE result for all values that match specific Boolean criteria in a source module.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) }, 'xALL_y')],
])

export let FunctionsInfo = new Map([
    ['ABS', new FunctionInfo('Returns the absolute value of a number.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['ADDMONTHS', new FunctionInfo('Add a specified number of months to a date.', 'Time and Date', AnaplanDataTypeStrings.DATE)],
    ['ADDYEARS', new FunctionInfo('Add a specified number of years to a date.', 'Time and Date', AnaplanDataTypeStrings.DATE)],
    ['AGENTS', new FunctionInfo('Calculates the number of agents required to service a given number of calls and meet the service level agreement.', 'Call Center Planning', AnaplanDataTypeStrings.NUMBER)],
    ['AGENTSB', new FunctionInfo('Calculates the number of agents required to handle the busy-period call traffic, given a percentage of calls that might receive a busy tone.', 'Call Center Planning', AnaplanDataTypeStrings.NUMBER)],
    ['AND', new FunctionInfo('Enter several conditions and this function tests to see if all conditions are met.', 'Logical', AnaplanDataTypeStrings.NUMBER)],
    ['ANSWERTIME', new FunctionInfo('Calculates the minimum waiting time to maintain a service level agreement.', 'Call Center Planning', AnaplanDataTypeStrings.NUMBER)],
    ['ARRIVALRATE', new FunctionInfo('Calculates the arrival rate of calls that can be received while guaranteeing the service level agreement.', 'Call Center Planning', AnaplanDataTypeStrings.NUMBER)],
    ['AVGDURATION', new FunctionInfo('Calculates the average duration of calls that are answered while guaranteeing the service level agreement.', 'Call Center Planning', AnaplanDataTypeStrings.NUMBER)],
    ['AVGWAIT', new FunctionInfo('Calculates the average waiting time for incoming calls.', 'Call Center Planning', AnaplanDataTypeStrings.NUMBER)],
    ['CODE', new FunctionInfo('Returns the code of a list item.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['COLLECT', new FunctionInfo('Collects the data from the original line items from one or more modules (module must have a line item subset as a dimension).', 'Miscellaneous', AnaplanDataTypeStrings.NUMBER)],
    ['COMPARE', new FunctionInfo('Compares text values; result is 0 if they match, 1 or -1 if not matched.', 'Logical', AnaplanDataTypeStrings.NUMBER)],
    ['COUPDAYS', new FunctionInfo('Returns the number of coupon days in the coupon period that contains the settlement date.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['COUPDAYSBS', new FunctionInfo('Calculates the number of coupon days before the settlement date.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['COUPDAYSNC', new FunctionInfo('Determines the number of coupon days from the settlement date until the next coupon date.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['COUPNCD', new FunctionInfo('Calculates the next coupon date after the settlement date.', 'Financial', AnaplanDataTypeStrings.DATE)],
    ['COUPNUM', new FunctionInfo(`Returns the number of coupons payable between the settlement date of a bond and the bond's maturity.`, 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['COUPPCD', new FunctionInfo('Identifies the previous coupon date before the settlement date.', 'Financial', AnaplanDataTypeStrings.DATE)],
    ['CUMIPMT', new FunctionInfo('Calculates the cumulative interest paid on a loan during a specified period.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['CUMPRINC', new FunctionInfo('Calculates the cumulative total of the principal amount paid during a given period for a loan.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['CUMULATE', new FunctionInfo('Gives the cumulative sum of values from the first period of the timescale or the cumulative sum across the items in a named non-time list.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['CURRENTPERIODEND', new FunctionInfo('The end date of the Current period.', 'Time and Date', AnaplanDataTypeStrings.DATE)],
    ['CURRENTPERIODSTART', new FunctionInfo('The start date of the Current period.', 'Time and Date', AnaplanDataTypeStrings.DATE)],
    ['CURRENTVERSION', new FunctionInfo('Returns the value of the current version as defined under Settings, Versions.', 'Miscellaneous', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['DATE', new FunctionInfo('Converts numbers yyyy, mm, and dd to a date. Date format depends on your locale.', 'Time and Date', AnaplanDataTypeStrings.DATE)],
    ['DAY', new FunctionInfo('Converts a date to a day in number format. Date format depends on your locale.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['DAYS', new FunctionInfo('Number of days in a time period.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['DAYSINMONTH', new FunctionInfo('Number of days in a specified calendar month.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['DAYSINYEAR', new FunctionInfo('Number of days in a specified year where year is formatted as a four digit number, YYYY.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['DECUMULATE', new FunctionInfo('Calculates the difference in a value in the current period vs previous period.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['DIVIDE', new FunctionInfo('Same as normal division x/y except that 1/0=Infinity and 0/0=NaN (not a number).', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['DURATION', new FunctionInfo(`Uses the Macaulay duration to indicate a bond price's response to changes in yield.`, 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['END', new FunctionInfo('Result is the last date in the period.', 'Time and Date', AnaplanDataTypeStrings.DATE)],
    ['ERLANGB', new FunctionInfo('Assumes no queue and calculates the probability a call will be blocked entirely.', 'Call Center Planning', AnaplanDataTypeStrings.NUMBER)],
    ['ERLANGC', new FunctionInfo('Assumes an unlimited queue and calculates the probability a call will be placed in the queue.', 'Call Center Planning', AnaplanDataTypeStrings.NUMBER)],
    ['EXP', new FunctionInfo('Returns e raised to the nth power, where e = 2.71828183.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['FIND', new FunctionInfo('Look for a text string within a text-formatted item, starting at a character number. Returns a number that denotes the character position.', 'Miscellaneous', AnaplanDataTypeStrings.NUMBER)],
    ['FINDITEM', new FunctionInfo('Matches text to a list item or matches text to an item in a time period list (can match on item name or code).', 'Miscellaneous', itemFunc)],
    ['FIRSTNONBLANK', new FunctionInfo('Shows the first non-blank text, list or date cell and uses the mapping to determine where to post the result.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['FIRSTNONZERO', new FunctionInfo('This takes at least two numeric arguments, and returns the first that is non-zero.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['FV', new FunctionInfo('Future value of an investment.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['HALFYEARTODATE', new FunctionInfo('Takes a single numeric parameter and returns a cumulative sums across a half-year time span and then resets.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['HALFYEARVALUE', new FunctionInfo('Returns the half-year value of the source line item, according to the Time Summary method set for the source.', 'Time and Date', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['INPERIOD', new FunctionInfo('Tests whether a date falls within the period specified on the time dimension or falls within a time period (result is Boolean-formatted).', 'Time and Date', AnaplanDataTypeStrings.BOOLEAN)],
    ['IPMT', new FunctionInfo('Calculates the amount allocated to loan interest in a period.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['IRR', new FunctionInfo('Calculates the internal rate of return of a series of future cashflows.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['ISACTUALVERSION', new FunctionInfo('Tests to see if the version you are on is the Actual version (result is Boolean-formatted).', 'Logical', AnaplanDataTypeStrings.BOOLEAN)],
    ['ISANCESTOR', new FunctionInfo('Tests whether a specified list item is an ancestor of the second specified list item or whether a specified time period is an ancestor of a second specified time period (result is Boolean-formatted).', 'Logical', AnaplanDataTypeStrings.BOOLEAN)],
    ['ISBLANK', new FunctionInfo('Tests whether an item is blank (the item must be date, text, list, or time period-formatted and the result is Boolean-formatted).', 'Logical', AnaplanDataTypeStrings.BOOLEAN)],
    ['ISCURRENTVERSION', new FunctionInfo('Tests to see if the version is current based on the flag that you have set in Settings > Versions.', 'Logical', AnaplanDataTypeStrings.BOOLEAN)],
    ['ISFIRSTOCCURRENCE', new FunctionInfo('Tests if a value in the source (first parameter) is the first occurrence of that value within the source (result is Boolean-formatted)', 'Logical', AnaplanDataTypeStrings.BOOLEAN)],
    ['ISNOTBLANK', new FunctionInfo('Tests whether an item is not blank (the item must be date, text, list, or time period-formatted and the result is Boolean-formatted)', 'Logical', AnaplanDataTypeStrings.BOOLEAN)],
    ['ITEM', new FunctionInfo('Returns the list item of a list-formatted or time period-formatted line item.', 'Miscellaneous', itemFunc)],
    ['LAG', new FunctionInfo('Take the value from n periods in the past. If this is before the start of the timescale, use the overflow value.', 'Time and Date', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['LASTNONBLANK', new FunctionInfo('Shows the last non-blank text, list or date cell and uses the mapping to determine where to post the result.', 'Logical', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['LEAD', new FunctionInfo('Take the value from n periods in the future. If this is beyond the end of the timescale, use the overflow value.', 'Time and Date', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['LEFT', new FunctionInfo('Extracts a sub-string from a string starting at the leftmost character.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['LEN', new FunctionInfo('Variant of LENGTH. Returns the number of characters in a text string.', 'Miscellaneous', AnaplanDataTypeStrings.NUMBER)],
    ['LENGTH', new FunctionInfo('Returns the number of characters in a text string.', 'Miscellaneous', AnaplanDataTypeStrings.NUMBER)],
    ['LN', new FunctionInfo('Returns the natural logarithm of a number, based on the constant e.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['LOG', new FunctionInfo('Returns the logarithm of a number to the specified base.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['LOWER', new FunctionInfo('Converts text to lowercase.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['MAILTO', new FunctionInfo('Composes the To, cc, Bcc, Subject, and Body of an email.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['MAKELINK', new FunctionInfo('Composes a click-able URL.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['MAX', new FunctionInfo('Maximum value of selected line items.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['MDURATION', new FunctionInfo('Uses the modified Macaulay duration to tell you by what percentage the value of a bond will change for a 1% change in the yield.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['MID', new FunctionInfo('Extract a sub-string from a string starting at any character.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['MIN', new FunctionInfo('Minimum of selected line items.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['MOD', new FunctionInfo('Modulus: remainder after dividing a dividend by a divisor.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['MONTH', new FunctionInfo('Converts a date or a time period to a calendar month as number.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['MONTHTODATE', new FunctionInfo('Takes a single numeric parameter and returns a cumulative sums across a month time span and then resets.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['MONTHVALUE', new FunctionInfo('Returns the month value of the source line item, according to the time summary method set for the source.', 'Time and Date', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['MOVINGSUM', new FunctionInfo('Calculates moving values, such as a moving sum or moving average.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['MROUND', new FunctionInfo('Round to the nearest multiple.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['NAME', new FunctionInfo('Converts a list item or time period to text.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['NEXT', new FunctionInfo('Returns a value from the next period.', 'Time and Date', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['NEXTVERSION', new FunctionInfo('Returns a value from the next version.', 'Miscellaneous', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['NPER', new FunctionInfo('The length in periods of the investment term.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['NPV', new FunctionInfo('Calculates the net present value of a series of cash flows using a constant interest rate.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['OFFSET', new FunctionInfo('Returns a value from a specified number of periods in advance.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['PARENT', new FunctionInfo('Can be used against list-formatted items to return the parent of a list item or against time period-formatted items to return the parent time period.', 'Miscellaneous', parentFunc)],
    ['PERIOD', new FunctionInfo('Take a date as parameter and returns a time period as result.', 'Time and Date', AnaplanDataTypeStrings.TIME_ENTITY)],
    ['PMT', new FunctionInfo('Calculates the payments for a loan or annuity with constant payments and a constant interest rate.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['POST', new FunctionInfo('Post a value to a specified number of periods in the future.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['POWER', new FunctionInfo('Raise a value to a power.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['PPMT', new FunctionInfo('Calculates the amount of a payment allocated to the principal part of a loan.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['PREVIOUS', new FunctionInfo('Takes a value from the previous period.', 'Time and Date', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['PREVIOUSVERSION', new FunctionInfo('Takes a value from the previous version.', 'Miscellaneous', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['PRICE', new FunctionInfo('Returns the price per 100 monetary units of a bond that pays periodic interest.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['PROFILE', new FunctionInfo('Allocates a value over the next few periods based on a table.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['PV', new FunctionInfo('Calculates the present value of future cash flows.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['QUARTERTODATE', new FunctionInfo('Takes a single numeric parameter and returns a cumulative sums across a quarter time span and then resets.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['QUARTERVALUE', new FunctionInfo('Returns the quarter value of the source line item, according to the time summary method set for the source.', 'Time and Date', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['RANK', new FunctionInfo('Orders a set of values and assigns rankings from 1 to a specified ending rank.', 'Miscellaneous', AnaplanDataTypeStrings.NUMBER)],
    ['RANKCUMULATE', new FunctionInfo('Allows you to cumulate line item values based on ranking criteria, that might contain groupings. Can be used against lists but not time.', 'Aggregation', AnaplanDataTypeStrings.NUMBER)],
    ['RATE', new FunctionInfo('Calculates a per period interest rate.', 'Miscellaneous', AnaplanDataTypeStrings.NUMBER)],
    ['RIGHT', new FunctionInfo('Extracts a sub-string from a string starting at the rightmost character.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['ROUND', new FunctionInfo('Rounds a value to a specified number of decimal places.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['SIGN', new FunctionInfo('Show the sign of a number (result = -1 if the value is negative, 1 if positive, 0 if zero).', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['SLA', new FunctionInfo('Calculates the percentage of incoming calls to be answered within a target answer time to meet a Service Level Agreement (SLA).', 'Call Center Planning', AnaplanDataTypeStrings.NUMBER)],
    ['SPREAD', new FunctionInfo('Spreads a value evenly over a number of periods.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['SQRT', new FunctionInfo('Square root of a value.', 'Numeric', AnaplanDataTypeStrings.NUMBER)],
    ['START', new FunctionInfo('Result is the first date in the period.', 'Time and Date', AnaplanDataTypeStrings.DATE)],
    ['SUBSTITUTE', new FunctionInfo('Replaces a single text character or a string of text characters with another.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['TEXT', new FunctionInfo('Converts a numeric value to text.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['TEXTLIST', new FunctionInfo('Lists a series of text items in a single result cell.', 'Aggregation', AnaplanDataTypeStrings.TEXT)],
    ['TIMESUM', new FunctionInfo('Aggregates between the from and to time periods. These can be absolute time periods or relative to the latest actual time period.', 'Aggregation', AnaplanDataTypeStrings.NUMBER)],
    ['TRIM', new FunctionInfo('Replaces multiple text spaces between words in text, and at the beginning or end of the text, with a single space.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['UPPER', new FunctionInfo('Converts text to uppercase.', 'Miscellaneous', AnaplanDataTypeStrings.TEXT)],
    ['VALUE', new FunctionInfo('Converts a numeric value in a text field to a number format.', 'Miscellaneous', AnaplanDataTypeStrings.NUMBER)],
    ['WEEKDAY', new FunctionInfo('Takes a date and returns a number 1 to 7 for the day-of-week number. An optional Type parameter can be used to set the start day for the day-of-week count.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['WEEKTODATE', new FunctionInfo('Takes a single numeric parameter and returns a cumulative sums across a week time span and then resets.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['WEEKVALUE', new FunctionInfo('Returns the week value of the source line item, according to the time summary method set for the source.', 'Time and Date', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['YEAR', new FunctionInfo('Converts a date or a time period to a year in number format.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['YEARFRAC', new FunctionInfo('Calculates the fraction of a year between two dates.', 'Financial', AnaplanDataTypeStrings.NUMBER)],
    ['YEARTODATE', new FunctionInfo('Takes a single numeric parameter and returns a cumulative sums across a year time span and then resets.', 'Time and Date', AnaplanDataTypeStrings.NUMBER)],
    ['YEARVALUE', new FunctionInfo('Returns the year value of the source line item, according to the time summary method set for the source.', 'Time and Date', (visitor, ctx) => { return visitor.visit(ctx.expression()[0]) })],
    ['YIELD', new FunctionInfo(`Determines the yield to maturity of a bond — the interest rate that, when used to discount the bond's future cashflows, produces the given price.`, 'Financial', AnaplanDataTypeStrings.NUMBER)],
]);