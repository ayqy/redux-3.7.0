/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

// [f1, f2, f3] -> f1(f2(f3(...args)))
// arr.reduce(callback(accumulator, currentValue, currentIndex, array)[, initialValue])
// 1.做((a, b) => (...args) => a(b(...args)))(f1, f2)
//   得到accumulator = (...args) => f1(f2(...args))
// 2.做((a, b) => (...args) => a(b(...args)))(accumulator, f3)
//   得到accumulator = (...args) => ((...args) => f1(f2(...args)))(f3(...args))
//   得到accumulator = (...args) => f1(f2(f3(...args)))
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
