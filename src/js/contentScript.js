import 'jquery';
import 'arrive';
import { InputStream, CommonTokenStream } from 'antlr4';
import { anaplanFormulaLexer, anaplanFormulaParser, anaplanFormulaVisitor } from '../anaplan/AnaplanFormula.g4';

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

$(document)
.arrive(".formulaEditorText", function(e) {
	console.log('editor arrived');
	$('.formulaEditorText').on('keyup', debounce(() => {
		const myinput = $('.formulaEditorText').val();
		const mylexer = new anaplanFormulaLexer(new InputStream(input));
		const myparser = new anaplanFormulaParser(new CommonTokenStream(lexer));
		const myresult = new anaplanFormulaVisitor().visit(parser.formula());
		alert(result);
	}, 250));
});