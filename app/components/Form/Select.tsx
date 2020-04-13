import React, { HTMLProps, useEffect, useRef } from "react"
import { useField } from "@unform/core"

const Select: React.FC<
    HTMLProps<HTMLSelectElement> & {
        label: string
        name: string
    }
> = ({ label, name, ...props }) => {
    const inputRef = useRef(null)
    const { fieldName, defaultValue = "", registerField, error } = useField(
        name
    )

    useEffect(() => {
        registerField({
            name: fieldName,
            ref: inputRef.current,
            path: "value",
        })
    }, [fieldName, registerField])

    return (
        <label htmlFor={fieldName}>
            <span>{label}</span>
            <select
                {...props}
                id={fieldName}
                defaultValue={defaultValue}
                ref={inputRef}
            />
            {error && <p>{error}</p>}
        </label>
    )
}

export default Select
