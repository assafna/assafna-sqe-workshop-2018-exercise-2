import * as esprima from 'esprima';

let argsDictionary;
let newCode;

const symbolicParser = (code, args) => {
    argsDictionary = {}; //new
    let dictionary = {}; //init
    newCode = []; //new
    let parsedScript = esprima.parseScript(code);
    //args
    let argsArray = argsParser(args);
    insertToDictionaryArray(dictionary, argsArray, true);
    console.log(dictionary);
    console.log(argsDictionary);
    //function
    recursiveParser(parsedScript, dictionary, -1);
    console.log(newCode);
    return newCode;
};

function recursiveParser(code, dictionary){
    //stop condition
    if (code == null || code.type == null) return;
    typeParser1(code, dictionary);
}

function typeParser1(code, dictionary){
    if (code.type === 'Program') return typeProgramParser(code, dictionary);
    else if (code.type === 'FunctionDeclaration') return typeFunctionDeclarationParser(code, dictionary);
    else if (code.type === 'BlockStatement') return typeBlockStatementParser(code, dictionary);
    else if (code.type === 'VariableDeclaration') return typeVariableDeclarationParser(code, dictionary);
    else return typeParser2(code, dictionary);
}

function typeParser2(code, dictionary){
    if (code.type === 'ExpressionStatement') return typeExpressionStatementParser(code, dictionary);
    else if (code.type === 'AssignmentExpression') return typeAssignmentExpressionParser(code, dictionary);
    else return typeParser3(code, dictionary);
}

function typeParser3(code, dictionary){
    if (code.type === 'WhileStatement') return typeWhileStatementParser(code, dictionary);
    else if (code.type === 'IfStatement') return typeIfStatementParser(code, dictionary);
    return typeReturnStatementParser(code, dictionary);
}

function typeReturnValues(code, dictionary){
    if (code.type === 'MemberExpression') return typeMemberExpressionParser(code, dictionary);
    else if (code.type === 'BinaryExpression') return typeBinaryExpressionParser(code, dictionary);
    else if (code.type === 'UnaryExpression') return typeUnaryExpressionParser(code, dictionary);
    else if (code.type === 'Literal') return typeLiteralParser(code, dictionary);
    return typeIdentifierParser(code, dictionary);
}

function deepCopyDictionary(dictionary) {
    return JSON.parse(JSON.stringify(dictionary));
}

function typeProgramParser(code, dictionary){
    //ignore parse and continue
    code.body.forEach(function (x) {
        recursiveParser(x, deepCopyDictionary(dictionary));
    });
}

function typeFunctionDeclarationParser(code, dictionary){
    //new code
    newCode.push('function ' + code.id.name + '(' + functionParamsParser(code.params, dictionary) + ') {');
    //body
    recursiveParser(code.body, deepCopyDictionary(dictionary));
    newCode.push('}');
}

function functionParamsParser(code, dictionary){
    let result = '';
    code.forEach(function (x) {
        result += typeReturnValues(x, dictionary) + ', ';
    });
    return result.substring(0, result.length - 2);
}

function typeBlockStatementParser(code, dictionary){
    //ignore parse and continue
    code.body.forEach(function (x) {
        recursiveParser(x, dictionary);
    });
}

function typeVariableDeclarationParser(code, dictionary){
    code.declarations.forEach(function (x) {
        typeVariableDeclaratorParser(x, dictionary);
    });
}

function typeVariableDeclaratorParser(code, dictionary){
    //check if init
    if (code.init != null)
        insertToDictionary(dictionary, code.id.name, typeReturnValues(code.init, dictionary), false);
}

function typeExpressionStatementParser(code, dictionary){
    //ignore and continue
    recursiveParser(code.expression, dictionary);
}

function typeAssignmentExpressionParser(code, dictionary){
    insertToDictionary(dictionary, code.left.name, typeReturnValues(code.right, dictionary), false);
    //args
    if (argsDictionary[code.left.name] != null)
        newCode.push(code.left.name + ' = ' + typeReturnValues(code.right, dictionary) + ';');
}

function typeBinaryExpressionParser(code, dictionary){
    //return value
    return typeReturnValues(code.left, dictionary) + ' ' + code.operator + ' ' + typeReturnValues(code.right, dictionary);
}

function typeWhileStatementParser(code, dictionary){
    newCode.push('while (' + typeReturnValues(code.test, dictionary) + ') {');
    //body
    recursiveParser(code.body, deepCopyDictionary(dictionary));
    newCode.push('}');
}

function typeIfStatementParser(code, dictionary, firstTime = true){
    //if itself
    if (firstTime)
        newCode.push('if (' + typeReturnValues(code.test, dictionary) + ') {');
    //consequent
    recursiveParser(code.consequent, deepCopyDictionary(dictionary));
    //alternate
    if (code.alternate != null){
        if (code.alternate.type === "IfStatement") {
            newCode.push('} else if (' + typeReturnValues(code.alternate.test, dictionary) + ') {');
            typeIfStatementParser(code.alternate, deepCopyDictionary(dictionary), false);
        } else {
            newCode.push('} else {');
            recursiveParser(code.alternate, deepCopyDictionary(dictionary));
        }
    }
    if (firstTime)
        newCode.push('}');
}

function typeReturnStatementParser(code, dictionary){
    //empty
    if (code.argument == null)
        newCode.push('return;');
    else
        newCode.push('return ' + typeReturnValues(code.argument, dictionary) + ';');
}

function typeMemberExpressionParser(code, dictionary){
    //return value
    return typeReturnValues(code.object, dictionary) + '[' + typeReturnValues(code.property, dictionary) + ']';
}

function typeUnaryExpressionParser(code, dictionary){
    //return value
    return code.operator + typeReturnValues(code.argument, dictionary);
}

function typeLiteralParser(code){
    //return value
    return code.value;
}

function typeIdentifierParser(code, dictionary){
    //dictionary
    return dictionary[code.name];
}

function argsParser(args) {
    let regex = /(?![^)(]*\([^)(]*?\)\)),(?![^\[]*])/g;
    return args.split(regex); //splits by comma not inside '[' and ']' or " or '
}

function insertToDictionaryArray(dictionary, keyValueArray, isArgs) {
    keyValueArray.forEach(function (element) {
        let splitByEqual = element.split('=');
        let key = splitByEqual[0];
        let value = splitByEqual[1];
        //check arrays
        if (value.startsWith('[')){
            let array = value.substring(1, value.length - 1).split(',');
            array.forEach(function (value, index) {
                insertToDictionary(dictionary, key + '[' + index + ']', value, isArgs);
            });
        } else
            insertToDictionary(dictionary ,key, value, isArgs);
    });
}

function insertToDictionary(dictionary, key, value, isArg) {
    //strings
    if (value.toString().startsWith("\"") || value.toString().startsWith("\'"))
        value = value.substring(1, value.length - 1);
    if (isArg) {
        argsDictionary[key] = value;
        dictionary[key] = key;
    }
    else
        dictionary[key] = value;
}

export {symbolicParser};