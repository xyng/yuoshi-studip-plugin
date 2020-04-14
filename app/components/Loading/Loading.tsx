import React from "react"

import { CenterSpinner } from "../Spinner/Spinner"

import Styles from "./Loading.module.css"

const Loading: React.FC = () => {
    return (
        <div>
            <CenterSpinner />
            <span className={Styles.text}>Einen Moment, bitte!</span>
        </div>
    )
}

export default Loading
