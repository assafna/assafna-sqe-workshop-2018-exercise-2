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
        addNewCode(newCode);

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

function addNewCode(newCode) {
    let tabs = 0;
    newCode.forEach(function (x) {
        if (x.includes('}') && !x.includes('{'))
            addRow(x, 'white', --tabs);
        else if (x.includes('}') && x.includes('{')){
            addRow(x, 'white', --tabs);
            tabs++;
        }
        else if (x.includes('function') || x.includes('if') || x.includes('while'))
            addRow(x, 'white', tabs++);
        else
            addRow(x, 'white', tabs);
    });
}

function addRow(code, backgroundColor, tabs){
    let newCodeDiv = document.getElementById('newCode');
    let row = document.createElement('div');
    row.setAttribute('class', backgroundColor);
    row.setAttribute('style', 'padding-left: ' + 2 * tabs + 'em;');
    row.innerText = code;
    newCodeDiv.appendChild(row);
}