import assert from 'assert';
import {symbolicParser} from '../src/js/symbolic-substitution';

describe('My parser', () => {
    it('is parsing nothing', () => {
        assert.equal(
            JSON.stringify(symbolicParser('', '')),
            '[]'
        );
    });

    // it('is parsing variable declaration', () => {
    //     assert.equal(
    //         JSON.stringify(symbolicParser('let x;')),
    //         '[' +
    //         '{' +
    //         '"line":1,' +
    //         '"type":"VariableDeclarator",' +
    //         '"name":"x",' +
    //         '"condition":null,' +
    //         '"value":null' +
    //         '}' +
    //         ']'
    //     );
    // });
});