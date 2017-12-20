/* eslint-env mocha, browser */
/* global proclaim */

// Modified version of the test262 tests located at
// https://github.com/tc39/test262/tree/master/test/built-ins/Object/entries
// Copyright (C) 2015 Jordan Harband. All rights reserved.
// This code is governed by the BSD license.

var arePropertyDescriptorsSupported = function() {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', {
			enumerable: false,
			value: obj
		});
		/* eslint-disable no-unused-vars, no-restricted-syntax */
		for (var _ in obj) {
			return false;
		}
		/* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { // this is IE 8.
		return false;
	}
};

var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var functionsHaveNames = (function foo() {}).name === 'foo';

var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var objectKeysWorksWithPrimitives = (function() {
	try {
		return Object.keys(2) === undefined;
	} catch (e) {
		return false;
	}
}());

it('should have name `entries`', function() {
	if (functionsHaveNames) {
		proclaim.equal(Object.entries.name, 'entries');
	} else {
		this.skip();
	}
});

it('has length `1`', function() {
	proclaim.equal(Object.entries.length, 1);
});

it('should terminate if getting a value throws an exception', function() {
	proclaim.throws(function() {
		Object.entries({
			get a() {
				throw new Error('This is the thrown error');
			},
			get b() {
				throw new Error();
			}
		});
	}, Error, 'This is the thrown error');
});

it('should throw TypeError when called with `null`', function() {
	proclaim.throws(function() {
		Object.entries(null);
	}, TypeError);
});

it('should throw TypeError when called with `undefined`', function() {
	proclaim.throws(function() {
		Object.entries(undefined);
	}, TypeError);
});

it('does not see a new element added by a getter that is hit during iteration', function() {
	var bAddsC = {
		a: 'A',
		get b() {
			this.c = 'C';
			return 'B';
		}
	};

	var result = Object.entries(bAddsC);

	proclaim.isArray(result, 'result is an array');
	proclaim.equal(result.length, 2, 'result has 2 items');

	proclaim.isArray(result[0], 'first entry is an array');
	proclaim.isArray(result[1], 'second entry is an array');

	proclaim.deepEqual(result, [
		['a', 'A'],
		['b', 'B']
	]);
});

it('does not see an element made non-enumerable by a getter that is hit during iteration', function() {
	if (supportsDescriptors) {

		var bDeletesC = {
			a: 'A',
			get b() {
				Object.defineProperty(this, 'c', {
					enumerable: false
				});
				return 'B';
			},
			c: 'C'
		};

		var result = Object.entries(bDeletesC);

		proclaim.isArray(result, 'result is an array');
		proclaim.equal(result.length, 2, 'result has 2 items');

		proclaim.isArray(result[0], 'first entry is an array');
		proclaim.isArray(result[1], 'second entry is an array');

		proclaim.deepEqual(result, [
			['a', 'A'],
			['b', 'B']
		]);
	} else {
		this.skip();
	}
});

it('does not see an element removed by a getter that is hit during iteration', function() {

	var bDeletesC = {
		a: 'A',
		get b() {
			delete this.c;
			return 'B';
		},
		c: 'C'
	};

	var result = Object.entries(bDeletesC);

	proclaim.isArray(result, 'result is an array');
	proclaim.equal(result.length, 2, 'result has 2 items');

	proclaim.isArray(result[0], 'first entry is an array');
	proclaim.isArray(result[1], 'second entry is an array');

	proclaim.deepEqual(result, [
		['a', 'A'],
		['b', 'B']
	]);
});

it('does not see inherited properties', function() {
	var F = function G() {};
	F.prototype.a = {};
	F.prototype.b = {};

	var f = new F();
	f.b = {}; // shadow the prototype
	f.c = {}; // solely an own property

	var result = Object.entries(f);

	proclaim.isArray(result, 'result is an array');
	proclaim.equal(result.length, 2, 'result has 2 items');

	proclaim.isArray(result[0], 'first entry is an array');
	proclaim.isArray(result[1], 'second entry is an array');

	proclaim.deepEqual(result, [
		['b', f.b],
		['c', f.c]
	]);
});

it('accepts boolean primitives', function() {
	if (objectKeysWorksWithPrimitives) {
		var trueResult = Object.entries(true);

		proclaim.isArray(trueResult, 'trueResult is an array');
		proclaim.equal(trueResult.length, 0, 'trueResult has 0 items');

		var falseResult = Object.entries(false);

		proclaim.isArray(falseResult, 'falseResult is an array');
		proclaim.equal(falseResult.length, 0, 'falseResult has 0 items');
	} else {
		this.skip();
	}
});

it('accepts number primitives', function() {
	if (objectKeysWorksWithPrimitives) {
		proclaim.equal(Object.entries(0).length, 0, '0 has zero entries');
		proclaim.equal(Object.entries(-0).length, 0, '-0 has zero entries');
		proclaim.equal(Object.entries(Infinity).length, 0, 'Infinity has zero entries');
		proclaim.equal(Object.entries(-Infinity).length, 0, '-Infinity has zero entries');
		proclaim.equal(Object.entries(NaN).length, 0, 'NaN has zero entries');
		proclaim.equal(Object.entries(Math.PI).length, 0, 'Math.PI has zero entries');
	} else {
		this.skip();
	}
});

it('accepts string primitives', function() {
	if (objectKeysWorksWithPrimitives) {
		var result = Object.entries('abc');

		proclaim.isArray(result, 'result is an array');
		proclaim.equal(result.length, 3, 'result has 3 items');

		proclaim.deepEqual(result, [
			['0', 'a'],
			['1', 'b'],
			['2', 'c']
		]);
	} else {
		this.skip();
	}
});


it('accepts Symbol primitives', function() {
	if (hasSymbols && objectKeysWorksWithPrimitives) {
		var result = Object.entries(Symbol());

		proclaim.isArray(result, 'result is an array');
		proclaim.equal(result.length, 0, 'result has 0 items');
	} else {
		this.skip();
	}
});

it('does not include Symbol keys', function() {
	if (hasSymbols) {
		var value = {};
		var enumSym = Symbol('enum');
		var nonEnumSym = Symbol('nonenum');
		var symValue = Symbol('value');

		var obj = {
			key: symValue
		};
		obj[enumSym] = value;
		Object.defineProperty(obj, nonEnumSym, {
			enumerable: false,
			value: value
		});

		var result = Object.entries(obj);

		proclaim.isArray(result, 'result is an array');
		proclaim.equal(result.length, 1, 'result has 1 item');

		proclaim.isArray(result[0], 'first entry is an array');

		proclaim.deepEqual(result, [
			['key', symValue]
		]);
	} else {
		this.skip();
	}
});
