import {
  capitalize,
  clone,
  environment,
  findMatches,
  format,
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
  randomInt,
  sort,
  startCase,
  take,
  trim,
  uniqueArray,
  uniqueId,
} from '../base';

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

describe('environment', () => {
  it('has all environment properties', () => {
    expect(environment.isBrowser).toBeTrue();
    expect(environment.isJSDOM).toBeTrue();
    expect(environment.isNode).toBeTrue();
    expect(environment.isMac).toBeFalse();
  });
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
    const failValue = {};
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
    const passValue = {};
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

  const dup = ['a', 'a', 'a', 'a', 'b'];
  expect(uniqueArray(dup)).toEqual(['a', 'b']);
});

test('sort', () => {
  const arr = [...Array(100), 11, 9, 12].map((value, index) => ({ value: value || 10, index }));
  // expect(arr.sort((a, b) => a.value - b.value)).toEqual([
  //   { value: 9, index: 101 },
  //   ...take(arr, 100),
  //   { value: 11, index: 100 },
  //   { value: 12, index: 102 },
  // ]);
  expect(sort(arr, (a, b) => a.value - b.value)).toEqual([
    { value: 9, index: 101 },
    ...take(arr, 100),
    { value: 11, index: 100 },
    { value: 12, index: 102 },
  ]);
});
