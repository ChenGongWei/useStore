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
 * 状态管理类
 */
class ReduxHooksStore {
    /** name + id  组成 connect 的 name */
    name: string
    id: number
    /** 数据源 */
    state: null
    /** 修改数据源的方法 */
    reducer: Function
    /** 注册的 connect 集合 */
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
     * 注册connect
     * @param connectCurrent 要注册的对象
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

### [useConnect](src/hooks/useRedux.ts#L110)
`useConnect` 在需要使用状态管理的组件上使用，可以订阅 `state`，获取改变 `state` 的 `dispatch`

[使用：](src/pages/Main/index.tsx)

```js
const [state, dispatch] = useConnect( mapStoreToState )
```
接受一个回调函数作为参数，会将 `state` 传入回调函数，回调返回值为需要订阅的 `state`，`useConnect` 会将 `state` 和 `dispatch`返回。

[实现代码：](src/hooks/useRedux.ts#L110)
```js
/**
 * 获取 state 和 dispatch
 * @param mapStoreToState 获取订阅state的函数
 * @returns 返回 state 和 dispatch
 */
export function useConnect(mapStoreToState = (state:any) => {}) {

    /** 获取 store 对象 */
    const contextValue = React.useContext(ReduxContext)
    /** 获取 store 对象的方法 */
    const { getInitState, subscribe, unSubscribe, dispatch } = contextValue!
    /** 通过 mapStoreToState 获取需要订阅的 state  */
    const stateValue = React.useRef(getInitState(mapStoreToState))
    /** 用于重新渲染 */
    const [ ,forceUpdate] = React.useState({})


    /** 需要注册的 connect */
    const connectValue = React.useMemo(() => {
        const state = {
            /** state 缓存，用于判断 dispatch 时新旧 state 是否发生变化 */
            cacheState: stateValue.current,
            /**
             * 更新函数
             * @param newState 新的state值
             */
            update: (newState:any) => {
                /** 从新的 state 中获取订阅的 state */
                const selectState = mapStoreToState(newState)
                /** 浅比较判断新旧 state 是否发生变化 */
                const isEqual = state.cacheState === selectState
                /** 将新的 state 缓存起来 */
                state.cacheState = selectState
                /** 更新订阅的 state */
                stateValue.current = selectState
                /** 新旧 state 不相同 */
                if(!isEqual) {
                    /** 刷新组件 */
                    forceUpdate({})
                }
            }
        }
        return state
    }, [stateValue, mapStoreToState])


    React.useEffect(() => {
        /** 组件挂载时 注册 connect */
        const name = subscribe(connectValue)
        return () => {
            /** 组件销毁时 解绑 connect */
            unSubscribe(name)
        }
    }, [connectValue, subscribe, unSubscribe])

    /** 返回 订阅的 state 和 用于派发更新的 dispatch */
    return [stateValue.current, dispatch]
}
```

##### 初始化
* 用 `useContext` 获取 `context` 上传递的 `store` 处理函数
* 用 `useRef` 保存订阅的 `state`
* 用 `useState` 产生一个更新组件的函数 `forceUpdate`

##### 注册 | 解绑
* 注册：在 `useEffect` 中通过 `subscribe` 向 `store` 中注册当前 `useConnect` 产生的 `connectValue`，返回唯一标识 `name`
* 解绑：在 `useEffect` 返回的函数中，通过 `unSubscribe` 传入 `name` 来解绑
  
##### 更新
* 每个 `connect` 上都有 `cacheState`(上一次的state) 和 `update`(更新函数)
* 通过 `dispatch` 触发 `store` 的 `renducer` 和 `publicRender`
* `renducer` 根据传入的 `action` 更新 `state`
* `publicRender` 触发注册的每一个 `connect` 的 `update` 函数
* `update` 函数浅比较上一次缓存的 `state` 和最新的 `state`，发生变化则更新组件


