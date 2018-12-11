import * as esprima from 'esprima';
import * as safeEval from 'safe-eval';

let argsDictionary;
let newCode;
let evalingNow;
let noVals;

const symbolicParser = (code, args) => {
    newRun();
    let dictionary = {}; //init
    let parsedScript = esprima.parseScript(code);
    //args
    let argsArray = [];
    if (args.length !== 0) {
        noVals = false;
        argsArray = argsParser(args);
        insertToDictionaryArray(dictionary, argsArray, true);
    }
    //function
    recursiveParser(parsedScript, dictionary, null);
    let newCodePrint = JSON.parse(JSON.stringify(newCode));
    if (noVals) return newCodePrint;
    //for eval
    evalRun(parsedScript, argsArray);
    // compare eval and return result
    return compareAndSend(newCodePrint);
};

function newRun(){
    argsDictionary = {}; //new
    newCode = []; //new
    evalingNow = false;
    noVals = true;
}

function evalRun(parsedScript, argsArray){
    evalingNow = true;
    newCode = []; //new
    let dictionary = {}; //init
    insertToDictionaryArray(dictionary, argsArray, true, true);
    recursiveParser(parsedScript, dictionary, null);
}

function compareAndSend(newCodePrint){
    let finalCode = [];
    newCode.forEach(function (value, index) {
        finalCode.push({'code': newCodePrint[index].code, 'eval': value.eval});
    });

    return finalCode;
}

function safeEvalFunc(code){
    if (evalingNow)
        return safeEval(code);
    else
        return true;
}

function recursiveParser(code, dictionary, amITrue){
    //stop condition
    typeParser1(code, dictionary, amITrue);
}

function typeParser1(code, dictionary, amITrue){
    if (code.type === 'Program') return typeProgramParser(code, dictionary, amITrue);
    else if (code.type === 'FunctionDeclaration') return typeFunctionDeclarationParser(code, dictionary, amITrue);
    else if (code.type === 'BlockStatement') return typeBlockStatementParser(code, dictionary, amITrue);
    else if (code.type === 'VariableDeclaration') return typeVariableDeclarationParser(code, dictionary, amITrue);
    else return typeParser2(code, dictionary, amITrue);
}

function typeParser2(code, dictionary, amITrue){
    if (code.type === 'ExpressionStatement') return typeExpressionStatementParser(code, dictionary, amITrue);
    else if (code.type === 'AssignmentExpression') return typeAssignmentExpressionParser(code, dictionary, amITrue);
    else return typeParser3(code, dictionary, amITrue);
}

function typeParser3(code, dictionary, amITrue){
    if (code.type === 'WhileStatement') return typeWhileStatementParser(code, dictionary, amITrue);
    else if (code.type === 'IfStatement') return typeIfStatementParser(code, dictionary, true, amITrue);
    return typeReturnStatementParser(code, dictionary, amITrue);
}

function typeReturnValues(code, dictionary, amITrue){
    if (code.type === 'MemberExpression') return typeMemberExpressionParser(code, dictionary, amITrue);
    else if (code.type === 'BinaryExpression') return '(' + typeBinaryExpressionParser(code, dictionary, amITrue) + ')';
    // else if (code.type === 'ArrayExpression') return typeArrayExpressionParser(code, dictionary, amITrue);
    else return typeReturnValues2(code, dictionary, amITrue);
}

function typeReturnValues2(code, dictionary, amITrue){
    if (code.type === 'UnaryExpression') return typeUnaryExpressionParser(code, dictionary, amITrue);
    else if (code.type === 'Literal') return typeLiteralParser(code, dictionary, amITrue);
    return typeIdentifierParser(code, dictionary, amITrue);
}

function deepCopyDictionary(dictionary) {
    return JSON.parse(JSON.stringify(dictionary));
}

function typeProgramParser(code, dictionary, amITrue){
    //ignore parse and continue
    code.body.forEach(function (x) {
        recursiveParser(x, dictionary, amITrue);
    });
}

function typeFunctionDeclarationParser(code, dictionary, amITrue){
    //new code
    let value = 'function ' + code.id.name + '(' + functionParamsParser(code.params, dictionary, amITrue) + ') {';
    newCode.push({'code': value, 'eval': amITrue});
    //body
    recursiveParser(code.body, deepCopyDictionary(dictionary), amITrue);
    value = '}';
    newCode.push({'code': value, 'eval': amITrue});
}

function functionParamsParser(code, dictionary, amITrue){
    let result = '';
    code.forEach(function (x) {
        if (noVals)
            insertToDictionary(dictionary, x.name, x.name, true, false);
        result += typeReturnValues(x, dictionary, amITrue) + ', ';
    });
    return result.substring(0, result.length - 2);
}

function typeBlockStatementParser(code, dictionary, amITrue){
    //ignore parse and continue
    code.body.forEach(function (x) {
        recursiveParser(x, dictionary, amITrue);
    });
}

function typeVariableDeclarationParser(code, dictionary, amITrue){
    code.declarations.forEach(function (x) {
        typeVariableDeclaratorParser(x, dictionary, amITrue);
    });
}

function typeVariableDeclaratorParser(code, dictionary, amITrue){
    //check if init
    if (code.init != null)
        //array
        if (code.init.type === 'ArrayExpression'){
            code.init.elements.forEach(function (value, index) {
                insertToDictionary(dictionary, code.id.name + '[' + index + ']', typeReturnValues(value, dictionary, amITrue), false);
            });
            insertToDictionary(dictionary, code.id.name, typeArrayExpressionToStringArray(code.init.elements, dictionary, amITrue), false);
        }
        else
            insertToDictionary(dictionary, code.id.name, typeReturnValues(code.init, dictionary, amITrue), false);
    else
        insertToDictionary(dictionary, code.id.name, null, false);
}

function typeArrayExpressionToStringArray(code, dictionary, amITrue){
    let result = '[';
    code.forEach(function (value) {
        result += typeReturnValues(value, dictionary, amITrue) + ',';
    });
    return result.substring(0, result.length - 1) + ']';
}

function typeExpressionStatementParser(code, dictionary, amITrue){
    //ignore and continue
    recursiveParser(code.expression, dictionary, amITrue);
}

function typeAssignmentExpressionParser(code, dictionary, amITrue){
    insertToDictionary(dictionary, code.left.name, typeReturnValues(code.right, dictionary, amITrue), false);
    //args
    if (argsDictionary[code.left.name] != null){
        let value = code.left.name + ' = ' + typeReturnValues(code.right, dictionary, amITrue) + ';';
        newCode.push({'code': value, 'eval': amITrue});
    }
}

function typeBinaryExpressionParser(code, dictionary, amITrue){
    //return value
    return typeReturnValues(code.left, dictionary, amITrue) + ' ' + code.operator + ' ' + typeReturnValues(code.right, dictionary, amITrue);
}

function typeWhileStatementParser(code, dictionary, amITrue){
    let value = 'while (' + typeReturnValues(code.test, dictionary, amITrue) + ') {';
    if ((amITrue == null || amITrue) && safeEvalFunc(typeReturnValues(code.test, dictionary, amITrue)))
        amITrue = true;
    else
        amITrue = false;
    //body
    newCode.push({'code': value, 'eval': amITrue});
    recursiveParser(code.body, deepCopyDictionary(dictionary), amITrue);
    newCode.push({'code': '}', 'eval': amITrue});
}

function typeIfStatementParser(code, dictionary, firstTime = true, amITrue, foundYet = false){
    //if itself
    if (firstTime)
        foundYet = ifFirstTime(code, dictionary, amITrue, foundYet);
    else
        recursiveParser(code.consequent, deepCopyDictionary(dictionary), amITrue);
    //alternate
    if (code.alternate != null)
        ifAlternate(code, dictionary, amITrue, foundYet);
    if (firstTime)
        newCode.push({'code': '}', 'eval': amITrue});
}

function ifAlternate(code, dictionary, amITrue, foundYet){
    let answer = ifAlternateCheck(code, dictionary, amITrue, foundYet);
    if (!answer) {
        let value = '} else {';
        if ((amITrue == null || amITrue) && !foundYet){
            newCode.push({'code': value, 'eval': true});
            recursiveParser(code.alternate, deepCopyDictionary(dictionary), true);
        } else {
            newCode.push({'code': value, 'eval': false});
            recursiveParser(code.alternate, deepCopyDictionary(dictionary), false);
        }
    }
}

function ifAlternateCheck(code, dictionary, amITrue, foundYet){
    if (code.alternate.type === 'IfStatement')
        return ifAlternateTrue(code, dictionary, amITrue, foundYet);
    else
        return false;
}

function ifAlternateTrue(code, dictionary, amITrue, foundYet){
    if (!foundYet && safeEvalFunc(typeReturnValues(code.alternate.test, dictionary)) && (amITrue == null || amITrue)){
        let value = '} else if (' + typeReturnValues(code.alternate.test, dictionary) + ') {';
        newCode.push({'code': value, 'eval': true});
        typeIfStatementParser(code.alternate, deepCopyDictionary(dictionary), false, true, true);
        return true;
    } else return ifAlternateFalse(code, dictionary, amITrue, foundYet);
}

function ifAlternateFalse(code, dictionary, amITrue, foundYet){
    let value = '} else if (' + typeReturnValues(code.alternate.test, dictionary) + ') {';
    newCode.push({'code': value, 'eval': false});
    typeIfStatementParser(code.alternate, deepCopyDictionary(dictionary), false, amITrue, foundYet);
    return true;
}

function ifFirstTime(code, dictionary, amITrue, foundYet){
    let value = 'if (' + typeReturnValues(code.test, dictionary) + ') {';
    if (safeEvalFunc(typeReturnValues(code.test, dictionary)) && (amITrue == null || amITrue)){
        foundYet = true;
        newCode.push({'code': value, 'eval': true});
        //consequent
        recursiveParser(code.consequent, deepCopyDictionary(dictionary), true);
    }
    else {
        newCode.push({'code': value, 'eval': false});
        //consequent
        recursiveParser(code.consequent, deepCopyDictionary(dictionary), false);
    }
    return foundYet;
}

function typeReturnStatementParser(code, dictionary, amITrue){
    //empty
    if (code.argument == null)
        newCode.push({'code': 'return;', 'eval': amITrue});
    else
        newCode.push({'code': 'return ' + typeReturnValues(code.argument, dictionary, amITrue) + ';', 'eval': amITrue});
}

function typeMemberExpressionParser(code, dictionary, amITrue){
    //return value
    return typeReturnValues(code.object, dictionary, amITrue) + '[' + typeReturnValues(code.property, dictionary, amITrue) + ']';
}

function typeUnaryExpressionParser(code, dictionary, amITrue){
    //return value
    return code.operator + typeReturnValues(code.argument, dictionary, amITrue);
}

function typeLiteralParser(code){
    //return value
    return code.raw;
}

function typeIdentifierParser(code, dictionary){
    //dictionary
    return dictionary[code.name];
}

function argsParser(args) {
    let regex = /(?![^)(]*\([^)(]*?\)\)),(?![^[]*])/g;
    return args.split(regex); //splits by comma not inside '[' and ']' or " or '
}

function insertToDictionaryArray(dictionary, keyValueArray, isArgs, forEval = false) {
    keyValueArray.forEach(function (element) {
        let splitByEqual = element.split('=');
        let key = splitByEqual[0];
        let value = splitByEqual[1];
        //check arrays
        if (value.startsWith('[')){
            let array = value.substring(1, value.length - 1).split(',');
            array.forEach(function (value, index) {
                insertToDictionary(dictionary, key + '[' + index + ']', value, isArgs, forEval);
            });
            insertToDictionary(dictionary ,key, value, isArgs, forEval);
        } else
            insertToDictionary(dictionary ,key, value, isArgs, forEval);
    });
}

function insertToDictionary(dictionary, key, value, isArg, forEval) {
    //strings
    if (value.toString().startsWith('"') || value.toString().startsWith('\''))
        value = '\'' + value.substring(1, value.length - 1) + '\'';
    if (isArg) {
        argsDictionary[key] = value;
        if (forEval)
            dictionary[key] = value;
        else
            dictionary[key] = key;
    }
    else
        dictionary[key] = value;
}

export {symbolicParser};