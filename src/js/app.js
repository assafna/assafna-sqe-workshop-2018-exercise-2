import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {recursionParser} from './my-parser';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        //code-analyzer
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));

        //my-parser
        let result = recursionParser(codeToParse);
        buildTable();
        printToTable(result);
    });
});

function buildTable(){
    let div = document.getElementById('result');
    div.removeChild(div.firstChild);
    let table = document.createElement('table');
    div.appendChild(table);
    table.setAttribute('id', 'resultTable');
    let tableHead = document.createElement('thead');
    table.appendChild(tableHead);
    let title = document.createElement('h1');
    tableHead.appendChild(title);
    title.innerHTML = 'Result Table';
    let tableBody = document.createElement('tbody');
    table.appendChild(tableBody);
    buildTableCols(tableBody);
}

function buildTableCols(tableBody){
    let firstRow = document.createElement('tr');
    tableBody.appendChild(firstRow);
    let lineCol = document.createElement('th');
    lineCol.innerHTML = 'Line';
    let typeCol = document.createElement('th');
    typeCol.innerHTML = 'Type';
    let nameCol = document.createElement('th');
    nameCol.innerHTML = 'Name';
    let conditionCol = document.createElement('th');
    conditionCol.innerHTML = 'Condition';
    let valueCol = document.createElement('th');
    valueCol.innerHTML = 'Value';
    firstRow.appendChild(lineCol);
    firstRow.appendChild(typeCol);
    firstRow.appendChild(nameCol);
    firstRow.appendChild(conditionCol);
    firstRow.appendChild(valueCol);
}

function printToTable(result){
    let table = document.getElementById('resultTable');
    result.forEach(function (x) {
        let row = table.insertRow(table.rows.length);

        let lineCell = row.insertCell(0);
        let typeCell = row.insertCell(1);
        let nameCell = row.insertCell(2);
        let conditionCell = row.insertCell(3);
        let valueCell = row.insertCell(4);

        lineCell.innerHTML = x.line;
        typeCell.innerHTML = x.type;
        nameCell.innerHTML = x.name;
        conditionCell.innerHTML = x.condition;
        valueCell.innerHTML = x.value;
    });
}