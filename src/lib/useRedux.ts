import React from 'react'
import { unstable_batchedUpdates } from 'react-dom'

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
    publicRender() {
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
    dispatch(action: string) {
        this.state = this.reducer(this.state, action)
        this.publicRender()
    }

    /**
     * 注册connect
     * @param connectCurrent 要注册的值
     * @returns 返回connect的name
     */
    subscribe(connectCurrent: any) {
        const connectName = this.name + (++this.id)
        this.mapConnects[connectName] = connectCurrent
        return connectName
    }

    /**
     * 解除绑定
     * @param connectName 需要解绑的connect的name
     */
    unSubscribe(connectName: string) {
        delete this.mapConnects[connectName]
    }

    /**
     * 获取初始化 state
     * @param mapStoreToState 接收 state 为参数的函数
     * @returns 
     */
    getInitState(mapStoreToState: Function) {
        return mapStoreToState(this.state)
    }

    /**
     * 对外传递的接口
     * @returns 
     */
    ecportStore() {
        return {
            dispatch: this.dispatch.bind(this),
            subscribe: this.subscribe.bind(this),
            unSubscribe: this.unSubscribe.bind(this),
            getInitState: this.getInitState.bind(this)
        }
    }

}

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
        store.current = new ReduxHooksStore(reducer, initState)
    }
    return store.current
}


/**
 * 获取store
 * @param mapStoreToState 获取state的函数
 * @returns 返回获取的state
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