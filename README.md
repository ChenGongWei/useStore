## 通过两个自定义 `Hook` 替代 `React-Redux`
小型项目使用 `React-Redux` 不太合适，所以就有了使用自定义 `Hook` 来解决 `React` 项目状态管理的问题的想法。
两个自定义 `Hook` 分别是：
* `useStore`：用于创建一个状态 `Store`，通过 `context` 传递给子组件
* `useConnect`：订阅 `state`，获取改变状态的 `dispatch` 方法
  
还要有一个状态调度中心 `ReduxHooksStore` 来实现状态管理和组件通信，它的功能有：
* 全局管理 `state`，改变时通知组件更新
* 收集使用 `useConnect` 的组件的信息，组件销毁时清除信息
* 维护并传递负责更新的 `dispatch` 方法
* 暴露一些 `api` 给 `context`，传递给每一个 `useConnect`
  
### [useStore](src/lib/useRedux.ts#L104)