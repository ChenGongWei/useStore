import { Suspense } from "react";
import Routes from "./routes";
import Loading from "@/components/Loading";

function App() {
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
            <Routes />
        </Suspense>
    );
}

export default App;
