import { Suspense } from "react"
import { ReduxContext, useStore } from '@/hooks/useRedux'
import Loading from "@/components/Loading"
import Routes from "./routes"

function App() {

    const store = useStore((state: any, action: any) => {
        const { type, payload } = action
        switch (type) {
            case 'setName':
                return { ...state, name: payload }
            case 'setAge':
                return { ...state, age: payload }
            default:
                return state
        }
    }, {
        name: '',
        age: 0
    })

    console.log(store, 888)

    return (
        <Suspense
            fallback={
                <Loading
                    style={{
                        marginTop: "30vh",
                    }}
                />
            }
        >
            <ReduxContext.Provider value={store}>
                <Routes />
            </ReduxContext.Provider>

        </Suspense>
    )
}

export default App;
