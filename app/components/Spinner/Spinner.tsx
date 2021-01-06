import React from "react"

import Styles from "./Spinner.module.css"

const Spinner: React.FC = () => {
    return <div className={Styles.spinner} />
}

export default Spinner

export const SmallSpinner: React.FC = () => {
    return (
        <div className={Styles.small}>
            <Spinner />
        </div>
    )
}

export const CenterSpinner: React.FC = () => {
    return (
        <div className={Styles.centerWrap}>
            <div className={Styles.centerSpinner}>
                <Spinner />
            </div>
        </div>
    )
}
