import React, { useEffect, useRef } from "react"
import { useField } from "@unform/core"

import Validation from "./Validation"

const Input: React.FC<
    JSX.IntrinsicElements["input"] & {
        label: string
        name: string
    }
> = ({ label, name, type, checked, value, ...props }) => {
    const inputRef = useRef(null)
    const { fieldName, defaultValue = "", registerField, error } = useField(
        name
    )

    useEffect(() => {
        let path
        switch (type) {
            case "number":
                path = "valueAsNumber"
                break
            case "checkbox":
                path = "checked"
                break
            case "date":
                path = "valueAsDate"
                break
            case "datetime-local":
                path = "value"
                break
            default:
                path = "value"
        }

        registerField({
            name: fieldName,
            ref: inputRef.current,
            path,
        })
    }, [fieldName, registerField, type])

    return (
        <label htmlFor={fieldName}>
            {type !== "checkbox" && <span>{label}</span>}
            <input
                {...props}
                id={fieldName}
                defaultValue={
                    type !== "checkbox" && value === undefined
                        ? defaultValue
                        : undefined
                }
                defaultChecked={
                    type === "checkbox" && checked === undefined
                        ? defaultValue
                        : undefined
                }
                value={value}
                checked={checked}
                ref={inputRef}
                type={type}
            />
            {type === "checkbox" && <span>{label}</span>}
            <Validation error={error} />
        </label>
    )
}

export default Input
