import React from "react"
import { hot } from 'react-hot-loader/root';

import Style from "./App.module.css"

const App: React.FC = () => {
    return <div className={Style.test}>Hallo</div>
};

export default hot(App)
