import React, { HTMLProps, useEffect, useRef } from "react"
import { useField } from "@unform/core"

import Validation from "./Validation"

const Input: React.FC<
    HTMLProps<HTMLInputElement> & {
        label: string
        name: string
    }
> = ({ label, name, type, ...props }) => {
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
            <span>{label}</span>
            <input
                {...props}
                id={fieldName}
                defaultValue={type !== "checkbox" ? defaultValue : undefined}
                defaultChecked={type === "checkbox" ? defaultValue : undefined}
                ref={inputRef}
                type={type}
            />
            <Validation error={error} />
        </label>
    )
}

export default Input
