/* eslint-env node, jasmine */
'use strict';
const {join} = require('path');
const getConfig = require('..');


/**
 * @param {String} rootFolder
 * @param {Boolean} expectThrows
 */
function testFixture(rootFolder, expectThrows){
	let actualThrows = false;
	try {
		getConfig({
			entry: {
				dummy: './src/dummy.ts'
			},
			rootFolder,
			outputFolder: join(__dirname, 'dummy')
		});
	} catch(e){
		actualThrows = true;
	}
	expect(actualThrows).toBe(expectThrows);
}

it('Valid: __dirname', testFixture.bind(null, __dirname, false));
it('Invalid: "myfolder"', testFixture.bind(null, 'myfolder', true));
it('Invalid: "./myfolder"', testFixture.bind(null, './myfolder', true));
it('Invalid: NaN', testFixture.bind(null, NaN, true));
it('Invalid: 123', testFixture.bind(null, 123, true));
it('Invalid: ""', testFixture.bind(null, '', true));
it('Invalid: null', testFixture.bind(null, null, true));
it('Invalid: false', testFixture.bind(null, false, true));
it('Invalid: true', testFixture.bind(null, true, true));
it('Invalid: {}', testFixture.bind(null, {}, true));
it('Invalid: Promise', testFixture.bind(null, Promise.resolve(), true));
it('Invalid: Symbol', testFixture.bind(null, Symbol('hello'), true));
