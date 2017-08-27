import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
// 中间件结构
//                fn1                 fn2         fn3
// let m = ({getState, dispatch}) => (next) => (action) => {
//   // todo here
//   return next(action);
// };
// 这块redux正在考虑重构，因为逻辑不清楚
// https://github.com/reactjs/redux/pull/2146
// https://github.com/reactjs/redux/commit/0bca1b5cd00758264dad1a31461e2da55a6b4a35#diff-00cf56e35f4f14a3079fa426caa8ef42L22
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState, enhancer) => {
// 得到初始store
// enhancer参数是不必要的，用来兼容之前的API
// https://github.com/reactjs/redux/issues/2028#issuecomment-252968176
    const store = createStore(reducer, preloadedState, enhancer)
// 初始dispatch，会被重写，这里不给null是考虑有的middleware会在初始化时候dispatch()
    let dispatch = store.dispatch
    let chain = []

    const middlewareAPI = {
      getState: store.getState,
// 因为dispatch下面会被重写，所以包一层用新值，不能直接dispatch: dispatch
// https://github.com/reactjs/redux/pull/1592#issuecomment-207682829
      dispatch: (action) => dispatch(action)
    }
// 给每一个middleware都注入{getState, dispatch} 剥掉fn1
    chain = middlewares.map(middleware => middleware(middlewareAPI))
// fn = compose(...chain)是reduceLeft从左向右链式组合起来
// fn(store.dispatch)把原始dispatch传进去，作为最后一个next
// 参数求值过程从右向左注入next 剥掉fn2，得到一系列(action) => {}的标准dispatch组合
// 调用被篡改过的disoatch时，从左向右传递action
// action先按next链顺序流经所有middleware，最后一环是原始dispatch，进入reducer计算过程
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
