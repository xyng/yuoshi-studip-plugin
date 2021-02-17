import React from "react"

import Styles from "./Validation.module.css"

const Validation = React.memo<{
    error?: string
}>(({ error }) => {
    if (!error) {
        return null
    }

    return <p className={Styles.validation}>{error}</p>
})

export default Validation
