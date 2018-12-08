import $ from 'jquery';
import {symbolicParser} from "./symbolic-substitution";

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        //code-analyzer
        let codeToParse = $('#codePlaceholder').val();
        // let parsedCode = parseCode(codeToParse);
        // $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));

        //args
        let args = $('#argsPlaceholder').val();

        //parser
        let newCode = symbolicParser(codeToParse, args);

        buildNewCodeDiv();
        addNewCode(newCode, args);

    });
});

function buildNewCodeDiv(){
    let div = document.getElementById('newCodeWrapper');
    let removeDiv = document.getElementById('newCode');
    div.removeChild(removeDiv);
    let newCodeDiv = document.createElement('div');
    div.appendChild(newCodeDiv);
    newCodeDiv.setAttribute('id', 'newCode');
}

function addNewCode(newCode, args) {
    let tabs = 0;
    newCode.forEach(function (x) {
        let color;
        if (args.length !== 0)
            color = defineColor(x.code, x.eval);
        else
            color = 'white';
        if (x.code.includes('}') && !x.code.includes('{'))
            addRow(x.code, color, --tabs);
        else if (x.code.includes('}') && x.code.includes('{')){
            addRow(x.code, color, --tabs);
            tabs++;
        }
        else if (x.code.includes('function') || x.code.includes('if') || x.code.includes('while'))
            addRow(x.code, color, tabs++);
        else
            addRow(x.code, color, tabs);
    });
}

function defineColor(code, evalush){
    if (code.includes('if (') || code.includes('while (') || code.includes('} else {'))
        if (evalush)
            return 'green';
        else
            return 'red';
    else
        return 'white';
}

function addRow(code, backgroundColor, tabs){
    let newCodeDiv = document.getElementById('newCode');
    let row = document.createElement('div');
    row.setAttribute('class', backgroundColor);
    row.setAttribute('style', 'padding-left: ' + 2 * tabs + 'em;');
    row.innerText = code;
    newCodeDiv.appendChild(row);
}