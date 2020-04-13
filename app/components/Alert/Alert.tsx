import React from "react"

import Styles from "./Alert.module.css"

const Alert: React.FC<{
    appearance: string
    label?: string
}> = ({ appearance, children, label }) => {
    return (
        <div className={`${Styles.alert} ${Styles[appearance]}`}>
            {label && (
                <>
                    <strong className={Styles.strong}>{label}</strong>
                    &nbsp;
                </>
            )}
            {children}
        </div>
    )
}

export default Alert
