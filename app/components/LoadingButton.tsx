import React from "react"

import { SmallSpinner } from "./Spinner/Spinner"

const LoadingButton: React.FC<
    JSX.IntrinsicElements["button"] & {
        loading: boolean
    }
> = ({ children, loading, disabled, ...props }) => {
    return (
        <button disabled={disabled || loading} {...props}>
            {loading && <SmallSpinner />}
            {children}
        </button>
    )
}

export default LoadingButton
