import assert from 'assert';
import {recursionParser} from '../src/js/my-parser';
import {recursiveParser} from '../src/js/my-parser';

describe('My parser', () => {
    it('is parsing an empty code', () => {
        assert.equal(
            JSON.stringify(recursiveParser(null)),
            undefined
        );
    });

    it('is parsing a code with no type', () => {
        assert.equal(
            JSON.stringify(recursiveParser('{"test":"test"}')),
            undefined
        );
    });

    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(recursionParser('')),
            '[]'
        );
    });

    it('is parsing variable declaration', () => {
        assert.equal(
            JSON.stringify(recursionParser('let x;')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"VariableDeclarator",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing variable declaration with value', () => {
        assert.equal(
            JSON.stringify(recursionParser('let x = 0;')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"VariableDeclarator",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":0' +
            '}' +
            ']'
        );
    });

    it('is parsing assignment expression', () => {
        assert.equal(
            JSON.stringify(recursionParser('x = 0;')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":0' +
            '}' +
            ']'
        );
    });

    it('is parsing complicated assignment expression', () => {
        assert.equal(
            JSON.stringify(recursionParser('x = n + 1;')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":"n + 1"' +
            '}' +
            ']'
        );
    });

    it('is parsing unary assignment expression', () => {
        assert.equal(
            JSON.stringify(recursionParser('x = -1;')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":"-1"' +
            '}' +
            ']'
        );
    });

    it('is parsing empty while statement', () => {
        assert.equal(
            JSON.stringify(recursionParser('while (x < 10){\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"WhileStatement",' +
            '"name":null,' +
            '"condition":"x < 10",' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing while statement with simple content', () => {
        assert.equal(
            JSON.stringify(recursionParser('while (x < 10){\nx = x + 1;\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"WhileStatement",' +
            '"name":null,' +
            '"condition":"x < 10",' +
            '"value":null' +
            '},' +
            '{' +
            '"line":2,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":"x + 1"' +
            '}' +
            ']'
        );
    });

    it('is parsing complicated assignment expression', () => {
        assert.equal(
            JSON.stringify(recursionParser('x = (y + z)/2;')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":"y + z / 2"' +
            '}' +
            ']'
        );
    });

    it('is parsing empty if statement', () => {
        assert.equal(
            JSON.stringify(recursionParser('if (x < y){\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"IfStatement",' +
            '"name":null,' +
            '"condition":"x < y",' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing simple if statement', () => {
        assert.equal(
            JSON.stringify(recursionParser('if (x < y)\nx = y;')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"IfStatement",' +
            '"name":null,' +
            '"condition":"x < y",' +
            '"value":null' +
            '},' +
            '{' +
            '"line":2,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":"y"' +
            '}' +
            ']'
        );
    });

    it('is parsing simple if statement with else', () => {
        assert.equal(
            JSON.stringify(recursionParser('if (x < y)\nx = y;\nelse\nx = x[y];')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"IfStatement",' +
            '"name":null,' +
            '"condition":"x < y",' +
            '"value":null' +
            '},' +
            '{' +
            '"line":2,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":"y"' +
            '},' +
            '{' +
            '"line":4,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":"x[y]"' +
            '}' +
            ']'
        );
    });

    it('is parsing simple if statement with else if and else', () => {
        assert.equal(
            JSON.stringify(recursionParser('if (x < y)\nx = 0;\nelse if (x > y)\nx = 1;\nelse\nx = 2;')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"IfStatement",' +
            '"name":null,' +
            '"condition":"x < y",' +
            '"value":null' +
            '},' +
            '{' +
            '"line":2,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":0' +
            '},' +
            '{' +
            '"line":3,' +
            '"type":"IfStatement",' +
            '"name":null,' +
            '"condition":"x > y",' +
            '"value":null' +
            '},' +
            '{' +
            '"line":4,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":1' +
            '},' +
            '{' +
            '"line":6,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":2' +
            '}' +
            ']'
        );
    });

    it('is parsing empty function', () => {
        assert.equal(
            JSON.stringify(recursionParser('function x(){\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"FunctionDeclaration",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing two empty functions', () => {
        assert.equal(
            JSON.stringify(recursionParser('function x(){\n}\nfunction y(){\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"FunctionDeclaration",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '},' +
            '{' +
            '"line":3,' +
            '"type":"FunctionDeclaration",' +
            '"name":"y",' +
            '"condition":null,' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing empty function with one param', () => {
        assert.equal(
            JSON.stringify(recursionParser('function x(y){\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"FunctionDeclaration",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '},' +
            '{' +
            '"line":1,' +
            '"type":"Identifier",' +
            '"name":"y",' +
            '"condition":null,' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing empty function with multi params', () => {
        assert.equal(
            JSON.stringify(recursionParser('function x(y, z){\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"FunctionDeclaration",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '},' +
            '{' +
            '"line":1,' +
            '"type":"Identifier",' +
            '"name":"y",' +
            '"condition":null,' +
            '"value":null' +
            '},' +
            '{' +
            '"line":1,' +
            '"type":"Identifier",' +
            '"name":"z",' +
            '"condition":null,' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing function with content', () => {
        assert.equal(
            JSON.stringify(recursionParser('function x(){\nlet x;\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"FunctionDeclaration",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '},' +
            '{' +
            '"line":2,' +
            '"type":"VariableDeclarator",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing function with empty return', () => {
        assert.equal(
            JSON.stringify(recursionParser('function x(){\nreturn;\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"FunctionDeclaration",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '},' +
            '{' +
            '"line":2,' +
            '"type":"ReturnStatement",' +
            '"name":null,' +
            '"condition":null,' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing function with simple return', () => {
        assert.equal(
            JSON.stringify(recursionParser('function x(){\nreturn 3;\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"FunctionDeclaration",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '},' +
            '{' +
            '"line":2,' +
            '"type":"ReturnStatement",' +
            '"name":null,' +
            '"condition":null,' +
            '"value":3' +
            '}' +
            ']'
        );
    });

    it('is parsing function with complicated return', () => {
        assert.equal(
            JSON.stringify(recursionParser('function x(){\nreturn x + 3;\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"FunctionDeclaration",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":null' +
            '},' +
            '{' +
            '"line":2,' +
            '"type":"ReturnStatement",' +
            '"name":null,' +
            '"condition":null,' +
            '"value":"x + 3"' +
            '}' +
            ']'
        );
    });

    it('is parsing empty for statement', () => {
        assert.equal(
            JSON.stringify(recursionParser('for(x=1;x<5;x++){\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"ForStatement",' +
            '"name":null,' +
            '"condition":"x < 5",' +
            '"value":null' +
            '}' +
            ']'
        );
    });

    it('is parsing simple for statement', () => {
        assert.equal(
            JSON.stringify(recursionParser('for(x=1;x<5;x++){\nx = x - 1;\n}')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"ForStatement",' +
            '"name":null,' +
            '"condition":"x < 5",' +
            '"value":null' +
            '},' +
            '{' +
            '"line":2,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":"x - 1"' +
            '}' +
            ']'
        );
    });

    it('is parsing assignment & member expression statement', () => {
        assert.equal(
            JSON.stringify(recursionParser('x = x[y];')),
            '[' +
            '{' +
            '"line":1,' +
            '"type":"AssignmentExpression",' +
            '"name":"x",' +
            '"condition":null,' +
            '"value":"x[y]"' +
            '}' +
            ']'
        );
    });
});