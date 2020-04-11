import React from "react"

import Style from "./Progress.module.css"

const Progress: React.FC<{
    value: number
    max: number
}> = ({ value, max }) => {
    const percent = (value / max) * 100

    return (
        <div className={Style.wrapper}>
            <div className={Style.outer}>
                <div
                    className={Style.inner}
                    style={{
                        width: `${percent}%`,
                    }}
                />
            </div>
            <span className={Style.text}>{percent}%</span>
        </div>
    )
}

export default Progress
