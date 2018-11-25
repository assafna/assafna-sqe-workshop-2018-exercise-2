import * as esprima from 'esprima';

let result;
let lineNumber;

const recursionParser = (code) => {
    result = []; //new
    lineNumber = 0; //new
    let parsedScript = esprima.parseScript(code);
    recursiveParser(parsedScript);
    return result;
};

function recursiveParser(code){
    //stop condition
    if (code == null || code.type == null) return;
    typeParser1(code);
}

function typeParser1(code){
    if (code.type === 'Program') return typeProgramParser(code);
    else if (code.type === 'FunctionDeclaration') return typeFunctionDeclarationParser(code);
    else if (code.type === 'BlockStatement') return typeBlockStatementParser(code);
    else if (code.type === 'VariableDeclaration') return typeVariableDeclarationParser(code);
    else return typeParser2(code);
}

function typeParser2(code){
    if (code.type === 'ExpressionStatement') return typeExpressionStatementParser(code);
    else if (code.type === 'AssignmentExpression') return typeAssignmentExpressionParser(code);
    else return typeParser3(code);
}

function typeParser3(code){
    if (code.type === 'WhileStatement') return typeWhileStatementParser(code);
    else if (code.type === 'IfStatement') return typeIfStatementParser(code);
    else if (code.type === 'ForStatement') return typeForStatementParser(code);
    return typeReturnStatementParser(code);
}

function typeReturnValues(code){
    if (code.type === 'MemberExpression') return typeMemberExpressionParser(code);
    else if (code.type === 'BinaryExpression') return typeBinaryExpressionParser(code);
    else if (code.type === 'UnaryExpression') return typeUnaryExpressionParser(code);
    else if (code.type === 'Literal') return typeLiteralParser(code);
    return typeIdentifierParser(code);
}

function typeProgramParser(code){
    //ignore parse and continue
    code.body.forEach(function (x) {
        lineNumber++;
        recursiveParser(x);
    });
}

function typeFunctionDeclarationParser(code){
    //add function itself
    addToResult(lineNumber, code.type, typeReturnValues(code.id), null, null);
    //add params
    functionParamsParser(code.params);
    lineNumber++;
    //body
    recursiveParser(code.body);
}

function functionParamsParser(code){
    code.forEach(function (x) {
        addToResult(lineNumber, x.type, typeReturnValues(x), null, null);
    });
}

function typeBlockStatementParser(code){
    //ignore parse and continue
    code.body.forEach(function (x) {
        recursiveParser(x);
    });
    if (code.body.length > 0)
        lineNumber++;
}

function typeVariableDeclarationParser(code){
    code.declarations.forEach(function (x) {
        typeVariableDeclaratorParser(x);
    });
    lineNumber++;
}

function typeVariableDeclaratorParser(code){
    //check if init
    if (code.init != null)
        addToResult(lineNumber, code.type, typeReturnValues(code.id), null, typeReturnValues(code.init));
    else
        addToResult(lineNumber, code.type, typeReturnValues(code.id), null, null);
}

function typeExpressionStatementParser(code){
    //ignore and continue
    recursiveParser(code.expression);
    lineNumber++;
}

function typeAssignmentExpressionParser(code){
    addToResult(lineNumber, code.type, typeReturnValues(code.left), null, typeReturnValues(code.right));
}

function typeBinaryExpressionParser(code){
    //return value
    return typeReturnValues(code.left) + ' ' + code.operator + ' ' + typeReturnValues(code.right);
}

function typeWhileStatementParser(code){
    //while itself
    addToResult(lineNumber, code.type, null, typeReturnValues(code.test), null);
    lineNumber++;
    //body
    recursiveParser(code.body);
}

function typeIfStatementParser(code){
    //if itself
    addToResult(lineNumber, code.type, null, typeReturnValues(code.test), null);
    lineNumber++;
    //consequent
    recursiveParser(code.consequent);
    //alternate
    if (code.alternate != null){
        //'else'
        if (code.alternate.type !== 'IfStatement')
            lineNumber++;
        recursiveParser(code.alternate);
    }
}

function typeForStatementParser(code){
    //for itself
    addToResult(lineNumber, code.type, null, typeReturnValues(code.test), null);
    lineNumber++;
    //body
    recursiveParser(code.body);
    lineNumber++;
}

function typeReturnStatementParser(code){
    //empty
    if (code.argument == null)
        addToResult(lineNumber, code.type, null, null, null);
    else
        addToResult(lineNumber, code.type, null, null, typeReturnValues(code.argument));
    lineNumber++;
}

function typeMemberExpressionParser(code){
    //return value
    return typeReturnValues(code.object) + '[' + typeReturnValues(code.property) + ']';
}

function typeUnaryExpressionParser(code){
    //return value
    return code.operator + typeReturnValues(code.argument);
}

function typeLiteralParser(code){
    //return value
    return code.value;
}

function typeIdentifierParser(code){
    //return value
    return code.name;
}

function addToResult(line, type, name, condition, value) {
    let json = {
        'line': line,
        'type': type,
        'name': name,
        'condition': condition,
        'value': value
    };
    result.push(json);
}

export {recursionParser};

export {recursiveParser};