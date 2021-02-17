import React from "react"

import Styles from "./Button.module.css"

const Button: React.FC<
    JSX.IntrinsicElements["button"] & {
        fixMargin?: boolean
        small?: boolean
    }
> = ({ fixMargin, small, className, children, type, ...rest }) => {
    return (
        <button
            {...rest}
            type={type || "button"}
            className={`button ${small ? Styles.small : ""} ${
                fixMargin ? Styles.marginFix : ""
            } ${className || ""}`}
        >
            {children}
        </button>
    )
}

export default Button
