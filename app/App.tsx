import React from "react"
import { hot } from "react-hot-loader/root"

import Packages from "./pages/Packages"

const App: React.FC = () => {
    return <div>
        <Packages />
    </div>
};

export default hot(App)
