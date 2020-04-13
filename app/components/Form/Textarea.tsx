import React, { HTMLProps, useEffect, useRef } from "react"
import { useField } from "@unform/core"

import Validation from "./Validation"

const TextArea: React.FC<
    HTMLProps<HTMLTextAreaElement> & {
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
            <textarea
                {...props}
                id={fieldName}
                defaultValue={defaultValue}
                ref={inputRef}
            />
            <Validation error={error} />
        </label>
    )
}

export default TextArea
