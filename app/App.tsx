import React from "react"
import { hot } from "react-hot-loader/root"
import { createHistory, LocationProvider, Router } from "@reach/router"
import createHashSource from "hash-source"

import Packages from "./pages/Packages/Packages"
import { CourseContextProvider } from "./contexts/CourseContext"
import Loading from "./components/Loading/Loading"
import Start from "./pages/Start/Start"
import Styles from "./App.module.css"

// hash router helps prevent studip routing issues and preserved the course query string
// memory source would be another option, but the state is harder to persist.
const source = createHashSource()
// @ts-ignore
const history = createHistory(source)

const App: React.FC = () => {
    return (
        <div className={Styles.app}>
            <React.Suspense fallback={<Loading />}>
                <CourseContextProvider>
                    <LocationProvider history={history}>
                        <Router>
                            <Start path="/" />
                            <Packages path="packages/*" />
                        </Router>
                    </LocationProvider>
                </CourseContextProvider>
            </React.Suspense>
        </div>
    )
}

export default hot(App)
