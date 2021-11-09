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
  
### [useStore](src/hooks/useRedux.ts#L94)
`useStore` 在靠近根组件的地方使用，为的是可以将创建的 `store` 传递给所有需要使用状态管理的子组件
[使用：](src/App.tsx)

```js
const store = useStore( reducer , initState )
```
参数：
* `reducer`：全局 `reducer`，纯函数，传入 `state` 和 `action`，返回新的 `state`
* `initState`：初始化 `state`

返回值：`store` 暴露的 `api`

[实现代码：](src/hooks/useRedux.ts#L94)
```js
/** context 对象，用于传递 store */
export const ReduxContext = React.createContext<ReduxHooksStore|null>(null)

/**
 * 生成 store
 * @param reducer 处理函数
 * @param initState 初始数据 
 * @returns 返回store
 */
export function useStore(reducer:Function, initState:any) {
    const store = React.useRef<any>(null)
    if(!store.current) {
        /** 创建一个 store 对象 */
        store.current = new ReduxHooksStore(reducer, initState).exportStore()
    }
    return store.current
}
```

### [ReduxHooksStore](src/hooks/useRedux.ts#L3)
```js
/**
 * 状态管理核心类
 */
class ReduxHooksStore {
    /** name + id  组成 connect 的 name */
    name: string
    id: number
    /** 数据源 */
    state: null
    /** 修改数据源的方法 */
    reducer: Function
    /** 绑定的 connect 集合 */
    mapConnects: {
        [key: string]: any
    }

    constructor(reducer: Function, initState: any) {
        this.name = '__ReduxHooksStore__'
        this.id = 0
        this.reducer = reducer
        this.state = initState
        this.mapConnects = {}
    }

    /**
     * 更新需要更新的组件
     */
    publicRender = () => {
        /* 批量更新 */
        unstable_batchedUpdates(() => {
            Object.keys(this.mapConnects).forEach(name => {
                const { update } = this.mapConnects[name]
                update(this.state)
            })
        })
    }

    /**
     * 更新state
     * @param action 更新方式
     */
    dispatch = (action: string) => {
        this.state = this.reducer(this.state, action)
        this.publicRender()
    }

    /**
     * 绑定connect
     * @param connectCurrent 要绑定的对象
     * @returns 返回connect的name
     */
    subscribe = (connectCurrent: any) => {
        const connectName = this.name + (++this.id)
        this.mapConnects[connectName] = connectCurrent
        return connectName
    }

    /**
     * 解除绑定
     * @param connectName 需要解绑的connect的name
     */
    unSubscribe = (connectName: string) => {
        delete this.mapConnects[connectName]
    }

    /**
     * 获取初始化 state
     * @param mapStoreToState 接收 state 为参数的函数
     * @returns 
     */
    getInitState = (mapStoreToState: Function) => {
        return mapStoreToState(this.state)
    }

    /**
     * 对外传递的接口
     * @returns 
     */
    exportStore = () => {
        return {
            dispatch: this.dispatch.bind(this),
            subscribe: this.subscribe.bind(this),
            unSubscribe: this.unSubscribe.bind(this),
            getInitState: this.getInitState.bind(this)
        }
    }

}
```

状态：
* `name`：自定义的标识名
* `id`：与 `name` 组成每一个 `connect` 的唯一 `key`
* `reducer`：用于处理 `dispatch`，更新 `state`
* `state`：全局状态
* `mapConnects`：保存使用 `useConnect` 的组件的更新函数
  
方法：
* `dispatch`：通过调用 `reducer` 改变 `state` 的值
* `subscribe`：绑定 `useConnect` 创建的 `connect`
* `unSubscribe`：解除 `connect` 绑定
* `getInitState`：通过 `useConnect` 传入的函数来获取初始值
* `exportStore`：将以上方法暴露给 `useConnect` 使用

