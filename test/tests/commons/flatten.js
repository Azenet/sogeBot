/* global describe it before */

require('../../general.js');

const db = require('../../general.js').db;
const message = require('../../general.js').message;
const variable = require('../../general.js').variable;

const { flatten, unflatten } = require('../../../dest/helpers/flatten');

const assert = require('assert');

describe('lib/commons - @func2 - flatten()', () => {
  it('Object with string should be correctly flatten', async () => {
    const object = { a: { b: { c: { d: { e: { f: 'lorem'}}}}}};
    assert.deepEqual(flatten(object), { 'a.b.c.d.e.f': 'lorem' });
  });

  it('Object with array should be correctly flatten', async () => {
    const object = { a: { b: { c: { d: { e: { f: ['lorem', 'ipsum']}}}}}};
    assert.deepEqual(flatten(object), { 'a.b.c.d.e.f': ['lorem', 'ipsum'] });
  });
});

describe('lib/commons - @func2 - unflatten()', () => {
  it('Object with string should be correctly unflatten', async () => {
    const object = { a: { b: { c: { d: { e: { f: 'lorem'}}}}}};
    assert.deepEqual(unflatten({ 'a.b.c.d.e.f': 'lorem' }), object);
  });

  it('Object with array should be correctly unflatten', async () => {
    const object = { a: { b: { c: { d: { e: { f: ['lorem', 'ipsum']}}}}}};
    assert.deepEqual(unflatten({ 'a.b.c.d.e.f': ['lorem', 'ipsum'] }), object);
  });

  it('Array of object should be correctly unflatten', async () => {
    const object = [ { userName: 'test' }, { userName: 'test2' }, { 'user.name': 'test3' } ];
    assert.deepEqual(unflatten(object), [
      { userName: 'test' },
      { userName: 'test2' },
      { user: { name: 'test3' } },
    ]);
  });
});