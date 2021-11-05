import React from 'react'
import { unstable_batchedUpdates } from 'react-dom'

class ReduxHooksStore {
    name: string
    id: number
    state: null
    reducer: any
    initState: any
    mapConnects: {
        [key: string]: any
    }
    constructor(reducer: any, initState: any) {
        this.name = '__ReduxHooksStore'
        this.id = 0
        this.reducer = reducer
        this.initState = initState
        this.mapConnects = {}
    }

    publicRender() {
        unstable_batchedUpdates(() => {
            Object.keys(this.mapConnects).forEach(name => {
                const { update } = this.mapConnects[name]
                update(this.state)
            })
        })
    }

    dispatch(action: string) {
        this.state = this.reducer(this.state, action)
        this.publicRender()
    }

    subscribe(connectCurrent: any) {
        const connectName = this.name + (++this.id)
        this.mapConnects[connectName] = connectCurrent
        return connectName
    }

    unSubscribe(connectName: string) {
        delete this.mapConnects[connectName]
    }

    getInitState(mapStoreToState: Function) {
        return mapStoreToState(this.state)
    }

    ecportStore() {
        return {
            dispatch: this.dispatch.bind(this),
            subscribe: this.subscribe.bind(this),
            unSubscribe: this.unSubscribe.bind(this),
            getInitState: this.getInitState.bind(this)
        }
    }

}

export const ReduxContext = React.createContext<ReduxHooksStore|null>(null)

export function useStore(reducer:any, initState:any) {
    const store = React.useRef<any>(null)
    if(!store.current) {
        store.current = new ReduxHooksStore(reducer, initState)
    }
    return store.current
}

export function useConnect(mapStoreToState = (state:any) => {}) {

    const contextValue = React.useContext(ReduxContext)

    const { getInitState, subscribe, unSubscribe, dispatch } = contextValue!

    const stateValue = React.useRef(getInitState(mapStoreToState))

    const [ ,forceUpdate] = React.useState({})

    const connectValue = React.useMemo(() => {
        const state = {
            cacheState: stateValue.current,
            update: (newState:any) => {
                const selectState = mapStoreToState(newState)
                const isEqual = state.cacheState === selectState
                state.cacheState = selectState
                stateValue.current = selectState
                if(!isEqual) {
                    forceUpdate({})
                }
            }
        }
        return state
    }, [stateValue, mapStoreToState])

    React.useEffect(() => {
        const name = subscribe(connectValue)
        return () => {
            unSubscribe(name)
        }
    }, [connectValue, subscribe, unSubscribe])

    return [stateValue.current, dispatch]
}