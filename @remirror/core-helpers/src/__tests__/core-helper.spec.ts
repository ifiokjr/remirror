import {
  capitalize,
  clone,
  deepMerge,
  entries,
  findMatches,
  format,
  get,
  hasOwnProperty,
  isBoolean,
  isDate,
  isEmptyArray,
  isEmptyObject,
  isError,
  isFunction,
  isInteger,
  isMap,
  isNativePromise,
  isNull,
  isNullOrUndefined,
  isNumber,
  isObject,
  isPlainObject,
  isPromise,
  isRegExp,
  isSafeInteger,
  isSet,
  isString,
  isSymbol,
  isUndefined,
  kebabCase,
  keys,
  Merge,
  randomInt,
  range,
  sort,
  startCase,
  take,
  trim,
  uniqueArray,
  uniqueBy,
  uniqueId,
  within,
} from '../core-helpers';

describe('findMatches', () => {
  const regex = /(@[0-9]+)/g;
  const str = '@12 @34 #12';
  it('finds the correct number of matches', () => {
    const matches = findMatches(str, regex);
    expect(matches).toHaveLength(2);
    expect(matches[0][1]).toBe('@12');
    expect(matches[0].index).toBe(0);
    expect(matches[1][1]).toBe('@34');
    expect(matches[1].index).toBe(4);
  });

  it('does not crash when no `g` flag added', () => {
    expect(findMatches('ababab', /a/)).toHaveLength(3);
  });

  it('should be not retain regex state', () => {
    expect(findMatches(str, regex)).toHaveLength(2);
    expect(findMatches(str, regex)).toHaveLength(2);
  });

  // it.only('should worl', () => {
  //   const text = 'this is some @awesome text and #should @work';
  //   const reg = /(\@[\w\d_]+)/;
  //   const matches = findMatches(text, reg);
  //   expect(matches).toHaveLength(2);
  // });
});

test('format', () => {
  expect(format(' test  ')).toBe('Test');
});

test('capitalize', () => {
  expect(capitalize('test')).toBe('Test');
});

test('trim', () => {
  expect(trim(' test    ')).toBe('test');
});

test('randomInt', () => {
  expect(randomInt(10)).toBeLessThanOrEqual(10);
  expect(randomInt(20, 30)).toBeGreaterThanOrEqual(20);
});

test('startCase', () => {
  expect(startCase('abcdefg')).toBe('Abcdefg');
  expect(startCase('a living dream')).toBe('A Living Dream');
});

test('uniqueId', () => {
  expect(uniqueId({ prefix: 'test' })).toInclude('test');
  expect(uniqueId({ size: 10 })).toHaveLength(10);
});

test('take', () => {
  expect(take([1, 2, 3], 2)).toEqual([1, 2]);
});

describe('predicates', () => {
  it('isBoolean', () => {
    const passValue = true;
    const failValue = 'true';
    expect(isBoolean(passValue)).toBeTrue();
    expect(isBoolean(failValue)).toBeFalse();
  });

  it('isDate', () => {
    const passValue = new Date();
    const failValue = Date.now();
    expect(isDate(passValue)).toBeTrue();
    expect(isDate(failValue)).toBeFalse();
  });

  it('isError', () => {
    const passValue = new Error('Pass');
    const failValue = new (class Simple {})();
    expect(isError(passValue)).toBeTrue();
    expect(isError(failValue)).toBeFalse();
  });

  it('isFunction', () => {
    const passValue = () => {};
    const failValue = '() => {}';
    expect(isFunction(passValue)).toBeTrue();
    expect(isFunction(failValue)).toBeFalse();
  });

  it('isInteger', () => {
    const passValue = 1002;
    const failValue = 10.02;
    expect(isInteger(passValue)).toBeTrue();
    expect(isInteger(failValue)).toBeFalse();
  });

  it('isMap', () => {
    const passValue = new Map();
    const failValue = Object.create(null);
    expect(isMap(passValue)).toBeTrue();
    expect(isMap(failValue)).toBeFalse();
  });

  it('isNativePromise', () => {
    const passValue = Promise.resolve();
    const failValue = { undefined };
    expect(isNativePromise(passValue)).toBeTrue();
    expect(isNativePromise(failValue)).toBeFalse();
  });

  it('isNull', () => {
    const passValue = null;
    const failValue = undefined;
    expect(isNull(passValue)).toBeTrue();
    expect(isNull(failValue)).toBeFalse();
  });

  it('isNumber', () => {
    const passValue = 1;
    const failValue = '1';
    expect(isNumber(passValue)).toBeTrue();
    expect(isNumber(failValue)).toBeFalse();
    expect(isNumber(Number('01'))).toBeTrue();
    expect(isNumber(Number('abc'))).toBeFalse();
  });

  it('isPlainObject', () => {
    const passValue = { a: 'a' };
    const failValue = new (class Simple {
      public a = 'a';
    })();
    const simpleFailValue = undefined;
    expect(isPlainObject(passValue)).toBeTrue();
    expect(isPlainObject(failValue)).toBeFalse();
    expect(isPlainObject(simpleFailValue)).toBeFalse();
  });

  it('isPromise', () => {
    const passValue = { then: () => {}, catch: () => {} };
    const failValue = null;
    expect(isPromise(passValue)).toBeTrue();
    expect(isPromise(failValue)).toBeFalse();
  });

  it('isRegExp', () => {
    const passValue = new RegExp('', 'g');
    const failValue = '//w';
    expect(isRegExp(passValue)).toBeTrue();
    expect(isRegExp(failValue)).toBeFalse();
  });

  it('isSafeInteger', () => {
    const passValue = Math.pow(2, 53) - 1;
    const failValue = Math.pow(2, 53);
    expect(isSafeInteger(passValue)).toBeTrue();
    expect(isSafeInteger(failValue)).toBeFalse();
  });

  it('isSet', () => {
    const passValue = new Set();
    const failValue = new WeakSet();
    expect(isSet(passValue)).toBeTrue();
    expect(isSet(failValue)).toBeFalse();
  });

  it('isString', () => {
    const passValue = 'isString';
    const failValue = 10;
    expect(isString(passValue)).toBeTrue();
    expect(isString(failValue)).toBeFalse();
  });

  it('isSymbol', () => {
    const passValue = Symbol('a');
    const failValue = 'symbol';
    expect(isSymbol(passValue)).toBeTrue();
    expect(isSymbol(failValue)).toBeFalse();
  });

  it('isUndefined', () => {
    const passValue = undefined;
    const failValue = null;
    expect(isUndefined(passValue)).toBeTrue();
    expect(isUndefined(failValue)).toBeFalse();
  });

  it('isNullOrUndefined', () => {
    const passValue = null;
    const failValue = false;
    expect(isNullOrUndefined(passValue)).toBeTrue();
    expect(isNullOrUndefined(failValue)).toBeFalse();
  });

  it('isObject', () => {
    const passValue = new (class Simple {})();
    const failValue = false;
    expect(isObject(passValue)).toBeTrue();
    expect(isObject(failValue)).toBeFalse();
  });

  it('isEmptyObject', () => {
    const passValue = Object.create(null);
    const failValue = { oop: 'sie' };
    const altPassValue = new (class Simple {})();
    expect(isEmptyObject(passValue)).toBeTrue();
    expect(isEmptyObject(failValue)).toBeFalse();
    expect(isEmptyObject(altPassValue)).toBeTrue();
  });

  it('isEmptyArray', () => {
    const passValue: never[] = [];
    const failValue = ['oop', 'sie'];
    expect(isEmptyArray(passValue)).toBeTrue();
    expect(isEmptyArray(failValue)).toBeFalse();
  });
});

test('clone', () => {
  const simple = { a: 'a', b: 'b' };
  expect(clone(simple)).not.toBe(simple);
  expect(clone(simple)).toEqual(simple);
});

test('uniqueArray', () => {
  const arr = [1, 2, 3];
  expect(uniqueArray(arr)).toEqual([1, 2, 3]);

  const dup = ['a', 'a', 'a', 'a', 'b', 'a'];
  expect(uniqueArray(dup)).toEqual(['a', 'b']);
  expect(uniqueArray(dup, true)).toEqual(['b', 'a']);
});

test('sort', () => {
  const arr = [...Array(100), 11, 9, 12].map((value, index) => ({ value: value || 10, index }));
  expect(sort(arr, (a, b) => a.value - b.value)).toEqual([
    { value: 9, index: 101 },
    ...take(arr, 100),
    { value: 11, index: 100 },
    { value: 12, index: 102 },
  ]);
});

test('get', () => {
  const obj = { a: 'a', b: 'b', nested: [{ awesome: true }] };

  expect(get('', obj)).toBe(obj);
  expect(get('a', 1)).toBe(undefined);
  expect(get('a', obj)).toBe('a');
  expect(get('nested.0.awesome', obj)).toBe(true);
  expect(get('nested.0.fake', obj)).toBe(undefined);

  expect(get([], obj)).toBe(obj);
  expect(get(['a'], 1)).toBe(undefined);
  expect(get(['a'], obj)).toBe('a');
  expect(get(['nested', 0, 'awesome'], obj)).toBe(true);
  expect(get(['nested', 0, 'fake'], obj)).toBe(undefined);

  expect(get(['nested', 0, 'fake'], obj, 'fallback')).toBe('fallback');
});

describe('kebabCase', () => {
  it('handles string with spaces', () => {
    expect(kebabCase('the quick brown fox')).toBe('the-quick-brown-fox');
    expect(kebabCase('the quick     brownfox')).toBe('the-quick-brownfox');
  });

  it('handles string with punctuation', () => {
    expect(kebabCase('the_quick_brown_fox')).toBe('the-quick-brown-fox');
    expect(kebabCase('the_quick_brown_fox')).toBe('the-quick-brown-fox');
    expect(kebabCase('the*quick-brown_fox')).toBe('the-quick-brown-fox');
    expect(kebabCase('the****quick-_-brown_:fox')).toBe('the-quick-brown-fox');
  });

  it('handles string with mixed spaces and punctuation', () => {
    expect(kebabCase('the_quick_brown_   fox')).toBe('the-quick-brown-fox');
    expect(kebabCase('the** **quick-_-brown_:fox')).toBe('the-quick-brown-fox');
  });

  it('handles string with capitalization', () => {
    expect(kebabCase('theQuickBrownFox')).toBe('the-quick-brown-fox');
    expect(kebabCase('the QuickBrown Fox')).toBe('the-quick-brown-fox');
    expect(kebabCase('The quick brown FOX')).toBe('the-quick-brown-f-o-x');
  });
});

test('deepMerge', () => {
  expect(deepMerge({ a: 'a', c: 2 }, { b: 'b', c: 'c' })).toEqual({ a: 'a', b: 'b', c: 'c' });
  expect(deepMerge({ a: 'a', c: 2 }, Merge.overwrite({ b: 'b', c: 'c', a: Merge.delete() }))).toEqual({
    b: 'b',
    c: 'c',
  });
  expect(deepMerge({ a: { b: 'b ' } }, { a: Merge.overwrite({ c: 'c' }) })).toEqual({ a: { c: 'c' } });
});

test('uniqueBy', () => {
  const foo = { key: 'foo', name: 'foo' };
  const bar = { key: 'bar', name: 'bar' };
  const baz = { key: 'foo', name: 'baz' };
  const original = [foo, bar, baz];
  const expected = [foo, bar];

  expect(uniqueBy(original, 'key')).toEqual(expected);
  expect(uniqueBy(original, ['key'])).toEqual(expected);
  expect(uniqueBy(original, item => item.key)).toEqual(expected);

  expect(uniqueBy(original, item => item.key, true)).toEqual([bar, baz]);
});

test('entries', () => {
  const input = { a: 1, b: 'b' };
  expect(entries(input).map(([key, value]) => [key, value])).toEqual([
    ['a', 1],
    ['b', 'b'],
  ]);
});
test('keys', () => {
  const input = { a: 1, b: 'b' };
  expect(keys(input).map(key => key)).toEqual(['a', 'b']);
});

test('range', () => {
  expect(range(5)).toEqual([0, 1, 2, 3, 4]);
  expect(range(-5)).toEqual([-0, -1, -2, -3, -4]);
  expect(range(0)).toEqual([]);
  expect(range(5, 5)).toEqual([5]);
  expect(range(-5, -5)).toEqual([-5]);
  expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  expect(range(-5, -1)).toEqual([-5, -4, -3, -2, -1]);
  expect(range(10, 5)).toEqual([10, 9, 8, 7, 6, 5]);
});

test('within', () => {
  expect(within(5, 0, 5)).toBeTrue();
  expect(within(5, 5, 5)).toBeTrue();
  expect(within(5, 5, 10)).toBeTrue();
  expect(within(5, 0, 4)).toBeFalse();
  expect(within(-20, -21, -20)).toBeTrue();
  expect(within(10, null, undefined, 0, 12)).toBeTrue();
});

test('hasOwnProperty', () => {
  expect(hasOwnProperty({ a: 1 }, 'a')).toBeTrue();
  expect(hasOwnProperty({ a: 1 }, 'b')).toBeFalse();
  expect(hasOwnProperty({ a: 1, hasOwnProperty: () => true }, 'b')).toBeFalse();

  const noProto = Object.create(null);
  noProto.a = 1;
  expect(hasOwnProperty(noProto, 'a')).toBeTrue();
  expect(hasOwnProperty(noProto, 'b')).toBeFalse();
});
