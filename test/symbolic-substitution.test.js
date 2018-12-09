import assert from 'assert';
import {symbolicParser} from '../src/js/symbolic-substitution';

describe('My parser', () => {
    it('is parsing nothing', () => {
        assert.equal(
            JSON.stringify(symbolicParser('', '')),
            '[]'
        );
    });

    it('is parsing args with empty code', () => {
        assert.equal(
            JSON.stringify(symbolicParser('', 'x = 1')),
            '[]'
        );
    });

    it('is parsing empty args with code', () => {
        assert.equal(
            JSON.stringify(symbolicParser('let x = 1;', '')),
            '[]'
        );
    });

    it('is parsing args with code', () => {
        assert.equal(
            JSON.stringify(symbolicParser('let x = 1;', 'x = 2')),
            '[]'
        );
    });

    it('is parsing empty function', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(){\n}', '')),
            '[{"code":"function f() {","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing empty function with arg', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x){\n}', '')),
            '[{"code":"function f(x) {","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing empty function with multi args', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\n}', '')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing empty function with multi args and args as input', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\n}', 'x=1,y=2')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with basic let', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(){\nlet x = 1;\n}', '')),
            '[{"code":"function f() {","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with basic let of args', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet x = 1;\n}', '')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if of arg', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nif (x > 0)\nreturn 1;\n}', '')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x > 0)) {","eval":true},{"code":"return 1;","eval":null},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if of arg with args', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nif (x > 0)\nreturn 1;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x > 0)) {","eval":true},{"code":"return 1;","eval":null},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if of var with args', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a > 0)\nreturn 1;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x > 0)) {","eval":true},{"code":"return 1;","eval":null},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if with else', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a;\na = x;\nif (a > 0)\nreturn 1;\nelse\nreturn 2;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x > 0)) {","eval":true},{"code":"return 1;","eval":null},{"code":"} else {","eval":false},{"code":"return 2;","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if with else if and else', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nx = 2;\nlet a = x + 1;\nif (a > 0)\nreturn 1;\nelse if (a < 0)\nreturn 2;\nelse\nreturn 3;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x > 0)) {","eval":true},{"code":"return 1;","eval":null},{"code":"} else if ((x < 0)) {","eval":false},{"code":"return 2;","eval":null},{"code":"} else {","eval":false},{"code":"return 3;","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if with else if and else where else if is true', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a < 0)\nreturn 1;\nelse if (a > 0)\nreturn 2;\nelse\nreturn 3;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x < 0)) {","eval":false},{"code":"return 1;","eval":false},{"code":"} else if ((x > 0)) {","eval":true},{"code":"return 2;","eval":true},{"code":"} else {","eval":false},{"code":"return 3;","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if with else if and else where else is true', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a < 0)\nreturn 1;\nelse if (a == 0)\nreturn 2;\nelse\nreturn 3;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x < 0)) {","eval":false},{"code":"return 1;","eval":false},{"code":"} else if ((x == 0)) {","eval":false},{"code":"return 2;","eval":null},{"code":"} else {","eval":true},{"code":"return 3;","eval":true},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if with double else if', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a < 0)\nreturn 1;\nelse if (a == 0)\nreturn 2;\nelse if (a == x)\nreturn 3;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x < 0)) {","eval":false},{"code":"return 1;","eval":false},{"code":"} else if ((x == 0)) {","eval":false},{"code":"return 2;","eval":null},{"code":"} else if ((x == x)) {","eval":true},{"code":"return 3;","eval":true},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if with double else if and else', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a < 0)\nreturn 1;\nelse if (a == 0)\nreturn 2;\nelse if (a == x)\nreturn 3;\nelse\nreturn 6;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x < 0)) {","eval":false},{"code":"return 1;","eval":false},{"code":"} else if ((x == 0)) {","eval":false},{"code":"return 2;","eval":null},{"code":"} else if ((x == x)) {","eval":true},{"code":"return 3;","eval":true},{"code":"} else {","eval":false},{"code":"return 6;","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if inside if', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a < 0)\nif (a < y)\nreturn y;\nelse if (a == 0)\nreturn 2;\nelse if (a == x)\nreturn 3;\nelse\nreturn 6;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x < 0)) {","eval":false},{"code":"if ((x < y)) {","eval":false},{"code":"return y;","eval":false},{"code":"} else if ((x == 0)) {","eval":false},{"code":"return 2;","eval":false},{"code":"} else if ((x == x)) {","eval":false},{"code":"return 3;","eval":false},{"code":"} else {","eval":false},{"code":"return 6;","eval":false},{"code":"}","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if inside if complicated', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a < 0) {\nif (a < y)\nreturn y;\n} else if (a == 0)\nreturn 2;\nelse if (a == x)\nreturn 3;\nelse\nreturn 6;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x < 0)) {","eval":false},{"code":"if ((x < y)) {","eval":false},{"code":"return y;","eval":false},{"code":"}","eval":false},{"code":"} else if ((x == 0)) {","eval":false},{"code":"return 2;","eval":null},{"code":"} else if ((x == x)) {","eval":true},{"code":"return 3;","eval":true},{"code":"} else {","eval":false},{"code":"return 6;","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if inside if complicated 2', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a < 0) {\nif (a < y)\nreturn y;\n} else if (a == 0)\nreturn 2;\nelse if (a == x) {\nif (y > -1)\nreturn y;\nelse if (y < 10)\nreturn y + x;\nelse\nreturn 0;\n} else\nreturn 6;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x < 0)) {","eval":false},{"code":"if ((x < y)) {","eval":false},{"code":"return y;","eval":false},{"code":"}","eval":false},{"code":"} else if ((x == 0)) {","eval":false},{"code":"return 2;","eval":null},{"code":"} else if ((x == x)) {","eval":true},{"code":"if ((y > -1)) {","eval":true},{"code":"return y;","eval":true},{"code":"} else if ((y < 10)) {","eval":false},{"code":"return (y + x);","eval":true},{"code":"} else {","eval":false},{"code":"return 0;","eval":false},{"code":"}","eval":true},{"code":"} else {","eval":false},{"code":"return 6;","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with while', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nwhile (x != a)\nreturn 1;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"while ((x != x)) {","eval":false},{"code":"return 1;","eval":false},{"code":"}","eval":false},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with two whiles', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nwhile (x == a)\nreturn 1;\na = y;\nwhile (x == a)\nreturn 2;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"while ((x == x)) {","eval":true},{"code":"return 1;","eval":true},{"code":"}","eval":true},{"code":"while ((x == y)) {","eval":false},{"code":"return 2;","eval":false},{"code":"}","eval":false},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with while inside while', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nwhile (x == a)\nwhile (x == a)\nreturn 2;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"while ((x == x)) {","eval":true},{"code":"while ((x == x)) {","eval":true},{"code":"return 2;","eval":true},{"code":"}","eval":true},{"code":"}","eval":true},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if after if', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (x > y)\nreturn x;\nif (y > x)\nreturn y;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x > y)) {","eval":true},{"code":"return x;","eval":null},{"code":"}","eval":null},{"code":"if ((y > x)) {","eval":false},{"code":"return y;","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with if inside while', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nwhile (x == a)\nif (x == a)\nreturn 2;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"while ((x == x)) {","eval":true},{"code":"if ((x == x)) {","eval":true},{"code":"return 2;","eval":true},{"code":"}","eval":true},{"code":"}","eval":true},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with while inside if', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (x != a)\nwhile (x == a)\nreturn 2;\n}', 'x=1,y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x != x)) {","eval":false},{"code":"while ((x == x)) {","eval":false},{"code":"return 2;","eval":false},{"code":"}","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with strings as args', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif ("hello" == a)\nwhile (x == a)\nreturn 2;\n}', 'x="hello",y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((\\"hello\\" == x)) {","eval":true},{"code":"while ((x == x)) {","eval":true},{"code":"return 2;","eval":true},{"code":"}","eval":true},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with strings as args 2', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif ("bye bye" == a)\nwhile (x == a)\nreturn 2;\n}', 'x="hello",y=0')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((\\"bye bye\\" == x)) {","eval":false},{"code":"while ((x == x)) {","eval":false},{"code":"return 2;","eval":false},{"code":"}","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with true as args', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a)\nwhile (y)\nreturn 2;\n}', 'x=true,y=false')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if (x) {","eval":true},{"code":"while (y) {","eval":false},{"code":"return 2;","eval":false},{"code":"}","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with false as args', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x;\nif (a)\nwhile (y)\nreturn 2;\n}', 'x=false,y=true')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if (x) {","eval":false},{"code":"while (y) {","eval":false},{"code":"return 2;","eval":false},{"code":"}","eval":false},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with array args', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x[0];\nif (a > 0)\nreturn 2;\n}', 'x=[1,2],y=true')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if ((x[0] > 0)) {","eval":true},{"code":"return 2;","eval":null},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

    it('is parsing function with complicated array args', () => {
        assert.equal(
            JSON.stringify(symbolicParser('function f(x, y){\nlet a = x[0];\nlet b = x[1];\nlet c = x[2];\nif (b)\nif (c == "hello")\nreturn 2;\n}', 'x=[1,true,"hello"],y=2')),
            '[{"code":"function f(x, y) {","eval":null},{"code":"if (x[1]) {","eval":true},{"code":"if ((x[2] == \\"hello\\")) {","eval":true},{"code":"return 2;","eval":null},{"code":"}","eval":null},{"code":"}","eval":null},{"code":"}","eval":null}]'
        );
    });

});