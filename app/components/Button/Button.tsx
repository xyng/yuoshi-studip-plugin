import React from "react"

import Styles from "./Button.module.css"

const Button: React.FC<
    JSX.IntrinsicElements["button"] & {
        fixMargin?: boolean
    }
> = ({ fixMargin, className, children, type, ...rest }) => {
    return (
        <button
            {...rest}
            type={type || "button"}
            className={`button ${fixMargin ? Styles.marginFix : ""} ${
                className || ""
            }`}
        >
            {children}
        </button>
    )
}

export default Button
